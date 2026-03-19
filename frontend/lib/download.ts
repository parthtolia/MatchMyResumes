import { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } from "docx"

/**
 * Highly precise multi-page PDF export.
 * Tiles a high-resolution canvas onto Letter pages with explicit 0.5in margins.
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
    const { default: html2canvas } = await import("html2canvas")
    const { jsPDF } = await import("jspdf")

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
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
        }
    })

    const imgData = canvas.toDataURL("image/png")
    
    // PDF Specs in points
    const PAGE_WIDTH = 612
    const PAGE_HEIGHT = 792
    const MARGIN = 36 // 0.5 inch
    const PRINT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
    const PRINT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2)

    // Calculate how much the canvas needs to be scaled to fit exactly in PRINT_WIDTH
    const ratio = PRINT_WIDTH / canvas.width
    const scaledHeight = canvas.height * ratio

    const pdf = new jsPDF("p", "pt", "letter")
    
    let heightLeft = scaledHeight
    let page = 0

    while (heightLeft > 0) {
        if (page > 0) pdf.addPage()
        
        // Offset logic: 
        // We add the image at MARGIN, MARGIN.
        // But we shift it UP by (page * PRINT_HEIGHT) so the next slice shows up perfectly.
        const yOffset = MARGIN - (page * PRINT_HEIGHT)
        
        pdf.addImage(imgData, "PNG", MARGIN, yOffset, PRINT_WIDTH, scaledHeight)
        
        heightLeft -= PRINT_HEIGHT
        page++
    }
    
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
