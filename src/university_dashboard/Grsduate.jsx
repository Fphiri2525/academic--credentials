import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./Graduate.module.css";
import { useAccreditationManagement, useCertificateManagement } from "../hooks/useSmartContract";
import { useConnectionStatus } from "../hooks/useSmartContract";
import { useUserManagement } from "../hooks/useSmartContract";
import CertificateGenerator from "../Components/CertificateGenerator";

function Graduate({ darkMode }) {
  const [graduates, setGraduates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExcelReady, setIsExcelReady] = useState(false);
  const [pendingGraduates, setPendingGraduates] = useState([]);
  const [award, setAward] = useState('Diploma');
  const [programOfStudy, setProgramOfStudy] = useState('');
  const [programOptions, setProgramOptions] = useState([]);
  const [yearOfGraduation, setYearOfGraduation] = useState('');
  const [yearError, setYearError] = useState('');
  const [isLoadingGraduates, setIsLoadingGraduates] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [successNotification, setSuccessNotification] = useState('');
  const [errorNotification, setErrorNotification] = useState('');
  const [userInstitution, setUserInstitution] = useState('');
  const [isLoadingInstitution, setIsLoadingInstitution] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] = useState(null);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Use smart contract hooks
  const {
    addUniversityGraduates,
    getGraduatesByUniversityName,
    getStudentDetailsByRegAndAward,
    getQRCodeByRegNumberAndAward,
    loading
  } = useCertificateManagement();

  const {
    getProgramsByUniversity,
  } = useAccreditationManagement();

  const { 
    getUserInstitution 
  } = useUserManagement();
  
  const { 
    isConnected 
  } = useConnectionStatus();

  // Calculate gas limit based on batch size
  const calculateGasLimit = (batchLength) => {
    const baseGas = 1000000;
    const gasPerStudent = 300000;
    const calculatedGas = baseGas + (batchLength * gasPerStudent);
    
    const minGas = 1500000;
    const maxGas = 5000000;
    
    return Math.min(Math.max(calculatedGas, minGas), maxGas);
  };

  // Process graduates in batches
  const processGraduatesInBatches = async (graduates, batchSize) => {
    const batches = [];
    for (let i = 0; i < graduates.length; i += batchSize) {
      batches.push(graduates.slice(i, i + batchSize));
    }
    
    const results = [];
    let currentGasLimit = calculateGasLimit(batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        const result = await addSingleBatchToBlockchain(batch, currentGasLimit);
        results.push(result);
        
        // Add delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        // If out of gas, retry with higher gas limit
        if (error.message.includes('out of gas') && currentGasLimit < 5000000) {
          currentGasLimit = Math.min(currentGasLimit * 1.5, 5000000);
          
          try {
            const retryResult = await addSingleBatchToBlockchain(batch, currentGasLimit);
            results.push(retryResult);
          } catch (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }
    }
    
    return results;
  };

  // FIXED: Add single batch to blockchain with proper parameter handling
  const addSingleBatchToBlockchain = async (batch, customGasLimit = null) => {
    const universityName = userInstitution?.trim();
    
    if (!universityName || universityName === '') {
      throw new Error('University name is required and cannot be empty.');
    }

    const studentNames = batch.map(student => String(student.studentName).trim());
    const registrationNumbers = batch.map(student => String(student.registrationNumber).trim());
    const trimmedProgram = String(programOfStudy).trim();
    const trimmedAward = String(award).trim();
    const trimmedYear = String(yearOfGraduation).trim();

    // FIXED: Enhanced year validation for blockchain compatibility
    if (!trimmedYear || trimmedYear.trim() === '') {
      throw new Error('Year of graduation is required');
    }

    const yearNum = parseInt(trimmedYear);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(yearNum)) {
      throw new Error('Please enter a valid year');
    }

    if (yearNum > currentYear) {
      throw new Error(`Year cannot be greater than ${currentYear}`);
    }

    if (yearNum < 1900) {
      throw new Error('Please enter a valid year (1900 or later)');
    }

    const finalGasLimit = customGasLimit || calculateGasLimit(batch.length);

    const txOptions = {
      gas: finalGasLimit,
      maxFeePerGas: '100000000000',
      maxPriorityFeePerGas: '3000000000'
    };

    console.log('🎯 Sending to blockchain with parameters:', {
      universityName,
      studentNames,
      programOfStudy: trimmedProgram,
      award: trimmedAward,
      yearOfGraduation: trimmedYear,
      registrationNumbers
    });

    // FIXED: Ensure all parameters are properly formatted for blockchain
    const result = await addUniversityGraduates({
      universityName: universityName,
      studentNames: studentNames,
      programOfStudy: trimmedProgram,
      award: trimmedAward,
      yearOfGraduation: trimmedYear,
      registrationNumbers: registrationNumbers
    }, txOptions);

    return result;
  };

  // Validation function
  const validateYearOfGraduation = (year) => {
    const currentYear = new Date().getFullYear();
    
    if (!year || year.trim() === '') {
      setYearError('Year of graduation is required');
      return false;
    }

    const inputYear = parseInt(year);
    if (isNaN(inputYear)) {
      setYearError('Please enter a valid year');
      return false;
    }

    if (inputYear > currentYear) {
      setYearError(`Year cannot be greater than ${currentYear}`);
      return false;
    }

    if (inputYear < 1900) {
      setYearError('Please enter a valid year (1900 or later)');
      return false;
    }

    setYearError('');
    return true;
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    setYearOfGraduation(value);
    if (value.trim() !== '') validateYearOfGraduation(value);
  };

  // Effects
  useEffect(() => {
    if (isConnected) {
      fetchUserInstitution();
    }
  }, [isConnected]);

  useEffect(() => {
    if (userInstitution && isConnected) {
      fetchGraduatesFromBlockchain(userInstitution);
      fetchProgramsFromBlockchain(userInstitution);
    }
  }, [userInstitution, isConnected]);

  useEffect(() => {
    applyFilters();
  }, [graduates, sortConfig, filterProgram, filterCriteria]);

  // Process and filter data
  const applyFilters = () => {
    let filtered = graduates;

    // Apply text search filter
    if (filterCriteria && filterCriteria.trim() !== '') {
      const searchTerm = filterCriteria.toLowerCase().trim();
      filtered = filtered.filter(graduate =>
        graduate.studentName?.toLowerCase().includes(searchTerm) ||
        graduate.registrationNumber?.toLowerCase().includes(searchTerm) ||
        graduate.programOfStudy?.toLowerCase().includes(searchTerm) ||
        graduate.award?.toLowerCase().includes(searchTerm) ||
        graduate.yearOfGraduation?.toString().includes(searchTerm)
      );
    }

    // Apply program filter
    if (filterProgram && filterProgram !== '') {
      filtered = filtered.filter(graduate =>
        graduate.programOfStudy?.toLowerCase() === filterProgram.toLowerCase()
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGraduates = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const fetchUserInstitution = async () => {
    try {
      setIsLoadingInstitution(true);
      setErrorNotification('');

      const userData = localStorage.getItem("user");
      if (!userData) {
        setIsLoadingInstitution(false);
        return;
      }

      const { email } = JSON.parse(userData);
      if (!email || !isConnected) {
        setIsLoadingInstitution(false);
        return;
      }

      const institution = await getUserInstitution(email);
      
      if (institution && typeof institution === 'string' && institution.trim() !== '') {
        const trimmedInstitution = institution.trim();
        setUserInstitution(trimmedInstitution);
      } else {
        setUserInstitution('');
      }
    } catch (error) {
      console.error("Error fetching user institution:", error);
      setUserInstitution('');
    } finally {
      setIsLoadingInstitution(false);
    }
  };

  const fetchProgramsFromBlockchain = async (universityName) => {
    try {
      setIsLoadingPrograms(true);

      if (!universityName || universityName.trim() === '') {
        setProgramOptions([]);
        setProgramOfStudy('');
        return;
      }

      const programs = await getProgramsByUniversity(universityName);
      
      if (programs && Array.isArray(programs) && programs.length > 0) {
        let programNames = [];
        
        if (typeof programs[0] === 'string') {
          programNames = programs.map(p => p.trim()).filter(p => p !== '');
        } else if (typeof programs[0] === 'object') {
          programNames = programs
            .map(p => p.programName || p.name || p.program || '')
            .map(p => String(p).trim())
            .filter(p => p !== '');
        }
        
        if (programNames.length > 0) {
          setProgramOptions(programNames);
          setProgramOfStudy(programNames[0]);
        } else {
          setProgramOptions([]);
          setProgramOfStudy('');
        }
      } else {
        setProgramOptions([]);
        setProgramOfStudy('');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setErrorNotification(`Failed to fetch programs: ${error.message}`);
      setProgramOptions([]);
      setProgramOfStudy('');
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const fetchGraduatesFromBlockchain = async (universityName) => {
    try {
      setIsLoadingGraduates(true);
      setErrorNotification('');
      
      if (!isConnected || !universityName || universityName.trim() === '') {
        setGraduates([]);
        setFilteredData([]);
        return;
      }

      const graduatesData = await getGraduatesByUniversityName(universityName);
      
      if (graduatesData && Array.isArray(graduatesData) && graduatesData.length > 0) {
        const processedGraduates = graduatesData.map(graduate => {
          // Handle Solidity struct that comes as object with numeric indices
          const gradObj = typeof graduate === 'object' ? graduate : {};
          
          return {
            studentName: String(gradObj.studentName || gradObj.name || gradObj[1] || '').trim(),
            programOfStudy: String(gradObj.programOfStudy || gradObj.program || gradObj[2] || '').trim(),
            award: String(gradObj.award || gradObj.degree || gradObj[3] || '').trim(),
            yearOfGraduation: String(gradObj.yearOfGraduation || gradObj.year || gradObj[4] || '').trim(),
            registrationNumber: String(gradObj.registrationNumber || gradObj.regNo || gradObj.id || gradObj[5] || '').trim(),
            universityName: String(gradObj.universityName || gradObj[0] || universityName || '').trim()
          };
        }).filter(grad => grad.studentName && grad.registrationNumber); // Filter out invalid entries
        
        setGraduates(processedGraduates);
        setFilteredData(processedGraduates);
      } else {
        setGraduates([]);
        setFilteredData([]);
      }
      
    } catch (error) {
      console.error('Error fetching graduates:', error);
      setErrorNotification(`Failed to fetch graduates: ${error.message}`);
      setGraduates([]);
      setFilteredData([]);
    } finally {
      setIsLoadingGraduates(false);
    }
  };

  const extractDataFromExcel = (file) => {
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        if (data.length === 0) {
          setIsExcelReady(false);
          setPendingGraduates([]);
          return;
        }

        const processedData = data.map((row) => {
          const columns = Object.keys(row).map((col) => col.trim().toLowerCase());

          const findColumn = (possibleNames) => {
            for (const name of possibleNames) {
              const index = columns.indexOf(name.toLowerCase());
              if (index !== -1) return Object.keys(row)[index];
            }
            return null;
          };

          const nameCol = findColumn(["student name", "name", "full name", "student"]);
          const regNoCol = findColumn(["registration number", "reg no", "student id", "id"]);

          return {
            studentName: String(row[nameCol]?.trim() || ""),
            registrationNumber: String(row[regNoCol]?.trim() || ""),
          };
        }).filter(student => student.studentName && student.registrationNumber);

        setPendingGraduates(processedData);
        setIsExcelReady(processedData.length > 0);
        setShowUploadPreview(true);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setIsExcelReady(false);
        setPendingGraduates([]);
      }
    };

    fileReader.onerror = () => {
      console.error("Error reading file");
      setIsExcelReady(false);
      setPendingGraduates([]);
    };

    fileReader.readAsArrayBuffer(file);
  };

  // FIXED: Main function to add graduates with enhanced error handling
  const addGraduatesToBlockchain = async () => {
    if (!isConnected) {
      setTransactionStatus('Please connect your wallet.');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    const universityName = userInstitution?.trim();
    
    if (!universityName || universityName === '') {
      setTransactionStatus('Failed');
      setErrorNotification('University name is required and cannot be empty.');
      setTimeout(() => {
        setTransactionStatus('');
        setErrorNotification('');
      }, 8000);
      return;
    }

    if (!programOfStudy || !award || !yearOfGraduation) {
      setTransactionStatus('Please fill in all required fields.');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    // FIXED: Enhanced validation that matches blockchain requirements
    if (!validateYearOfGraduation(yearOfGraduation)) {
      setTransactionStatus(`Invalid year of graduation: ${yearError}`);
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    if (!isExcelReady || pendingGraduates.length === 0) {
      setTransactionStatus('Please upload an Excel file with student data.');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    try {
      setIsSubmitting(true);
      setTransactionStatus(`Adding ${pendingGraduates.length} graduates to blockchain...`);
      setErrorNotification('');
      setSuccessNotification('');

      console.log('📋 Starting blockchain transaction with:', {
        universityName,
        programOfStudy,
        award,
        yearOfGraduation,
        studentCount: pendingGraduates.length
      });

      // Process in batches of 3 students (optimal for gas limits)
      const batchSize = 3;
      const results = await processGraduatesInBatches(pendingGraduates, batchSize);
      
      setSuccessNotification(`✅ Successfully added ${pendingGraduates.length} graduates to blockchain!`);
      setTransactionStatus('Success');

      await fetchGraduatesFromBlockchain(universityName);

      setTimeout(() => {
        setPendingGraduates([]);
        setIsExcelReady(false);
        setYearOfGraduation('');
        setTransactionStatus('');
        setSuccessNotification('');
        setShowUploadPreview(false);
        setShowAddForm(false); // Close the form modal
      }, 5000);
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionStatus('Failed');
      
      if (error.message.includes('out of gas')) {
        setErrorNotification('Transaction failed: Insufficient gas. Please try again with fewer students.');
      } else if (error.message.includes('Invalid year')) {
        setErrorNotification('Invalid year format. Please ensure year is between 1900 and current year.');
      } else {
        setErrorNotification(error.message || 'Failed to add graduates. Please try again.');
      }

      setTimeout(() => setTransactionStatus(''), 8000);
      setTimeout(() => setErrorNotification(''), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCertificate = async (graduate) => {
    try {
      setIsSubmitting(true);
      console.log("🎓 Generating certificate for:", graduate);

      // Fetch the latest QR code hash directly from the blockchain.
      console.log("🔗 Fetching QR code from blockchain for:", graduate.registrationNumber, graduate.award);
      const qrResult = await getQRCodeByRegNumberAndAward(
        graduate.registrationNumber,
        graduate.award
      );
      
      console.log("📦 Full QR Result from blockchain:", qrResult);      
      
      let finalQrCodeValue = '';
      
      // Access the correct property from blockchain response
      if (qrResult) {
        // The contract returns a struct: [bool found, string qrCode]
        if (qrResult.qrCode && typeof qrResult.qrCode === 'string' && qrResult.qrCode.trim() !== '' && qrResult.qrCode !== 'true' && qrResult.qrCode !== 'false') {
          finalQrCodeValue = qrResult.qrCode.trim();
          console.log("✅ Found QR in qrCode property:", finalQrCodeValue);
        } 
        // Array-like object `[found, qrCode]`
        else if (qrResult[1] && typeof qrResult[1] === 'string' && qrResult[1].trim() !== '' && qrResult[1] !== 'true' && qrResult[1] !== 'false') {
          finalQrCodeValue = qrResult[1].trim();
          console.log("✅ Found QR in array[1]:", finalQrCodeValue);
        } 
        // Transformed response to `qrCodeValue`
        else if (qrResult.qrCodeValue && typeof qrResult.qrCodeValue === 'string' && qrResult.qrCodeValue.trim() !== '' && qrResult.qrCodeValue !== 'true' && qrResult.qrCodeValue !== 'false') {
            finalQrCodeValue = qrResult.qrCodeValue.trim();
            console.log("✅ Found QR in (transformed) qrCodeValue property:", finalQrCodeValue);
        }
      }
      
      // Fallback if QR code not found or invalid
      if (!finalQrCodeValue || finalQrCodeValue === 'true' || finalQrCodeValue === 'false') {
        finalQrCodeValue = `${graduate.registrationNumber}-${graduate.award}-${userInstitution}`;
        console.warn("⚠️ QR code not found on blockchain. Using fallback:", finalQrCodeValue);
        setErrorNotification("QR code not found on blockchain. A temporary one will be used for preview.");
        setTimeout(() => setErrorNotification(''), 5000);
      }

      // Prepare the data for the CertificateGenerator component.
      const certificateData = {
        universityName: String(graduate.universityName || userInstitution || '').trim(),
        studentName: String(graduate.studentName || '').trim(),
        programOfStudy: String(graduate.programOfStudy || '').trim(),
        award: String(graduate.award || '').trim(),
        yearOfGraduation: String(graduate.yearOfGraduation || '').trim(),
        registrationNumber: String(graduate.registrationNumber || '').trim(),
        issueDate: new Date().toISOString().split('T')[0],
        qrCode: finalQrCodeValue, // Use the hash fetched from the blockchain
      };

      console.log('✅ Final certificate data prepared:', certificateData);
      console.log('📋 QR Code to encode:', finalQrCodeValue);
      console.log('📏 QR Code length:', finalQrCodeValue.length, 'characters');

      if (!certificateData.studentName || !certificateData.registrationNumber) {
        throw new Error('Missing required student information. Cannot generate certificate.');
      }

      setSelectedStudentForCertificate(certificateData);
      setShowCertificateModal(true);
    } catch (e) {
      console.error('❌ Failed to generate certificate:', e);
      setErrorNotification(e.message || 'Failed to generate certificate');
      setTimeout(() => setErrorNotification(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      extractDataFromExcel(file);
    }
  };

  const handleProgramChange = (e) => {
    setProgramOfStudy(e.target.value);
  };

  const handleFilterProgramChange = (e) => {
    setFilterProgram(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    // Reset form state when closing
    if (showAddForm) {
      setPendingGraduates([]);
      setIsExcelReady(false);
      setShowUploadPreview(false);
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      {showCertificateModal && (
        <CertificateGenerator
          studentData={selectedStudentForCertificate}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedStudentForCertificate(null);
          }}
          isGenerating={isSubmitting}
          darkMode={darkMode}
        />
      )}

      {!isConnected && (
        <div className={styles.connectionWarning}>
          ⚠️ Not connected to blockchain. Please connect your wallet to manage graduates.
        </div>
      )}

      {successNotification && (
        <div className={styles.successNotification}>
          <div className={styles.notificationIcon}>✅</div>
          <div className={styles.notificationContent}>
            {successNotification}
          </div>
        </div>
      )}

      {errorNotification && (
        <div className={styles.errorNotification}>
          <div className={styles.notificationIcon}>❌</div>
          <div className={styles.notificationContent}>
            {errorNotification}
          </div>
        </div>
      )}

      {transactionStatus && (
        <div className={`${styles.transactionStatus} ${
          transactionStatus.includes('Success') ? styles.success :
          transactionStatus.includes('Failed') ? styles.error :
          styles.loading
        }`}>
          {transactionStatus}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Processing blockchain transaction...</p>
        </div>
      )}

      {/* Main Table Section */}
      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.addButton}
              onClick={toggleAddForm}
              title="Add New Graduate"
              disabled={!isConnected || !userInstitution}
            >
              <span className={styles.plusIcon}>+</span>
              Add New Graduate
            </button>
          </div>
          <div className={styles.headerRight}>
            {userInstitution && (
              <div className={styles.institutionBadge}>
                📍 {userInstitution}
              </div>
            )}
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableControls}>
            <div className={styles.controlsRow}>
              <div className={styles.searchGroup}>
                <label className={styles.controlLabel}>Search</label>
                <input
                  type="text"
                  placeholder="Search by name, reg no, award, year..."
                  value={filterCriteria}
                  onChange={(e) => setFilterCriteria(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.controlLabel}>Filter by Program</label>
                <select
                  value={filterProgram}
                  onChange={handleFilterProgramChange}
                  className={styles.filterSelect}
                  disabled={isLoadingPrograms}
                >
                  <option value="">All Programs</option>
                  {programOptions.map((program, index) => (
                    <option key={index} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {(filterCriteria || filterProgram) && (
              <div className={styles.filterStatus}>
                Showing {filteredData.length} of {graduates.length} graduates
                {filterProgram && ` in ${filterProgram}`}
                {filterCriteria && ` matching "${filterCriteria}"`}
              </div>
            )}
          </div>

          <div className={styles.tableWrapper}>
            {isLoadingGraduates ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading graduates from blockchain...</p>
              </div>
            ) : graduates.length > 0 ? (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.paginationControls}>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className={styles.pageSizeSelect}
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                    
                    <div className={styles.pagination}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                      >
                        ←
                      </button>
                      
                      <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages || 1} ({filteredData.length} total)
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={styles.pageButton}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>

                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th 
                        onClick={() => handleSort('studentName')} 
                        className={styles.sortableHeader}
                      >
                        Student Name {sortConfig.key === 'studentName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('programOfStudy')} 
                        className={styles.sortableHeader}
                      >
                        Program {sortConfig.key === 'programOfStudy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('award')} 
                        className={styles.sortableHeader}
                      >
                        Award {sortConfig.key === 'award' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('yearOfGraduation')} 
                        className={styles.sortableHeader}
                      >
                        Year {sortConfig.key === 'yearOfGraduation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('registrationNumber')} 
                        className={styles.sortableHeader}
                      >
                        Registration No. {sortConfig.key === 'registrationNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGraduates.length > 0 ? (
                      currentGraduates.map((graduate, index) => (
                        <tr key={index}>
                          <td className={styles.studentNameCell}>{graduate.studentName}</td>
                          <td>{graduate.programOfStudy}</td>
                          <td>
                            <span className={styles.awardBadge}>{graduate.award}</span>
                          </td>
                          <td>{graduate.yearOfGraduation}</td>
                          <td className={styles.regNumberCell}>{graduate.registrationNumber}</td>
                          <td>
                            <button
                              onClick={() => handleGenerateCertificate(graduate)}
                              disabled={isSubmitting}
                              className={styles.certificateButton}
                              title="Generate Certificate"
                            >
                              🎓 Certificate
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className={styles.noResults}>
                          No graduates match your filter criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🎓</div>
                <h3>No Graduates Found</h3>
                <p>Get started by adding graduates using the form above.</p>
                {userInstitution && (
                  <p className={styles.emptyStateHint}>
                    University: <strong>{userInstitution}</strong>
                  </p>
                )}
                {!userInstitution && isConnected && (
                  <p className={styles.emptyStateHint}>
                    Unable to detect your institution. Please contact administrator.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Graduate Form Modal */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Upload New Graduates</h2>
              <button 
                className={styles.closeButton}
                onClick={toggleAddForm}
                title="Close"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>University Name</label>
                <div className={styles.universityDisplay}>
                  {isLoadingInstitution ? (
                    <div className={styles.loadingText}>Loading institution from blockchain...</div>
                  ) : userInstitution ? (
                    <div className={styles.universityValue}>
                      <strong>{userInstitution}</strong>
                      <span className={styles.verifiedBadge}>✓ Verified</span>
                    </div>
                  ) : (
                    <div className={styles.noInstitution}>
                      ❌ No institution found. Please contact administrator.
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Program of Study *</label>
                  <select
                    value={programOfStudy}
                    onChange={handleProgramChange}
                    disabled={isSubmitting || !userInstitution || isLoadingPrograms}
                    className={styles.formInput}
                  >
                    {isLoadingPrograms ? (
                      <option value="">Loading programs...</option>
                    ) : programOptions.length === 0 ? (
                      <option value="">No programs found</option>
                    ) : (
                      programOptions.map((program, index) => (
                        <option key={index} value={program}>
                          {program}
                        </option>
                      ))
                    )}
                  </select>
                  {isLoadingPrograms && (
                    <small className={styles.helperText}>Fetching programs from blockchain...</small>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Award *</label>
                  <select
                    value={award}
                    onChange={(e) => setAward(e.target.value)}
                    disabled={isSubmitting || !userInstitution}
                    className={styles.formInput}
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Year of Graduation *</label>
                  <input
                    type="number"
                    value={yearOfGraduation}
                    onChange={handleYearChange}
                    placeholder={new Date().getFullYear().toString()}
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting || !userInstitution}
                    className={`${styles.formInput} ${yearError ? styles.inputError : ''}`}
                  />
                  {yearError && (
                    <div className={styles.errorMessage}>
                      ⚠️ {yearError}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Upload Excel File *</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isSubmitting || !userInstitution}
                  className={styles.fileInput}
                />
                <small className={styles.helperText}>
                  File should contain columns for <strong>Student Name</strong> and <strong>Registration Number</strong>
                </small>
                
                {showUploadPreview && pendingGraduates.length > 0 && (
                  <div className={styles.uploadPreview}>
                    <h4 className={styles.previewTitle}>
                      ✅ Ready to upload: {pendingGraduates.length} student{pendingGraduates.length !== 1 ? 's' : ''}
                    </h4>
                    <div className={styles.previewList}>
                      {pendingGraduates.slice(0, 5).map((student, index) => (
                        <div key={index} className={styles.previewItem}>
                          <span className={styles.studentName}>{student.studentName}</span>
                          <span className={styles.regNumber}>{student.registrationNumber}</span>
                        </div>
                      ))}
                      {pendingGraduates.length > 5 && (
                        <div className={styles.previewMore}>
                          ... and {pendingGraduates.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={addGraduatesToBlockchain}
                  disabled={!isExcelReady || isSubmitting || !isConnected || !userInstitution || !programOfStudy || !award || !yearOfGraduation || yearError}
                  className={styles.primaryButton}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Adding {pendingGraduates.length} Graduates...
                    </>
                  ) : (
                    `Add ${pendingGraduates.length} Graduates to Blockchain`
                  )}
                </button>
                
                <button
                  onClick={toggleAddForm}
                  disabled={isSubmitting}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>

              {isSubmitting && (
                <div className={styles.transactionInfo}>
                  <div className={styles.infoIcon}>⏳</div>
                  <div className={styles.infoText}>
                    <strong>Transaction in progress...</strong>
                    <small>This may take a few minutes. Please don't close this window.</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Graduate;