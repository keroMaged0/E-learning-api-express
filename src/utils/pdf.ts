import fs from "fs";
import PDFDocument from "pdfkit";

/**
 * Creates a certificate PDF for a user.
 * @param {string} name - The name of the recipient.
 * @param {string} courseName - The name of the course.
 * @param {string} instructor - The name of the instructor.
 * @param {string} outputPath - The path where the PDF will be saved.
 */
export function createCertificate(name, courseName, instructor, path) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set the background color
    doc.rect(2, 0, doc.page.width, doc.page.height).fill('#FFFDD1');

    // Draw decorative frame
    drawFrame(doc);

    // Generate certificate header
    generateHeader(doc);

    // Generate recipient information
    generateRecipientInfo(doc, name, courseName);

    // Generate footer with instructor information
    generateFooter(doc, instructor);

    // Finalize the document and write to the specified path
    doc.end();
    doc.pipe(fs.createWriteStream(path));
}

function drawFrame(doc) {
    const margin = 30; // Outer margin
    const decorativeMargin = margin + 5; // Decorative inner margin

    // Draw outer frame
    doc
        .lineWidth(3)
        .strokeColor('#000000')
        .rect(margin, margin, doc.page.width - margin * 2, doc.page.height - margin * 2)
        .stroke()
        .moveDown(4);

    // Draw inner decorative frame
    doc
        .lineWidth(1)
        .strokeColor('#000000')
        .rect(decorativeMargin, decorativeMargin, doc.page.width - decorativeMargin * 2, doc.page.height - decorativeMargin * 2)
        .stroke();

    // Add decorative lines
    doc
        .lineWidth(0.5)
        .moveTo(decorativeMargin, decorativeMargin)
        .lineTo(doc.page.width - decorativeMargin, decorativeMargin) // Top line
        .moveTo(decorativeMargin, doc.page.height - decorativeMargin)
        .lineTo(doc.page.width - decorativeMargin, doc.page.height - decorativeMargin) // Bottom line
        .moveTo(decorativeMargin, decorativeMargin)
        .lineTo(decorativeMargin, doc.page.height - decorativeMargin) // Left line
        .moveTo(doc.page.width - decorativeMargin, decorativeMargin)
        .lineTo(doc.page.width - decorativeMargin, doc.page.height - decorativeMargin) // Right line
        .stroke();

    // Add decorative dots
    const dotSpacing = 10; // Spacing between dots
    for (let i = 0; i <= (doc.page.width - 2 * decorativeMargin) / dotSpacing; i++) {
        doc.circle(decorativeMargin + i * dotSpacing, decorativeMargin - 5, 2).fill('#000000'); // Top dots
        doc.circle(decorativeMargin + i * dotSpacing, doc.page.height - decorativeMargin + 5, 2).fill('#000000'); // Bottom dots
    }

    for (let i = 0; i <= (doc.page.height - 2 * decorativeMargin) / dotSpacing; i++) {
        doc.circle(decorativeMargin - 5, decorativeMargin + i * dotSpacing, 2).fill('#000000'); // Left dots
        doc.circle(doc.page.width - decorativeMargin + 5, decorativeMargin + i * dotSpacing, 2).fill('#000000'); // Right dots
    }
}

function generateHeader(doc) {
    doc
        .fillColor("#333333")
        .font("Times-Bold")
        .fontSize(36)
        .text("Certificate of Completion", { align: "center", underline: true })
        .moveDown(1.5); // Move down a little further
    // Move down a little further
}

function generateRecipientInfo(doc, name, courseName) {
    doc
        .fontSize(18)
        .text("This certificate is awarded to", { align: "center" })
        .moveDown();

    doc
        .fontSize(30)
        .font("Helvetica-Bold")
        .text(name, { align: "center" })
        .moveDown();

    doc
        .fontSize(16)
        .font("Helvetica")
        .text(`For successfully completing the course:`, { align: "center" })
        .moveDown();

    doc
        .fontSize(20)
        .font("Helvetica-Oblique")
        .text(courseName, { align: "center" })
        .moveDown();

    doc.moveDown(3);
}

function generateFooter(doc, instructor) {
    const currentDate = new Date().toLocaleDateString();
    doc
        .fontSize(16)
        .font("Helvetica")
        .text("Date of Issue:", { align: "center" })
        .moveDown()
        .text(currentDate, { align: "center" })
        .moveDown(2);

    doc
        .fontSize(18)
        .text("Authorized by", { align: "center" })
        
    doc
        .text("____________________", { align: "center" }) // Signature line
        .moveDown()
        .fontSize(22) // Increase font size for instructor name
        .font("Times-Italic")
        .text(`${instructor}`, { align: "center" });
}
