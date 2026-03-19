import { Document, Paragraph, TextRun, Packer, AlignmentType } from "docx"

/**
 * Download a DOM element as a PDF using html2canvas & jsPDF (WYSIWYG).
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
    const { default: html2canvas } = await import("html2canvas")
    const { jsPDF } = await import("jspdf")

    // Optimization: scale up for higher quality
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
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
 * Improved DOCX download with basic formatting (bolding sections).
 */
export async function downloadTextAsDocx(text: string, filename: string) {
    const lines = text.split("\n")
    const paragraphs = lines.map(line => {
        const trimmed = line.trim()
        const isHeader = 
            trimmed.toUpperCase() === trimmed && 
            trimmed.length > 2 && 
            trimmed.length < 50 &&
            !trimmed.startsWith("•") &&
            !trimmed.startsWith("-")

        return new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: isHeader ? 200 : 0, after: 100 },
            children: [
                new TextRun({
                    text: line,
                    font: "Arial",
                    size: isHeader ? 24 : 18, // 12pt vs 9pt
                    bold: isHeader,
                }),
            ],
        })
    })

    const doc = new Document({
        sections: [{
            properties: {},
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
