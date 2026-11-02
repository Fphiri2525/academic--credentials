import React, { useState, useEffect } from 'react';
import {
  Upload, ChevronDown, FileText, X, Search, RefreshCw,
  AlertCircle, CheckCircle2, Info, Inbox,
} from 'lucide-react';
import { useTheme } from './maneb';
import { useManebContract } from '../hooks/useSmartContract';
import { useConnectionStatus } from '../hooks/useSmartContract';
import * as XLSX from 'xlsx';
import styles from './uploadresults.module.css';

const UploadResults = () => {
  const { darkMode } = useTheme();
  const {
    getSchoolNamesByDistrict,
    setFormFourDetailsBatch,
    addFormFourDetailsSimple,
    getAllFormFourDetails,
  } = useManebContract();
  const { isConnected } = useConnectionStatus();

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    examinationYear: '',
    district: '',
  });

  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  const [extractedStudents, setExtractedStudents] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessingError, setFileProcessingError] = useState('');
  const [fileProcessingSuccess, setFileProcessingSuccess] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  const [existingFormFourDetails, setExistingFormFourDetails] = useState([]);
  const [loadingExistingDetails, setLoadingExistingDetails] = useState(true);
  const [existingDetailsError, setExistingDetailsError] = useState('');

  const [filters, setFilters] = useState({ district: '', school: '', search: '' });

  const malawiDistricts = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
    'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
    'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
    'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe',
    'Rumphi', 'Salima', 'Thyolo', 'Zomba',
  ];

  useEffect(() => {
    setFilteredSchools([]);
    loadExistingFormFourDetails();
  }, []);

  const loadExistingFormFourDetails = async () => {
    try {
      setLoadingExistingDetails(true);
      setExistingDetailsError('');
      const allDetails = await getAllFormFourDetails();
      setExistingFormFourDetails(Array.isArray(allDetails) ? allDetails : []);
    } catch (error) {
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

  const processExcelFile = (file) => {
    setIsProcessingFile(true);
    setFileProcessingError('');
    setFileProcessingSuccess('');
    setExtractedStudents([]);

    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setFileProcessingError('Excel file is empty or has no data rows.');
          return;
        }

        const extractedData = jsonData
          .map((row, index) => {
            const studentName =
              row['Student Name'] || row['StudentName'] || row['Student_Name'] ||
              row['Name'] || row['student_name'] ||
              row['STUDENT NAME'] || row['STUDENT_NAME'] ||
              Object.values(row)[0];

            const examNumber =
              row['Examination Number'] || row['ExaminationNumber'] ||
              row['Examination_Number'] || row['Exam Number'] ||
              row['ExamNumber'] || row['Exam_Number'] ||
              row['examination_number'] || row['exam_number'] ||
              row['EXAMINATION NUMBER'] || row['EXAM NUMBER'] ||
              Object.values(row)[1];

            return {
              id: index + 1,
              studentName: studentName ? String(studentName).trim() : '',
              examinationNumber: examNumber ? String(examNumber).trim() : '',
            };
          })
          .filter(
            (student) =>
              student.studentName &&
              student.examinationNumber &&
              student.studentName !== 'Student Name' &&
              student.examinationNumber !== 'Examination Number',
          );

        if (extractedData.length === 0) {
          setFileProcessingError(
            'No valid student data found. Please ensure your Excel file has columns for "Student Name" and "Examination Number".',
          );
          return;
        }

        setExtractedStudents(extractedData);
        setFileProcessingSuccess(
          `Successfully extracted ${extractedData.length} student records from Excel file.`,
        );
      } catch (error) {
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

  const fetchSchoolsByDistrict = async (district) => {
    if (!district) {
      setFilteredSchools([]);
      return;
    }
    try {
      setIsLoadingSchools(true);
      const schools = await getSchoolNamesByDistrict(district);
      let processedSchools = [];
      if (Array.isArray(schools) && schools.length > 0) {
        processedSchools = schools.map((school, index) => ({
          id: index + 1,
          name:
            typeof school === 'string'
              ? school
              : school.schoolName || school.name || `School ${index + 1}`,
        }));
      }
      setFilteredSchools(processedSchools);
    } catch (error) {
      console.error('Error fetching schools by district:', error);
      setFilteredSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'district') {
      fetchSchoolsByDistrict(value);
      setFormData((prev) => ({ ...prev, district: value, schoolName: '' }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) return setSubmissionError('Please connect your wallet first.');
    if (!formData.schoolName || !formData.examinationYear || !formData.district)
      return setSubmissionError('Please fill in all required fields.');
    if (!selectedFile)
      return setSubmissionError('Please upload an Excel file with student data.');
    if (extractedStudents.length === 0)
      return setSubmissionError('No valid student data found in the Excel file.');

    try {
      setIsSubmitting(true);
      setSubmissionError('');
      setSubmissionSuccess('');

      const studentNames = extractedStudents.map((s) => s.studentName);
      const examinationNumbers = extractedStudents.map((s) => s.examinationNumber);
      const yearOfExamination = Number(formData.examinationYear);

      if (isNaN(yearOfExamination) || yearOfExamination < 1900 || yearOfExamination > 2100)
        throw new Error(`Invalid examination year: ${formData.examinationYear}`);
      if (studentNames.some((n) => !n || n.trim().length === 0))
        throw new Error('Some student names are empty or invalid');
      if (examinationNumbers.some((n) => !n || n.trim().length === 0))
        throw new Error('Some examination numbers are empty or invalid');
      if (!formData.schoolName || formData.schoolName.trim().length === 0)
        throw new Error('School name is required');

      let result;
      try {
        result = await setFormFourDetailsBatch(
          studentNames,
          examinationNumbers,
          formData.schoolName,
          yearOfExamination,
        );
      } catch (primaryError) {
        try {
          result = await addFormFourDetailsSimple(
            studentNames,
            examinationNumbers,
            formData.schoolName,
            yearOfExamination,
          );
        } catch (alternativeError) {
          throw new Error(
            `Both methods failed. Primary: ${primaryError.message}. Alternative: ${alternativeError.message}`,
          );
        }
      }

      setSubmissionSuccess(
        `Successfully added ${extractedStudents.length} Form Four student records.\n\nTransaction Hash: ${result.transactionHash}\nSchool: ${formData.schoolName}\nYear: ${formData.examinationYear}\nStudents: ${extractedStudents.length}`,
      );

      setTimeout(() => {
        setFormData({ schoolName: '', examinationYear: '', district: '' });
        setSelectedFile(null);
        setExtractedStudents([]);
        setFilteredSchools([]);
        setFileProcessingSuccess('');
      }, 5000);
    } catch (error) {
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

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Upload MSCE Results</h1>
          <p className={styles.subtitle}>
            Add Form Four examination details and review existing records.
          </p>
        </div>
      </div>

      {/* ---------------- Upload Card ---------------- */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Add Form Four Details</h2>
            <p className={styles.cardSub}>
              Upload student examination results to the blockchain.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="district">
                District
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select District</option>
                  {malawiDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="schoolName">
                Secondary School Name
                {isLoadingSchools && (
                  <span className={styles.loadingText}> (loading…)</span>
                )}
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                  disabled={!formData.district || isLoadingSchools}
                >
                  <option value="">
                    {!formData.district
                      ? 'Select district first'
                      : isLoadingSchools
                      ? 'Loading schools…'
                      : filteredSchools.length === 0
                      ? 'No schools found in this district'
                      : 'Select school name'}
                  </option>
                  {filteredSchools.map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} />
              </div>
              {formData.district &&
                filteredSchools.length === 0 &&
                !isLoadingSchools && (
                  <div className={styles.noSchoolsMessage}>
                    No schools registered in {formData.district}. Contact admin
                    to register schools first.
                  </div>
                )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="examinationYear">
                Year of Examination
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="examinationYear"
                  name="examinationYear"
                  value={formData.examinationYear}
                  onChange={handleInputChange}
                  className={styles.select}
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
              <h4 className={styles.uploadTitle}>Results Excel File</h4>
              <p className={styles.uploadDescription}>
                Upload the Excel file containing student names and examination
                numbers.
              </p>
            </div>

            {selectedFile ? (
              <div className={styles.filePreview}>
                <div className={styles.fileInfo}>
                  <FileText className={styles.fileIcon} />
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>
                      {selectedFile.name}
                    </span>
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
                    Click to browse or drag and drop your Excel file
                  </p>
                  <span className={styles.fileTypes}>
                    Supported: .xlsx, .xls, .csv
                  </span>
                </div>
              </label>
            )}
          </div>

          {isProcessingFile && (
            <div className={styles.alert}>
              <RefreshCw size={16} className={styles.loadingSpinner} />
              <span>Processing Excel file…</span>
            </div>
          )}

          {fileProcessingError && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <AlertCircle size={16} />
              <span>{fileProcessingError}</span>
            </div>
          )}

          {fileProcessingSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              <span>{fileProcessingSuccess}</span>
            </div>
          )}

          {submissionError && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <AlertCircle size={16} />
              <span>{submissionError}</span>
            </div>
          )}

          {submissionSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              <pre className={styles.successDetails}>{submissionSuccess}</pre>
            </div>
          )}

          {!isConnected && (
            <div className={`${styles.alert} ${styles.alertInfo}`}>
              <Info size={16} />
              <span>
                Please connect your wallet to submit Form Four details.
              </span>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={
                isSubmitting || !isConnected || extractedStudents.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className={styles.loadingSpinner} />{' '}
                  Processing…
                </>
              ) : (
                <>
                  <Upload size={14} /> Add Form Four Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ---------------- Records Table ---------------- */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Form Four Records</h2>
            <p className={styles.cardSub}>
              Current student details stored on the blockchain.
            </p>
          </div>
          <button
            type="button"
            onClick={loadExistingFormFourDetails}
            className={styles.btnGhost}
            disabled={loadingExistingDetails}
          >
            <RefreshCw
              size={14}
              className={loadingExistingDetails ? styles.loadingSpinner : ''}
            />
            {loadingExistingDetails ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {loadingExistingDetails ? (
          <div className={styles.loadingContainer}>
            <RefreshCw size={20} className={styles.loadingSpinner} />
            <span>Loading records…</span>
          </div>
        ) : existingDetailsError ? (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <AlertCircle size={16} />
            <span>{existingDetailsError}</span>
          </div>
        ) : existingFormFourDetails.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
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
                    <td className={styles.studentNameCell}>
                      {detail.studentName}
                    </td>
                    <td className={styles.examNumberCell}>
                      {detail.examinationNumber}
                    </td>
                    <td>{detail.schoolName}</td>
                    <td>{detail.yearOfExamination}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Inbox size={40} />
            <p className={styles.emptyStateTitle}>No records yet</p>
            <p className={styles.emptyStateText}>
              Upload your first batch of results above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResults;