import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './CertificateGenerator.module.css';

const CertificateGenerator = ({
  studentData,
  onClose,
  isGenerating,
  darkMode = false
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const certificateRef = useRef(null);

  // Enhanced getThemeClass function with more Malawian universities
  const getThemeClass = (universityName) => {
    if (!universityName) return styles.themeDefault;
    const name = universityName.toLowerCase();

    // Map university names to their respective themes
    if (name.includes("unima") || name.includes("university of malawi")) {
      return styles.themeUnima;
    } else if (name.includes("mubas") || name.includes("malawi university of business and applied sciences")) {
      return styles.themeMubas;
    } else if (name.includes("must") || name.includes("malawi university of science and technology")) {
      return styles.themeMust;
    } else if (name.includes("luanar") || name.includes("lilongwe university of agriculture and natural resources")) {
      return styles.themeLuanar;
    } else if (name.includes("mzuni") || name.includes("mzuzu university")) {
      return styles.themeMzuni;
    } else if (name.includes("catholic") || name.includes("catholic university")) {
      return styles.themeCatholic;
    } else if (name.includes("dmi") || name.includes("dedza") || name.includes("david livingstone")) {
      return styles.themeMzuni; // Using MZUNI theme as fallback
    } else if (name.includes("blantyre international university") || name.includes("biu")) {
      return styles.themeMubas; // Using MUBAS theme as fallback
    } else if (name.includes("explore") || name.includes("explore university")) {
      return styles.themeDefault;
    } else if (name.includes("african bible college") || name.includes("abc")) {
      return styles.themeCatholic; // Similar to Catholic theme
    } else if (name.includes("livingstonia") || name.includes("the university of livingstonia")) {
      return styles.themeUnima; // Similar to UNIMA theme
    } else if (name.includes("accountancy") || name.includes("icam")) {
      return styles.themeMubas; // Business-oriented institution
    } else if (name.includes("nurs") || name.includes("nursing") || name.includes("kamuzu college of nursing")) {
      return styles.themeUnima; // Part of UNIMA system
    } else if (name.includes("polytechnic") || name.includes("technical")) {
      return styles.themeMubas; // Technical institution
    } else if (name.includes("medicine") || name.includes("college of medicine")) {
      return styles.themeUnima; // Part of UNIMA system
    } else if (name.includes("chancellor college") || name.includes("chanco")) {
      return styles.themeUnima; // Part of UNIMA system
    } else {
      return styles.themeDefault;
    }
  };

  // Process student data to ensure all values are strings
  useEffect(() => {
    if (studentData) {
      try {
        // The actual student record might be nested inside a 'student' property or at index 0.
        // This logic robustly finds the correct object to process.
        const dataToProcess = studentData.student && typeof studentData.student === 'object' 
                            ? studentData.student
                            : (studentData[0] && typeof studentData[0] === 'object' ? studentData[0] : studentData);

        // Handle Solidity struct or regular object
        const processData = (data) => {
          if (!data) return null;

          // Extract qrCode properly - handle various data structures
          let qrCodeValue = '';
          
          // Case 1: Direct qrCode property (string)
          if (data.qrCode && typeof data.qrCode === 'string') {
            qrCodeValue = data.qrCode;
          }
          // Case 2: Array format from Solidity struct (index 6)
          else if (data[6]) {
            qrCodeValue = data[6];
          }
          // Case 3: hashValue property
          else if (data.hashValue) {
            qrCodeValue = data.hashValue;
          }
          // Case 4: qrCodeHash property (from updated contract)
          else if (data.qrCodeHash) {
            qrCodeValue = data.qrCodeHash;
          }

          // Clean the QR code value
          qrCodeValue = String(qrCodeValue || '').trim();

          // IMPORTANT: Remove any boolean values that might have been concatenated
          if (qrCodeValue === 'true' || qrCodeValue === 'false' || qrCodeValue === '') {
            console.warn('⚠️ Invalid QR code detected. Will generate from student data.');
            qrCodeValue = '';
          }

          console.log('📋 Extracted QR Code:', qrCodeValue);

          return {
            universityName: String(data.universityName || data[0] || '').trim(),
            studentName: String(data.studentName || data[1] || '').trim(),
            programOfStudy: String(data.programOfStudy || data[2] || '').trim(),
            award: String(data.award || data[3] || '').trim(),
            yearOfGraduation: String(data.yearOfGraduation || data[4] || '').trim(),
            registrationNumber: String(data.registrationNumber || data[5] || data.regNumber || '').trim(),
            issueDate: String(data.issueDate || new Date().toISOString().split('T')[0]).trim(),
            qrCode: qrCodeValue
          };
        };

        const processed = processData(dataToProcess);
        console.log('✅ Processed student data:', processed);
        setProcessedData(processed);
      } catch (error) {
        console.error('❌ Error processing student data:', error);
        setProcessedData(null);
      }
    }
  }, [studentData]);

  // Generate QR code from blockchain data
  useEffect(() => {
    const generateQRCode = async () => {
      if (processedData) {
        try {
          let qrDataString = '';

          // Use blockchain QR code if available and valid
          if (processedData.qrCode && 
              processedData.qrCode !== 'true' && 
              processedData.qrCode !== 'false' &&
              processedData.qrCode.length > 10) {
            
            console.log('🔗 Using blockchain QR code hash:', processedData.qrCode);
            
            // IMPORTANT: Use ONLY the hash value from blockchain
            // This hash is what's stored on the blockchain and can be verified
            qrDataString = processedData.qrCode;
            console.log('📦 QR Data (Blockchain Hash):', qrDataString);
          } else {
            // Fallback: Use registration number and award combination
            console.warn('⚠️ No valid blockchain QR code. Using registration data.');
            qrDataString = `${processedData.registrationNumber}|${processedData.award}`;
          }

          // Generate QR code with optimal settings for scanning
          const qrDataURL = await QRCode.toDataURL(qrDataString, {
            width: 300, // Increased size for better scanning
            margin: 4, // More margin for better detection
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M' // Medium - better balance for hash data
          });

          setQrCodeDataURL(qrDataURL);
          console.log('✅ QR code generated successfully');
          console.log('📏 QR Data Length:', qrDataString.length, 'characters');
          console.log('📋 QR Contains:', qrDataString.substring(0, 50) + '...');
          
        } catch (error) {
          console.error('❌ Error generating QR code:', error);
          
          // Last resort fallback - super simple
          try {
            const emergencyData = `${processedData.registrationNumber}|${processedData.award}`;
            const fallbackQR = await QRCode.toDataURL(emergencyData, {
              width: 300,
              margin: 4,
              errorCorrectionLevel: 'M'
            });
            setQrCodeDataURL(fallbackQR);
            console.log('⚠️ Using emergency fallback QR code');
          } catch (fallbackError) {
            console.error('❌ All QR generation methods failed:', fallbackError);
          }
        }
      }
    };

    if (processedData) {
      generateQRCode();
    }
  }, [processedData]);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      setIsDownloading(true);
      
      // Create canvas from certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Calculate dimensions to fit the page
      const imgWidth = 297; // A4 landscape width
      const imgHeight = 210; // A4 landscape height
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const filename = `Certificate_${processedData.studentName.replace(/\s+/g, '_')}_${processedData.yearOfGraduation}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const printCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${processedData.studentName}</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                body { margin: 0; }
                .certificate { 
                  width: 100vw; 
                  height: 100vh; 
                  margin: 0; 
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${certificateRef.current.outerHTML}
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for images to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      };
    } catch (error) {
      console.error('Error printing certificate:', error);
      alert('Failed to print certificate. Please try again.');
    }
  };

  if (!studentData || !processedData) {
    return (
      <div className={`${styles.modal} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.modalContent}>
          <div className={styles.errorMessage}>
            {!studentData ? 'No student data available for certificate generation.' : 'Processing student data...'}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.modal} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>Certificate Preview - {processedData.universityName}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.certificateContainer}>
          <div 
            ref={certificateRef}
            className={`${styles.certificate} ${getThemeClass(processedData.universityName)}`}
          >
            {/* Certificate Border */}
            <div className={styles.certificateBorder}>
              {/* Header Section */}
              <div className={styles.certificateHeader}>
                <div className={styles.universitySeal}>
                  <div className={styles.sealCircle}>
                    <span className={styles.sealText}>SEAL</span>
                  </div>
                </div>
                <div className={styles.universityInfo}>
                  <h1 className={styles.universityName}>
                    {processedData.universityName || 'University Name'}
                  </h1>
                  <p className={styles.universitySubtitle}>
                    CERTIFICATE OF COMPLETION
                  </p>
                </div>
                <div className={styles.certificateNumber}>
                  <span className={styles.certNumberLabel}>Certificate No:</span>
                  <span className={styles.certNumber}>{processedData.registrationNumber}</span>
                </div>
              </div>

              {/* Main Content */}
              <div className={styles.certificateContent}>
                <div className={styles.thisIsToCertify}>
                  <p>This is to certify that</p>
                </div>

                <div className={styles.studentName}>
                  <h2>{processedData.studentName}</h2>
                </div>

                <div className={styles.programDetails}>
                  <p>
                    has successfully completed the program of study in
                  </p>
                  <div className={styles.programName}>
                    <strong>{processedData.programOfStudy}</strong>
                  </div>
                  <p>
                    and is hereby awarded the degree of
                  </p>
                  <div className={styles.awardDegree}>
                    <strong>{processedData.award}</strong>
                  </div>
                  <p>
                    in the year {processedData.yearOfGraduation}
                  </p>
                </div>

                {/* QR Code Section */}
                <div className={styles.qrCodeSection}>
                  {qrCodeDataURL ? (
                    <div className={styles.qrCodeContainer}>
                      <img 
                        src={qrCodeDataURL} 
                        alt="Certificate QR Code"
                        className={styles.qrCode}
                      />
                      <p className={styles.qrCodeLabel}>
                        {processedData.qrCode && processedData.qrCode.length > 10 
                          ? 'Blockchain Verified' 
                          : 'Certificate Data'}
                      </p>
                      <p className={styles.qrCodeSubLabel}>Scan to verify authenticity</p>
                      {processedData.qrCode && processedData.qrCode.length > 10 && (
                        <p className={styles.qrCodeHash}>
                          Hash: {processedData.qrCode.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.qrCodeLoading}>
                      <div className={styles.spinner}></div>
                      <span>Generating QR Code...</span>
                    </div>
                  )}
                </div>

                {/* Signatures Section */}
                <div className={styles.signaturesSection}>
                  <div className={styles.signature}>
                    <div className={styles.signatureLine}></div>
                    <p className={styles.signatureLabel}>Registrar</p>
                  </div>
                  <div className={styles.signature}>
                    <div className={styles.signatureLine}></div>
                    <p className={styles.signatureLabel}>Vice Chancellor</p>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.certificateFooter}>
                  <p className={styles.issueDate}>
                    Issued on: {processedData.issueDate}
                  </p>
                  <p className={styles.verificationNote}>
                    This certificate can be verified using the QR code above
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            onClick={downloadCertificate}
            disabled={isDownloading || isGenerating}
            className={styles.downloadButton}
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
          
          <button 
            onClick={printCertificate}
            disabled={isDownloading || isGenerating}
            className={styles.printButton}
          >
            Print Certificate
          </button>
          
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;