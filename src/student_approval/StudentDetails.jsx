import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, School, Calendar, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { useManebContract, useAccreditationManagement, useConnectionStatus } from '../hooks/useSmartContract';
import StudentTopBar from './StudentTopBar';
import styles from './Student.module.css';

const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useConnectionStatus();

  // Get student details from navigation state
  const { studentDetails: receivedStudentDetails, educationLevel: receivedEducationLevel } = location.state || {};
  
  // State management
  const [educationLevel, setEducationLevel] = useState(receivedEducationLevel || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentDetails, setStudentDetails] = useState(receivedStudentDetails || null);
  
  // Success notification popup state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationShown, setNotificationShown] = useState(false);

  // Form data for tertiary education
  const [tertiaryFormData, setTertiaryFormData] = useState({
    award: '',
    registrationNumber: ''
  });

  // Form data for secondary education
  const [secondaryFormData, setSecondaryFormData] = useState({
    examinationNumber: '',
    yearOfExamination: ''
  });

  // Get contract functions
  const { getStudentDetailsByExamAndYear } = useManebContract();
  const { getStudentByAwardAndRegNumber } = useAccreditationManagement();

  // Redirect if no student details received
  useEffect(() => {
    if (!receivedStudentDetails || !receivedEducationLevel) {
      console.log('No student details received, redirecting to main page');
      navigate('/student');
    }
  }, [receivedStudentDetails, receivedEducationLevel, navigate]);

  // Show success notification popup - only once per verification
  const showSuccessPopup = (message) => {
    // Prevent multiple notifications for the same verification
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

  // Handle tertiary form changes
  const handleTertiaryChange = (e) => {
    const { name, value } = e.target;
    setTertiaryFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous results and notifications when input changes
    setError('');
    setStudentDetails(null);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // Handle secondary form changes
  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setSecondaryFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous results and notifications when input changes
    setError('');
    setStudentDetails(null);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // Handle education level changes
  const handleEducationLevelChange = (level) => {
    setEducationLevel(level);
    // Clear previous results and notifications when education level changes
    setError('');
    setStudentDetails(null);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // SECONDARY EDUCATION: Handle student lookup using MANEB contract
  const handleSecondaryLookup = async () => {
    const { examinationNumber, yearOfExamination } = secondaryFormData;
    
    if (!examinationNumber || !yearOfExamination) {
      setError('❌ Please enter both examination number and year of examination.');
      return;
    }

    if (!isConnected) {
      setError('❌ Please connect your wallet to verify student details.');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setStudentDetails(null);
      // Reset notification state to allow new notification
      setShowSuccessNotification(false);
      setNotificationShown(false);

      console.log('🔍 Looking up Form Four student with MANEB contract:', {
        examinationNumber,
        yearOfExamination: parseInt(yearOfExamination)
      });

      // Call MANEB contract to get student details by exam number and year
      const result = await getStudentDetailsByExamAndYear(examinationNumber, yearOfExamination);

      if (result && result.studentName) {
        console.log('✅ Student found:', result);

        // Set student details for display
        setStudentDetails({
          educationLevel: 'secondary',
          studentName: result.studentName,
          examinationNumber: result.examinationNumber,
          schoolName: result.schoolName,
          yearOfExamination: result.yearOfExamination,
          hashValue: result.hashValue
        });

        // Show success notification popup - only once
        showSuccessPopup('📋 Secondary Education Student Details Retrieved Successfully!');

      } else {
        setError('❌ No student record found with this examination number and year. Please check your details.');
        setStudentDetails(null);
      }
    } catch (error) {
      console.error('❌ Error looking up student:', error);
      setError(`❌ Error retrieving student data: ${error.message}`);
      setStudentDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // TERTIARY EDUCATION: Handle verification using Certificate Management contract
  const handleTertiaryLookup = async () => {
    const { registrationNumber, award } = tertiaryFormData;
    
    if (!registrationNumber || !award) {
      setError('❌ Please fill in all fields.');
      return;
    }

    if (!isConnected) {
      setError('❌ Please connect your wallet to verify student details.');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setStudentDetails(null);
      // Reset notification state to allow new notification
      setShowSuccessNotification(false);
      setNotificationShown(false);

      console.log('🔍 Searching for student with:', {
        registrationNumber,
        award
      });

      // Call the smart contract function
      const result = await getStudentByAwardAndRegNumber(registrationNumber, award);

      console.log('Smart contract result:', result);

      if (result.found && result.studentDetails) {
        const studentData = {
          educationLevel: 'tertiary',
          found: true,
          institutionName: result.studentDetails.universityName,
          studentName: result.studentDetails.studentName,
          programOfStudy: result.studentDetails.programOfStudy,
          award: result.studentDetails.award,
          yearOfGraduation: result.studentDetails.yearOfGraduation,
          registrationNumber: result.studentDetails.registrationNumber,
          hashValue: result.studentDetails.hashValue
        };

        setStudentDetails(studentData);

        // Show success notification popup - only once
        showSuccessPopup('🎓 University Student Details Retrieved Successfully!');

      } else {
        setError(`❌ No student found with the provided details. Please verify your registration number and award.`);
        setStudentDetails(null);
      }
    } catch (error) {
      console.error('Error verifying student details:', error);
      setError(error.message || 'Failed to verify student details. Please try again.');
      setStudentDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification based on education level
  const handleVerifyDetails = async () => {
    if (!educationLevel) {
      setError('Please select an education level first.');
      return;
    }

    if (educationLevel === 'secondary') {
      await handleSecondaryLookup();
    } else if (educationLevel === 'tertiary') {
      await handleTertiaryLookup();
    }
  };

  // Handle confirm and generate QR code
  const handleConfirmAndGenerateQR = () => {
    if (!studentDetails) {
      setError('No student details available to generate QR code.');
      return;
    }

    // Navigate to QR code page with student details
    navigate('/student/qrcode', { 
      state: { 
        studentDetails,
        educationLevel 
      } 
    });
  };

  // Reset form
  const resetForm = () => {
    setEducationLevel('');
    setTertiaryFormData({
      award: '',
      registrationNumber: ''
    });
    setSecondaryFormData({
      yearOfExamination: '',
      examinationNumber: ''
    });
    setStudentDetails(null);
    setError('');
    setIsLoading(false);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // If no student details received, show loading or redirect
  if (!receivedStudentDetails) {
    return (
      <div className={styles.container}>
        <StudentTopBar />
        <main className={styles.main}>
          <div className={styles.verificationCard}>
            <div className={styles.loadingMessage}>
              <AlertCircle size={16} />
              Redirecting to student portal...
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
      <StudentTopBar onReset={() => navigate('/student')} showResetButton={true} />

      <main className={styles.main}>
        <div className={styles.verificationCard}>
          <div className={styles.cardTitle}>
            <CheckCircle size={24} />
            Student Details Verified
          </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className={styles.warningMessage}>
            <AlertCircle size={16} />
            Please connect your wallet to generate QR code
          </div>
        )}

        {/* Verification Success Message */}
        <div className={styles.successMessage}>
          <CheckCircle size={16} />
          <div className={styles.messageText}>
            ✅ Student details verified successfully! Review the information below and click "Confirm & Generate QR Code" to proceed.
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Student Details Display */}
        {studentDetails && (
          <div className={styles.detailsSection}>
            <h3 className={styles.sectionTitle}>
              {studentDetails.educationLevel === 'secondary' ? '📋 Secondary Education Details' : '🎓 University Details'}
            </h3>

            <div className={styles.detailsCard}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <User size={16} />
                  <div>
                    <label>Student Name</label>
                    <span>{studentDetails.studentName}</span>
                  </div>
                </div>

                {studentDetails.educationLevel === 'secondary' ? (
                  <>
                    <div className={styles.detailItem}>
                      <Hash size={16} />
                      <div>
                        <label>Examination Number</label>
                        <span>{studentDetails.examinationNumber}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <School size={16} />
                      <div>
                        <label>School Name</label>
                        <span>{studentDetails.schoolName}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Calendar size={16} />
                      <div>
                        <label>Year of Examination</label>
                        <span>{studentDetails.yearOfExamination}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.detailItem}>
                      <Hash size={16} />
                      <div>
                        <label>Registration Number</label>
                        <span>{studentDetails.registrationNumber}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <School size={16} />
                      <div>
                        <label>Institution</label>
                        <span>{studentDetails.institutionName}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Calendar size={16} />
                      <div>
                        <label>Program of Study</label>
                        <span>{studentDetails.programOfStudy}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <CheckCircle size={16} />
                      <div>
                        <label>Award</label>
                        <span>{studentDetails.award}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Calendar size={16} />
                      <div>
                        <label>Year of Graduation</label>
                        <span>{studentDetails.yearOfGraduation}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Confirm and Generate QR Code Button */}
              <div className={styles.confirmSection}>
                <button
                  onClick={handleConfirmAndGenerateQR}
                  className={styles.confirmBtn}
                >
                  <CheckCircle size={20} />
                  Confirm & Generate QR Code
                </button>
                <p className={styles.confirmText}>
                  Click to confirm these details and generate your verification QR code
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default StudentDetails;
