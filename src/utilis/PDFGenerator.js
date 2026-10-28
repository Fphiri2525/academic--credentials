import jsPDF from "jspdf";

export const generateAndDownloadPDF = (reportData = {}) => {
  const pdf = new jsPDF();
  let y = 20;

  const write = (text, size = 11, indent = 20, gap = 7) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(String(text), 190 - indent);
    lines.forEach((line) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, indent, y);
      y += gap;
    });
  };

  write(reportData.title || "Academic Credentials Verification Report", 18, 20, 9);
  write(`Generated: ${reportData.generatedAt || "N/A"}`);
  write(`Total Records: ${reportData.totalCount ?? "N/A"}`);
  if (reportData.totalQRCodes !== undefined) {
    write(`Total QR Codes Generated: ${reportData.totalQRCodes}`);
  }
  y += 4;
  write(reportData.description || "");
  y += 6;

  (reportData.universities || []).forEach((uni) => {
    write(uni.name, 13, 20, 8);
    if (uni.category) write(`Category: ${uni.category}`, 11, 25);
    if (uni.programCount !== undefined) write(`Programs: ${uni.programCount}`, 11, 25);
    if (uni.graduateCount !== undefined) write(`Graduates: ${uni.graduateCount}`, 11, 25);
    if (uni.count !== undefined) write(`Verifications: ${uni.count}`, 11, 25);
    y += 4;
  });

  pdf.save(`${(reportData.title || "report").replace(/\s+/g, "-").toLowerCase()}.pdf`);
};