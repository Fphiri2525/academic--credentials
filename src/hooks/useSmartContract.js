import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  web3Service, 
  sendTransaction, 
  callContract, 
  listenToEvent, 
  getPastEvents,
  getConnectionStatus,
  getNetworkInfo 
} from '../web3service';
import contractUtils from '../utilis/contractutils';

// Stops a subscription whatever shape it has (Promise, .remove, .unsubscribe, .off, or a function)
export const stopSubscription = async (sub) => {
  try {
    const s = await sub;
    if (!s) return;
    if (typeof s.remove === 'function') s.remove();
    else if (typeof s.unsubscribe === 'function') await s.unsubscribe();
    else if (typeof s.off === 'function') s.off();
    else if (typeof s === 'function') s();
  } catch (err) {
    console.warn('Failed to stop event subscription:', err);
  }
};

// Custom hook for smart contract interactions
export const useSmartContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [contractStatus, setContractStatus] = useState({});
  const eventListeners = useRef(new Map());

  useEffect(() => {
    const updateConnectionStatus = () => {
      const status = getConnectionStatus();
      setConnectionStatus(status);
    };

    updateConnectionStatus();
    const interval = setInterval(updateConnectionStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchNetworkInfo = useCallback(async () => {
    try {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
      return info;
    } catch (error) {
      console.error('Failed to fetch network info:', error);
      setError(error);
      return null;
    }
  }, []);

  const checkContractStatus = useCallback(async () => {
    try {
      const status = await contractUtils.general.checkAllContracts();
      setContractStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check contract status:', error);
      setError(error);
      return {};
    }
  }, []);

  const sendTransactionWithState = useCallback(async (contractName, methodName, params = [], options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sendTransaction(contractName, methodName, params, options);
      return result;
    } catch (error) {
      const formattedError = contractUtils.general.formatErrorMessage(error);
      setError(formattedError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const callContractWithState = useCallback(async (contractName, methodName, params = [], options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callContract(contractName, methodName, params, options);
      return result;
    } catch (error) {
      const formattedError = contractUtils.general.formatErrorMessage(error);
      setError(formattedError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const listenToEventWithCleanup = useCallback((contractName, eventName, callback, options = {}) => {
    const eventKey = `${contractName}:${eventName}`;

    if (eventListeners.current.has(eventKey)) {
      stopSubscription(eventListeners.current.get(eventKey));
      eventListeners.current.delete(eventKey);
    }

    const subscription = listenToEvent(contractName, eventName, callback, options);
    eventListeners.current.set(eventKey, subscription);

    // Avoid "unhandled rejection" if the subscription is a Promise that fails
    Promise.resolve(subscription).catch((err) => console.warn(`Event ${eventKey} failed:`, err));

    return subscription;
  }, []);

  const cleanupEventListeners = useCallback(() => {
    eventListeners.current.forEach((subscription, key) => {
      stopSubscription(subscription);
      console.log(`Cleaned up event listener: ${key}`);
    });
    eventListeners.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      cleanupEventListeners();
    };
  }, [cleanupEventListeners]);

  return {
    loading,
    error,
    connectionStatus,
    networkInfo,
    contractStatus,
    sendTransaction: sendTransactionWithState,
    callContract: callContractWithState,
    listenToEvent: listenToEventWithCleanup,
    getPastEvents,
    fetchNetworkInfo,
    checkContractStatus,
    cleanupEventListeners,
    formatError: contractUtils.general.formatErrorMessage,
    isValidAddress: contractUtils.general.isValidAddress,
    weiToEther: contractUtils.general.weiToEther,
    etherToWei: contractUtils.general.etherToWei
  };
};

// Hook for user management operations
export const useUserManagement = () => {
  const contract = useSmartContract();
  const userDetailsCache = useRef(new Map());

  const registerUser = useCallback(async (userData) => {
    return await contract.sendTransaction('userManagement', 'registerUser', [
      userData.name,
      userData.email,
      userData.contactInfo,
      userData.password,
      userData.role,
      userData.institution
    ], { gas: 500000 });
  }, [contract]);

  const signIn = useCallback(async (email, password) => {
    return await contract.callContract('userManagement', 'signIn', [email, password]);
  }, [contract]);

  const getUserDetails = useCallback(async (email) => {
    const details = await contract.callContract('userManagement', 'getUserDetails', [email]);
    return {
      name: details[0] || '',
      email: details[1] || '',
      contactInfo: details[2] || '',
      role: details[3] || ''
    };
  }, [contract]);

  const getUserDetailsWithInstitution = useCallback(async (email) => {
    if (userDetailsCache.current.has(email)) {
      console.log('Returning cached user details for:', email);
      return userDetailsCache.current.get(email);
    }

    try {
      const details = await contract.callContract('userManagement', 'getUserDetails', [email]);
      const institution = await contract.callContract('userManagement', 'getUserInstitution', [email]);
      
      const userData = {
        name: details[0] || '',
        email: details[1] || '',
        contactInfo: details[2] || '',
        role: details[3] || '',
        institution: institution || ''
      };

      userDetailsCache.current.set(email, userData);
      console.log('Cached user details for:', email);
      
      return userData;
    } catch (error) {
      console.error('Error getting user details with institution:', error);
      const details = await contract.callContract('userManagement', 'getUserDetails', [email]);
      const userData = {
        name: details[0] || '',
        email: details[1] || '',
        contactInfo: details[2] || '',
        role: details[3] || '',
        institution: ''
      };
      
      userDetailsCache.current.set(email, userData);
      return userData;
    }
  }, [contract]);

  const getAllUsers = useCallback(async () => {
    const data = await contract.callContract('userManagement', 'getAllUserDetails');
    const users = [];
    const names = data[0] || [];
    const emails = data[1] || [];
    const contactInfos = data[2] || [];
    const roles = data[3] || [];
    const institutions = data[4] || [];
    
    for (let i = 0; i < names.length; i++) {
      users.push({
        id: i,
        name: names[i] || '',
        email: emails[i] || '',
        contactInfo: contactInfos[i] || '',
        role: roles[i] || '',
        institution: institutions[i] || ''
      });
    }
    
    return users;
  }, [contract]);

  const updateUserPassword = useCallback(async (email, newPassword) => {
    try {
      if (!email || !newPassword) {
        throw new Error('Email and new password are required');
      }

      console.log('🔐 Changing user password using changeUserPasswordByEmail for:', email);

      const txOptions = {
        gas: 400000,
        maxFeePerGas: '50000000000',
        maxPriorityFeePerGas: '2000000000'
      };

      const result = await contract.sendTransaction(
        'userManagement',
        'changeUserPasswordByEmail',
        [email, newPassword],
        txOptions
      );

      console.log('✅ User password changed successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Error changing user password:', error);
      throw error;
    }
  }, [contract]);

  const changeUserPasswordByEmail = updateUserPassword;

  const updateUserEmailAndName = useCallback(async (currentEmail, newEmail, newName) => {
    try {
      if (!currentEmail || !newEmail || !newName) {
        throw new Error('All parameters (currentEmail, newEmail, newName) are required');
      }

      console.log('Updating user email and name:', {
        currentEmail,
        newEmail,
        newName
      });

      const txOptions = {
        gas: 500000,
        maxFeePerGas: '50000000000',
        maxPriorityFeePerGas: '2000000000'
      };

      const result = await contract.sendTransaction(
        'userManagement',
        'updateUserEmailAndName',
        [currentEmail, newEmail, newName],
        txOptions
      );

      console.log('✅ User email and name updated successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Error updating user email and name:', error);
      throw error;
    }
  }, [contract]);

  const deleteUser = useCallback(async (email) => {
    return await contract.sendTransaction('userManagement', 'deleteUser', [email], { gas: 300000 });
  }, [contract]);

  const getUserInstitution = useCallback(async (email) => {
    return await contract.callContract('userManagement', 'getUserInstitution', [email]);
  }, [contract]);

  const clearUserDetailsCache = useCallback(() => {
    userDetailsCache.current.clear();
    console.log('User details cache cleared');
  }, []);

  return {
    ...contract,
    registerUser,
    signIn,
    getUserDetails,
    getUserDetailsWithInstitution,
    getAllUsers,
    updateUserPassword,
    changeUserPasswordByEmail,
    updateUserEmailAndName,
    deleteUser,
    getUserInstitution,
    clearUserDetailsCache
  };
};

// Hook for accreditation management operations
// Contract enum: 0 = Active, 1 = Suspended
export const useAccreditationManagement = () => {
  const contract = useSmartContract();
  // sendTransaction / callContract are stable (useCallback with no deps),
  // so depending on them avoids re-creating every function on each render.
  const { sendTransaction, callContract } = contract;

  const normalizeStatus = (value) => {
    const s = Number(value ?? 0);
    return s === 1 ? 1 : 0;
  };

  const mapUniversity = (u, index) => ({
    id: index,
    name: u.name ?? u[0] ?? '',
    category: u.category ?? u[1] ?? '',
    contactInfo: u.contactInfo ?? u[2] ?? '',
    status: normalizeStatus(u.status ?? u[3]),
  });

  const mapProgram = (p, index) => {
    // Safety net if an older contract returned plain program-name strings
    if (typeof p === 'string') {
      return {
        id: index,
        institutionName: '',
        programName: p,
        programType: '',
        accreditationDate: '',
        status: 0,
      };
    }
    return {
      id: index,
      institutionName: p.institutionName ?? p[0] ?? '',
      programName: p.programName ?? p[1] ?? '',
      programType: p.programType ?? p[2] ?? '',
      accreditationDate: p.accreditationDate ?? p[3] ?? '',
      status: normalizeStatus(p.status ?? p[4]),
    };
  };

  const addAccreditedUniversity = useCallback(async (universityData) => {
    return await sendTransaction('accreditationManagement', 'addAccreditedUniversity', [
      universityData.institutionName,
      universityData.category,
      universityData.contactInfo
    ], { gas: 500000 });
  }, [sendTransaction]);

  const addProgram = useCallback(async (programData) => {
    return await sendTransaction('accreditationManagement', 'addProgram', [
      programData.institutionName,
      programData.programName,
      programData.programType,
      programData.accreditationDate
    ], { gas: 500000 });
  }, [sendTransaction]);

  const getAllAccreditedUniversities = useCallback(async () => {
    try {
      const data = await callContract('accreditationManagement', 'getAllAccreditedUniversities');

      if (Array.isArray(data)) {
        return data.map(mapUniversity);
      }

      if (data && typeof data === 'object') {
        return [mapUniversity(data, 0)];
      }

      console.warn('Unexpected data format from getAllAccreditedUniversities:', data);
      return [];
    } catch (error) {
      console.error('Error in getAllAccreditedUniversities:', error);
      return [];
    }
  }, [callContract]);

  // NOTE: the contract's getProgramsByUniversity returns ONLY Active programs.
  // Use getAllProgramsByUniversity (below) when you also need Suspended ones.
  const getProgramsByUniversity = useCallback(async (universityName) => {
    const programs = await callContract('accreditationManagement', 'getProgramsByUniversity', [universityName]);
    return Array.isArray(programs) ? programs.map(mapProgram) : [];
  }, [callContract]);

  // Suspend (1) or reinstate (0) a university. Wallet must be the owner or an authorized institution.
  const updateUniversityStatus = useCallback(async ({ name, status }) => {
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('University name is required');

    const s = Number(status);
    if (s !== 0 && s !== 1) throw new Error('Status must be 0 (Active) or 1 (Suspended)');

    return await sendTransaction('accreditationManagement', 'updateUniversityStatus', [
      cleanName,
      s
    ], { gas: 800000 });
  }, [sendTransaction]);

  // Suspend (1) or reinstate (0) a program. Wallet must be the owner or an authorized institution.
  const updateProgramStatus = useCallback(async ({ institutionName, programName, status }) => {
    const cleanInstitution = (institutionName || '').trim();
    const cleanProgram = (programName || '').trim();
    if (!cleanInstitution) throw new Error('Institution name is required');
    if (!cleanProgram) throw new Error('Program name is required');

    const s = Number(status);
    if (s !== 0 && s !== 1) throw new Error('Status must be 0 (Active) or 1 (Suspended)');

    return await sendTransaction('accreditationManagement', 'updateProgramStatus', [
      cleanInstitution,
      cleanProgram,
      s
    ], { gas: 800000 });
  }, [sendTransaction]);

  // Active AND Suspended programs. Needs getAllProgramsByUniversity in the contract.
  const getAllProgramsByUniversity = useCallback(async (universityName) => {
    const programs = await callContract('accreditationManagement', 'getAllProgramsByUniversity', [universityName]);
    return Array.isArray(programs) ? programs.map(mapProgram) : [];
  }, [callContract]);

  const getTotalActiveAccreditedUniversities = useCallback(async () => {
    try {
      const total = await callContract('accreditationManagement', 'getTotalActiveAccreditedUniversities');
      return Number(total) || 0;
    } catch (error) {
      console.error('Error fetching total active accredited universities:', error);
      return 0;
    }
  }, [callContract]);

  const getTotalAccreditedUniversities = useCallback(async () => {
    try {
      const total = await callContract('accreditationManagement', 'getTotalAccreditedUniversities');
      return parseInt(total) || 0;
    } catch (error) {
      console.error('Error fetching total accredited universities:', error);
      return 0;
    }
  }, [callContract]);

  return {
    ...contract,
    addAccreditedUniversity,
    addProgram,
    getAllAccreditedUniversities,
    getProgramsByUniversity,
    updateUniversityStatus,
    updateProgramStatus,
    getAllProgramsByUniversity,
    getTotalAccreditedUniversities,
    getTotalActiveAccreditedUniversities
  };
};

// Hook for certificate management operations
export const useCertificateManagement = () => {
  const contract = useSmartContract();

  const addUniversityGraduates = useCallback(async (graduateData, options = {}) => {
    console.log('🎯 addUniversityGraduates called with:', graduateData);
    
    const params = [
      graduateData.universityName,
      graduateData.programOfStudy,
      graduateData.award,
      graduateData.yearOfGraduation,
      graduateData.registrationNumbers,
      graduateData.studentNames
    ];

    return await contract.sendTransaction('certificateManagement', 'addUniversityGraduates', params, {
      gas: options.gas || 800000,
      gasPrice: options.gasPrice,
      maxFeePerGas: options.maxFeePerGas,
      maxPriorityFeePerGas: options.maxPriorityFeePerGas,
      ...options
    });
  }, [contract]);

  // ---------------------------------------------------------------
  // NEW: registers an approved foreign certificate on-chain.
  // Contract: addForeignVerification(universityName, studentName,
  //   programOfStudy, award, yearOfGraduation, registrationNumber)
  // ---------------------------------------------------------------
  const addForeignVerification = useCallback(async (data, options = {}) => {
    const clean = (v) => String(v ?? '').trim();

    const args = [
      clean(data?.universityName),
      clean(data?.studentName),
      clean(data?.programOfStudy),
      clean(data?.award),
      clean(data?.yearOfGraduation),
      clean(data?.registrationNumber),
    ];

    const labels = [
      'University name',
      'Student name',
      'Program of study',
      'Award',
      'Year of graduation',
      'Registration number',
    ];
    const missing = labels.filter((_, i) => !args[i]);
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    console.log('🌍 addForeignVerification called with:', args);

    const result = await contract.sendTransaction('certificateManagement', 'addForeignVerification', args, {
      gas: options.gas || 800000,
      ...options,
    });

    console.log('✅ Foreign certificate recorded on blockchain:', result?.transactionHash);
    return result;
  }, [contract]);

  const getGraduatesByUniversityName = useCallback(async (universityName) => {
    try {
      const data = await contract.callContract('certificateManagement', 'getGraduatesByUniversity', [universityName]);

      if (Array.isArray(data) && data.length > 0) {
        return data.map((graduate, index) => ({
          id: index,
          universityName: graduate.universityName || graduate[0] || '',
          studentName: graduate.studentName || graduate[1] || '',
          programOfStudy: graduate.programOfStudy || graduate[2] || '',
          award: graduate.award || graduate[3] || '',
          yearOfGraduation: graduate.yearOfGraduation || graduate[4] || '',
          registrationNumber: graduate.registrationNumber || graduate[5] || '',
          hashValue: graduate.hashValue || graduate[6] || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching graduates by university name:', error);
      return [];
    }
  }, [contract]);

  const getStudentDetailsByRegAndAward = useCallback(async (registrationNumber, award, yearOfGraduation) => {
    const data = await contract.callContract(
      'certificateManagement',
      'getStudentDetailsByRegAndYear',
      [registrationNumber, award, yearOfGraduation]
    );

    // The contract returns a struct with named fields.
    const graduateData = data || {};

    return {
      // A non-empty studentName indicates a record was found.
      found: !!(graduateData.studentName || (Array.isArray(data) && data[1])),
      universityName: graduateData.universityName || (Array.isArray(data) ? data[0] : ''),
      studentName: graduateData.studentName || (Array.isArray(data) ? data[1] : ''),
      programOfStudy: graduateData.programOfStudy || (Array.isArray(data) ? data[2] : ''),
      award: graduateData.award || (Array.isArray(data) ? data[3] : ''),
      yearOfGraduation: graduateData.yearOfGraduation || (Array.isArray(data) ? data[4] : ''),
      registrationNumber: graduateData.registrationNumber || (Array.isArray(data) ? data[5] : ''),
      dateApproved: graduateData.dateApproved || (Array.isArray(data) ? data[6] : '')
    };
  }, [contract]);

  const issueCertificate = useCallback(async (certificateData) => {
    return await contract.sendTransaction('certificateManagement', 'issueCertificate', [
      certificateData.certificateId,
      certificateData.studentName,
      certificateData.institutionName,
      certificateData.programName,
      certificateData.issueDate,
      certificateData.expiryDate
    ], { gas: 600000 });
  }, [contract]);

  const getCertificate = useCallback(async (certificateId) => {
    const data = await contract.callContract('certificateManagement', 'getCertificate', [certificateId]);
    
    return {
      studentName: data.studentName || data[0] || '',
      institutionName: data.institutionName || data[1] || '',
      programName: data.programName || data[2] || '',
      issueDate: data.issueDate || data[3] || '',
      expiryDate: data.expiryDate || data[4] || '',
      isValid: data.isValid || data[5] || false
    };
  }, [contract]);

  const getAllCertificates = useCallback(async () => {
    const certificateIds = await contract.callContract('certificateManagement', 'getAllCertificates');
    
    const certificates = [];
    for (const certificateId of certificateIds) {
      try {
        const certificate = await getCertificate(certificateId);
        certificates.push({
          id: certificateId,
          ...certificate
        });
      } catch (error) {
        console.warn(`Failed to get details for certificate ${certificateId}:`, error);
      }
    }
    
    return certificates;
  }, [contract, getCertificate]);

  const getQRCodeByRegNumberAndAward = useCallback(async (registrationNumber, award) => {
    const data = await contract.callContract(
      'certificateManagement', 
      'getQRCodeByAwardAndRegNumber', 
      [award, registrationNumber]
    );

    console.log("📦 Raw QR data from contract:", data);
    console.log("📦 QR Data structure - [0]:", data[0], "[1]:", data[1]);

    const qrCodeValue = data.qrCode || data[0] || '';
    const found = !!(data.found !== undefined ? data.found : data[1]);

    return {
      found: found,
      qrCode: qrCodeValue,
      qrCodeValue: qrCodeValue,
      [0]: qrCodeValue,
      [1]: found
    };
  }, [contract]);

  const getStudentByQRCode = useCallback(async (qrCodeValue) => {
    const data = await contract.callContract('certificateManagement', 'getStudentByQRCode', [qrCodeValue]);
    
    return {
      found: data.found || data[0] || false,
      universityName: data.student?.universityName || data[1]?.universityName || '',
      studentName: data.student?.studentName || data[1]?.studentName || '',
      programOfStudy: data.student?.programOfStudy || data[1]?.programOfStudy || '',
      award: data.student?.award || data[1]?.award || '',
      yearOfGraduation: data.student?.yearOfGraduation || data[1]?.yearOfGraduation || '',
      registrationNumber: data.student?.registrationNumber || data[1]?.registrationNumber || '',
      qrCode: data.student?.qrCode || data[1]?.qrCode || ''
    };
  }, [contract]);

  const revokeCertificate = useCallback(async (certificateId) => {
    return await contract.sendTransaction('certificateManagement', 'revokeCertificate', [certificateId], { gas: 300000 });
  }, [contract]);

  const updateCertificate = useCallback(async (certificateId, newExpiryDate) => {
    return await contract.sendTransaction('certificateManagement', 'updateCertificate', [certificateId, newExpiryDate], { gas: 400000 });
  }, [contract]);

  const addDigitalCertificate = useCallback(async (registrationNumbers, award, yearOfGraduation) => {
    return await contract.sendTransaction('certificateManagement', 'addDigitalCertificate', [registrationNumbers, award, yearOfGraduation], { gas: 500000 });
  }, [contract]);

  const getTotalGraduatesByUniversityName = useCallback(async (universityName) => {
    try {
      const total = await contract.callContract('certificateManagement', 'getTotalGraduates', []);
      return { count: parseInt(total) || 0 };
    } catch (error) {
      console.error('Error fetching total graduates:', error);
      return { count: 0 };
    }
  }, [contract]);

  const addViewQRCodeDetails = useCallback(async (email, qrCode) => {
    try {
      const result = await contract.sendTransaction('certificateManagement', 'addViewQRCodeDetails', [email, qrCode], { gas: 300000 });
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'QR code successfully associated with email'
      };
    } catch (error) {
      console.error('Error associating QR code with email:', error);
      return {
        success: false,
        error: error.message || 'Failed to associate QR code with email'
      };
    }
  }, [contract]);

  const getQRCodeByEmail = useCallback(async (email) => {
    try {
      const result = await contract.callContract('certificateManagement', 'getQRCodeByEmail', [email]);
      return {
        found: result.found || result[0] || false,
        qrCode: result.qrCode || result[1] || ''
      };
    } catch (error) {
      console.error('Error retrieving QR code by email:', error);
      return {
        found: false,
        error: error.message || 'Failed to retrieve QR code by email'
      };
    }
  }, [contract]);

  const getAllViewQRCodes = useCallback(async () => {
    try {
      const result = await contract.callContract('certificateManagement', 'getAllViewQRCodes', []);
      if (Array.isArray(result) && result.length > 0) {
        return result.map((item, index) => ({
          id: index,
          email: item.email || item[0] || '',
          qrCode: item.qrCode || item[1] || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error retrieving all view QR codes:', error);
      return [];
    }
  }, [contract]);

  const getTotalViewQRCodes = useCallback(async () => {
    try {
      const total = await contract.callContract('certificateManagement', 'getTotalViewQRCodes', []);
      return parseInt(total) || 0;
    } catch (error) {
      console.error('Error retrieving total view QR codes:', error);
      return 0;
    }
  }, [contract]);

  const addVerificationRequestByQRCode = useCallback(async (qrCode, verifierInfo = '') => {
    try {
      console.log('📝 Adding verification request by QR code:', { qrCode, verifierInfo });

      // Validate QR code
      if (!qrCode || typeof qrCode !== 'string' || qrCode.trim() === '') {
        return {
          success: false,
          error: 'QR code is required and must be a non-empty string'
        };
      }

      const cleanQRCode = qrCode.trim();
      const cleanVerifierInfo = verifierInfo ? verifierInfo.trim() : '';

      console.log('📊 QR code details:', {
        qrCode: cleanQRCode,
        verifierInfo: cleanVerifierInfo,
        hasVerifierInfo: cleanVerifierInfo.length > 0
      });

      const params = cleanVerifierInfo ? [cleanQRCode, cleanVerifierInfo] : [cleanQRCode];
      
      const result = await contract.sendTransaction('certificateManagement', 'addVerificationRequestByQRCode', 
        params, 
        { gas: 500000 }
      );
      
      console.log('✅ Verification request by QR code added successfully:', result.transactionHash);
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Verification request by QR code added successfully'
      };
    } catch (error) {
      console.error('❌ Error adding verification request by QR code:', error);
      
      let errorMessage = error.message || 'Failed to add verification request by QR code';
      
      if (error.message.includes('revert')) {
        errorMessage = 'Transaction reverted: The QR code might be invalid, already verified, or the certificate might not exist. Check browser console for details.';
      } else if (error.message.includes('Out of gas')) {
        errorMessage = 'Out of gas: The operation requires more gas. Try again.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [contract]);

  const addVerificationRequest = useCallback(async (verificationData) => {
    try {
      console.log('📝 Adding verification request with data:', verificationData);

      // Comprehensive validation
      if (!verificationData) {
        throw new Error('Verification data is required');
      }

      const { universityName, studentName, programOfStudy, yearOfGraduation, registrationNumber, award } = verificationData;

      // Validate each parameter
      const validationErrors = [];
      if (!universityName || typeof universityName !== 'string' || universityName.trim() === '') {
        validationErrors.push('University name is required and must be a non-empty string');
      }
      if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') {
        validationErrors.push('Student name is required and must be a non-empty string');
      }
      if (!programOfStudy || typeof programOfStudy !== 'string' || programOfStudy.trim() === '') {
        validationErrors.push('Program of study is required and must be a non-empty string');
      }
      if (!yearOfGraduation || typeof yearOfGraduation !== 'string' || yearOfGraduation.trim() === '') {
        validationErrors.push('Year of graduation is required and must be a non-empty string');
      }
      if (!registrationNumber || typeof registrationNumber !== 'string' || registrationNumber.trim() === '') {
        validationErrors.push('Registration number is required and must be a non-empty string');
      }
      if (!award || typeof award !== 'string' || award.trim() === '') {
        validationErrors.push('Award is required and must be a non-empty string');
      }

      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join('; ');
        console.error('❌ Validation failed:', errorMessage);
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`
        };
      }

      const args = [
        universityName.trim(),
        studentName.trim(),
        programOfStudy.trim(),
        yearOfGraduation.toString().trim(),
        registrationNumber.trim(),
        award.trim()
      ];

      console.log('📊 Sanitized parameters:', {
        universityName: args[0],
        studentName: args[1],
        programOfStudy: args[2],
        yearOfGraduation: args[3],
        registrationNumber: args[4],
        award: args[5]
      });

      const result = await contract.sendTransaction('certificateManagement', 'addVerificationRequest', args, { gas: 600000 });
      
      console.log('✅ Verification request added successfully:', result.transactionHash);
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Verification request added successfully'
      };
    } catch (error) {
      console.error('❌ Error adding verification request:', error);
      
      let errorMessage = error.message || 'Failed to add verification request';
      
      if (error.message.includes('revert')) {
        errorMessage = 'Transaction reverted: The smart contract rejected this verification request. This could be due to: 1) Duplicate verification request, 2) Invalid data format, 3) Access control restrictions. Check the browser console for details.';
      } else if (error.message.includes('Out of gas')) {
        errorMessage = 'Out of gas: The operation requires more gas. Try again with higher gas limit.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [contract]);

  return {
    ...contract,
    addUniversityGraduates,
    addForeignVerification,
    getGraduatesByUniversityName,
    getStudentDetailsByRegAndAward,
    issueCertificate,
    getCertificate,
    getAllCertificates,
    getQRCodeByRegNumberAndAward,
    getStudentByQRCode,
    revokeCertificate,
    updateCertificate,
    addDigitalCertificate,
    getTotalGraduatesByUniversityName,
    addViewQRCodeDetails,
    getQRCodeByEmail,
    getAllViewQRCodes,
    getTotalViewQRCodes,
    addVerificationRequestByQRCode,
    addVerificationRequest
  };
};

// ---------------------------------------------------------------------
// Enums (must match the Solidity enums in CertificateManagement)
// ---------------------------------------------------------------------
export const CERT_STATUS = { VALID: 0, SUSPENDED: 1, REVOKED: 2 };
export const CHECK_RESULT = { VALID: 0, SUSPENDED: 1, REVOKED: 2, TAMPERED: 3, NOT_FOUND: 4 };
export const APPLICATION_STATUS = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  MORE_INFO_NEEDED: 2,
  APPROVED: 3,
  REJECTED: 4
};

const APPLICATION_STATUS_LABELS = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_NEEDED', 'APPROVED', 'REJECTED'];
const CHECK_RESULT_LABELS = ['VALID', 'SUSPENDED', 'REVOKED', 'TAMPERED', 'NOT_FOUND'];

// web3 v4 returns uint256 / enums as BigInt, so always convert before using them
const toNum = (v) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// Read a value from a result that may have named fields or only numeric indexes
const pick = (obj, name, index) => (obj?.[name] ?? obj?.[index]);

const toBytes32 = (value) => {
  const v = String(value || '').trim();
  const hex = v.startsWith('0x') ? v : `0x${v}`;
  if (hex.length !== 66) {
    throw new Error(`Invalid hash length: expected 66 characters, got ${hex.length}`);
  }
  return hex;
};

// Hook for the admin dashboard (CertificateManagement dashboard functions)
export const useDashboardManagement = () => {
  const contract = useSmartContract();
  // sendTransaction / callContract are stable, so these callbacks stay stable too
  const { sendTransaction, callContract } = contract;

  // ---------- Totals ----------
  const getTotalGraduates = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getTotalGraduates'));
  }, [callContract]);

  // "Certificates issued" = QR codes registered in the qrCodes list
  const getTotalCertificatesIssued = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getTotalCertificatesIssued'));
  }, [callContract]);

  // Per-university graduate count (the contract takes the university name)
  const getGraduateCountForUniversity = useCallback(async (universityName) => {
    return toNum(
      await callContract('certificateManagement', 'getTotalGraduatesByUniversityName', [universityName])
    );
  }, [callContract]);

  // ---------- Certificate status ----------
  const getCertificateStatusCounts = useCallback(async () => {
    const data = await callContract('certificateManagement', 'getCertificateStatusCounts');
    return {
      valid: toNum(pick(data, 'valid', 0)),
      suspended: toNum(pick(data, 'suspended', 1)),
      revoked: toNum(pick(data, 'revoked', 2))
    };
  }, [callContract]);

  // status: 0 = Valid, 1 = Suspended, 2 = Revoked. Wallet must be owner or authorized.
  const setCertificateStatus = useCallback(async (registrationNumber, status) => {
    const reg = (registrationNumber || '').trim();
    if (!reg) throw new Error('Registration number is required');
    const s = Number(status);
    if (![0, 1, 2].includes(s)) throw new Error('Status must be 0 (Valid), 1 (Suspended) or 2 (Revoked)');

    return await sendTransaction('certificateManagement', 'setCertificateStatus', [reg, s], { gas: 300000 });
  }, [sendTransaction]);

  // ---------- Certificates issued per year ----------
  const getCertificatesIssuedByYear = useCallback(async (year) => {
    return toNum(await callContract('certificateManagement', 'getCertificatesIssuedByYear', [String(year)]));
  }, [callContract]);

  // Returns [{ year, value }] in the same order as the years you pass in
  const getCertificatesIssuedForYears = useCallback(async (years) => {
    const yearList = (years || []).map(String);
    const counts = await callContract('certificateManagement', 'getCertificatesIssuedForYears', [yearList]);
    const list = Array.isArray(counts) ? counts : [];
    return yearList.map((year, i) => ({ year, value: toNum(list[i]) }));
  }, [callContract]);

  // ---------- Blockchain integrity ----------
  const getIntegritySummary = useCallback(async () => {
    const data = await callContract('certificateManagement', 'getIntegritySummary');
    return {
      checked: toNum(pick(data, 'checked', 0)),
      mismatches: toNum(pick(data, 'mismatches', 1)),
      lastCheckAt: toNum(pick(data, 'lastCheckAt', 2)) // unix seconds, 0 = never
    };
  }, [callContract]);

  const getOnChainRecordHash = useCallback(async (registrationNumber) => {
    const data = await callContract('certificateManagement', 'getOnChainRecordHash', [
      (registrationNumber || '').trim()
    ]);
    return {
      found: Boolean(pick(data, 'found', 0)),
      recordHash: pick(data, 'recordHash', 1) || ''
    };
  }, [callContract]);

  // Compares one record's database hash with the on-chain hash. Raises a tamper alert on mismatch.
  const checkRecordIntegrity = useCallback(async (registrationNumber, databaseHash) => {
    const reg = (registrationNumber || '').trim();
    if (!reg) throw new Error('Registration number is required');
    return await sendTransaction(
      'certificateManagement',
      'checkRecordIntegrity',
      [reg, toBytes32(databaseHash)],
      { gas: 300000 }
    );
  }, [sendTransaction]);

  // Records the time a full integrity run finished
  const completeIntegrityRun = useCallback(async () => {
    return await sendTransaction('certificateManagement', 'completeIntegrityRun', [], { gas: 100000 });
  }, [sendTransaction]);

  const resolveTamper = useCallback(async (registrationNumber) => {
    const reg = (registrationNumber || '').trim();
    if (!reg) throw new Error('Registration number is required');
    return await sendTransaction('certificateManagement', 'resolveTamper', [reg], { gas: 200000 });
  }, [sendTransaction]);

  // ---------- Foreign applications ----------
  const submitForeignApplication = useCallback(async ({ applicantName, country, award }) => {
    if (!(applicantName || '').trim()) throw new Error('Applicant name is required');
    return await sendTransaction(
      'certificateManagement',
      'submitForeignApplication',
      [applicantName.trim(), (country || '').trim(), (award || '').trim()],
      { gas: 400000 }
    );
  }, [sendTransaction]);

  const getTotalForeignApplications = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getTotalForeignApplications'));
  }, [callContract]);

  const getTotalOpenForeignApplications = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getTotalOpenForeignApplications'));
  }, [callContract]);

  // Open applications, newest first. The contract does not return the array index,
  // but ids are "FA-<index + 1>", so the index is worked out from the id.
  const getOpenForeignApplications = useCallback(async () => {
    const data = await callContract('certificateManagement', 'getOpenForeignApplications');
    if (!Array.isArray(data)) return [];

    return data.map((a) => {
      const applicationId = String(pick(a, 'applicationId', 0) ?? '');
      const status = toNum(pick(a, 'status', 4));
      const submittedAt = toNum(pick(a, 'submittedAt', 5));
      return {
        applicationId,
        index: Math.max(0, parseInt(applicationId.replace(/\D/g, ''), 10) - 1),
        applicantName: String(pick(a, 'applicantName', 1) ?? ''),
        country: String(pick(a, 'country', 2) ?? ''),
        award: String(pick(a, 'award', 3) ?? ''),
        status,
        statusLabel: APPLICATION_STATUS_LABELS[status] || 'PENDING',
        submittedAt,
        submittedDate: submittedAt ? new Date(submittedAt * 1000).toLocaleDateString() : ''
      };
    });
  }, [callContract]);

  // index = array index (id number minus 1); status: see APPLICATION_STATUS
  const updateForeignApplicationStatus = useCallback(async (index, status) => {
    const i = Number(index);
    const s = Number(status);
    if (!Number.isInteger(i) || i < 0) throw new Error('A valid application index is required');
    if (![0, 1, 2, 3, 4].includes(s)) throw new Error('Invalid application status');
    return await sendTransaction('certificateManagement', 'updateForeignApplicationStatus', [i, s], { gas: 200000 });
  }, [sendTransaction]);

  // ---------- Employer checks ----------
  // Logs a check on-chain and returns the transaction result
  const logEmployerCheck = useCallback(async (registrationNumber) => {
    const reg = (registrationNumber || '').trim();
    if (!reg) throw new Error('Registration number is required');
    return await sendTransaction('certificateManagement', 'logEmployerCheck', [reg], { gas: 300000 });
  }, [sendTransaction]);

  const getEmployerChecksToday = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getEmployerChecksToday'));
  }, [callContract]);

  const getTotalEmployerChecks = useCallback(async () => {
    return toNum(await callContract('certificateManagement', 'getTotalEmployerChecks'));
  }, [callContract]);

  // Newest first
  const getLatestEmployerChecks = useCallback(async (limit = 10) => {
    const data = await callContract('certificateManagement', 'getLatestEmployerChecks', [Number(limit)]);
    if (!Array.isArray(data)) return [];

    return data.map((c, i) => {
      const result = toNum(pick(c, 'result', 1));
      const checkedAt = toNum(pick(c, 'checkedAt', 2));
      return {
        id: i,
        registrationNumber: String(pick(c, 'registrationNumber', 0) ?? ''),
        result,
        resultLabel: CHECK_RESULT_LABELS[result] || 'VALID',
        checkedAt,
        checkedDate: checkedAt ? new Date(checkedAt * 1000).toLocaleString() : ''
      };
    });
  }, [callContract]);

  return {
    ...contract,
    getTotalGraduates,
    getTotalCertificatesIssued,
    getGraduateCountForUniversity,
    getCertificateStatusCounts,
    setCertificateStatus,
    getCertificatesIssuedByYear,
    getCertificatesIssuedForYears,
    getIntegritySummary,
    getOnChainRecordHash,
    checkRecordIntegrity,
    completeIntegrityRun,
    resolveTamper,
    submitForeignApplication,
    getTotalForeignApplications,
    getTotalOpenForeignApplications,
    getOpenForeignApplications,
    updateForeignApplicationStatus,
    logEmployerCheck,
    getEmployerChecksToday,
    getTotalEmployerChecks,
    getLatestEmployerChecks
  };
};

// Hook for connection and network status
export const useConnectionStatus = () => {
  const [status, setStatus] = useState({
    connectionStatus: 'disconnected',
    networkInfo: null,
    contractStatus: {},
    isConnected: false
  });

  const updateStatus = useCallback(async () => {
    try {
      const connectionStatus = getConnectionStatus();
      const networkInfo = await getNetworkInfo();
      const contractStatus = await contractUtils.general.checkAllContracts();

      const hasAccounts = networkInfo && networkInfo.accountCount > 0 && networkInfo.currentAccount;
      const isFullyConnected = connectionStatus === 'connected' && hasAccounts;

      setStatus({
        connectionStatus,
        networkInfo,
        contractStatus,
        isConnected: isFullyConnected
      });
    } catch (error) {
      console.error('Failed to update connection status:', error);
      setStatus(prev => ({
        ...prev,
        connectionStatus: 'error',
        isConnected: false
      }));
    }
  }, []);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  return {
    ...status,
    updateStatus
  };
};

// Hook for MANEB contract operations
export const useManebContract = () => {
  const contract = useSmartContract();

  const registerSecondarySchools = useCallback(async (schoolNames, schoolCode, district, zone, category) => {
    try {
      if (!Array.isArray(schoolNames) || schoolNames.length === 0) {
        throw new Error('School names must be a non-empty array');
      }

      if (!schoolCode || typeof schoolCode !== 'string' || schoolCode.trim().length === 0) {
        throw new Error('School code must be a non-empty string');
      }

      if (!district || typeof district !== 'string' || district.trim().length === 0) {
        throw new Error('District must be a non-empty string');
      }

      if (!zone || typeof zone !== 'string' || zone.trim().length === 0) {
        throw new Error('Zone must be a non-empty string');
      }

      if (!category || typeof category !== 'string' || category.trim().length === 0) {
        throw new Error('Category must be a non-empty string');
      }

      const cleanSchoolNames = schoolNames
        .filter(name => name && typeof name === 'string' && name.trim().length > 0)
        .map(name => name.trim());

      if (cleanSchoolNames.length === 0) {
        throw new Error('No valid school names found after cleaning');
      }

      const cleanParams = {
        schoolNames: cleanSchoolNames,
        schoolCode: schoolCode.trim(),
        district: district.trim(),
        zone: zone.trim(),
        category: category.trim()
      };

      console.log('🔍 Calling registerSecondarySchools with validated parameters:', cleanParams);

      const txOptions = {
        gas: 2000000,
        gasPrice: '20000000000'
      };

      const result = await contract.sendTransaction('maneb', 'registerSecondarySchools', [
        cleanParams.schoolNames,
        cleanParams.schoolCode,
        cleanParams.district,
        cleanParams.zone,
        cleanParams.category
      ], txOptions);

      console.log('✅ Secondary schools registered successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Error registering secondary schools:', error);
      throw error;
    }
  }, [contract]);

  const getAllSecondarySchools = useCallback(async () => {
    try {
      return await contract.callContract('maneb', 'getAllSecondarySchools', []);
    } catch (error) {
      console.error('Error fetching secondary schools:', error);
      return [];
    }
  }, [contract]);

  const getTotalSecondarySchools = useCallback(async () => {
    try {
      return await contract.callContract('maneb', 'getTotalSecondarySchools', []);
    } catch (error) {
      console.error('Error fetching total secondary schools:', error);
      return 0;
    }
  }, [contract]);

  const getSchoolNamesByDistrict = useCallback(async (district) => {
    try {
      return await contract.callContract('maneb', 'getSchoolNamesByDistrict', [district]);
    } catch (error) {
      console.error('Error fetching schools by district:', error);
      return [];
    }
  }, [contract]);

  const getFormFourDetails = useCallback(async (examNumber) => {
    try {
      return await contract.callContract('maneb', 'getFormFourDetails', [examNumber]);
    } catch (error) {
      console.error('Error fetching form four details:', error);
      return null;
    }
  }, [contract]);

  const getStudentDetailsByExamAndYear = useCallback(async (examNumber, year) => {
    try {
      const result = await contract.callContract('maneb', 'getStudentDetailsWithoutHash', [
        examNumber,
        parseInt(year)
      ]);

      if (result && result.studentName) {
        return {
          studentName: result.studentName || result[0] || '',
          examinationNumber: result.examinationNumber || result[1] || '',
          schoolName: result.schoolName || result[2] || '',
          yearOfExamination: result.yearOfExamination || result[3] || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching student details by exam and year:', error);
      return null;
    }
  }, [contract]);

  const getFormHashByExamAndYear = useCallback(async (examNumber, year) => {
    try {
      const result = await contract.callContract('maneb', 'getFormHash', [
        examNumber,
        parseInt(year)
      ]);

      return result;
    } catch (error) {
      console.error('Error fetching form hash by exam and year:', error);
      return null;
    }
  }, [contract]);

  const getStudentDetailsByHashValue = useCallback(async (hashValue) => {
    try {
      let bytes32Hash = hashValue;
      if (typeof hashValue === 'string') {
        if (!hashValue.startsWith('0x')) {
          bytes32Hash = '0x' + hashValue;
        }
        if (bytes32Hash.length !== 66) {
          throw new Error(`Invalid hash length: expected 66 characters, got ${bytes32Hash.length}`);
        }
      }

      const result = await contract.callContract('maneb', 'getStudentDetailsByHash', [
        bytes32Hash
      ]);

      if (result && result.studentName) {
        let yearOfExamination = result.yearOfExamination || result[3];

        if (typeof yearOfExamination === 'string') {
          yearOfExamination = parseInt(yearOfExamination, 10);
        } else if (typeof yearOfExamination === 'bigint') {
          yearOfExamination = Number(yearOfExamination);
        }

        const formattedResult = {
          found: true,
          studentName: result.studentName || result[0] || '',
          examinationNumber: result.examinationNumber || result[1] || '',
          schoolName: result.schoolName || result[2] || '',
          yearOfExamination: yearOfExamination || 0
        };

        return formattedResult;
      }

      return { found: false };
    } catch (error) {
      console.error('Error fetching student details by hash value:', error);
      return { found: false };
    }
  }, [contract]);

  const addVerificationCheck = useCallback(async (hashValue, employerEmail, employerName) => {
    try {
      if (!hashValue || !employerEmail || !employerName) {
        throw new Error('Missing required parameters for addVerificationCheck');
      }

      const result = await contract.sendTransaction('maneb', 'addVerificationCheck', [
        hashValue,
        employerEmail,
        employerName
      ], {
        gas: 300000,
        maxFeePerGas: '50000000000',
        maxPriorityFeePerGas: '2000000000'
      });

      return {
        success: true,
        result,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error adding verification check:', error);
      return { success: false, error: error.message };
    }
  }, [contract]);

  const addVerificationRequest = useCallback(async (hashValue) => {
    try {
      if (!hashValue) {
        throw new Error('Missing hash value for addVerificationRequest');
      }

      let bytes32Hash = hashValue;
      if (typeof bytes32Hash === 'string') {
        let normalizedHash = bytes32Hash.trim();
        if (!normalizedHash.startsWith('0x')) {
          normalizedHash = `0x${normalizedHash}`;
        }
        if (normalizedHash.length !== 66) {
          throw new Error(`Invalid hash length: expected 66 characters, got ${normalizedHash.length}`);
        }
        bytes32Hash = normalizedHash;
      }

      const result = await contract.sendTransaction('maneb', 'addVerification', [
        bytes32Hash
      ], {
        gas: 800000,
        maxFeePerGas: '50000000000',
        maxPriorityFeePerGas: '2000000000'
      });

      return {
        success: true,
        result,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error adding MANEB verification request:', error);
      return { success: false, error: error.message };
    }
  }, [contract]);

  const getAllFormFourDetails = useCallback(async () => {
    try {
      const result = await contract.callContract('maneb', 'getAllFormFourDetails', []);

      if (!result || !Array.isArray(result)) {
        return [];
      }

      const formattedDetails = result.map((detail, index) => ({
        id: index + 1,
        studentName: detail.studentName || '',
        examinationNumber: detail.examinationNumber || '',
        schoolName: detail.schoolName || '',
        yearOfExamination: detail.yearOfExamination ? Number(detail.yearOfExamination) : 0,
        formHash: detail.formHash || '',
        displayName: detail.studentName || 'Unknown Student',
        displaySchool: detail.schoolName || 'Unknown School',
        displayYear: detail.yearOfExamination ? Number(detail.yearOfExamination) : 'Unknown Year'
      }));

      return formattedDetails;
    } catch (error) {
      console.error('❌ Error fetching all Form Four details:', error);
      return [];
    }
  }, [contract]);

  const getFilteredFormFourDetails = useCallback(async (filters = {}) => {
    try {
      const allDetails = await getAllFormFourDetails();

      if (!allDetails || allDetails.length === 0) {
        return [];
      }

      let filteredDetails = [...allDetails];

      if (filters.schoolName) {
        filteredDetails = filteredDetails.filter(detail =>
          detail.schoolName.toLowerCase().includes(filters.schoolName.toLowerCase())
        );
      }

      if (filters.yearOfExamination) {
        filteredDetails = filteredDetails.filter(detail =>
          detail.yearOfExamination === Number(filters.yearOfExamination)
        );
      }

      if (filters.studentName) {
        filteredDetails = filteredDetails.filter(detail =>
          detail.studentName.toLowerCase().includes(filters.studentName.toLowerCase())
        );
      }

      if (filters.examinationNumber) {
        filteredDetails = filteredDetails.filter(detail =>
          detail.examinationNumber.toLowerCase().includes(filters.examinationNumber.toLowerCase())
        );
      }

      return filteredDetails;
    } catch (error) {
      console.error('❌ Error filtering Form Four details:', error);
      return [];
    }
  }, [getAllFormFourDetails]);

  const getFormFourStatistics = useCallback(async () => {
    try {
      const allDetails = await getAllFormFourDetails();

      if (!allDetails || allDetails.length === 0) {
        return {
          totalStudents: 0,
          totalSchools: 0,
          yearRange: { min: null, max: null },
          schoolStats: [],
          yearStats: []
        };
      }

      const totalStudents = allDetails.length;

      const uniqueSchools = [...new Set(allDetails.map(d => d.schoolName))];
      const totalSchools = uniqueSchools.length;

      const years = allDetails.map(d => d.yearOfExamination).filter(y => y > 0);
      const yearRange = {
        min: years.length > 0 ? Math.min(...years) : null,
        max: years.length > 0 ? Math.max(...years) : null
      };

      const schoolCounts = {};
      allDetails.forEach(detail => {
        schoolCounts[detail.schoolName] = (schoolCounts[detail.schoolName] || 0) + 1;
      });

      const schoolStats = Object.entries(schoolCounts)
        .map(([school, count]) => ({ school, count }))
        .sort((a, b) => b.count - a.count);

      const yearCounts = {};
      allDetails.forEach(detail => {
        if (detail.yearOfExamination > 0) {
          yearCounts[detail.yearOfExamination] = (yearCounts[detail.yearOfExamination] || 0) + 1;
        }
      });

      const yearStats = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: Number(year), count }))
        .sort((a, b) => b.year - a.year);

      return {
        totalStudents,
        totalSchools,
        yearRange,
        schoolStats,
        yearStats
      };
    } catch (error) {
      console.error('❌ Error calculating Form Four statistics:', error);
      return {
        totalStudents: 0,
        totalSchools: 0,
        yearRange: { min: null, max: null },
        schoolStats: [],
        yearStats: []
      };
    }
  }, [getAllFormFourDetails]);

  const setFormFourDetailsBatch = useCallback(async (studentNames, examinationNumbers, schoolName, yearOfExamination) => {
    try {
      if (!Array.isArray(studentNames) || studentNames.length === 0) {
        throw new Error('Student names must be a non-empty array');
      }

      if (!Array.isArray(examinationNumbers) || examinationNumbers.length === 0) {
        throw new Error('Examination numbers must be a non-empty array');
      }

      if (studentNames.length !== examinationNumbers.length) {
        throw new Error('Student names and examination numbers arrays must have the same length');
      }

      if (!schoolName || typeof schoolName !== 'string' || schoolName.trim().length === 0) {
        throw new Error('School name must be a non-empty string');
      }

      if (!yearOfExamination || typeof yearOfExamination !== 'number' || yearOfExamination < 1900 || yearOfExamination > 2100) {
        throw new Error('Year of examination must be a valid number between 1900 and 2100');
      }

      // The original file used `result` here without ever defining it.
      // Adjust the method name / parameter order if your MANEB contract differs.
      const result = await contract.sendTransaction('maneb', 'setFormFourDetailsBatch', [
        studentNames.map((n) => String(n).trim()),
        examinationNumbers.map((n) => String(n).trim()),
        schoolName.trim(),
        yearOfExamination
      ], {
        gas: 2000000,
        gasPrice: '20000000000'
      });

      console.log('✅ Form four details batch added:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Error adding form four details batch:', error);
      throw error;
    }
  }, [contract]);

  return {
    ...contract,
    registerSecondarySchools,
    getAllSecondarySchools,
    getTotalSecondarySchools,
    getSchoolNamesByDistrict,
    getFormFourDetails,
    getAllFormFourDetails,
    getFilteredFormFourDetails,
    getFormFourStatistics,
    setFormFourDetailsBatch,
    getStudentDetailsByExamAndYear,
    getFormHashByExamAndYear,
    getStudentDetailsByHashValue,
    addVerificationCheck,
    addVerificationRequest
  };
};