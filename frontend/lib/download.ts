import { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } from "docx"

/**
 * Download a DOM element as a PDF using html2canvas & jsPDF (WYSIWYG).
 * Redesigned for perfect spacing and margin consistency.
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
    const { default: html2canvas } = await import("html2canvas")
    const { jsPDF } = await import("jspdf")

    // Optimize: capture with a "Safe Zone" to prevent border clipping
    const canvas = await html2canvas(element, {
        scale: 2, // 2x is usually enough for 300dpi feel without huge files
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
            // Fix for Tailwind 4 / modern CSS using lab() or oklch()
            const allElements = clonedDoc.getElementsByTagName("*")
            for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i] as HTMLElement
                const style = window.getComputedStyle(el)
                if (style.color.includes("lab") || style.color.includes("oklch")) {
                    el.style.color = "#000000"
                }
                if (style.backgroundColor.includes("lab") || style.backgroundColor.includes("oklch")) {
                    el.style.backgroundColor = "transparent"
                }
                if (style.borderColor.includes("lab") || style.borderColor.includes("oklch")) {
                    el.style.borderColor = "#999999"
                }
            }

            // ENHANCEMENT: Force a white border around the cloned element to act as a "Buffer"
            clonedElement.style.margin = "40px" 
            clonedElement.style.padding = "0"
            clonedElement.style.boxShadow = "none"
            clonedElement.style.border = "1px solid #eeeeee"
        }
    })

    const imgData = canvas.toDataURL("image/png")
    
    // Letter format: 612 x 792 points (8.5 x 11 inches)
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
    })

    const PAGE_WIDTH = 612
    const PAGE_HEIGHT = 792
    
    // Dynamic scaling to fit the page horizontally while respecting margins
    const MARGIN = 40 // ~0.55 inch
    const PDF_CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
    const PDF_CONTENT_HEIGHT = (canvas.height * PDF_CONTENT_WIDTH) / canvas.width

    // If it's a very long resume, it might need multi-page logic, 
    // but for now we fit it to the width and place it at the top.
    pdf.addImage(imgData, "PNG", MARGIN, MARGIN, PDF_CONTENT_WIDTH, PDF_CONTENT_HEIGHT)
    
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}

/**
 * Improved DOCX download with signature top bar and better formatting.
 */
export async function downloadTextAsDocx(text: string, filename: string, accentColor: string = "#000000") {
    const lines = text.split("\n")
    const hex = accentColor.startsWith("#") ? accentColor.slice(1) : accentColor

    const paragraphs = lines.map((line, idx) => {
        const trimmed = line.trim()
        const isHeader = 
            trimmed.toUpperCase() === trimmed && 
            trimmed.length > 2 && 
            trimmed.length < 50 &&
            !trimmed.startsWith("•") &&
            !trimmed.startsWith("-")

        return new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: isHeader ? 280 : 120, after: 120 },
            // Add blue top bar to the FIRST line
            border: idx === 0 ? {
                top: {
                    color: hex,
                    space: 20,
                    style: BorderStyle.SINGLE,
                    size: 40, // thick bar
                }
            } : undefined,
            children: [
                new TextRun({
                    text: line,
                    font: "Arial",
                    size: isHeader ? 28 : 22, // 14pt vs 11pt
                    bold: isHeader,
                    color: isHeader ? hex : "333333",
                }),
            ],
        })
    })

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 720, right: 900, bottom: 720, left: 900 }, // Generous margins
                }
            },
            children: paragraphs,
        }],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * OLD: Download plain text as a PDF using jsPDF (Fallback).
 */
export async function downloadTextAsPdf(text: string, filename: string) {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ format: "letter" })
    doc.setFont("helvetica")
    doc.setFontSize(10)
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxLineWidth = pageWidth - margin * 2
    const lines = doc.splitTextToSize(text, maxLineWidth)
    let y = margin
    for (const line of lines) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin }
        doc.text(line, margin, y)
        y += 4.5
    }
    doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}
