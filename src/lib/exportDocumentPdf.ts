import type { DocumentData } from "@/lib/document";

// Colours, matching the on-screen document
const INK = "#15131F";
const BODY = "#3A3846";
const MUTED = "#5B5868";
const ACCENT = "#6C47FF";
const CALLOUT_BG = "#F3F0FF";
const RULE = "#E7E4EF";

export async function downloadDocumentPdf(doc: DocumentData) {
  // Load jsPDF only when someone clicks Download, so the page itself stays light
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  const footerSpace = 30;

  let y = margin; // where the next line will be written

  // Start a new page if the next piece won't fit
  function ensureSpace(height: number) {
    if (y + height > pageHeight - margin - footerSpace) {
      pdf.addPage();
      y = margin;
    }
  }

  function setStyle(size: number, bold: boolean, color: string) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(color);
  }

  // Writes wrapped text, moving to a new page whenever needed
  function writeText(
    text: string,
    { size, bold = false, color = BODY, indent = 0, lineHeight = 1.5 }: {
      size: number;
      bold?: boolean;
      color?: string;
      indent?: number;
      lineHeight?: number;
    }
  ) {
    setStyle(size, bold, color);
    const lines: string[] = pdf.splitTextToSize(text, contentWidth - indent);
    const lineGap = size * lineHeight;

    for (const line of lines) {
      ensureSpace(lineGap);
      pdf.text(line, margin + indent, y, { baseline: "top" });
      y += lineGap;
    }
  }

  // ---------- Title ----------
  writeText(doc.title, { size: 24, bold: true, color: INK, lineHeight: 1.25 });
  y += 6;

  if (doc.subtitle) {
    writeText(doc.subtitle, { size: 13, color: MUTED });
  }

  y += 10;
  pdf.setDrawColor(RULE);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 22;

  // ---------- Blocks ----------
  for (const block of doc.blocks) {
    switch (block.type) {
      case "heading":
        y += 16;
        ensureSpace(80); // keep a heading together with the text after it
        writeText(block.text, { size: 16, bold: true, color: INK, lineHeight: 1.3 });
        y += 6;
        break;

      case "subheading":
        y += 10;
        ensureSpace(60);
        writeText(block.text, { size: 13, bold: true, color: INK, lineHeight: 1.3 });
        y += 4;
        break;

      case "paragraph":
        writeText(block.text, { size: 11 });
        y += 10;
        break;

      case "bullets":
        for (const item of block.items) {
          ensureSpace(11 * 1.5);
          const bulletY = y;
          writeText(item, { size: 11, indent: 16 });
          setStyle(11, true, ACCENT);
          pdf.text("•", margin + 2, bulletY, { baseline: "top" });
          y += 4;
        }
        y += 8;
        break;

      case "callout": {
        // Measure the box first so it never splits across two pages
        setStyle(11, true, INK);
        const lines: string[] = pdf.splitTextToSize(block.text, contentWidth - 36);
        const boxHeight = 18 + 14 + lines.length * 11 * 1.5 + 14;

        y += 6;
        ensureSpace(boxHeight);
        pdf.setFillColor(CALLOUT_BG);
        pdf.roundedRect(margin, y, contentWidth, boxHeight, 8, 8, "F");

        setStyle(8, true, ACCENT);
        pdf.text("KEY TAKEAWAY", margin + 18, y + 18, { baseline: "top" });

        setStyle(11, true, INK);
        pdf.text(lines, margin + 18, y + 36, { baseline: "top", lineHeightFactor: 1.5 });

        y += boxHeight + 16;
        break;
      }
    }
  }

  // ---------- Page numbers ----------
  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);
    setStyle(9, false, MUTED);
    pdf.text(`${page} / ${totalPages}`, pageWidth / 2, pageHeight - margin / 2, {
      align: "center",
    });
  }

  pdf.save(`${toFileName(doc.title)}.pdf`);
}

// "How to Study Effectively!" → "how-to-study-effectively"
function toFileName(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "document"
  );
}