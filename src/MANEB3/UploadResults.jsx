import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, FileText, X, Search } from 'lucide-react';
import { useTheme } from './maneb';
import { useManebContract } from '../hooks/useSmartContract';
import { useConnectionStatus } from '../hooks/useSmartContract';
import * as XLSX from 'xlsx';
import styles from './uploadresults.module.css';

const UploadResults = () => {
  const { darkMode } = useTheme();
  const { getSchoolNamesByDistrict, setFormFourDetailsBatch, addFormFourDetailsSimple, getAllFormFourDetails, getFormFourDetails } = useManebContract();
  const { isConnected } = useConnectionStatus();

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    examinationYear: '',
    district: '',
  });

  // State for filtered schools
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  // State for Excel data processing
  const [extractedStudents, setExtractedStudents] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessingError, setFileProcessingError] = useState('');
  const [fileProcessingSuccess, setFileProcessingSuccess] = useState('');

  // State for blockchain submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // State for existing Form Four details
  const [existingFormFourDetails, setExistingFormFourDetails] = useState([]);
  const [loadingExistingDetails, setLoadingExistingDetails] = useState(true);
  const [existingDetailsError, setExistingDetailsError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    district: '',
    school: '',
    search: ''
  });

  // Malawi's 28 districts
  const malawiDistricts = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
    'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
    'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
    'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe',
    'Rumphi', 'Salima', 'Thyolo', 'Zomba'
  ];

  // Load existing Form Four details and clear filtered schools on component mount
  useEffect(() => {
    setFilteredSchools([]);
    loadExistingFormFourDetails();
  }, []);

  // Load existing Form Four details from blockchain
  const loadExistingFormFourDetails = async () => {
    try {
      setLoadingExistingDetails(true);
      setExistingDetailsError('');

      console.log('📚 Loading existing Form Four details...');

      const allDetails = await getAllFormFourDetails();

      if (allDetails && allDetails.length > 0) {
        setExistingFormFourDetails(allDetails);
        console.log(`✅ Loaded ${allDetails.length} existing Form Four records`);
      } else {
        console.log('📋 No existing Form Four details found');
        setExistingFormFourDetails([]);
      }

    } catch (error) {
      console.error('❌ Error loading existing Form Four details:', error);
      setExistingDetailsError(`Failed to load existing records: ${error.message}`);
    } finally {
      setLoadingExistingDetails(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      processExcelFile(file);
    }
  };

  // Process Excel file to extract student names and examination numbers
  const processExcelFile = (file) => {
    setIsProcessingFile(true);
    setFileProcessingError('');
    setFileProcessingSuccess('');
    setExtractedStudents([]);

    console.log('📁 Processing Excel file:', file.name);

    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setFileProcessingError('Excel file is empty or has no data rows.');
          return;
        }

        console.log('📊 Raw Excel data:', jsonData);

        // Extract student data - try different possible column names
        const extractedData = jsonData.map((row, index) => {
          // Try different possible column names for student name
          const studentName = row['Student Name'] ||
                             row['StudentName'] ||
                             row['Student_Name'] ||
                             row['Name'] ||
                             row['student_name'] ||
                             row['STUDENT NAME'] ||
                             row['STUDENT_NAME'] ||
                             Object.values(row)[0]; // First column if no header match

          // Try different possible column names for examination number
          const examNumber = row['Examination Number'] ||
                            row['ExaminationNumber'] ||
                            row['Examination_Number'] ||
                            row['Exam Number'] ||
                            row['ExamNumber'] ||
                            row['Exam_Number'] ||
                            row['examination_number'] ||
                            row['exam_number'] ||
                            row['EXAMINATION NUMBER'] ||
                            row['EXAM NUMBER'] ||
                            Object.values(row)[1]; // Second column if no header match

          return {
            id: index + 1,
            studentName: studentName ? String(studentName).trim() : '',
            examinationNumber: examNumber ? String(examNumber).trim() : ''
          };
        }).filter(student =>
          student.studentName &&
          student.examinationNumber &&
          student.studentName !== 'Student Name' &&
          student.examinationNumber !== 'Examination Number'
        );

        console.log('✅ Extracted student data:', extractedData);

        if (extractedData.length === 0) {
          setFileProcessingError('No valid student data found. Please ensure your Excel file has columns for "Student Name" and "Examination Number".');
          return;
        }

        setExtractedStudents(extractedData);
        setFileProcessingSuccess(`✅ Successfully extracted ${extractedData.length} student records from Excel file.`);

      } catch (error) {
        console.error('❌ Error processing Excel file:', error);
        setFileProcessingError(`Error processing Excel file: ${error.message}`);
      } finally {
        setIsProcessingFile(false);
      }
    };

    fileReader.onerror = () => {
      setFileProcessingError('Error reading the Excel file. Please try again.');
      setIsProcessingFile(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  // Fetch schools by district
  const fetchSchoolsByDistrict = async (district) => {
    if (!district) {
      setFilteredSchools([]);
      return;
    }

    try {
      setIsLoadingSchools(true);
      console.log('🔍 Fetching schools for district:', district);

      const schools = await getSchoolNamesByDistrict(district);
      console.log('📚 Schools found:', schools);

      // Process the schools data
      let processedSchools = [];
      if (Array.isArray(schools) && schools.length > 0) {
        processedSchools = schools.map((school, index) => ({
          id: index + 1,
          name: typeof school === 'string' ? school : school.schoolName || school.name || `School ${index + 1}`
        }));
      }

      setFilteredSchools(processedSchools);
      console.log('✅ Processed schools:', processedSchools);

    } catch (error) {
      console.error('❌ Error fetching schools by district:', error);
      setFilteredSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If district changes, fetch schools for that district
    if (name === 'district') {
      fetchSchoolsByDistrict(value);
      // Clear school name when district changes
      setFormData(prev => ({
        ...prev,
        district: value,
        schoolName: ''
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!isConnected) {
      setSubmissionError('Please connect your wallet first.');
      return;
    }

    if (!formData.schoolName || !formData.examinationYear || !formData.district) {
      setSubmissionError('Please fill in all required fields.');
      return;
    }

    if (!selectedFile) {
      setSubmissionError('Please upload an Excel file with student data.');
      return;
    }

    if (extractedStudents.length === 0) {
      setSubmissionError('No valid student data found in the Excel file. Please check the file format.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError('');
      setSubmissionSuccess('');

      console.log('🚀 Submitting Form Four details to blockchain...');
      console.log('📊 Form data:', formData);
      console.log('👥 Students to add:', extractedStudents.length);

      // Prepare data for blockchain submission
      const studentNames = extractedStudents.map(student => student.studentName);
      const examinationNumbers = extractedStudents.map(student => student.examinationNumber);

      // Ensure year is properly converted to number
      const yearOfExamination = Number(formData.examinationYear);

      console.log('🔍 Year conversion debug:', {
        originalValue: formData.examinationYear,
        originalType: typeof formData.examinationYear,
        convertedValue: yearOfExamination,
        convertedType: typeof yearOfExamination,
        isNaN: isNaN(yearOfExamination)
      });

      // Additional validation
      if (isNaN(yearOfExamination) || yearOfExamination < 1900 || yearOfExamination > 2100) {
        throw new Error(`Invalid examination year: ${formData.examinationYear} (converted to: ${yearOfExamination})`);
      }

      if (studentNames.some(name => !name || name.trim().length === 0)) {
        throw new Error('Some student names are empty or invalid');
      }

      if (examinationNumbers.some(examNum => !examNum || examNum.trim().length === 0)) {
        throw new Error('Some examination numbers are empty or invalid');
      }

      if (!formData.schoolName || formData.schoolName.trim().length === 0) {
        throw new Error('School name is required');
      }

      console.log('📋 Blockchain submission data:', {
        studentNames,
        examinationNumbers,
        schoolName: formData.schoolName,
        yearOfExamination,
        studentCount: studentNames.length,
        examNumberCount: examinationNumbers.length
      });

      // Try the main function first, then fallback to simple implementation
      let result;
      try {
        console.log('🚀 Attempting primary setFormFourDetailsBatch method...');
        result = await setFormFourDetailsBatch(
          studentNames,
          examinationNumbers,
          formData.schoolName,
          yearOfExamination
        );
        console.log('✅ Primary method successful:', result);
      } catch (primaryError) {
        console.error('❌ Primary method failed:', primaryError.message);
        console.log('🔄 Trying alternative simple implementation...');

        try {
          result = await addFormFourDetailsSimple(
            studentNames,
            examinationNumbers,
            formData.schoolName,
            yearOfExamination
          );
          console.log('✅ Alternative method successful:', result);
        } catch (alternativeError) {
          console.error('❌ Alternative method also failed:', alternativeError.message);
          throw new Error(`Both methods failed. Primary: ${primaryError.message}. Alternative: ${alternativeError.message}`);
        }
      }

      setSubmissionSuccess(`🎉 Successfully added ${extractedStudents.length} Form Four student records to the blockchain!

Transaction Hash: ${result.transactionHash}
School: ${formData.schoolName}
Year: ${formData.examinationYear}
Students: ${extractedStudents.length}`);

      // Clear form after successful submission
      setTimeout(() => {
        setFormData({
          schoolName: '',
          examinationYear: '',
          district: '',
        });
        setSelectedFile(null);
        setExtractedStudents([]);
        setFilteredSchools([]);
        setFileProcessingSuccess('');
      }, 5000);

    } catch (error) {
      console.error('❌ Error submitting Form Four details:', error);
      setSubmissionError(`Failed to add Form Four details: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExtractedStudents([]);
    setFileProcessingError('');
    setFileProcessingSuccess('');
  };

  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.pageTitle}>Upload MSCE Results</h2>
        <div className={styles.headerDivider}></div>
      </div>
      
      {/* Section 1: Form Card */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Add Form Four Details</h3>
          <p className={styles.sectionDescription}>
            Upload student examination results to the blockchain
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.uploadForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="district" className={styles.formLabel}>
                District
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Select District</option>
                  {malawiDistricts.map((district, index) => (
                    <option key={index} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="schoolName" className={styles.formLabel}>
                Secondary School Name
                {isLoadingSchools && <span className={styles.loadingText}> (Loading schools...)</span>}
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                  disabled={!formData.district || isLoadingSchools}
                >
                  <option value="">
                    {!formData.district
                      ? 'Select district first'
                      : isLoadingSchools
                        ? 'Loading schools...'
                        : filteredSchools.length === 0
                          ? 'No schools found in this district'
                          : 'Select school name'
                    }
                  </option>
                  {filteredSchools.map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} />
              </div>
              {formData.district && filteredSchools.length === 0 && !isLoadingSchools && (
                <div className={styles.noSchoolsMessage}>
                  No schools registered in {formData.district} district. Please contact admin to register schools first.
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="examinationYear" className={styles.formLabel}>
                Year of Examination
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="examinationYear"
                  name="examinationYear"
                  value={formData.examinationYear}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className={styles.selectIcon} />
              </div>
            </div>
          </div>

          <div className={styles.uploadSection}>
            <div className={styles.uploadHeaderContent}>
              <div>
                <h4 className={styles.uploadTitle}>Results Excel File</h4>
                <p className={styles.uploadDescription}>
                  Upload the Excel file containing student names and examination numbers
                </p>
              </div>
            </div>
            
            {selectedFile ? (
              <div className={styles.filePreview}>
                <div className={styles.fileInfo}>
                  <FileText className={styles.fileIcon} />
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className={styles.fileRemove}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className={styles.uploadZone}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  required
                />
                <div className={styles.uploadContent}>
                  <Upload className={styles.uploadIcon} />
                  <p className={styles.uploadText}>
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <span className={styles.fileTypes}>Supported: .xlsx, .xls, .csv</span>
                  <button type="button" className={styles.btnSecondary}>
                    Browse Files
                  </button>
                </div>
              </label>
            )}
          </div>

          {/* File Processing Status */}
          {isProcessingFile && (
            <div className={styles.processingSection}>
              <div className={styles.processingMessage}>
                <div className={styles.loadingSpinner}></div>
                <span>Processing Excel file...</span>
              </div>
            </div>
          )}

          {fileProcessingError && (
            <div className={styles.errorMessage}>
              {fileProcessingError}
            </div>
          )}

          {fileProcessingSuccess && (
            <div className={styles.successMessage}>
              {fileProcessingSuccess}
            </div>
          )}

          {/* Submission Status */}
          {submissionError && (
            <div className={styles.errorMessage}>
              {submissionError}
            </div>
          )}

          {submissionSuccess && (
            <div className={styles.successMessage}>
              <pre className={styles.successDetails}>{submissionSuccess}</pre>
            </div>
          )}

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className={styles.warningMessage}>
              ⚠️ Please connect your wallet to submit Form Four details to the blockchain.
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting || !isConnected || extractedStudents.length === 0}
            >
              {isSubmitting ? '⏳ Processing...' : 'Add Form Four Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Filter Card */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Filter Records</h3>
          <p className={styles.sectionDescription}>
            Search and filter existing Form Four records
          </p>
        </div>
        
        <div className={styles.filterGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="searchDistrict" className={styles.formLabel}>
              District
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="searchDistrict"
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                className={styles.formSelect}
              >
                <option value="">All Districts</option>
                {malawiDistricts.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="searchSchool" className={styles.formLabel}>
              School
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="searchSchool"
                name="school"
                value={filters.school}
                onChange={handleFilterChange}
                className={styles.formSelect}
              >
                <option value="">All Schools</option>
                {/* School options will be populated based on selected district */}
              </select>
              <ChevronDown className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="searchInput" className={styles.formLabel}>
              Search
            </label>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                id="searchInput"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by student name or exam number..."
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Records Table Card */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderContent}>
            <div>
              <h3 className={styles.sectionTitle}>
                Form Four Records
              </h3>
              <p className={styles.sectionDescription}>
                Current Form Four student details stored in the system
              </p>
            </div>
            <button
              type="button"
              onClick={loadExistingFormFourDetails}
              className={styles.refreshDataBtn}
              disabled={loadingExistingDetails}
              title="Refresh data"
            >
              {loadingExistingDetails ? '⏳' : '🔄'}
            </button>
          </div>
        </div>

        {loadingExistingDetails ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading Form Four records...</span>
          </div>
        ) : existingDetailsError ? (
          <div className={styles.errorMessage}>
            {existingDetailsError}
          </div>
        ) : existingFormFourDetails.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Exam Number</th>
                  <th>School</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {existingFormFourDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className={styles.studentNameCell}>{detail.studentName}</td>
                    <td className={styles.examNumberCell}>{detail.examinationNumber}</td>
                    <td>{detail.schoolName}</td>
                    <td>{detail.yearOfExamination}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No Form Four records found yet.</p>
            <p>Upload your first batch of results above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResults;