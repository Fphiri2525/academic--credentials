import React, { useState, useEffect } from 'react';
import {
  Search, Upload, FileText, X, Plus, Eye, RefreshCw,
  AlertCircle, CheckCircle2, Info, Inbox, Building2,
} from 'lucide-react';
import { useTheme } from './maneb';
import styles from './manageistitution.module.css';
import * as XLSX from 'xlsx';
import { useManebContract } from '../hooks/useSmartContract';
import { useConnectionStatus } from '../hooks/useSmartContract';
import { connectWallet } from '../web3service';

const ManageInstitutions = () => {
  const { darkMode } = useTheme();

  const {
    registerSecondarySchools,
    getAllSecondarySchools,
    getTotalSecondarySchools,
  } = useManebContract();
  const { isConnected, connectionStatus, updateStatus } = useConnectionStatus();

  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    schoolCode: '',
    district: '',
    zone: '',
    category: '',
  });

  const malawiDistricts = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
    'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
    'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
    'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe',
    'Rumphi', 'Salima', 'Thyolo', 'Zomba',
  ];

  const [selectedFile, setSelectedFile] = useState(null);
  const [schoolNames, setSchoolNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState('');

  const [registeredSchools, setRegisteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [totalSchools, setTotalSchools] = useState(0);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const loadSchoolsData = async () => {
      if (isConnected) {
        await fetchRegisteredSchools();
      }
    };
    loadSchoolsData();
  }, [isConnected]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    extractSchoolNamesFromExcel(file);
  };

  const extractSchoolNamesFromExcel = (file) => {
    setIsProcessing(true);
    setUploadError('');
    setUploadSuccess('');

    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const dataWithHeaders = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
        });
        const dataWithoutHeaders = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
        });

        if (dataWithHeaders.length === 0 && dataWithoutHeaders.length === 0) {
          setUploadError('The Excel file appears to be empty');
          setIsProcessing(false);
          return;
        }

        let extractedNames = [];

        if (dataWithHeaders.length > 0) {
          extractedNames = dataWithHeaders
            .map((row) => {
              const schoolName =
                row['School Name'] ||
                row['SchoolName'] ||
                row['School_Name'] ||
                row['Name'] ||
                row['school_name'] ||
                row['Institution'] ||
                row['institution'] ||
                row['SCHOOL NAME'] ||
                row['SCHOOL_NAME'] ||
                Object.values(row)[0];

              return schoolName ? String(schoolName).trim() : null;
            })
            .filter(
              (name) =>
                name &&
                name.length > 0 &&
                name !== 'School Name' &&
                name !== 'Name',
            );
        }

        if (extractedNames.length === 0 && dataWithoutHeaders.length > 0) {
          extractedNames = dataWithoutHeaders
            .map((row) => {
              if (Array.isArray(row) && row.length > 0 && row[0]) {
                const schoolName = String(row[0]).trim();
                if (
                  schoolName.toLowerCase().includes('school') &&
                  schoolName.toLowerCase().includes('name')
                ) {
                  return null;
                }
                return schoolName;
              }
              return null;
            })
            .filter((name) => name && name.length > 0);
        }

        if (extractedNames.length === 0) {
          setUploadError(
            'No valid school names found in the Excel file. Please ensure the first column contains school names.',
          );
          setIsProcessing(false);
          return;
        }

        const cleanedNames = [...new Set(extractedNames)]
          .map((name) => name.replace(/\s+/g, ' ').trim())
          .filter((name) => name.length > 0);

        setSchoolNames(cleanedNames);
        setIsProcessing(false);
      } catch (error) {
        setUploadError(
          `Error reading Excel file: ${error.message}. Please check the file format.`,
        );
        setIsProcessing(false);
      }
    };

    fileReader.onerror = () => {
      setUploadError('Error reading file. Please try again.');
      setIsProcessing(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setSchoolNames([]);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTransactionError('');
    setTransactionSuccess('');
    setUploadError('');

    if (!selectedFile) {
      setUploadError('Please upload an Excel file containing school names');
      return;
    }

    if (!schoolNames || schoolNames.length === 0) {
      setUploadError(
        'No school names extracted from Excel file. Please check the file format and ensure it contains school names.',
      );
      return;
    }

    const validSchoolNames = schoolNames.filter(
      (name) =>
        name &&
        typeof name === 'string' &&
        name.trim().length > 0 &&
        name.trim().length < 200,
    );

    if (validSchoolNames.length === 0) {
      setUploadError(
        'No valid school names found. Please ensure your Excel file contains proper school names.',
      );
      return;
    }

    if (!isConnected) {
      setTransactionError(
        'Please connect your wallet to submit institution data',
      );
      return;
    }

    if (
      !formData.schoolCode ||
      !formData.district ||
      !formData.zone ||
      !formData.category
    ) {
      setTransactionError(
        'Please fill in all required fields (School Code, District, Zone, Category)',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const finalParams = {
        schoolNames: validSchoolNames,
        schoolCode: formData.schoolCode.trim(),
        district: formData.district.trim(),
        zone: formData.zone.trim(),
        category: formData.category.trim(),
      };

      if (finalParams.schoolNames.some((name) => !name || name.length === 0)) {
        throw new Error('Some school names are empty or invalid');
      }

      if (!finalParams.schoolCode || finalParams.schoolCode.length === 0) {
        throw new Error('School code cannot be empty');
      }

      const result = await registerSecondarySchools(
        finalParams.schoolNames,
        finalParams.schoolCode,
        finalParams.district,
        finalParams.zone,
        finalParams.category,
      );

      showNotificationMessage(
        `Successfully registered ${finalParams.schoolNames.length} institutions`,
      );

      await fetchRegisteredSchools();

      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error) {
      let errorMessage = 'Transaction failed. Please try again.';
      if (error.message.includes('Internal JSON-RPC error')) {
        errorMessage =
          'Invalid transaction data. Please check all fields and try again.';
      } else if (error.message.includes('Network error')) {
        errorMessage =
          'Network connection issue. Please check your internet and try again.';
      } else if (error.message.includes('Contract connection failed')) {
        errorMessage =
          'Smart contract connection failed. Please refresh and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setTransactionError(`Failed to register institutions: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchRegisteredSchools = async () => {
    try {
      setIsLoadingSchools(true);
      setTransactionError('');

      const total = await getTotalSecondarySchools();
      setTotalSchools(parseInt(total) || 0);

      const schoolsData = await getAllSecondarySchools();

      let processedSchools = [];

      if (Array.isArray(schoolsData) && schoolsData.length > 0) {
        processedSchools = schoolsData.map((school, index) => ({
          id: index + 1,
          schoolName: school.schoolName || school[0] || '',
          schoolCode: school.schoolCode || school[1] || '',
          district: school.district || school[2] || '',
          zone: school.zone || school[3] || '',
          category: school.category || school[4] || '',
          registered:
            school.registered !== undefined ? school.registered : school[5] || true,
        }));
      }

      setRegisteredSchools(processedSchools);
    } catch (error) {
      setTransactionError(`Failed to fetch schools: ${error.message}`);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleViewSchool = (school) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  const handleCloseModal = () => {
    setShowSchoolModal(false);
    setSelectedSchool(null);
  };

  const handleConnectWallet = async () => {
    try {
      setTransactionError('');
      setTransactionSuccess('');
      await connectWallet();
      await updateStatus();
      showNotificationMessage('Wallet connected successfully');
    } catch (error) {
      setTransactionError(`Wallet connection failed: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      schoolCode: '',
      district: '',
      zone: '',
      category: '',
    });
    setSelectedFile(null);
    setSchoolNames([]);
    setUploadError('');
    setUploadSuccess('');
    setTransactionError('');
    setTransactionSuccess('');
    setIsSubmitting(false);
    setShowAddForm(false);
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.container}>
      {/* Notification Toast */}
      {showNotification && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <CheckCircle2 size={16} />
          <span>{notificationMessage}</span>
          <button
            onClick={() => setShowNotification(false)}
            className={styles.closeBtn}
            aria-label="Dismiss"
            style={{ marginLeft: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Manage Institutions</h1>
          <p className={styles.subtitle}>
            Register secondary schools on the blockchain and review existing
            records.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} /> Add Institution
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Registered Schools</h2>
            <p className={styles.cardSub}>
              {totalSchools > 0
                ? `${totalSchools} ${
                    totalSchools === 1 ? 'school' : 'schools'
                  } registered on-chain`
                : 'No schools registered yet'}
            </p>
          </div>
          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search institutions…"
                className={styles.searchInput}
              />
            </div>
            <button
              onClick={fetchRegisteredSchools}
              className={styles.btnGhost}
              disabled={isLoadingSchools}
            >
              <RefreshCw
                size={14}
                className={isLoadingSchools ? styles.spinner : ''}
              />
              {isLoadingSchools ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {isLoadingSchools ? (
          <div className={styles.loadingContainer}>
            <RefreshCw size={20} className={styles.spinner} />
            <span>Loading registered schools…</span>
          </div>
        ) : registeredSchools.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>School Name</th>
                  <th>School Code</th>
                  <th>District</th>
                  <th>Zone</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredSchools.map((school) => (
                  <tr key={school.id}>
                    <td>{school.id}</td>
                    <td className={styles.schoolNameCell}>
                      {school.schoolName}
                    </td>
                    <td className={styles.schoolCodeCell}>
                      {school.schoolCode}
                    </td>
                    <td>{school.district}</td>
                    <td>{school.zone}</td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {school.category}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => handleViewSchool(school)}
                        title="View School Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Building2 size={40} />
            <p className={styles.emptyStateTitle}>No schools registered yet</p>
            <p className={styles.emptyStateText}>
              Start by adding institutions to the blockchain using the button
              above.
            </p>
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      {showAddForm && (
        <div className={styles.overlayBackdrop} onClick={() => setShowAddForm(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Add Institution</h2>
                <div className={styles.subtle}>
                  Register schools in a specific district and zone.
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* File Upload */}
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
                      {schoolNames.length > 0 && (
                        <span className={styles.extractedCount}>
                          {schoolNames.length} schools ready
                        </span>
                      )}
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
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                    required
                  />
                  <div className={styles.uploadContent}>
                    <Upload className={styles.uploadIcon} />
                    <p className={styles.uploadText}>
                      Upload Excel file with school names
                    </p>
                    <span className={styles.fileTypes}>
                      Supported: .xlsx, .xls
                    </span>
                  </div>
                </label>
              )}

              {isProcessing && (
                <div className={`${styles.alert} ${styles.alertInfo}`}>
                  <RefreshCw size={16} className={styles.spinner} />
                  <span>Processing Excel file…</span>
                </div>
              )}

              {uploadError && (
                <div className={`${styles.alert} ${styles.alertDanger}`}>
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="schoolCode">
                    School Code
                  </label>
                  <input
                    type="text"
                    id="schoolCode"
                    name="schoolCode"
                    value={formData.schoolCode}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Enter school code"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="district">
                    District
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  >
                    <option value="">Select District</option>
                    {malawiDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="zone">
                    Zone
                  </label>
                  <input
                    type="text"
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Enter zone"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              {schoolNames.length > 0 && (
                <div className={styles.previewSection}>
                  <div className={styles.schoolNamesList}>
                    {schoolNames.slice(0, 10).map((name, index) => (
                      <span key={index} className={styles.schoolNameTag}>
                        {name}
                      </span>
                    ))}
                    {schoolNames.length > 10 && (
                      <span className={styles.moreCount}>
                        +{schoolNames.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {transactionError && (
                <div className={`${styles.alert} ${styles.alertDanger}`}>
                  <AlertCircle size={16} />
                  <span>{transactionError}</span>
                </div>
              )}

              {!isConnected && (
                <div className={`${styles.alert} ${styles.alertWarning}`}>
                  <Info size={16} />
                  <span>
                    Please connect your wallet to register institutions.
                  </span>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className={styles.btnPrimary}
                    disabled={isSubmitting}
                    style={{ marginLeft: 'auto' }}
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={styles.btnGhost}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className={styles.btnPrimary}
                disabled={
                  isSubmitting || !isConnected || schoolNames.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className={styles.spinner} />
                    Registering…
                  </>
                ) : (
                  <>
                    <Building2 size={14} />
                    Register Institutions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View School Details Modal */}
      {showSchoolModal && selectedSchool && (
        <div className={styles.overlayBackdrop} onClick={handleCloseModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selectedSchool.category}</div>
                <h2 className={styles.modalTitle}>
                  {selectedSchool.schoolName}
                </h2>
              </div>
              <button
                className={styles.closeBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>School Name</span>
                  <span className={styles.detailValue}>
                    {selectedSchool.schoolName}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>School Code</span>
                  <span className={styles.detailValue}>
                    {selectedSchool.schoolCode}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>District</span>
                  <span className={styles.detailValue}>
                    {selectedSchool.district}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Zone</span>
                  <span className={styles.detailValue}>
                    {selectedSchool.zone}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>
                    {selectedSchool.category}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInstitutions;