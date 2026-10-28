import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.currentY = this.margin;
  }

  // Initialize new PDF document
  initDocument() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = this.margin;
    return this.doc;
  }

  // Add header with logo and title
  addHeader(title, subtitle = '') {
    if (!this.doc) this.initDocument();

    // Add title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;

    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(127, 140, 141);
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 10;
    }

    // Add horizontal line
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  // Add metadata section
  addMetadata(data) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);

    const metaData = [
      `Generated on: ${data.generatedAt}`,
      `Total Universities: ${data.totalCount}`,
      `Report Type: ${data.title}`
    ];

    metaData.forEach(item => {
      this.doc.text(item, this.margin, this.currentY);
      this.currentY += 8;
    });

    this.currentY += 10;
  }

  // Add description section
  addDescription(description) {
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(44, 62, 80);

    const lines = this.doc.splitTextToSize(description, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 6 + 15;
  }

  // Add chart from canvas element
  async addChart(chartElement, title) {
    if (!chartElement) return;

    try {
      // Add chart title
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 15;

      // Convert chart to canvas with high quality
      const canvas = await html2canvas(chartElement, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Calculate dimensions to fit page
      const imgWidth = this.pageWidth - 2 * this.margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if we need a new page
      if (this.currentY + imgHeight > this.pageHeight - this.margin) {
        this.addNewPage();
      }

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 20;

    } catch (error) {
      console.error('Error adding chart to PDF:', error);
      // Add fallback text
      this.doc.setFontSize(12);
      this.doc.setTextColor(231, 76, 60);
      this.doc.text('Chart could not be rendered', this.margin, this.currentY);
      this.currentY += 15;
    }
  }

  // Add university data table (supports both accredited and graduate reports)
  addUniversityTable(universities, reportType = 'accredited') {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);

    const title = reportType === 'graduate' ?
      'Graduate Details by University' :
      reportType === 'verification' ? 'Verification Details by University' :
      'Accredited Universities and Programs';

    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;

    universities.forEach((university, index) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage();
      }

      // University header
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(41, 128, 185);
      this.doc.text(`${index + 1}. ${university.name}`, this.margin, this.currentY);
      this.currentY += 10;

      // University details
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(44, 62, 80);

      const details = [
        `Category: ${university.category}`,
        `Contact: ${university.contactInfo}`
      ];

      if (reportType === 'graduate') {
        details.push(`Total Graduates: ${university.graduateCount || 0}`);
      } else if (reportType === 'verification') {
        details.push(`Total Verifications: ${university.count || 0}`);
        details.push(`Programs Verified: ${university.programCount || 0}`);
        details.push(`Award Types: ${university.awardCount || 0}`);
      } else {
        details.push(`Total Programs: ${university.programCount || 0}`);
      }

      details.forEach(detail => {
        this.doc.text(detail, this.margin + 5, this.currentY);
        this.currentY += 6;
      });

      // Graduate-specific information
      if (reportType === 'graduate' && university.graduateCount > 0) {
        // Graduates by year
        if (university.graduatesByYear && Object.keys(university.graduatesByYear).length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Graduates by Year:', this.margin + 5, this.currentY);
          this.currentY += 8;

          this.doc.setFont('helvetica', 'normal');
          Object.entries(university.graduatesByYear)
            .sort(([a], [b]) => b.localeCompare(a))
            .forEach(([year, count]) => {
              this.doc.text(`• ${year}: ${count} graduates`, this.margin + 10, this.currentY);
              this.currentY += 6;
            });
          this.currentY += 5;
        }

        // Graduates by program
        if (university.graduatesByProgram && Object.keys(university.graduatesByProgram).length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Graduates by Program:', this.margin + 5, this.currentY);
          this.currentY += 8;

          this.doc.setFont('helvetica', 'normal');
          Object.entries(university.graduatesByProgram)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10) // Show top 10 programs
            .forEach(([program, count]) => {
              this.doc.text(`• ${program}: ${count} graduates`, this.margin + 10, this.currentY);
              this.currentY += 6;

              // Check if we need a new page
              if (this.currentY > this.pageHeight - 30) {
                this.addNewPage();
              }
            });
        }
      }

      // Verification-specific information
      if (reportType === 'verification' && university.count > 0) {
        // Programs with verifications
        if (university.programs && university.programs.length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Programs with Verifications:', this.margin + 5, this.currentY);
          this.currentY += 8;

          this.doc.setFont('helvetica', 'normal');
          university.programs.slice(0, 10).forEach((program) => {
            this.doc.text(`• ${program}`, this.margin + 10, this.currentY);
            this.currentY += 6;

            // Check if we need a new page
            if (this.currentY > this.pageHeight - 30) {
              this.addNewPage();
            }
          });
          this.currentY += 5;
        }

        // Recent verifications sample
        if (university.verifications && university.verifications.length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Recent Verifications (Sample):', this.margin + 5, this.currentY);
          this.currentY += 8;

          this.doc.setFont('helvetica', 'normal');
          university.verifications.slice(0, 5).forEach((verification) => {
            const verificationText = `• ${verification.studentName} - ${verification.programOfStudy} (${verification.yearOfGraduation})`;
            this.doc.text(verificationText, this.margin + 10, this.currentY);
            this.currentY += 6;

            // Check if we need a new page
            if (this.currentY > this.pageHeight - 30) {
              this.addNewPage();
            }
          });
        }
      }

      // Programs list for accredited reports
      if (reportType === 'accredited' && university.programs && university.programs.length > 0) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Programs Offered:', this.margin + 5, this.currentY);
        this.currentY += 8;

        this.doc.setFont('helvetica', 'normal');
        university.programs.forEach((program) => {
          const programName = program.name || program;
          this.doc.text(`• ${programName}`, this.margin + 10, this.currentY);
          this.currentY += 6;

          // Check if we need a new page within programs
          if (this.currentY > this.pageHeight - 30) {
            this.addNewPage();
          }
        });
      }

      this.currentY += 10;
    });
  }

  // Add new page
  addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  // Add footer with page numbers
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(127, 140, 141);
      
      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin - 20,
        this.pageHeight - 10
      );
      
      // Generated by text
      this.doc.text(
        'Generated by MANEB Certificate Verification System',
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  // Generate complete report PDF
  async generateReportPDF(reportData, chartElement) {
    try {
      this.initDocument();

      // Detect report type
      const isGraduateReport = reportData.title.toLowerCase().includes('graduate');
      const isVerificationReport = reportData.title.toLowerCase().includes('verification');
      const reportType = isGraduateReport ? 'graduate' :
                        isVerificationReport ? 'verification' : 'accredited';

      // Add header
      this.addHeader(reportData.title,
        isGraduateReport ? 'Comprehensive Graduate Report' :
        isVerificationReport ? 'Comprehensive Verification Report' :
        'Comprehensive University Report');

      // Add metadata
      this.addMetadata(reportData);

      // Add description
      this.addDescription(reportData.description);

      // Add chart if available
      if (chartElement && reportData.chartData && reportData.chartData.length > 0) {
        const chartTitle = isGraduateReport ?
          'Universities vs Number of Graduates' :
          isVerificationReport ? 'Universities vs Number of Verifications' :
          'Universities vs Number of Programs';
        await this.addChart(chartElement, chartTitle);
      }

      // Add university table
      if (reportData.universities && reportData.universities.length > 0) {
        this.addUniversityTable(reportData.universities, reportType);
      }

      // Add footer
      this.addFooter();

      return this.doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Download PDF
  downloadPDF(filename = 'report.pdf') {
    if (this.doc) {
      this.doc.save(filename);
    }
  }
}

// Export utility functions
export const generateAndDownloadPDF = async (reportData, chartElement) => {
  try {
    const pdfGenerator = new PDFGenerator();
    await pdfGenerator.generateReportPDF(reportData, chartElement);
    
    const filename = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdfGenerator.downloadPDF(filename);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};
