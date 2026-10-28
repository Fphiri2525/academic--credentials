import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, XCircle, Search, Camera, StopCircle, User, LogOut, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './employer.module.css';
import QrCode from 'qrcode-reader';
import { useCertificateManagement, useManebContract, useUserManagement } from './hooks/useSmartContract';
import { useConnectionStatus, useCertificateManagement as useCertMgmtForManual } from './hooks/useSmartContract';

// Success Notification Popup Component
const SuccessNotificationPopup = ({ showSuccessNotification, successMessage, setShowSuccessNotification }) => {
  if (!showSuccessNotification) return null;

  return (
    <div className={styles.notificationOverlay}>
      <div className={styles.notificationPopup}>
        <div className={styles.notificationIcon}>
          <CheckCircle size={48} />
        </div>
        <div className={styles.notificationContent}>
          <h3 className={styles.notificationTitle}>Verification Successful!</h3>
          <p className={styles.notificationMessage}>{successMessage}</p>
        </div>
        <button
          className={styles.notificationClose}
          onClick={() => setShowSuccessNotification(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Logout Confirmation Popup Component
const LogoutConfirmationPopup = ({ showLogoutConfirmation, cancelLogout, confirmLogout }) => {
  if (!showLogoutConfirmation) return null;

  return (
    <div className={styles.confirmationOverlay}>
      <div className={styles.confirmationPopup}>
        <div className={styles.confirmationHeader}>
          <LogOut className={styles.confirmationIcon} />
          <h3 className={styles.confirmationTitle}>Confirm Logout</h3>
        </div>

        <div className={styles.confirmationContent}>
          <p className={styles.confirmationMessage}>
            Are you sure you want to logout? You will need to login again to access the employer dashboard.
          </p>
        </div>

        <div className={styles.confirmationActions}>
          <button
            className={styles.cancelButton}
            onClick={cancelLogout}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={confirmLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Manual Verification Form Component
const ManualVerificationForm = ({ 
  showManualVerificationForm, 
  manualFormData, 
  isSubmittingManualForm, 
  error,
  handleManualFormChange, 
  handleManualFormSubmit, 
  closeManualForm 
}) => {
  if (!showManualVerificationForm) return null;

  return (
    <div className={styles.manualFormOverlay}>
      <div className={styles.manualFormContainer}>
        <div className={styles.manualFormHeader}>
          <FileText className={styles.formIcon} />
          <h3 className={styles.formTitle}>Manual Verification Required</h3>
          <button 
            className={styles.closeFormButton}
            onClick={closeManualForm}
          >
            ×
          </button>
        </div>

        <div className={styles.formDescription}>
          <p>The certificate QR code was not found in our system. Please fill out this form for manual verification.</p>
          <p className={styles.note}>Note: This process may take 2-3 business days</p>
        </div>

        <form onSubmit={handleManualFormSubmit} className={styles.manualForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Student Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={manualFormData.studentName}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter full student name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Program of Study *
            </label>
            <input
              type="text"
              name="programOfStudy"
              value={manualFormData.programOfStudy}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter program of study"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Registration Number *
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={manualFormData.registrationNumber}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter registration number"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              University/Institution Name *
            </label>
            <input
              type="text"
              name="universityName"
              value={manualFormData.universityName}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter university or institution name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Program/Award *
            </label>
            <input
              type="text"
              name="award"
              value={manualFormData.award}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter program name or award/degree"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Year of Graduation *
            </label>
            <input
              type="number"
              name="yearOfGraduation"
              value={manualFormData.yearOfGraduation}
              onChange={handleManualFormChange}
              className={styles.formInput}
              placeholder="Enter year of graduation"
              min="1900"
              max={new Date().getFullYear()}
              required
            />
          </div>

          {error && (
            <div className={styles.formError}>
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={closeManualForm}
              className={styles.cancelFormButton}
              disabled={isSubmittingManualForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitFormButton}
              disabled={isSubmittingManualForm}
            >
              {isSubmittingManualForm ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Verification Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Verification Result Display Component
const VerificationResultDisplay = ({ verificationResult }) => {
  if (!verificationResult) return null;

  const isSecondary = verificationResult.educationType === 'secondary';
  const isTertiary = verificationResult.educationType === 'tertiary';

  return (
    <div className={styles.verificationResultContainer}>
      {/* Authentication Notification */}
      <div className={styles.authenticationNotification}>
        <div className={styles.authIcon}>
          <CheckCircle size={48} />
        </div>
        <div className={styles.authMessage}>
          <h2 className={styles.authTitle}>Certificate is Original and Authentic</h2>
          <p className={styles.authSubtitle}>
            This {isSecondary ? 'MSCE' : 'university'} certificate has been successfully verified through our secure verification system.
          </p>
        </div>
      </div>

      {/* Student Details */}
      <div className={styles.studentDetailsCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {isSecondary ? 'Secondary Education Details' : 'University Student Details'}
          </h3>
          <div className={styles.verificationBadge}>
            <CheckCircle size={20} />
            <span>Verified</span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Student Name</span>
            <span className={styles.detailValue}>{verificationResult.studentName}</span>
          </div>

          {/* Secondary Education Fields */}
          {isSecondary && (
            <>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Examination Number</span>
                <span className={styles.detailValue}>{verificationResult.examinationNumber}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>School Name</span>
                <span className={styles.detailValue}>{verificationResult.schoolName}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Year of Examination</span>
                <span className={styles.detailValue}>
                  {verificationResult.yearOfExamination && verificationResult.yearOfExamination !== 0
                    ? verificationResult.yearOfExamination
                    : 'Not Available'}
                </span>
              </div>
            </>
          )}

          {/* Tertiary Education Fields */}
          {isTertiary && (
            <>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Registration Number</span>
                <span className={styles.detailValue}>{verificationResult.registrationNumber}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>University/Institution</span>
                <span className={styles.detailValue}>
                  {verificationResult.institutionName || verificationResult.universityName}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Program of Study</span>
                <span className={styles.detailValue}>{verificationResult.programOfStudy}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Award/Degree</span>
                <span className={styles.detailValue}>{verificationResult.award}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Year of Graduation</span>
                <span className={styles.detailValue}>{verificationResult.yearOfGraduation}</span>
              </div>
            </>
          )}
        </div>

        {/* Verification Information */}
        <div className={styles.verificationInfo}>
          <h4 className={styles.verificationTitle}>Verification Information</h4>
          <div className={styles.verificationGrid}>
            <div className={styles.verificationItem}>
              <span className={styles.verificationLabel}>Verification Date</span>
              <span className={styles.verificationValue}>{new Date(verificationResult.verificationDate).toLocaleDateString()}</span>
            </div>
            <div className={styles.verificationItem}>
              <span className={styles.verificationLabel}>Verification Method</span>
              <span className={styles.verificationValue}>{verificationResult.verificationMethod}</span>
            </div>
            <div className={styles.verificationItem}>
              <span className={styles.verificationLabel}>Verification Recorded</span>
              <span className={styles.verificationValue}>
                {verificationResult.verificationRecorded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployerDashboard = () => {
  const navigate = useNavigate();

  // User welcome state
  const [userName, setUserName] = useState('');
  const [isLoadingUserName, setIsLoadingUserName] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Education level selection state
  const [educationLevel, setEducationLevel] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraScanning, setCameraScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Success notification popup state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Logout confirmation popup state
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Manual verification form state
  const [showManualVerificationForm, setShowManualVerificationForm] = useState(false);
  const [isSubmittingManualForm, setIsSubmittingManualForm] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    studentName: '',
    programOfStudy: '',
    award: '',
    registrationNumber: '',
    universityName: '',
    yearOfGraduation: ''
  });

  // Add flags to prevent multiple executions
  const [isVerificationInProgress, setIsVerificationInProgress] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    getStudentByQRCode,
    addViewQRCodeDetails,
    addVerificationRequestByQRCode, // This is what we need for successful QR scan
    addVerificationRequest: addTertiaryVerificationRequest
  } = useCertificateManagement();

  // Debug log to verify function exists
  useEffect(() => {
    console.debug('Debug: getStudentByQRCode type check', {
      typeofGetStudentByQRCode: typeof getStudentByQRCode,
      getStudentByQRCode,
      typeofAddViewQRCodeDetails: typeof addViewQRCodeDetails,
      addViewQRCodeDetails,
      typeofAddVerificationRequestByQRCode: typeof addVerificationRequestByQRCode,
      addVerificationRequestByQRCode
    });
  }, [getStudentByQRCode, addViewQRCodeDetails, addVerificationRequestByQRCode]);

  const { 
    getStudentDetailsByHashValue: getSecondaryStudentByHash, 
    addVerificationRequest: addSecondaryVerification 
  } = useManebContract();
  
  // USER MANAGEMENT: For welcome functionality
  const { getUserDetailsWithInstitution } = useUserManagement();

  const { isConnected } = useConnectionStatus();

  // Function to fetch user name from email
  const fetchUserName = async () => {
    setIsLoadingUserName(true);
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const { email } = JSON.parse(userData);
        const userDetails = await getUserDetailsWithInstitution(email);
        setUserName(userDetails.name || 'Employer');
      } else {
        setUserName('Employer');
      }
    } catch (error) {
      console.error('Error fetching employer name:', error);
      setUserName('Employer');
    } finally {
      setIsLoadingUserName(false);
    }
  };

  // Load user name on component mount
  useEffect(() => {
    fetchUserName();
  }, []);

  // Toggle user menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Show logout confirmation popup
  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutConfirmation(true);
  };

  // Confirm logout action
  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setShowLogoutConfirmation(false);
    navigate('/login');
  };

  // Cancel logout action
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  // Show success notification popup
  const showSuccessPopup = useCallback((message) => {
    if (showSuccessNotification) return;
    
    setSuccessMessage(message);
    setShowSuccessNotification(true);

    const timer = setTimeout(() => {
      setShowSuccessNotification(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showSuccessNotification]);

  // Handle manual form input changes
  const handleManualFormChange = (e) => {
    const { name, value } = e.target;
    setManualFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addManualVerificationRequest = useCallback(async () => {
    const {
      studentName,
      registrationNumber,
      universityName,
      programOfStudy,
      award,
      yearOfGraduation
    } = manualFormData;

    if (!studentName || !registrationNumber || !universityName || !programOfStudy || !award || !yearOfGraduation) {
      setError('Please fill in all required fields');
      return { success: false, error: 'validation' };
    }

    try {
      const payload = {
        universityName,
        studentName,
        programOfStudy,
        yearOfGraduation: yearOfGraduation.toString(),
        registrationNumber,
        award
      };

      return await addTertiaryVerificationRequest(payload);
    } catch (err) {
      console.error('Error adding manual verification request:', err);
      return { success: false, error: err.message || 'Failed to submit manual verification request' };
    }
  }, [manualFormData, addTertiaryVerificationRequest]);

  // Submit manual verification form - FIXED VERSION
  const handleManualFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting manual verification form with data:", manualFormData);

    setIsSubmittingManualForm(true);
    setError('');

    try {
      const result = await addManualVerificationRequest();

      if (result && result.success) {
        console.log('✅ Manual verification request submitted successfully.');
        showSuccessPopup('Manual verification request submitted successfully! It will be processed within 2-3 business days.');
        closeManualForm();
      } else if (result && result.error) {
        setError(result.error);
        console.error("Manual verification submission failed. Result:", result);
      } else {
        setError('Failed to submit manual verification request. Please try again.');
        console.error("Manual verification submission failed. Result:", result);
      }
    } catch (error) {
      console.error('Error submitting manual verification request:', error);
      const errorMessage = error.message || 'Failed to submit manual verification request. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmittingManualForm(false);
    }
  };

  // Close manual verification form
  const closeManualForm = () => {
    setShowManualVerificationForm(false);
    setManualFormData({
      studentName: '',
      registrationNumber: '',
      programOfStudy: '',
      universityName: '',
      award: '',
      yearOfGraduation: ''
    });
    setError('');
  };

  // NEW FUNCTION: Record verification in blockchain
  const recordVerificationInBlockchain = async (qrCodeValue, educationType) => {
    try {
      console.log('📝 Recording verification in blockchain for QR:', qrCodeValue);
      
      let verificationResult;
      
      if (educationType === 'tertiary') {
        // For tertiary education, use addVerificationRequestByQRCode
        verificationResult = await addVerificationRequestByQRCode(qrCodeValue);
        console.log('Result of addVerificationRequestByQRCode (tertiary):', verificationResult);
        
        if (verificationResult.success) {
          console.log('✅ Tertiary verification recorded in blockchain via QR code');
          return true;
        } else {
          console.log('⚠️ Tertiary QR code recording failed, trying view method...');
          
          // Fallback to view QR code method
          const userData = localStorage.getItem('user');
          if (userData) {
            console.log('Attempting addViewQRCodeDetails as fallback for tertiary verification...');
            const { email } = JSON.parse(userData);
            const viewResult = await addViewQRCodeDetails(email, qrCodeValue);
            return viewResult.success;
          }
          return false;
        }
      } else if (educationType === 'secondary') {
        // For secondary education, use addVerificationRequest from MANEB
        verificationResult = await addSecondaryVerification(qrCodeValue);
        return verificationResult.success;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error recording verification in blockchain:', error);
      return false;
    }
  };

  // Start camera scanning
  const startCameraScanning = async () => {
    try {
      setCameraScanning(true);
      setError('');

      const cameraConfigs = [
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
        { video: true }
      ];

      let mediaStream = null;
      for (let i = 0; i < cameraConfigs.length; i++) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(cameraConfigs[i]);
          break;
        } catch (configError) {
          if (i === cameraConfigs.length - 1) {
            throw configError;
          }
        }
      }

      if (!mediaStream) {
        throw new Error('No camera configuration worked');
      }

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          scanQRFromCamera();
        };
      }

    } catch (error) {
      let errorMessage = 'Camera access failed. ';

      if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access and try again.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      setCameraScanning(false);
    }
  };

  // Stop camera scanning
  const stopCameraScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    setCameraScanning(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Scan QR code from camera feed
  const scanQRFromCamera = () => {
    if (!videoRef.current || !canvasRef.current || !cameraScanning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
      if (cameraScanning) {
        setTimeout(scanQRFromCamera, 100);
      }
      return;
    }

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qr = new QrCode();

      qr.callback = async function(err, value) {
        if (err) {
          if (cameraScanning) {
            setTimeout(scanQRFromCamera, 200);
          }
          return;
        }

        if (value && value.result) {
          stopCameraScanning();
          setQrCode(value.result);
          setVerificationResult(null);
          setError('');
          setShowSuccessNotification(false);
          await verifyCameraScannedQR(value.result);
        } else {
          if (cameraScanning) {
            setTimeout(scanQRFromCamera, 200);
          }
        }
      };

      qr.decode(imageData);

    } catch (error) {
      if (cameraScanning) {
        setTimeout(scanQRFromCamera, 200);
      }
    }
  };

  // Verify camera-scanned QR code - UPDATED VERSION
  const verifyCameraScannedQR = async (scannedQrCode) => {
    if (!educationLevel) {
      setError('Please select an education level first.');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to verify certificates.');
      return;
    }

    if (isVerificationInProgress) {
      return;
    }

    setIsVerificationInProgress(true);
    setIsLoading(true);
    setError('');
    setVerificationResult(null);
    setShowManualVerificationForm(false);
    setShowSuccessNotification(false);

    try {
      let hashValue = '';
      try {
        const qrData = JSON.parse(scannedQrCode);
        hashValue = qrData.hashValue || scannedQrCode.trim();
      } catch {
        hashValue = scannedQrCode.trim();
      }

      let result;
      if (educationLevel === 'secondary') {
        result = await getSecondaryStudentByHash(hashValue);
      } else if (educationLevel === 'tertiary') {
        result = await getStudentByQRCode(hashValue);
      }

      console.debug('Verification result:', result);

      // Check if result is valid and certificate was found
      const isValidSecondary = educationLevel === 'secondary' && result && result.found === true;
      const isValidTertiary = educationLevel === 'tertiary' && result && result.found === true;

      if (isValidSecondary || isValidTertiary) {
        let studentData;
        let verificationRecorded = false;

        if (educationLevel === 'secondary') {
          // Validate that we have actual student data
          const hasValidStudentData = result && (
            result.studentName || 
            result.examinationNumber
          );

          if (!hasValidStudentData) {
            console.error('No valid student data in result');
            setVerificationResult(null);
            setShowManualVerificationForm(true);
            setError('Secondary certificate verification failed - not found in MANEB registry. Please fill out the manual verification form.');
            setIsLoading(false);
            setIsVerificationInProgress(false);
            return;
          }

          studentData = {
            found: true,
            studentName: result.studentName || 'Not Available',
            examinationNumber: result.examinationNumber || 'Not Available',
            schoolName: result.schoolName || 'Not Available',
            yearOfExamination: result.yearOfExamination || 'Not Available',
            hashValue: hashValue,
            verificationMethod: 'Camera Scan',
            verificationDate: new Date().toISOString(),
            issuedAt: new Date().toLocaleDateString(),
            educationType: 'secondary',
            verificationRecorded: false // Initialize as false
          };

          // RECORD VERIFICATION IN BLOCKCHAIN FOR SECONDARY
          console.log('Attempting to record secondary verification in blockchain for hash:', hashValue);
          verificationRecorded = await recordVerificationInBlockchain(hashValue, 'secondary');
          studentData.verificationRecorded = verificationRecorded;

        } else if (educationLevel === 'tertiary') {
          const student = result.student || result[0] || result;
          console.debug('Student data structure:', student);
          
          // Validate that we have actual student data
          const hasValidStudentData = student && (
            student.studentName || student.name ||
            student.registrationNumber || student.regNumber
          );

          if (!hasValidStudentData) {
            console.error('No valid student data in result');
            setVerificationResult(null);
            setShowManualVerificationForm(true);
            setError('Tertiary certificate verification failed - not found in Certificate Management registry. Please fill out the manual verification form.');
            setIsLoading(false);
            setIsVerificationInProgress(false);
            return;
          }
          
          studentData = {
            found: true,
            universityName: student.universityName || student.institutionName || 'Not Available',
            studentName: student.studentName || student.name || 'Not Available',
            programOfStudy: student.programOfStudy || student.program || student.course || 'Not Available',
            award: student.award || student.degree || student.certificateType || 'Not Available',
            yearOfGraduation: student.yearOfGraduation || student.graduationYear || 'Not Available',
            registrationNumber: student.registrationNumber || student.regNumber || student.studentId || 'Not Available',
            hashValue: hashValue,
            verificationMethod: 'Camera Scan',
            verificationDate: new Date().toISOString(),
            issuedAt: new Date().toLocaleDateString(),
            educationType: 'tertiary',
            verificationRecorded: false // Initialize as false
          };

          // RECORD VERIFICATION IN BLOCKCHAIN FOR TERTIARY
          console.log('Attempting to record tertiary verification in blockchain for hash:', hashValue);
          verificationRecorded = await recordVerificationInBlockchain(hashValue, 'tertiary');
          studentData.verificationRecorded = verificationRecorded;
        }

        console.debug('Final verification data:', studentData);
        setVerificationResult(studentData);
        
        // Show appropriate success message based on blockchain recording
        if (verificationRecorded) {
          showSuccessPopup(`${educationLevel === 'secondary' ? 'Secondary Education' : 'University'} Certificate Verified Successfully! Verification recorded on blockchain.`);
        } else {
          showSuccessPopup(`${educationLevel === 'secondary' ? 'Secondary Education' : 'University'} Certificate Verified Successfully! (Blockchain recording pending)`);
        }

      } else {
        // QR code not found - DO NOT show success notification
        console.log('Certificate not found - showing manual form');
        setVerificationResult(null);
        setShowManualVerificationForm(true);
        setError(`${educationLevel === 'secondary' ? 'Secondary' : 'Tertiary'} certificate verification failed - not found in registry. Please fill out the manual verification form.`);
      }
    } catch (err) {
      console.error('Verification error during camera scan:', err);
      setVerificationResult(null);
      setShowManualVerificationForm(true);
      setError(`Verification error: ${err.message || 'QR code not found. Please fill out the manual verification form.'}`);
    } finally {
      setIsLoading(false);
      setIsVerificationInProgress(false);
    }
  };

  // Secondary Education Verification - UPDATED VERSION
  const handleSecondaryVerification = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code to verify.');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to verify certificates.');
      return;
    }

    if (isVerificationInProgress || isLoading) {
      return;
    }

    setIsVerificationInProgress(true);
    setIsLoading(true);
    setError('');
    setVerificationResult(null);
    setShowSuccessNotification(false);
    setShowManualVerificationForm(false);

    try {
      let hashValue = '';
      try {
        const qrData = JSON.parse(qrCode);
        hashValue = qrData.hashValue || qrCode.trim();
      } catch {
        hashValue = qrCode.trim();
      }

      const result = await getSecondaryStudentByHash(hashValue);
      console.debug('Secondary verification result:', result);

      // Check if result is valid and certificate was found
      const isValidSecondary = result && result.found === true;

      if (isValidSecondary) {
        // Validate that we have actual student data
        const hasValidStudentData = result && (
          result.studentName || 
          result.examinationNumber
        );

        if (!hasValidStudentData) {
          // Result claims found but no valid data - treat as not found
          console.error('No valid student data in result');
          setVerificationResult(null);
          setShowManualVerificationForm(true);
          setError('Secondary certificate verification failed - not found in MANEB registry. Please fill out the manual verification form.');
          setIsLoading(false);
          setIsVerificationInProgress(false);
          return;
        }

        const studentData = {
          found: true,
          studentName: result.studentName || 'Not Available',
          examinationNumber: result.examinationNumber || 'Not Available',
          schoolName: result.schoolName || 'Not Available',
          yearOfExamination: result.yearOfExamination || 'Not Available',
          hashValue: hashValue,
          verificationMethod: 'Manual Entry',
          verificationDate: new Date().toISOString(),
          issuedAt: new Date().toLocaleDateString(),
          educationType: 'secondary',
          verificationRecorded: false // Initialize as false
        };

        // RECORD VERIFICATION IN BLOCKCHAIN FOR SECONDARY
        console.log('Attempting to record secondary verification in blockchain for hash:', hashValue);
        const verificationRecorded = await recordVerificationInBlockchain(hashValue, 'secondary');
        studentData.verificationRecorded = verificationRecorded;

        setVerificationResult(studentData);
        
        // Show appropriate success message
        if (verificationRecorded) {
          showSuccessPopup('Secondary Education Certificate Verified Successfully! Verification recorded on blockchain.');
        } else {
          showSuccessPopup('Secondary Education Certificate Verified Successfully! (Blockchain recording pending)');
        }
      } else {
        // QR code not found - DO NOT show success notification
        console.log('Certificate not found - showing manual form');
        setVerificationResult(null);
        setShowManualVerificationForm(true);
        setError('Secondary certificate verification failed - not found in MANEB registry. Please fill out the manual verification form.');
      }
    } catch (err) {
      console.error('Verification error during manual secondary check:', err);
      setVerificationResult(null);
      setShowManualVerificationForm(true);
      setError(`Verification error: ${err.message || 'QR code not found. Please fill out the manual verification form.'}`);
    } finally {
      setIsLoading(false);
      setIsVerificationInProgress(false);
    }
  };

  // Tertiary Education Verification - UPDATED VERSION
  const handleTertiaryVerification = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code to verify.');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to verify certificates.');
      return;
    }

    if (isVerificationInProgress || isLoading) {
      return;
    }

    setIsVerificationInProgress(true);
    setIsLoading(true);
    setError('');
    setVerificationResult(null);
    setShowSuccessNotification(false);
    setShowManualVerificationForm(false);

    try {
      let hashValue = '';
      try {
        const qrData = JSON.parse(qrCode);
        hashValue = qrData.hashValue || qrCode.trim();
      } catch {
        hashValue = qrCode.trim();
      }

      const result = await getStudentByQRCode(hashValue);
      console.debug('Tertiary verification result:', result);

      // Check if result is valid and certificate was found
      const isValidTertiary = result && result.found === true;

      if (isValidTertiary) {
        const student = result.student || result[0] || result;
        console.debug('Student data structure:', student);
        
        // Validate that we have actual student data
        const hasValidStudentData = student && (
          student.studentName || student.name ||
          student.registrationNumber || student.regNumber
        );

        if (!hasValidStudentData) {
          // Result claims found but no valid data - treat as not found
          console.error('No valid student data in result');
          setVerificationResult(null);
          setShowManualVerificationForm(true);
          setError('Tertiary certificate verification failed - not found in Certificate Management registry. Please fill out the manual verification form.');
          setIsLoading(false);
          setIsVerificationInProgress(false);
          return;
        }
        
        const verificationData = {
          found: true,
          universityName: student.universityName || student.institutionName || 'Not Available',
          studentName: student.studentName || student.name || 'Not Available',
          programOfStudy: student.programOfStudy || student.program || student.course || 'Not Available',
          award: student.award || student.degree || student.certificateType || 'Not Available',
          yearOfGraduation: student.yearOfGraduation || student.graduationYear || 'Not Available',
          registrationNumber: student.registrationNumber || student.regNumber || student.studentId || 'Not Available',
          hashValue: hashValue,
          verificationMethod: 'Manual Entry',
          verificationDate: new Date().toISOString(),
          issuedAt: new Date().toLocaleDateString(),
          educationType: 'tertiary',
          verificationRecorded: false // Initialize as false
        };

        // RECORD VERIFICATION IN BLOCKCHAIN FOR TERTIARY
        console.log('Attempting to record tertiary verification in blockchain for hash:', hashValue);
        const verificationRecorded = await recordVerificationInBlockchain(hashValue, 'tertiary');
        verificationData.verificationRecorded = verificationRecorded;

        console.debug('Final verification data:', verificationData);
        setVerificationResult(verificationData);
        
        // Show appropriate success message
        if (verificationRecorded) {
          showSuccessPopup('University Certificate Verified Successfully! Verification recorded on blockchain.');
        } else {
          showSuccessPopup('University Certificate Verified Successfully! (Blockchain recording pending)');
        }

      } else {
        // QR code not found - DO NOT show success notification
        console.log('Certificate not found - showing manual form');
        setVerificationResult(null);
        setShowManualVerificationForm(true);
        setError('Tertiary certificate verification failed - not found in Certificate Management registry. Please fill out the manual verification form.');
      }
    } catch (err) {
      console.error('Verification error during manual tertiary check:', err);
      setVerificationResult(null);
      setShowManualVerificationForm(true);
      setError(`Verification error: ${err.message || 'QR code not found. Please fill out the manual verification form.'}`);
    } finally {
      setIsLoading(false);
      setIsVerificationInProgress(false);
    }
  };

  // Handle QR code input changes
  const handleQrCodeChange = (e) => {
    setQrCode(e.target.value);
    setVerificationResult(null);
    setError('');
    setShowSuccessNotification(false);
    setShowManualVerificationForm(false);
  };

  // Handle education level changes
  const handleEducationLevelChange = (level) => {
    setEducationLevel(level);
    setVerificationResult(null);
    setError('');
    setShowSuccessNotification(false);
    setShowManualVerificationForm(false);
  };

  // Main verification handler
  const handleVerifyCertificate = async () => {
    if (!educationLevel) {
      setError('Please select an education level first.');
      return;
    }

    if (educationLevel === 'secondary') {
      await handleSecondaryVerification();
    } else if (educationLevel === 'tertiary') {
      await handleTertiaryVerification();
    }
  };

  // Handle QR code file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      img.src = URL.createObjectURL(file);
      await imageLoaded;

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qr = new QrCode();

      const qrDecoded = new Promise((resolve, reject) => {
        qr.callback = function(err, value) {
          if (err) {
            reject(new Error('No QR code found in the uploaded image'));
            return;
          }

          if (value && value.result) {
            resolve(value.result);
          } else {
            reject(new Error('Failed to decode QR code from image'));
          }
        };
      });

      qr.decode(imageData);
      const qrResult = await qrDecoded;

      setQrCode(qrResult);
      setVerificationResult(null);
      setError('');
      setShowSuccessNotification(false);
      setShowManualVerificationForm(false);

      URL.revokeObjectURL(img.src);

    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file upload
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset form and clear results
  const handleReset = () => {
    setQrCode('');
    setVerificationResult(null);
    setError('');
    setUploading(false);
    setShowSuccessNotification(false);
    setShowManualVerificationForm(false);
    stopCameraScanning();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Success Notification Popup */}
      <SuccessNotificationPopup 
        showSuccessNotification={showSuccessNotification}
        successMessage={successMessage}
        setShowSuccessNotification={setShowSuccessNotification}
      />

      {/* Logout Confirmation Popup */}
      <LogoutConfirmationPopup 
        showLogoutConfirmation={showLogoutConfirmation}
        cancelLogout={cancelLogout}
        confirmLogout={confirmLogout}
      />

      {/* Manual Verification Form */}
      <ManualVerificationForm
        showManualVerificationForm={showManualVerificationForm}
        manualFormData={manualFormData}
        isSubmittingManualForm={isSubmittingManualForm}
        error={error}
        handleManualFormChange={handleManualFormChange}
        handleManualFormSubmit={handleManualFormSubmit}
        closeManualForm={closeManualForm}
      />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Shield className={styles.logoIcon} />
            <h1 className={styles.title}>Verify and Authenticate Certificate</h1>
          </div>

          {/* User Profile Section with Dropdown */}
          <div className={styles.userSection}>
            <div className={styles.userProfile} onClick={toggleUserMenu}>
              <User className={styles.userIcon} />
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>
                  {isLoadingUserName ? 'Loading...' : `Welcome, ${userName}!`}
                </span>
                <span className={styles.userRole}>Employer</span>
              </div>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <button
                  onClick={handleLogout}
                  className={styles.dropdownItem}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.verificationCard}>
          <h2 className={styles.cardTitle}>
            <Search size={24} /> Verify Certificate
          </h2>

          <div className={styles.form}>
            {/* Education Level Selection */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Education Level</label>
              <div className={styles.educationLevelContainer}>
                <button
                  type="button"
                  className={`${styles.educationButton} ${educationLevel === 'tertiary' ? styles.active : ''}`}
                  onClick={() => handleEducationLevelChange('tertiary')}
                >
                  Tertiary (University)
                </button>
                <button
                  type="button"
                  className={`${styles.educationButton} ${educationLevel === 'secondary' ? styles.active : ''}`}
                  onClick={() => handleEducationLevelChange('secondary')}
                >
                  Secondary (MSCE)
                </button>
              </div>
            </div>

            {/* Show verification form only when education level is selected */}
            {educationLevel && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Certificate QR Code</label>
                  <div className={styles.inputContainer}>
                    <input
                      className={styles.input}
                      type="text"
                      value={qrCode}
                      onChange={handleQrCodeChange}
                      placeholder="Enter QR code data"
                    />
                    <button
                      className={styles.cameraButton}
                      onClick={cameraScanning ? stopCameraScanning : startCameraScanning}
                      disabled={uploading}
                    >
                      {cameraScanning ? 'Stop Camera' : 'Camera Scan'}
                    </button>

                    <button
                      className={styles.uploadButton}
                      onClick={handleUploadClick}
                      disabled={cameraScanning || uploading}
                    >
                      {uploading ? 'Processing...' : 'Upload QR'}
                    </button>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.verifyButton}
                    onClick={handleVerifyCertificate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    className={styles.resetButton}
                    onClick={handleReset}
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Camera Scanner Section */}
          {cameraScanning && (
            <div className={styles.cameraSection}>
              <h3>Camera QR Code Scanner</h3>
              <div className={styles.cameraContainer}>
                <video
                  ref={videoRef}
                  className={styles.cameraVideo}
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className={styles.cameraCanvas}
                  style={{ display: 'none' }}
                />
                <div className={styles.cameraOverlay}>
                  <div className={styles.scanFrame}>
                    <div className={styles.scanCorners}>
                      <div className={styles.corner}></div>
                      <div className={styles.corner}></div>
                      <div className={styles.corner}></div>
                      <div className={styles.corner}></div>
                    </div>
                    <p className={styles.scanInstructions}>
                      Position QR code within the frame
                      <br />
                      Scanner will automatically detect and verify
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.cameraControls}>
                <button
                  onClick={stopCameraScanning}
                  className={styles.stopCameraButton}
                >
                  <StopCircle size={20} />
                  Stop Camera Scanner
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Only show verification result when QR code exists and verification is successful */}
          {verificationResult && verificationResult.found && (
            <VerificationResultDisplay verificationResult={verificationResult} />
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;