import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, AlertCircle, RefreshCw, Mail, Eye } from 'lucide-react';
import QRCode from 'qrcode';
import { useManebContract, useAccreditationManagement, useConnectionStatus, useCertificateManagement } from '../hooks/useSmartContract';
import StudentTopBar from './StudentTopBar';
import styles from './Student.module.css';

const QRCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useConnectionStatus();
  
  // Get student details from navigation state
  const { studentDetails, educationLevel } = location.state || {};
  
  // State management
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Success notification popup state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationShown, setNotificationShown] = useState(false);

  // State for QR code viewing
  const [userEmail, setUserEmail] = useState('');
  const [isViewingQR, setIsViewingQR] = useState(false);
  const [viewQRError, setViewQRError] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  // Get contract functions
  const { getFormHashByExamAndYear, addVerificationRequest } = useManebContract();
  const { getQRCodeByRegNumberAndAward, addQR } = useAccreditationManagement();
  const { addViewQRCodeDetails, getQRCodeByEmail } = useCertificateManagement();

  // Show success notification popup - only once per action
  const showSuccessPopup = (message) => {
    // Prevent multiple notifications for the same action
    if (notificationShown || showSuccessNotification) {
      return;
    }

    setNotificationShown(true);
    setSuccessMessage(message);
    setShowSuccessNotification(true);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 4000);
  };

  // Generate QR Code
  const generateQRCode = async () => {
    if (!studentDetails) {
      setError('No student details available for QR code generation.');
      return;
    }

    if (!isConnected) {
      setError('❌ Please connect your wallet to generate QR code.');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isGeneratingQR) {
      return;
    }

    try {
      setIsGeneratingQR(true);
      setError('');
      setSuccess('');
      // Reset notification state to allow new notification
      setShowSuccessNotification(false);
      setNotificationShown(false);

      let hashValue = '';

      if (educationLevel === 'secondary') {
        console.log('🔍 Getting hash value for secondary education...');

        // Get hash value from MANEB contract
        const result = await getFormHashByExamAndYear(
          studentDetails.examinationNumber,
          studentDetails.yearOfExamination
        );

        console.log('📋 MANEB hash result:', result);
        console.log('📋 Result type:', typeof result);

        if (result) {
          // The function returns the hash directly as a string, not an object with hashValue property
          hashValue = typeof result === 'string' ? result : result.hashValue || result;
          console.log('✅ Hash value retrieved:', hashValue);
        } else {
          throw new Error('Failed to retrieve hash value for secondary education');
        }

      } else if (educationLevel === 'tertiary') {
        console.log('🔍 Getting QR code value for tertiary education...');

        // Get QR code value directly from Certificate Management contract
        const result = await getQRCodeByRegNumberAndAward(
          studentDetails.registrationNumber,
          studentDetails.award
        );

        console.log('📋 Tertiary QR code result:', result);
        console.log('📋 Result type:', typeof result);

        if (result && result.found && result.qrCodeValue) {
          // Extract the actual QR code value from the result object
          hashValue = result.qrCodeValue;
          console.log('✅ QR code value retrieved:', hashValue);
          console.log('✅ QR code value type:', typeof hashValue);
        } else if (result && typeof result === 'string' && (result.startsWith('0x') || /^[a-fA-F0-9]{64}$/.test(result))) {
          // If result is directly a QR code string (with or without 0x prefix)
          hashValue = result.startsWith('0x') ? result : '0x' + result;
          console.log('✅ Direct QR code value retrieved:', hashValue);
        } else {
          // Handle error cases
          const errorMessage = result?.qrCodeValue || result?.message || 'No QR code found';
          console.error('❌ QR code retrieval failed:', errorMessage);
          throw new Error(`Failed to retrieve QR code value for tertiary education: ${errorMessage}`);
        }
      }

      // Validate QR code value before QR generation
      if (!hashValue) {
        throw new Error(`No ${educationLevel === 'tertiary' ? 'QR code value' : 'hash value'} found for the provided details`);
      }

      // Check if QR code value is a valid hex string
      if (typeof hashValue !== 'string') {
        console.error(`❌ ${educationLevel === 'tertiary' ? 'QR code value' : 'Hash value'} is not a string:`, hashValue);
        throw new Error(`Invalid ${educationLevel === 'tertiary' ? 'QR code value' : 'hash value'} format - expected string`);
      }

      // Check for error messages in QR code value
      if (hashValue.includes('already exists') || hashValue.includes('not found') || hashValue.includes('error')) {
        console.error(`❌ ${educationLevel === 'tertiary' ? 'QR code value' : 'Hash value'} contains error message:`, hashValue);
        throw new Error(`${educationLevel === 'tertiary' ? 'QR code' : 'Hash'} retrieval error: ${hashValue}`);
      }

      // Check for empty or zero hash (handle both prefixed and non-prefixed)
      const zeroHash64 = '0000000000000000000000000000000000000000000000000000000000000000';
      const zeroHashPrefixed = '0x' + zeroHash64;
      if (hashValue === zeroHashPrefixed || hashValue === zeroHash64 || hashValue.length < 10) {
        throw new Error('Invalid or empty hash value found');
      }

      // Ensure hash has 0x prefix for QR code generation
      if (!hashValue.startsWith('0x') && /^[a-fA-F0-9]{64}$/.test(hashValue)) {
        hashValue = '0x' + hashValue;
        console.log('🔧 Added 0x prefix to hash value:', hashValue);
      }

      console.log(`🔍 Final ${educationLevel === 'tertiary' ? 'QR code value' : 'hash value'} for QR generation:`, hashValue);
      console.log(`🔍 ${educationLevel === 'tertiary' ? 'QR code value' : 'Hash value'} type:`, typeof hashValue);
      console.log(`🔍 ${educationLevel === 'tertiary' ? 'QR code value' : 'Hash value'} length:`, hashValue.length);

      // ===== QR CODE PAGE ENCODING VERIFICATION =====
      console.log('');
      console.log('📱 ===== QR CODE PAGE ENCODING VERIFICATION =====');
      console.log(`🔑 FINAL ${educationLevel === 'tertiary' ? 'QR CODE VALUE' : 'HASH'} FOR QR ENCODING:`, hashValue);
      console.log(`📏 ${educationLevel === 'tertiary' ? 'QR Code Value' : 'Hash'} Length:`, hashValue.length);
      console.log(`🔤 ${educationLevel === 'tertiary' ? 'QR Code Value' : 'Hash'} Type:`, typeof hashValue);
      console.log('✅ Has 0x Prefix:', hashValue.startsWith('0x'));
      console.log('✅ Is Valid Hex:', /^0x[a-fA-F0-9]{64}$/.test(hashValue));
      console.log('📱 ============================================');
      console.log('');

      // Generate QR code from the retrieved value
      console.log(`🔄 Generating QR code from ${educationLevel === 'tertiary' ? 'QR code value' : 'hash value'}...`);
      const qrDataURL = await QRCode.toDataURL(hashValue, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataURL(qrDataURL);
      console.log('✅ QR code generated successfully');

      // Show popup notification immediately for successful QR code generation
      showSuccessPopup('🎉 QR Code Generated Successfully!');

      // Add QR record to blockchain
      try {
        console.log('🔄 Adding QR record to blockchain...');
        setSuccess('Adding QR record to blockchain... Please confirm transaction in MetaMask');

        let addQRResult;
        if (educationLevel === 'secondary') {
          // For secondary education, try addQRCodeDetails first, then fallback to addVerification
          console.log('🔄 Adding QR code details to MANEB blockchain...');
          console.log('📋 Hash value being sent:', hashValue);
          console.log('📋 Hash value type:', typeof hashValue);
          console.log('📋 Hash value length:', hashValue?.length);

          try {
            // Try primary function first
            addQRResult = await addQRCodeDetails(hashValue);
          } catch (primaryError) {
            console.warn('⚠️ Primary addQRCodeDetails failed, trying alternative addVerification:', primaryError.message);

            try {
              // Fallback to addVerification function
              addQRResult = await addQRCodeUsingVerification(hashValue);
              console.log('✅ Successfully used addVerification as fallback');
            } catch (fallbackError) {
              console.error('❌ Both QR code functions failed:', fallbackError.message);
              addQRResult = {
                success: false,
                error: `Both functions failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`
              };
            }
          }
        } else {
          // For tertiary education, use the addQR function from accreditation management
          addQRResult = await addQR(hashValue);
        }

        if (addQRResult.success) {
          console.log('✅ QR record added successfully to blockchain');
          setSuccess(`✅ QR code generated and recorded on blockchain
          
🔗 Transaction Hash: ${addQRResult.transactionHash?.substring(0, 20)}...
📱 QR code ready for download`);

          // Automatically associate QR code with email if provided
          if (userEmail) {
            console.log('🔄 Automatically associating QR code with email:', userEmail);
            await autoAssociateQRCode(hashValue, userEmail);
          }

        } else {
          console.warn('⚠️ Failed to add QR record to blockchain:', addQRResult.error);
          setSuccess(`✅ QR code generated but failed to record on blockchain: ${addQRResult.error}`);
        }
      } catch (qrError) {
        console.error('❌ Error adding QR record to blockchain:', qrError);
        setSuccess(`✅ QR code generated but blockchain recording failed: ${qrError.message}`);
      }

    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      setError(`❌ Failed to generate QR code: ${error.message}`);
      setQrCodeDataURL('');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Redirect if no student details or auto-generate QR code
  useEffect(() => {
    if (!studentDetails) {
      navigate('/student/details');
    } else {
      // Automatically generate QR code when page loads
      generateQRCode();
    }
  }, [studentDetails, navigate]);

  // View QR code by email
  const viewQRCodeByEmail = async () => {
    // Reset error and success messages
    setViewQRError('');
    setError('');
    
    // Validate email
    if (!userEmail || !userEmail.trim()) {
      setViewQRError('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setViewQRError('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsViewingQR(true);
      
      // Get QR code by email
      const result = await getQRCodeByEmail(userEmail);
      
      if (result && result.found && result.qrCode) {
        // Generate QR code from the retrieved value
        const qrCodeValue = result.qrCode;
        console.log('✅ QR code value retrieved from email:', qrCodeValue);
        
        // Generate QR code
        const qrDataURL = await QRCode.toDataURL(qrCodeValue, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataURL(qrDataURL);
        setSuccess('QR code successfully retrieved from blockchain!');
        
        // Reset notification state to allow new notification
        setNotificationShown(false);
        showSuccessPopup('QR Code Retrieved Successfully!');
        
        // Hide email input after successful retrieval
        setShowEmailInput(false);
      } else {
        setViewQRError('No QR code found for this email address.');
      }
    } catch (error) {
      console.error('Error retrieving QR code by email:', error);
      setViewQRError(`Error: ${error.message}`);
    } finally {
      setIsViewingQR(false);
    }
  };
  
  // Automatically associate QR code with email when generated
  const autoAssociateQRCode = async (qrCodeValue, userEmail) => {
    if (!qrCodeValue || !userEmail) return;
    
    try {
      // Check if QR code is already associated with this email
      const existingQRCode = await getQRCodeByEmail(userEmail);
      if (existingQRCode && existingQRCode.found) {
        if (existingQRCode.qrCode === qrCodeValue) {
          console.log('QR code already associated with this email');
          return;
        }
      }
      
      // Associate QR code with email
      const result = await addViewQRCodeDetails(userEmail, qrCodeValue);
      
      if (result.success) {
        console.log('QR code automatically associated with email:', userEmail);
      } else {
        console.error('Failed to associate QR code with email:', result.error);
      }
    } catch (error) {
      console.error('Error auto-associating QR code with email:', error);
    }
  };

  // Download QR Code
  const downloadQRCode = async () => {
    if (!qrCodeDataURL) {
      setError('No QR code available for download.');
      return;
    }

    try {
      // First, download the QR code file
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${studentDetails.studentName}_${educationLevel}_QRCode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification for download
      setNotificationShown(false); // Reset to allow new notification
      showSuccessPopup('📥 QR Code Downloaded Successfully!');

      // For tertiary education, call addQR function to record the download on blockchain
      if (educationLevel === 'tertiary') {
        try {
          console.log('🔄 Recording QR code download on blockchain for tertiary education...');

          // Get the QR code value that was used to generate the QR code
          const qrResult = await getQRCodeByRegNumberAndAward(
            studentDetails.registrationNumber,
            studentDetails.award
          );

          if (qrResult && qrResult.found && qrResult.qrCodeValue) {
            const qrCodeValue = qrResult.qrCodeValue;
            console.log('📋 QR code value for blockchain recording:', qrCodeValue);

            // Call addQR function to record on blockchain
            setSuccess('Recording QR code download on blockchain... Please confirm transaction in MetaMask');
            const addQRResult = await addQR(qrCodeValue);

            if (addQRResult && addQRResult.success) {
              console.log('✅ QR code download recorded on blockchain successfully');
              setSuccess(`✅ QR code downloaded and recorded on blockchain!

🔗 Transaction Hash: ${addQRResult.transactionHash?.substring(0, 20)}...
📥 Download completed successfully`);
            } else {
              console.warn('⚠️ QR code downloaded but failed to record on blockchain:', addQRResult?.error);
              setSuccess(`✅ QR code downloaded successfully, but blockchain recording failed: ${addQRResult?.error || 'Unknown error'}`);
            }
          } else {
            console.warn('⚠️ Could not retrieve QR code value for blockchain recording');
            setSuccess('✅ QR code downloaded successfully, but could not record on blockchain (QR code value not found)');
          }
        } catch (blockchainError) {
          console.error('❌ Error recording QR code download on blockchain:', blockchainError);
          setSuccess(`✅ QR code downloaded successfully, but blockchain recording failed: ${blockchainError.message}`);
        }
      }

    } catch (error) {
      console.error('Error downloading QR code:', error);
      setError('Failed to download QR code. Please try again.');
    }
  };

  // If no student details, show loading or redirect
  if (!studentDetails) {
    return (
      <div className={styles.container}>
        <StudentTopBar />
        <main className={styles.main}>
          <div className={styles.verificationCard}>
            <div className={styles.loadingMessage}>
              <RefreshCw size={16} className={styles.spinning} />
              Redirecting to student details...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Success Notification Popup */}
      {showSuccessNotification && (
        <div className={styles.successNotification}>
          <div className={styles.notificationIcon}>
            <CheckCircle size={48} />
          </div>
          <div className={styles.notificationContent}>
            <h3 className={styles.notificationTitle}>Success!</h3>
            <p className={styles.notificationMessage}>{successMessage}</p>
          </div>
          <button
            className={styles.notificationClose}
            onClick={() => setShowSuccessNotification(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Shared Top Bar */}
      <StudentTopBar />

      <main className={styles.main}>
        <div className={styles.verificationCard}>
          <div className={styles.cardTitle}>
            <CheckCircle size={24} />
            Generate QR Code
          </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className={styles.warningMessage}>
            <AlertCircle size={16} />
            Please connect your wallet to generate QR code
          </div>
        )}

        {/* QR Code Section */}
        <div className={styles.qrSection}>
          <h3 className={styles.sectionTitle}>Your Verification QR Code</h3>

          {isGeneratingQR ? (
            <div className={styles.generateSection}>
              <div className={styles.loadingContainer}>
                <RefreshCw size={48} className={styles.spinning} />
                <h4>Generating QR Code...</h4>
                <p>Please wait while we generate your verification QR code from blockchain data</p>
                {isConnected && (
                  <p className={styles.metaMaskNote}>
                    📱 You may need to confirm the transaction in MetaMask
                  </p>
                )}
              </div>
            </div>
          ) : qrCodeDataURL ? (
            <div className={styles.qrDisplay}>
              <div className={styles.qrCodeContainer}>
                <img
                  src={qrCodeDataURL}
                  alt="Student Verification QR Code"
                  className={styles.qrCodeImage}
                />
              </div>

              <div className={styles.qrActions}>
                <button
                  onClick={downloadQRCode}
                  className={styles.downloadBtn}
                >
                  <Download size={20} />
                  Download QR Code
                </button>

                <button
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className={styles.regenerateBtn}
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
              </div>

              <div className={styles.qrInfo}>
                <p className={styles.qrDescription}>
                  🔒 This QR code contains your verified {educationLevel === 'secondary' ? 'secondary education' : 'university'} credentials.
                  Share it with employers or institutions for instant verification.
                </p>
              </div>
              
              {/* Email Association Section */}
              <div className={styles.emailAssociationSection}>
                <h4 className={styles.emailSectionTitle}>
                  <Mail size={16} />
                  Associate with Email
                </h4>
                <p className={styles.emailDescription}>
                  Associate this QR code with your email to easily access it later
                </p>
                
                <div className={styles.emailInputGroup}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.emailInput}
                    disabled={isAssociatingEmail}
                  />
                  <button
                    onClick={associateQRCodeWithEmail}
                    disabled={isAssociatingEmail || !email}
                    className={styles.associateBtn}
                  >
                    {isAssociatingEmail ? (
                      <>
                        <RefreshCw size={16} className={styles.spinning} />
                        Associating...
                      </>
                    ) : (
                      'Associate'
                    )}
                  </button>
                </div>
                
                {emailError && (
                  <div className={styles.emailError}>
                    <AlertCircle size={14} />
                    {emailError}
                  </div>
                )}
                
                {emailSuccess && (
                  <div className={styles.emailSuccess}>
                    <CheckCircle size={14} />
                    {emailSuccess}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.errorSection}>
              <AlertCircle size={48} />
              <h4>Failed to Generate QR Code</h4>
              <p>There was an issue generating your QR code. Please try again.</p>
              <button
                onClick={generateQRCode}
                disabled={isGeneratingQR || !isConnected}
                className={styles.retryBtn}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className={styles.successMessage}>
            <CheckCircle size={16} />
            <div className={styles.messageText}>{success}</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default QRCodePage;
