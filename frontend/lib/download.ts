import { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx"
import { ResumeData } from "./types/resume"

/**
 * Highly precise multi-page PDF export.
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
    const { default: html2canvasPro } = await import("html2canvas-pro")
    const { jsPDF } = await import("jspdf")

    // Temporarily inject html2canvasPro globally so jsPDF auto-detects it and avoids the lab() parser crash
    // @ts-ignore
    window.html2canvas = html2canvasPro

    // Clone correctly
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.transform = 'none'
    clone.style.width = '816px' // standard letter width
    clone.style.padding = '0 48px' // Horizontal padding only. Vertical margins are handled by jsPDF for true page breaks.
    clone.style.margin = '0'
    clone.style.color = '#000000'
    clone.style.backgroundColor = '#ffffff'
    clone.style.minHeight = '1056px'
    
    // Create a hidden container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.appendChild(clone)
    document.body.appendChild(container)

    // Wait for any async styles/images
    await new Promise(r => setTimeout(r, 100))

    try {
        const pdf = new jsPDF("p", "pt", "letter")
        await pdf.html(clone, {
            callback: function (doc) {
                doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
            },
            autoPaging: 'text',
            margin: [48, 0, 48, 0], // [top, right, bottom, left] points
            width: 612, // jsPDF page width in points
            windowWidth: 816 // Virtual window width reflecting our clone
        })
    } catch (err) {
        console.error("PDF generation failed:", err)
    } finally {
        document.body.removeChild(container)
        // @ts-ignore
        delete window.html2canvas
    }
}

/**
 * Download plain text as simple Word document (.docx).
 * For cover letters and other plain text content.
 */
export async function downloadPlainTextAsDocx(text: string, filename: string) {
    const { Document, Paragraph, Packer } = await import("docx");

    const paragraphs = text.split("\n").map(line =>
        new Paragraph({
            text: line || "",
            spacing: { after: 100 }
        })
    );

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Professional Word download using structured data.
 */
export async function downloadTextAsDocx(data: ResumeData, filename: string, templateId: string = "classic", accentColor: string = "#000000") {
    const hex = accentColor.startsWith("#") ? accentColor.slice(1) : accentColor

    const children: any[] = []

    // Header Layout based on template
    let basicsText = "";
    if (data.basics.email) basicsText += `${data.basics.email}`;
    if (data.basics.phone) basicsText += (basicsText ? "   |   " : "") + data.basics.phone;
    if (data.basics.location) basicsText += (basicsText ? "   |   " : "") + data.basics.location;

    if (templateId === "modern") {
        const leftChildren: any[] = [];
        const rightChildren: any[] = [];

        // Left Side: Name, Label, Contact, Skills
        leftChildren.push(
            new Paragraph({
                spacing: { before: 100, after: 50 },
                children: [new TextRun({ text: data.basics.name.toUpperCase(), bold: true, size: 40, font: "Arial", color: hex })]
            })
        );
        if (data.basics.label) {
            leftChildren.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: data.basics.label, size: 20, font: "Arial", color: "666666" })]
                })
            );
        }
        
        leftChildren.push(
             new Paragraph({
                 spacing: { after: 50 },
                 children: [new TextRun({ text: "CONTACT", bold: true, size: 16, color: "999999", font: "Arial" })]
             })
        );
        if (data.basics.email) leftChildren.push(new Paragraph({ children: [new TextRun({ text: data.basics.email, size: 16, font: "Arial" })] }));
        if (data.basics.phone) leftChildren.push(new Paragraph({ children: [new TextRun({ text: data.basics.phone, size: 16, font: "Arial" })] }));
        if (data.basics.location) leftChildren.push(new Paragraph({ children: [new TextRun({ text: data.basics.location, size: 16, font: "Arial" })] }));
        if (data.basics.website) leftChildren.push(new Paragraph({ children: [new TextRun({ text: data.basics.website, size: 16, font: "Arial" })] }));

        const skillsSections = data.sections.filter(s => s.title.toLowerCase().includes("skills"));
        skillsSections.forEach(section => {
            leftChildren.push(
                 new Paragraph({
                     spacing: { before: 300, after: 50 },
                     children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 16, color: "999999", font: "Arial" })]
                 })
            );
            const fragments = section.content.split(/(<ul>|<\/ul>|<li>|<\/li>|<p>|<\/p>|<br\s*\/?>)/).filter(f => f.trim().length > 0 && !f.startsWith("<"));
            fragments.forEach(text => {
                 const cleanText = text.trim().replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
                 if (!cleanText) return;
                 leftChildren.push(
                     new Paragraph({
                         spacing: { before: 40, after: 40 },
                         children: [new TextRun({ text: cleanText, size: 16, font: "Arial" })]
                     })
                 );
            });
        });

        // Right Side: Experience, Education, etc.
        const rightSections = data.sections.filter(s => !s.title.toLowerCase().includes("skills"));
        rightSections.forEach(section => {
            rightChildren.push(
                new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 20, color: hex, font: "Arial" })]
                })
            );

            // Parse HTML content more carefully
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = section.content;

            // Process each child element
            Array.from(tempDiv.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = (node.textContent || '').trim();
                    if (text) {
                        rightChildren.push(new Paragraph({
                            spacing: { before: 50, after: 50 },
                            children: [new TextRun({ text, size: 18, font: "Arial" })]
                        }));
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const elem = node as HTMLElement;
                    if (elem.tagName === 'P') {
                        // Check if it's a bold header (role | company | date)
                        const strong = elem.querySelector('strong');
                        if (strong) {
                            const headerText = strong.textContent || '';
                            rightChildren.push(new Paragraph({
                                spacing: { before: 100, after: 50 },
                                children: [new TextRun({ text: headerText, bold: true, size: 18, font: "Arial" })]
                            }));
                        } else {
                            const text = elem.textContent || '';
                            if (text.trim()) {
                                rightChildren.push(new Paragraph({
                                    spacing: { before: 50, after: 50 },
                                    children: [new TextRun({ text: text.trim(), size: 18, font: "Arial" })]
                                }));
                            }
                        }
                    } else if (elem.tagName === 'UL') {
                        Array.from(elem.querySelectorAll('li')).forEach(li => {
                            const text = (li.textContent || '').trim();
                            if (text) {
                                rightChildren.push(new Paragraph({
                                    spacing: { before: 40, after: 40 },
                                    bullet: { level: 0 },
                                    indent: { left: 400, hanging: 240 },
                                    children: [new TextRun({ text, size: 18, font: "Arial" })]
                                }));
                            }
                        });
                    }
                }
            });
        });

        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: { 
                    top: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                    left: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                    right: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "EEEEEE" } 
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 35, type: WidthType.PERCENTAGE },
                                margins: { right: 200, left: 0 },
                                children: leftChildren
                            }),
                            new TableCell({
                                width: { size: 65, type: WidthType.PERCENTAGE },
                                margins: { left: 400, right: 0 },
                                children: rightChildren
                            })
                        ]
                    })
                ]
            })
        );
    } else {
        // Shared logic for Compact and Classic - Build contact info with website
        const contactInfo = [data.basics.email, data.basics.phone, data.basics.location, data.basics.website]
            .filter(Boolean)
            .join(" | ");

        if (templateId === "compact") {
            // Header for Compact uses a 2-column layout (Name/Label on Left, Contact on Right)
            children.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                        left: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                        right: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                        insideVertical: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
                        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "ffffff" }
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [
                                        new Paragraph({
                                            spacing: { before: 0, after: 30 },
                                            children: [new TextRun({ text: data.basics.name.toUpperCase(), bold: true, size: 40, font: "Arial", color: hex })]
                                        }),
                                        new Paragraph({
                                            spacing: { before: 0, after: 100 },
                                            children: [new TextRun({ text: data.basics.label || "", size: 22, font: "Arial", color: "666666" })]
                                        })
                                    ]
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            spacing: { before: 0, after: 100 },
                                            children: [new TextRun({ text: contactInfo, size: 16, font: "Arial", color: "777777" })]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );
            children.push(
                new Paragraph({
                    border: { bottom: { color: "CCCCCC", style: BorderStyle.SINGLE, size: 4, space: 1 } },
                    spacing: { before: 0, after: 150 }
                })
            );
        } else {
            // Classic Template (Centered)
            children.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: data.basics.name.toUpperCase(), bold: true, size: 48, font: "Arial", color: hex })]
                })
            );
            if (data.basics.label) {
                children.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        children: [new TextRun({ text: data.basics.label, size: 24, font: "Arial", color: "444444" })]
                    })
                );
            }
            children.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                    border: { bottom: { color: hex, style: BorderStyle.SINGLE, size: 24, space: 10 } },
                    children: [new TextRun({ text: contactInfo, size: 18, font: "Arial", color: "555555" })]
                })
            );
        }

        // Sections - Use DOM-based parsing for proper headers
        data.sections.forEach(section => {
            if (templateId === "compact") {
                // Compact section header with left border
                children.push(
                    new Paragraph({
                        spacing: { before: 150, after: 75 },
                        border: { left: { color: hex, style: BorderStyle.SINGLE, size: 24, space: 15 } },
                        indent: { left: 250 },
                        children: [
                            new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, color: hex, font: "Arial" })
                        ]
                    })
                );
            } else {
                children.push(
                    new Paragraph({
                        spacing: { before: 300, after: 100 },
                        border: { bottom: { color: "CCCCCC", style: BorderStyle.SINGLE, size: 4, space: 4 } },
                        children: [
                            new TextRun({ text: section.title.toUpperCase(), bold: true, size: 24, color: hex, font: "Arial" })
                        ]
                    })
                );
            }

            // Parse HTML content using DOM
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = section.content;

            Array.from(tempDiv.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = (node.textContent || '').trim();
                    if (text) {
                        const fontSize = templateId === "compact" ? 18 : 20;
                        const spacing = templateId === "compact" ? { before: 40, after: 40 } : { before: 50, after: 50 };
                        children.push(new Paragraph({
                            spacing,
                            children: [new TextRun({ text, size: fontSize, font: "Arial" })]
                        }));
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const elem = node as HTMLElement;
                    if (elem.tagName === 'P') {
                        const strong = elem.querySelector('strong');
                        if (strong) {
                            // Bold header (role | company | date)
                            const headerText = strong.textContent || '';
                            const headerSize = templateId === "compact" ? 18 : 20;
                            children.push(new Paragraph({
                                spacing: { before: 80, after: 50 },
                                children: [new TextRun({ text: headerText, bold: true, size: headerSize, font: "Arial" })]
                            }));
                        } else {
                            const text = elem.textContent || '';
                            if (text.trim()) {
                                const fontSize = templateId === "compact" ? 18 : 20;
                                const spacing = templateId === "compact" ? { before: 40, after: 40 } : { before: 50, after: 50 };
                                children.push(new Paragraph({
                                    spacing,
                                    children: [new TextRun({ text: text.trim(), size: fontSize, font: "Arial" })]
                                }));
                            }
                        }
                    } else if (elem.tagName === 'UL') {
                        Array.from(elem.querySelectorAll('li')).forEach(li => {
                            const text = (li.textContent || '').trim();
                            if (text) {
                                const bulletSize = templateId === "compact" ? 18 : 20;
                                children.push(new Paragraph({
                                    spacing: { before: 35, after: 35 },
                                    bullet: { level: 0 },
                                    indent: { left: 400, hanging: 240 },
                                    children: [new TextRun({ text, size: bulletSize, font: "Arial" })]
                                }));
                            }
                        });
                    }
                }
            });
        })
    }

    const isCompact = templateId === "compact";
    const doc = new Document({
        sections: [{
            properties: {
                page: { margin: { 
                    top: isCompact ? 500 : 720, 
                    right: isCompact ? 500 : 720, 
                    bottom: isCompact ? 500 : 720, 
                    left: isCompact ? 500 : 720 
                } }
            },
            children: children,
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
