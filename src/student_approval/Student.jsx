// StudentPortal.js - Professional Design with Employer Page Styling
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './student.module.css';
import { useAccreditationManagement, useManebContract, useUserManagement } from '../hooks/useSmartContract';
import { useConnectionStatus } from '../hooks/useSmartContract';
import QRCode from 'qrcode';
import { Shield, User, Download, Search, FileText, Award, GraduationCap, X, UserCheck, LogOut } from 'lucide-react';

// Import local images
import graduationImg from '../assets/photo/Graduation.jpg';
import gala4Img from '../assets/photo/gala4.jpg';
import gala8Img from '../assets/photo/gala8.jpg';

const StudentPortal = () => {
  const navigate = useNavigate();
  const [showAccreditationForm, setShowAccreditationForm] = useState(false);
  const [educationLevel, setEducationLevel] = useState('');
  const [tertiaryFormData, setTertiaryFormData] = useState({
    award: '',
    registrationNumber: ''
  });
  const [secondaryFormData, setSecondaryFormData] = useState({
    yearOfExamination: '',
    examinationNumber: ''
  });
  const [studentDetails, setStudentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalGraduates, setTotalGraduates] = useState(0);
  const [isLoadingGraduates, setIsLoadingGraduates] = useState(true);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Success notification popup state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationShown, setNotificationShown] = useState(false);

  // Logout confirmation popup state
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // User welcome state
  const [userName, setUserName] = useState('');
  const [isLoadingUserName, setIsLoadingUserName] = useState(true);

  // Slideshow images - Local Malawian graduation images
  const slideImages = [
    {
      url: graduationImg,
      title: 'Malawian Graduate Success',
      subtitle: 'Secure your academic achievements with blockchain technology'
    },
    {
      url: gala4Img,
      title: 'Academic Excellence',
      subtitle: 'Empowering students across Malawi with verified credentials'
    },
    {
      url: gala8Img,
      title: 'Educational Achievement',
      subtitle: 'Your achievements, secured and verified for life'
    }
  ];

  // Smart contract hooks - Separated by education level

  // TERTIARY EDUCATION: Certificate Management Contract - Updated function names
  const {
    getStudentByAwardAndRegNumber,
    getQRCodeByRegNumberAndAward,  // NEW: replaces getHashByRegNumberAndAward
    getStudentByQRCode,            // NEW: replaces getStudentByHashValue
    addQR                          // NEW: for generating QR codes
  } = useAccreditationManagement();

  // SECONDARY EDUCATION: MANEB Contract
  const { getStudentDetailsByExamAndYear, getFormHashByExamAndYear, addQR: addQRSecondary } = useManebContract();

  // Connection status
  const { isConnected } = useConnectionStatus();

  // USER MANAGEMENT: For welcome functionality
  const { getUserDetailsWithInstitution } = useUserManagement();

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

  // Slideshow auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slideImages.length]);

  // Logout functions
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    console.log('🚪 Student logging out...');

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');

    // Hide confirmation popup
    setShowLogoutConfirmation(false);

    // Show logout notification
    showSuccessPopup('👋 Logged out successfully!');

    // Navigate to login page after a short delay
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  // Function to fetch user name from email using hook
  const fetchUserName = async () => {
    setIsLoadingUserName(true);
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const { email } = JSON.parse(userData);
        console.log('🔍 Fetching student details for email:', email);

        // Use the hook function to get user details
        const userDetails = await getUserDetailsWithInstitution(email);
        console.log('👤 Student details retrieved:', userDetails);

        setUserName(userDetails.name || 'Student');

        // Show welcome notification
        showSuccessPopup(`Welcome back, ${userDetails.name || 'Student'}! 👋`);
      } else {
        console.warn('⚠️ No user data found in localStorage');
        setUserName('Student');
      }
    } catch (error) {
      console.error('❌ Error fetching student details:', error);
      setUserName('Student');
    } finally {
      setIsLoadingUserName(false);
    }
  };

  // Canvas ref for QR code generation
  const canvasRef = useRef(null);

  // Awards commonly offered in Malawi institutions
  const malawiAwards = [
    'Diploma',
    'Degree',
    'Masters Degree',
    'PhD'
  ];

  useEffect(() => {
    fetchTotalGraduates();
    fetchUserName(); // Fetch user name on component mount
  }, []);

  const fetchTotalGraduates = async () => {
    try {
      setIsLoadingGraduates(true);
      if (isConnected) {
        // Get total from all major universities in Malawi
        const universities = ['mzuzu university', 'university of malawi', 'lilongwe university'];
        let total = 0;

        for (const university of universities) {
          try {
            const count = await getTotalUniversityGraduates(university);
            total += parseInt(count) || 0;
          } catch (err) {
            console.warn(`Could not fetch graduates for ${university}:`, err);
          }
        }
        setTotalGraduates(total);
      } else {
        setTotalGraduates(0);
      }
    } catch (error) {
      console.error('Error fetching total graduates:', error);
      setTotalGraduates(0);
    } finally {
      setIsLoadingGraduates(false);
    }
  };

  const handleApplyForAccreditation = () => {
    setShowAccreditationForm(true);
    setEducationLevel('');
    setStudentDetails(null);
    setError('');
    setSuccess('');
    setShowQRCode(false);
    setQrCodeDataURL('');
  };

  const handleEducationLevelChange = (e) => {
    setEducationLevel(e.target.value);
    setStudentDetails(null);
    setError('');
    setSuccess('');
    setShowQRCode(false);
    setQrCodeDataURL('');
  };

  const handleTertiaryChange = (e) => {
    const { name, value } = e.target;
    setTertiaryFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous results and notifications when input changes
    setError('');
    setSuccess('');
    setStudentDetails(null);
    setShowQRCode(false);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setSecondaryFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous results and notifications when input changes
    setError('');
    setSuccess('');
    setStudentDetails(null);
    setShowQRCode(false);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // SECONDARY EDUCATION: Handle student lookup using MANEB contract
  const handleSecondaryLookup = async (examinationNumber, yearOfExamination) => {
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
      setSuccess('');
      setStudentDetails(null);
      setShowQRCode(false);
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
          studentName: result.studentName,
          examinationNumber: result.examinationNumber,
          schoolName: result.schoolName,
          yearOfExamination: result.yearOfExamination
        });

        // Show success notification popup - only once
        showSuccessPopup('📋 Secondary Education Student Details Retrieved Successfully!');

        // Navigate to StudentDetails page with the retrieved data
        setTimeout(() => {
          navigate('/student/details', {
            state: {
              studentDetails: {
                educationLevel: 'secondary',
                studentName: result.studentName,
                examinationNumber: result.examinationNumber,
                schoolName: result.schoolName,
                yearOfExamination: result.yearOfExamination,
                hashValue: result.hashValue
              },
              educationLevel: 'secondary'
            }
          });
        }, 1500); // Small delay to show the notification

      } else {
        setError('❌ No student record found with this examination number and year. Please check your details.');
        setStudentDetails(null);
        setShowQRCode(false);
      }
    } catch (error) {
      console.error('❌ Error looking up student:', error);
      setError(`❌ Error retrieving student data: ${error.message}`);
      setStudentDetails(null);
      setShowQRCode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // SECONDARY EDUCATION: Generate QR code using MANEB contract
  const generateSecondaryQRCode = async (examinationNumber, yearOfExamination) => {
    if (!examinationNumber || !yearOfExamination) {
      setError('❌ Missing examination number or year for QR code generation.');
      return;
    }

    try {
      setIsGeneratingQR(true);
      setError('');

      console.log('🔍 Step 1: Getting hash value from MANEB contract:', {
        examinationNumber,
        yearOfExamination: parseInt(yearOfExamination)
      });

      // Step 1: Get hash value from MANEB contract
      const hashValue = await getFormHashByExamAndYear(examinationNumber, yearOfExamination);

      if (!hashValue) {
        throw new Error('No hash value found for this examination number and year.');
      }

      console.log('✅ Step 1 Complete: Hash value retrieved:', hashValue);
      console.log('🔍 Step 2: Generating QR code from hash value...');

      // Step 2: Generate QR code from hash value
      const qrCodeDataURL = await QRCode.toDataURL(hashValue, {
        width: 400,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1.0,
        scale: 8
      });

      setQrCodeDataURL(qrCodeDataURL);
      setShowQRCode(true);

      // Show popup notification immediately for successful QR code generation
      showSuccessPopup('🎉 Secondary Education QR Code Generated Successfully!');

      console.log('✅ Step 2 Complete: QR code generated successfully');
      console.log('🔍 Step 3: Recording QR code in MANEB blockchain...');

      // Step 3: Add QR record to MANEB blockchain (secondary education)
      await addQRSecondary(hashValue);

      console.log('✅ Step 3 Complete: QR code recorded in MANEB blockchain');

      setSuccess('✅ QR code generated successfully! You can now download it.');

    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      setError(`❌ Error generating QR code: ${error.message}`);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // TERTIARY EDUCATION: Generate QR Code - Retrieve QR code from blockchain
  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      setError('');
      setSuccess('');

      // Validate that we have student details
      if (!studentDetails || !studentDetails.registrationNumber || !studentDetails.award) {
        throw new Error('Student details not available. Please verify student details first.');
      }

      console.log('🔍 ===== RETRIEVING QR CODE FROM BLOCKCHAIN =====');
      console.log('📋 Student Details:', {
        registrationNumber: studentDetails.registrationNumber,
        award: studentDetails.award,
        studentName: studentDetails.studentName,
        universityName: studentDetails.institutionName
      });

      // First, let's verify the student still exists with these exact parameters
      console.log('🔍 Double-checking student exists with exact parameters...');
      const studentCheck = await getStudentByAwardAndRegNumber(
        studentDetails.registrationNumber,
        studentDetails.award
      );
      console.log('📊 Student verification result:', studentCheck);

      // Call the Certificate Management contract to get QR code
      const qrResult = await getQRCodeByRegNumberAndAward(
        studentDetails.registrationNumber,
        studentDetails.award
      );

      console.log('📊 QR Code Retrieval Result:', qrResult);

      if (qrResult && qrResult.found && qrResult.qrCodeValue) {
        console.log('✅ QR CODE FOUND IN BLOCKCHAIN!');
        console.log('🔗 QR Code Value:', qrResult.qrCodeValue);
        console.log('📱 QR Code Length:', qrResult.qrCodeValue.length);
        console.log('🎯 QR Code Type:', typeof qrResult.qrCodeValue);

        // For tertiary education, call addQR function to record QR code generation on blockchain
        if (educationLevel === 'tertiary') {
          try {
            console.log('🔄 Recording QR code generation on blockchain for tertiary education...');
            setSuccess('Recording QR code generation on blockchain... Please confirm transaction in MetaMask');

            // Call addQR function with the QR code value to send transaction
            const addQRResult = await addQR(qrResult.qrCodeValue);
            console.log('📊 addQR Transaction Result:', addQRResult);

            if (addQRResult && addQRResult.success) {
              console.log('✅ QR code generation recorded on blockchain successfully!');
              setSuccess(`✅ QR Code retrieved and recorded on blockchain!

🔗 Transaction Hash: ${addQRResult.transactionHash?.substring(0, 20)}...
📋 QR Code Value: ${qrResult.qrCodeValue}
👤 Student: ${studentDetails.studentName}
🎓 Award: ${studentDetails.award}`);
            } else {
              console.warn('⚠️ QR code retrieved but failed to record generation on blockchain:', addQRResult?.error);
              setSuccess(`✅ QR Code retrieved successfully, but blockchain recording failed: ${addQRResult?.error || 'Unknown error'}`);
            }
          } catch (blockchainError) {
            console.error('❌ Error recording QR code generation on blockchain:', blockchainError);
            setSuccess(`✅ QR Code retrieved successfully, but blockchain recording failed: ${blockchainError.message}`);
          }
        } else {
          // For secondary education, just show success message
          setSuccess(`✅ QR Code retrieved successfully from blockchain!

QR Code Value: ${qrResult.qrCodeValue}
Registration Number: ${studentDetails.registrationNumber}
Award: ${studentDetails.award}
Student: ${studentDetails.studentName}`);
        }

        // TODO: Generate actual QR code image and navigate to QR page
        console.log('💡 Next step: Generate QR code image and navigate to QR page');

      } else {
        console.log('❌ QR CODE NOT FOUND IN BLOCKCHAIN');
        throw new Error('QR code not found in blockchain. Please ensure the student record exists and has a QR code generated.');
      }

    } catch (error) {
      console.error('❌ QR Code retrieval failed:', error);
      setError(`❌ Failed to retrieve QR code: ${error.message}`);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR Code
  const downloadQRCode = async () => {
    if (!qrCodeDataURL) return;

    try {
      // First, download the QR code file
      const link = document.createElement('a');
      link.download = `student-verification-${studentDetails.registrationNumber}-${Date.now()}.png`;
      link.href = qrCodeDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification for download
      showSuccessPopup('📥 QR Code Downloaded Successfully!');

      // For tertiary education, call addQR function to record the download on blockchain
      if (educationLevel === 'tertiary' && studentDetails) {
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

  // Test QR Code Generation (for debugging)
  const generateTestQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      console.log('🧪 Generating test QR code...');

      const testHash = "0x1234567890abcdef1234567890abcdef12345678";
      console.log('🧪 Test hash:', testHash);

      const testQrCodeDataURL = await QRCode.toDataURL(testHash, {
        width: 400,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1.0,
        scale: 8
      });

      setQrCodeDataURL(testQrCodeDataURL);
      setShowQRCode(true);

      // Show popup notification for test QR code generation
      showSuccessPopup('🧪 Test QR Code Generated Successfully!');

      console.log('🧪 Test QR code generated successfully');
      setSuccess('🧪 Test QR code generated with hash: ' + testHash);

    } catch (error) {
      console.error('🧪 Test QR code generation failed:', error);
      setError('🧪 Test QR code generation failed: ' + error.message);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // TERTIARY EDUCATION: Handle verification using Certificate Management contract
  const handleTertiarySubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple simultaneous requests
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    // Reset notification state to allow new notification
    setShowSuccessNotification(false);
    setNotificationShown(false);

    try {
      // Validate input fields
      if (!tertiaryFormData.registrationNumber || !tertiaryFormData.award) {
        throw new Error('Please fill in all fields');
      }

      if (!isConnected) {
        throw new Error('Please connect your wallet to verify student details');
      }

      console.log('🔍 Searching for tertiary student with:', {
        registrationNumber: tertiaryFormData.registrationNumber,
        award: tertiaryFormData.award
      });

      // Call the Certificate Management contract function
      const result = await getStudentByAwardAndRegNumber(
        tertiaryFormData.registrationNumber,
        tertiaryFormData.award
      );

      console.log('📊 Certificate Management contract result:', result);

      if (result && result.found && result.studentDetails) {
        // Extract student details from blockchain result
        const studentData = {
          found: true,
          educationLevel: 'tertiary',
          institutionName: result.studentDetails.universityName,
          studentName: result.studentDetails.studentName,
          programOfStudy: result.studentDetails.programOfStudy,
          award: result.studentDetails.award,
          yearOfGraduation: result.studentDetails.yearOfGraduation,
          registrationNumber: result.studentDetails.registrationNumber
        };

        console.log('✅ Student details retrieved successfully:', studentData);
        setStudentDetails(studentData);

        // 🔍 DEBUG: Test hash generation and verification for this student
        await debugHashMismatch(tertiaryFormData.registrationNumber, tertiaryFormData.award);

        // Show success notification popup
        showSuccessPopup('🎓 Tertiary Student Details Retrieved Successfully!');

        // Navigate to StudentDetails page with the retrieved data
        setTimeout(() => {
          navigate('/student/details', {
            state: {
              studentDetails: studentData,
              educationLevel: 'tertiary'
            }
          });
        }, 1500); // Small delay to show the notification

      } else {
        // Student not found in blockchain
        const errorMsg = `❌ No student found with the provided details.

🔍 Search Parameters:
• Registration Number: ${tertiaryFormData.registrationNumber}
• Award: ${tertiaryFormData.award}

💡 Please verify:
1. Registration number is correct
2. Award matches exactly
3. Student record exists in the Certificate Management blockchain

📚 Make sure the student has been added to the blockchain first.`;

        console.log('❌ Student not found:', errorMsg);
        setError(errorMsg);
        setStudentDetails(null);
      }

    } catch (error) {
      console.error('❌ Error verifying tertiary student details:', error);
      setError(error.message || 'Failed to verify student details. Please try again.');
      setStudentDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 DEBUG FUNCTION: Trace hash generation vs verification mismatch
  const debugHashMismatch = async (registrationNumber, award) => {
    try {
      console.log('');
      console.log('🔍 ===== HASH MISMATCH DEBUGGING =====');
      console.log('📋 Testing with:', { registrationNumber, award });

      // Step 1: Get student details (we know this works)
      console.log('🔍 Step 1: Getting student details...');
      const studentResult = await getStudentByAwardAndRegNumber(registrationNumber, award);
      console.log('📊 Student result:', studentResult);

      if (studentResult && studentResult.found && studentResult.studentDetails) {
        const student = studentResult.studentDetails;
        console.log('✅ Student found in contract:');
        console.log('  • Name:', student.studentName);
        console.log('  • Reg Number:', student.registrationNumber);
        console.log('  • Award:', student.award);
        console.log('  • Hash in student record:', student.hashValue);

        // Step 2: Generate QR code using the same reg number and award
        console.log('🔍 Step 2: Generating QR code for same student...');
        const qrResult = await getQRCodeByRegNumberAndAward(registrationNumber, award);
        console.log('📊 QR code generation result:', qrResult);

        if (qrResult && qrResult.found && qrResult.qrCodeValue) {
          const generatedQRCode = qrResult.qrCodeValue;
          console.log('✅ QR code generated successfully:', generatedQRCode);

          // Step 3: Compare the QR codes
          console.log('🔍 Step 3: Comparing QR codes...');
          const storedQRCode = student.hashValue; // This might be stored as hashValue in old records
          console.log('📊 QR code stored in student record:', storedQRCode);
          console.log('📊 QR code generated by function:', generatedQRCode);
          console.log('📊 QR codes match:', storedQRCode === generatedQRCode);

          if (storedQRCode !== generatedQRCode) {
            console.log('❌ QR CODE MISMATCH DETECTED!');
            console.log('❌ Stored QR code:', storedQRCode);
            console.log('❌ Generated QR code:', generatedQRCode);
            console.log('❌ This explains why QR verification fails!');

            // Test both QR codes with verification
            console.log('🔍 Step 4: Testing both QR codes with verification...');

            // Test stored QR code
            console.log('🔍 Testing stored QR code:', storedQRCode);
            const storedQRTest = await getStudentByQRCode(storedQRCode);
            console.log('📊 Stored QR code verification result:', storedQRTest);

            // Test generated QR code
            console.log('🔍 Testing generated QR code:', generatedQRCode);
            const generatedQRTest = await getStudentByQRCode(generatedQRCode);
            console.log('📊 Generated QR code verification result:', generatedQRTest);

          } else {
            console.log('✅ QR codes match! Testing verification...');

            // Step 4: Test verification with the QR code
            console.log('🔍 Step 4: Testing QR code verification...');
            const verificationResult = await getStudentByQRCode(generatedQRCode);
            console.log('📊 Verification result:', verificationResult);

            if (verificationResult && verificationResult.found) {
              console.log('✅ QR code verification works correctly!');
            } else {
              console.log('❌ QR code verification failed even though QR codes match!');
              console.log('❌ This indicates a different issue in getStudentByQRCode function');
            }
          }
        } else {
          console.log('❌ QR code generation failed');
        }
      } else {
        console.log('❌ Student not found (this should not happen)');
      }

      console.log('🔍 ===== HASH MISMATCH DEBUGGING END =====');
      console.log('');

    } catch (error) {
      console.error('❌ Debug function error:', error);
    }
  };

  const clearResults = () => {
    setStudentDetails(null);
    setError('');
    setSuccess('');
    setShowQRCode(false);
    setQrCodeDataURL('');
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  const resetForm = () => {
    // Reset all form states
    setShowAccreditationForm(false);
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
    setSuccess('');
    setShowQRCode(false);
    setQrCodeDataURL('');
    setIsLoading(false);
    setIsGeneratingQR(false);
    setShowSuccessNotification(false);
    setNotificationShown(false);
  };

  // Handle secondary education selection
  const handleSecondaryEducation = () => {
    setEducationLevel('secondary');
    setError('');
    setSuccess('');
    setStudentDetails(null);
    setShowQRCode(false);
    setQrCodeDataURL('');
  };

  // Success Notification Popup Component
  const SuccessNotificationPopup = () => {
    if (!showSuccessNotification) return null;

    return (
      <div className={styles.notificationOverlay}>
        <div className={styles.notificationPopup}>
          <div className={styles.notificationIcon}>
            <Award size={48} />
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
      </div>
    );
  };

  // Logout Confirmation Popup Component
  const LogoutConfirmationPopup = () => {
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
              Are you sure you want to logout? You will need to login again to access the student portal.
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

  return (
    <div className={styles.container}>
      {/* Success Notification Popup */}
      <SuccessNotificationPopup />

      {/* Logout Confirmation Popup */}
      <LogoutConfirmationPopup />

      {/* Background Slideshow */}
      <div className={styles.backgroundSlideshow}>
        {slideImages.map((slide, index) => (
          <div
            key={index}
            className={`${styles.backgroundSlide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <GraduationCap className={styles.logoIcon} />
            <h1 className={styles.title}>Student Digital Certificate Portal</h1>
          </div>

          {/* Welcome Message for Student */}
          <div className={styles.welcomeSection}>
            <div className={styles.userProfile}>
              <User className={styles.userIcon} />
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>
                  {isLoadingUserName
                    ? '⏳ Loading...'
                    : `👋 Welcome, ${userName}!`
                  }
                </span>
                <span className={styles.userRole}>🎓 Student</span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {(showAccreditationForm || studentDetails || error || success || showQRCode) && (
              <button
                onClick={resetForm}
                className={styles.cancelButton}
                title="Clear everything and start over"
              >
                <X size={24} />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              title="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.verificationCard}>
          {!showAccreditationForm ? (
            <div className={styles.initialView}>
              <div className={styles.cardTitle}>
                <Award size={24} />
                Welcome to Digital Certificate Portal
              </div>
              <div className={styles.welcomeContent}>
                <p className={styles.welcomeText}>
                  Secure your certificate by get digital certificate
                </p>
                <button
                  onClick={handleApplyForAccreditation}
                  className={styles.applyButton}
                >
                  <FileText size={20} />
                  Get Digital Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.accreditationForm}>
              <h2 className={styles.cardTitle}>
                <User size={24} />
                Student Verification
              </h2>

              {!educationLevel ? (
                <div className={styles.educationLevelSelection}>
                  <h3 className={styles.cardTitle}>
                    <GraduationCap size={24} />
                    Select Your Education Level
                  </h3>
                  <div className={styles.levelOptions}>
                    <button
                      onClick={handleSecondaryEducation}
                      className={styles.levelButton}
                    >
                      <Award size={20} />
                      Secondary (MSCE)
                    </button>
                    <button
                      onClick={() => setEducationLevel('tertiary')}
                      className={styles.levelButton}
                    >
                      <GraduationCap size={20} />
                      Tertiary Education
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {educationLevel === 'tertiary' && (
                    <div className={styles.form}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Registration Number:</label>
                        <div className={styles.inputContainer}>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={tertiaryFormData.registrationNumber}
                            onChange={handleTertiaryChange}
                            placeholder="Enter your registration number"
                            className={styles.input}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Award:</label>
                        <div className={styles.inputContainer}>
                          <select
                            name="award"
                            value={tertiaryFormData.award}
                            onChange={handleTertiaryChange}
                            className={styles.select}
                            required
                          >
                            <option value="">Select Award</option>
                            {malawiAwards.map((award, index) => (
                              <option key={index} value={award}>
                                {award}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={handleTertiarySubmit}
                          className={styles.retrieveButton}
                          disabled={isLoading || !isConnected}
                        >
                          <Search size={20} />
                          {isLoading ? 'Verifying from Blockchain...' : 'Verify Student Details'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className={styles.resetButton}
                        >
                          Reset
                        </button>
                      </div>

                      {!isConnected && (
                        <p className={styles.warningText}>
                          ⚠️ Please connect your wallet to verify student details
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error Messages */}
                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}

                  {/* Simple Success Message for Student Details */}
                  {studentDetails && (
                    <div className={styles.simpleSuccess}>
                      processed successful
                    </div>
                  )}
                </>
              )}

              {educationLevel === 'secondary' && (
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Year of Examination:</label>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        name="yearOfExamination"
                        value={secondaryFormData.yearOfExamination}
                        onChange={handleSecondaryChange}
                        placeholder="e.g., 2024"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Examination Number:</label>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        name="examinationNumber"
                        value={secondaryFormData.examinationNumber}
                        onChange={handleSecondaryChange}
                        placeholder="e.g., MSCE2024001"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => handleSecondaryLookup(secondaryFormData.examinationNumber, secondaryFormData.yearOfExamination)}
                      className={styles.retrieveButton}
                      disabled={isLoading || !isConnected || !secondaryFormData.examinationNumber || !secondaryFormData.yearOfExamination}
                    >
                      <Search size={20} />
                      {isLoading ? 'Looking up student...' : 'Verify Student Record'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className={styles.resetButton}
                    >
                      Reset
                    </button>
                  </div>

                  {!isConnected && (
                    <p className={styles.warningText}>
                      ⚠️ Please connect your wallet to verify student details
                    </p>
                  )}

                  {isLoading && (
                    <div className={styles.loadingMessage}>
                      🔍 Looking up student record...
                    </div>
                  )}

                  {/* Error Messages */}
                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}

                  {/* Success Messages */}
                  {success && (
                    <div className={styles.successMessage}>
                      {success}
                    </div>
                  )}

                  {/* Simple Success Message for Student Details */}
                  {studentDetails && (
                    <div className={styles.simpleSuccess}>
                      processed successful
                    </div>
                  )}

                  {/* Secondary Education Student Details Display */}
                  {studentDetails && educationLevel === 'secondary' && (
                    <div className={styles.studentDetailsCard}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>📋 Student Details Found</h3>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Student Name</span>
                          <span className={styles.detailValue}>{studentDetails.studentName}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Examination Number</span>
                          <span className={styles.detailValue}>{studentDetails.examinationNumber}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>School Name</span>
                          <span className={styles.detailValue}>{studentDetails.schoolName}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Year of Examination</span>
                          <span className={styles.detailValue}>{studentDetails.yearOfExamination}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate QR Code Button for Secondary Education */}
                  {studentDetails && educationLevel === 'secondary' && (
                    <div className={styles.qrButtonGroup}>
                      <button
                        type="button"
                        onClick={() => generateSecondaryQRCode(studentDetails.examinationNumber, studentDetails.yearOfExamination)}
                        className={styles.qrButton}
                        disabled={isGeneratingQR || showQRCode}
                      >
                        <Download size={20} />
                        {isGeneratingQR ? 'Generating QR Code...' : showQRCode ? 'QR Code Generated' : 'Generate QR Code'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(studentDetails || error || success) && (
                <div className={styles.resultsContainer}>
                  <div className={styles.resultsHeader}>
                    <h3>Verification Results</h3>
                    <button onClick={clearResults} className={styles.clearButton}>
                      Clear Results
                    </button>
                  </div>

                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className={styles.successMessage}>
                      {success}
                    </div>
                  )}

                  {/* Tertiary Education Student Details Display */}
                  {studentDetails && educationLevel === 'tertiary' && (
                    <div className={styles.studentDetailsCard}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>🎓 University Student Details</h3>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Student Name</span>
                          <span className={styles.detailValue}>{studentDetails.studentName}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Registration Number</span>
                          <span className={styles.detailValue}>{studentDetails.registrationNumber}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Institution</span>
                          <span className={styles.detailValue}>{studentDetails.institutionName}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Program of Study</span>
                          <span className={styles.detailValue}>{studentDetails.programOfStudy}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Award</span>
                          <span className={styles.detailValue}>{studentDetails.award}</span>
                        </div>

                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Year of Graduation</span>
                          <span className={styles.detailValue}>{studentDetails.yearOfGraduation}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Button - Shows only for tertiary education */}
                  {studentDetails && educationLevel === 'tertiary' && (
                    <div className={styles.confirmSection}>
                      <button
                        onClick={generateQRCode}
                        className={styles.retrieveButton}
                        disabled={isGeneratingQR || !isConnected}
                      >
                        <FileText size={20} />
                        {isGeneratingQR ? 'Generating QR Code...' : 'Generate Digital Certificate'}
                      </button>

                      {!isConnected && (
                        <p className={styles.warningText}>
                          ⚠️ Please connect your wallet to generate QR code
                        </p>
                      )}
                    </div>
                  )}

                  {/* QR Code Display */}
                  {showQRCode && qrCodeDataURL && (
                    <div className={styles.qrCodeSection}>
                      <h3 className={styles.cardTitle}>
                        <Award size={24} />
                        Digital Certificate QR Code
                      </h3>
                      <div className={styles.qrCodeContainer}>
                        <img
                          src={qrCodeDataURL}
                          alt="Student Verification QR Code"
                          className={styles.qrCodeImage}
                        />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className={styles.downloadButton}
                      >
                        <Download size={20} />
                        Download Certificate
                      </button>
                      <div className={styles.qrCodeInfo}>
                        <p><strong>Your Digital Certificate is Ready!</strong></p>
                        <p>This QR code contains your verification hash for instant credential verification.</p>
                        <p>Employers can scan this code to verify your academic credentials instantly.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;