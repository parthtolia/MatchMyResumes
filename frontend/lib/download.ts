import { Document, Paragraph, TextRun, Packer, AlignmentType } from "docx"

/**
 * Download a DOM element as a PDF using html2canvas & jsPDF (WYSIWYG).
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
    const { default: html2canvas } = await import("html2canvas")
    const { jsPDF } = await import("jspdf")

    // Optimization: scale up for higher quality and handle modern CSS color issues
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
            // Fix for Tailwind 4 / modern CSS using lab() or oklch() which html2canvas 1.4.1 doesn't support
            const allElements = clonedDoc.getElementsByTagName("*")
            for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i] as HTMLElement
                const style = window.getComputedStyle(el)
                // If the color contains lab or oklch, replace it with a safe fallback
                if (style.color.includes("lab") || style.color.includes("oklch")) {
                    el.style.color = "#000000"
                }
                if (style.backgroundColor.includes("lab") || style.backgroundColor.includes("oklch")) {
                    el.style.backgroundColor = "transparent"
                }
                if (style.borderColor.includes("lab") || style.borderColor.includes("oklch")) {
                    el.style.borderColor = "#dddddd"
                }
            }
        }
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}

/**
 * Improved DOCX download with basic formatting (bolding sections and adding accent colors).
 */
export async function downloadTextAsDocx(text: string, filename: string, accentColor: string = "#000000") {
    const lines = text.split("\n")
    const paragraphs = lines.map(line => {
        const trimmed = line.trim()
        
        // Detect section headers (all caps, shortish, not a bullet)
        const isHeader = 
            trimmed.toUpperCase() === trimmed && 
            trimmed.length > 2 && 
            trimmed.length < 50 &&
            !trimmed.startsWith("•") &&
            !trimmed.startsWith("-")

        // Clean hex for docx (remove #)
        const hex = accentColor.startsWith("#") ? accentColor.slice(1) : accentColor

        return new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: isHeader ? 240 : 80, after: 120 },
            children: [
                new TextRun({
                    text: line,
                    font: "Arial",
                    size: isHeader ? 26 : 20, // 13pt vs 10pt
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
                    margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
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
