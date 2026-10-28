import { 
  web3Service, 
  sendTransaction, 
  callContract, 
  listenToEvent, 
  getPastEvents,
  contractExists 
} from '../web3service';

// ============================================================================
// USER MANAGEMENT CONTRACT UTILITIES
// ============================================================================

export const userManagementUtils = {
  // Register a new user
  async registerUser(userData) {
    const { name, email, contactInfo, password, role, institution } = userData;
    
    try {
      const result = await sendTransaction(
        'userManagement',
        'registerUser',
        [name, email, contactInfo, password, role, institution],
        { gas: 500000 }
      );
      
      console.log('✅ User registered successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ User registration failed:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const role = await callContract('userManagement', 'signIn', [email, password]);
      console.log('✅ User signed in successfully, role:', role);
      return role;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  },

  // Get user details
  async getUserDetails(email) {
    try {
      const details = await callContract('userManagement', 'getUserDetails', [email]);
      
      // Format the response
      const formattedDetails = {
        name: details[0] || '',
        email: details[1] || '',
        contactInfo: details[2] || '',
        role: details[3] || ''
      };
      
      console.log('✅ User details retrieved:', formattedDetails);
      return formattedDetails;
    } catch (error) {
      console.error('❌ Failed to get user details:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const data = await callContract('userManagement', 'getAllUserDetails');
      
      // Format the response
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
      
      console.log('✅ All users retrieved:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Failed to get all users:', error);
      throw error;
    }
  },

  // Get users by institution
  async getUsersByInstitution(institution) {
    try {
      const data = await callContract('userManagement', 'getUsersByInstitution', [institution]);
      
      const users = [];
      const names = data[0] || [];
      const emails = data[1] || [];
      const contactInfos = data[2] || [];
      const roles = data[3] || [];
      
      for (let i = 0; i < names.length; i++) {
        users.push({
          id: i,
          name: names[i] || '',
          email: emails[i] || '',
          contactInfo: contactInfos[i] || '',
          role: roles[i] || '',
          institution: institution
        });
      }
      
      console.log(`✅ Users for institution '${institution}' retrieved:`, users.length);
      return users;
    } catch (error) {
      console.error('❌ Failed to get users by institution:', error);
      throw error;
    }
  },

  // Update user password
  async updateUserPassword(email, newPassword) {
    try {
      const result = await sendTransaction(
        'userManagement',
        'updateUserPassword',
        [email, newPassword],
        { gas: 300000 }
      );
      
      console.log('✅ User password updated successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Password update failed:', error);
      throw error;
    }
  },

  // Update user email and name
  async updateUserEmailAndName(currentEmail, newEmail, newName) {
    try {
      const result = await sendTransaction(
        'userManagement',
        'updateUserEmailAndName',
        [currentEmail, newEmail, newName],
        { gas: 400000 }
      );
      
      console.log('✅ User email and name updated successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ User update failed:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(email) {
    try {
      const result = await sendTransaction(
        'userManagement',
        'deleteUser',
        [email],
        { gas: 300000 }
      );
      
      console.log('✅ User deleted successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ User deletion failed:', error);
      throw error;
    }
  },

  // Get user institution
  async getUserInstitution(email) {
    try {
      const institution = await callContract('userManagement', 'getUserInstitution', [email]);
      console.log('✅ User institution retrieved:', institution);
      return institution;
    } catch (error) {
      console.error('❌ Failed to get user institution:', error);
      throw error;
    }
  },

  // Listen to user events
  listenToUserEvents(callback) {
    const events = ['UserRegistered', 'UserUpdated', 'UserDeleted'];
    const subscriptions = [];
    
    events.forEach(eventName => {
      const subscription = listenToEvent('userManagement', eventName, callback);
      subscriptions.push(subscription);
    });
    
    return subscriptions;
  }
};

// ============================================================================
// ACCREDITATION MANAGEMENT CONTRACT UTILITIES
// ============================================================================

export const accreditationUtils = {
  // Add accredited university
  async addAccreditedUniversity(universityData) {
    const { institutionName, category, contactInfo } = universityData;
    
    try {
      const result = await sendTransaction(
        'accreditationManagement',
        'addAccreditedUniversity',
        [institutionName, category, contactInfo],
        { gas: 500000 }
      );
      
      console.log('✅ University added successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ University addition failed:', error);
      throw error;
    }
  },

  // Add program
  async addProgram(programData) {
    const { institutionName, programName, programType, accreditationDate } = programData;
    
    try {
      const result = await sendTransaction(
        'accreditationManagement',
        'addProgram',
        [institutionName, programName, programType, accreditationDate],
        { gas: 500000 }
      );
      
      console.log('✅ Program added successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Program addition failed:', error);
      throw error;
    }
  },

  // Get all accredited universities
  async getAllAccreditedUniversities() {
    try {
      const data = await callContract('accreditationManagement', 'getAllAccreditedUniversities');
      
      const universities = [];
      const institutionNames = data.institutionNames || data[0] || [];
      const categories = data.categories || data[1] || [];
      const contactInfos = data.contactInfos || data[2] || [];
      
      for (let i = 0; i < institutionNames.length; i++) {
        universities.push({
          id: i,
          name: institutionNames[i] || '',
          category: categories[i] || '',
          contactInfo: contactInfos[i] || ''
        });
      }
      
      console.log('✅ All accredited universities retrieved:', universities.length);
      return universities;
    } catch (error) {
      console.error('❌ Failed to get accredited universities:', error);
      throw error;
    }
  },

  // Get programs by university
  async getProgramsByUniversity(universityName) {
    try {
      const programs = await callContract('accreditationManagement', 'getProgramsByUniversity', [universityName]);
      
      const formattedPrograms = Array.isArray(programs) ? programs.map((program, index) => ({
        id: index,
        name: program || ''
      })) : [];
      
      console.log(`✅ Programs for '${universityName}' retrieved:`, formattedPrograms.length);
      return formattedPrograms;
    } catch (error) {
      console.error('❌ Failed to get programs by university:', error);
      throw error;
    }
  },

  // Get total accredited universities count
  async getTotalAccreditedUniversities() {
    try {
      const count = await callContract('accreditationManagement', 'getTotalAccreditedUniversities');
      console.log('✅ Total accredited universities count:', count);
      return parseInt(count);
    } catch (error) {
      console.error('❌ Failed to get total universities count:', error);
      throw error;
    }
  },

  // Listen to accreditation events
  listenToAccreditationEvents(callback) {
    const events = ['UniversityAdded', 'ProgramAdded'];
    const subscriptions = [];
    
    events.forEach(eventName => {
      const subscription = listenToEvent('accreditationManagement', eventName, callback);
      subscriptions.push(subscription);
    });
    
    return subscriptions;
  }
};

// ============================================================================
// CERTIFICATE MANAGEMENT CONTRACT UTILITIES
// ============================================================================

export const certificateUtils = {
  // Issue certificate
  async issueCertificate(certificateData) {
    const { certificateId, studentName, institutionName, programName, issueDate, expiryDate } = certificateData;
    
    try {
      const result = await sendTransaction(
        'certificateManagement',
        'issueCertificate',
        [certificateId, studentName, institutionName, programName, issueDate, expiryDate],
        { gas: 600000 }
      );
      
      console.log('✅ Certificate issued successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Certificate issuance failed:', error);
      throw error;
    }
  },

  // Get certificate details
  async getCertificate(certificateId) {
    try {
      const data = await callContract('certificateManagement', 'getCertificate', [certificateId]);
      
      const certificate = {
        studentName: data.studentName || data[0] || '',
        institutionName: data.institutionName || data[1] || '',
        programName: data.programName || data[2] || '',
        issueDate: data.issueDate || data[3] || '',
        expiryDate: data.expiryDate || data[4] || '',
        isValid: data.isValid || data[5] || false
      };
      
      console.log('✅ Certificate details retrieved:', certificate);
      return certificate;
    } catch (error) {
      console.error('❌ Failed to get certificate details:', error);
      throw error;
    }
  },

  // Get all certificates
  async getAllCertificates() {
    try {
      const certificateIds = await callContract('certificateManagement', 'getAllCertificates');
      
      const certificates = [];
      for (const certificateId of certificateIds) {
        try {
          const certificate = await this.getCertificate(certificateId);
          certificates.push({
            id: certificateId,
            ...certificate
          });
        } catch (error) {
          console.warn(`⚠️ Failed to get details for certificate ${certificateId}:`, error);
        }
      }
      
      console.log('✅ All certificates retrieved:', certificates.length);
      return certificates;
    } catch (error) {
      console.error('❌ Failed to get all certificates:', error);
      throw error;
    }
  },

  // Get certificates by institution
  async getCertificatesByInstitution(institutionName) {
    try {
      const certificateIds = await callContract('certificateManagement', 'getCertificatesByInstitution', [institutionName]);
      
      const certificates = [];
      for (const certificateId of certificateIds) {
        try {
          const certificate = await this.getCertificate(certificateId);
          certificates.push({
            id: certificateId,
            ...certificate
          });
        } catch (error) {
          console.warn(`⚠️ Failed to get details for certificate ${certificateId}:`, error);
        }
      }
      
      console.log(`✅ Certificates for '${institutionName}' retrieved:`, certificates.length);
      return certificates;
    } catch (error) {
      console.error('❌ Failed to get certificates by institution:', error);
      throw error;
    }
  },

  // Check if certificate is valid
  async isCertificateValid(certificateId) {
    try {
      const isValid = await callContract('certificateManagement', 'isCertificateValid', [certificateId]);
      console.log(`✅ Certificate ${certificateId} validity:`, isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Failed to check certificate validity:', error);
      throw error;
    }
  },

  // Revoke certificate
  async revokeCertificate(certificateId) {
    try {
      const result = await sendTransaction(
        'certificateManagement',
        'revokeCertificate',
        [certificateId],
        { gas: 300000 }
      );
      
      console.log('✅ Certificate revoked successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Certificate revocation failed:', error);
      throw error;
    }
  },

  // Update certificate
  async updateCertificate(certificateId, newExpiryDate) {
    try {
      const result = await sendTransaction(
        'certificateManagement',
        'updateCertificate',
        [certificateId, newExpiryDate],
        { gas: 400000 }
      );
      
      console.log('✅ Certificate updated successfully:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Certificate update failed:', error);
      throw error;
    }
  },

  // Get certificate count
  async getCertificateCount() {
    try {
      const count = await callContract('certificateManagement', 'getCertificateCount');
      console.log('✅ Certificate count:', count);
      return parseInt(count);
    } catch (error) {
      console.error('❌ Failed to get certificate count:', error);
      throw error;
    }
  },

  // Get student details by registration and award
  async getStudentDetailsByRegAndAward(registrationNumber, award) {
    try {
      const data = await callContract(
        'certificateManagement', 
        'getStudentByAwardAndRegNumber', 
        [registrationNumber, award]
      );
      
      const studentDetails = {
        found: data.found || data[0] || false,
        universityName: data.grad?.universityName || data[1]?.universityName || data[1] || '',
        studentName: data.grad?.studentName || data[1]?.studentName || data[2] || '',
        programOfStudy: data.grad?.programOfStudy || data[1]?.programOfStudy || data[3] || '',
        award: data.grad?.award || data[1]?.award || data[4] || '',
        yearOfGraduation: data.grad?.yearOfGraduation || data[1]?.yearOfGraduation || data[5] || '',
        registrationNumber: data.grad?.registrationNumber || data[1]?.registrationNumber || data[6] || '',
        qrCode: data.grad?.qrCode || data[1]?.qrCode || ''
      };
      
      console.log('✅ Student details retrieved:', studentDetails);
      return studentDetails;
    } catch (error) {
      console.error('❌ Failed to get student details:', error);
      throw error;
    }
  },

  // Get QR code by registration number and award
  async getQRCodeByRegNumberAndAward(registrationNumber, award) {
    try {
      const data = await callContract(
        'certificateManagement', 
        'getQRCodeByRegNumberAndAward', 
        [registrationNumber, award]
      );
      
      const qrCodeData = {
        found: data.found || data[0] || false,
        qrCodeValue: data.qrCodeValue || data[1] || ''
      };
      
      console.log('✅ QR code retrieved:', qrCodeData);
      return qrCodeData;
    } catch (error) {
      console.error('❌ Failed to get QR code:', error);
      throw error;
    }
  },

  // Get student details by QR code
  async getStudentByQRCode(qrCodeValue) {
    try {
      const data = await callContract(
        'certificateManagement', 
        'getStudentByQRCode', 
        [qrCodeValue]
      );
      
      const studentDetails = {
        found: data.found || data[0] || false,
        universityName: data.student?.universityName || data[1]?.universityName || '',
        studentName: data.student?.studentName || data[1]?.studentName || '',
        programOfStudy: data.student?.programOfStudy || data[1]?.programOfStudy || '',
        award: data.student?.award || data[1]?.award || '',
        yearOfGraduation: data.student?.yearOfGraduation || data[1]?.yearOfGraduation || '',
        registrationNumber: data.student?.registrationNumber || data[1]?.registrationNumber || '',
        qrCode: data.student?.qrCode || data[1]?.qrCode || ''
      };
      
      console.log('✅ Student details by QR code retrieved:', studentDetails);
      return studentDetails;
    } catch (error) {
      console.error('❌ Failed to get student details by QR code:', error);
      throw error;
    }
  },

  // Listen to certificate events
  listenToCertificateEvents(callback) {
    const events = ['CertificateIssued', 'CertificateRevoked', 'CertificateUpdated'];
    const subscriptions = [];
    
    events.forEach(eventName => {
      const subscription = listenToEvent('certificateManagement', eventName, callback);
      subscriptions.push(subscription);
    });
    
    return subscriptions;
  }
};

// ============================================================================
// INTEGRATED SYSTEM CONTRACT UTILITIES
// ============================================================================

export const integratedSystemUtils = {
  // Register user in integrated system
  async registerUser(userData) {
    const { name, email, contactInfo, password, role, institution } = userData;
    
    try {
      const result = await sendTransaction(
        'integratedSystem',
        'registerUser',
        [name, email, contactInfo, password, role, institution],
        { gas: 500000 }
      );
      
      console.log('✅ User registered in integrated system:', result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Integrated system registration failed:', error);
      throw error;
    }
  },

  // Sign in to integrated system
  async signIn(email, password) {
    try {
      const role = await callContract('integratedSystem', 'signIn', [email, password]);
      console.log('✅ Integrated system sign in successful, role:', role);
      return role;
    } catch (error) {
      console.error('❌ Integrated system sign in failed:', error);
      throw error;
    }
  },

  // Get all user details from integrated system
  async getAllUserDetails() {
    try {
      const data = await callContract('integratedSystem', 'getAllUserDetails');
      
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
      
      console.log('✅ All integrated system users retrieved:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Failed to get integrated system users:', error);
      throw error;
    }
  }
};

// ============================================================================
// GENERAL UTILITIES
// ============================================================================

export const contractUtils = {
  // Check if all contracts exist
  async checkAllContracts() {
    const contracts = ['userManagement', 'accreditationManagement', 'certificateManagement', 'integratedSystem', 'maneb'];
    const results = {};

    for (const contractName of contracts) {
      try {
        const exists = await contractExists(contractName);
        results[contractName] = exists;
        console.log(`✅ Contract ${contractName} exists:`, exists);
      } catch (error) {
        results[contractName] = false;
        console.error(`❌ Error checking contract ${contractName}:`, error);
      }
    }

    return results;
  },

  // Get network status
  async getNetworkStatus() {
    try {
      const networkInfo = await web3Service.getNetworkInfo();
      const contractStatus = await this.checkAllContracts();
      
      return {
        network: networkInfo,
        contracts: contractStatus
      };
    } catch (error) {
      console.error('❌ Failed to get network status:', error);
      throw error;
    }
  },

  // Format error messages for user display
  formatErrorMessage(error) {
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction. Please ensure your wallet has enough ETH for gas fees.';
    } else if (error.message.includes('user rejected')) {
      return 'Transaction was cancelled by user.';
    } else if (error.message.includes('execution reverted')) {
      return 'Operation failed. This usually means the contract rejected the operation or data is invalid.';
    } else if (error.message.includes('network error')) {
      return 'Network connection error. Please check your internet connection and try again.';
    } else {
      return error.message || 'An unexpected error occurred. Please try again.';
    }
  },

  // Validate Ethereum address
  isValidAddress(address) {
    return web3Service.web3.utils.isAddress(address);
  },

  // Convert Wei to Ether
  weiToEther(wei) {
    return web3Service.web3.utils.fromWei(wei, 'ether');
  },

  // Convert Ether to Wei
  etherToWei(ether) {
    return web3Service.web3.utils.toWei(ether, 'ether');
  }
};

// Export all utilities
export default {
  userManagement: userManagementUtils,
  accreditation: accreditationUtils,
  certificate: certificateUtils,
  integratedSystem: integratedSystemUtils,
  general: contractUtils
}; 