import React, { useState, useEffect } from 'react';
import { Search, Upload, FileText, X, Plus, Eye } from 'lucide-react';
import { useTheme } from './maneb';
import styles from './manageistitution.module.css';
import * as XLSX from 'xlsx';
import { useManebContract } from '../hooks/useSmartContract';
import { useConnectionStatus } from '../hooks/useSmartContract';
import { connectWallet } from '../web3service';

const ManageInstitutions = () => {
  const { darkMode } = useTheme();

  // Smart contract hooks
  const {
    registerSecondarySchools,
    getAllSecondarySchools,
    getTotalSecondarySchools,
  } = useManebContract();
  const { isConnected, connectionStatus, updateStatus } = useConnectionStatus();

  // State for form visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    schoolCode: '',
    district: '',
    zone: '',
    category: ''
  });

  // Malawi's 28 districts
  const malawiDistricts = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
    'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
    'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
    'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe',
    'Rumphi', 'Salima', 'Thyolo', 'Zomba'
  ];

  // State for Excel file and extracted school names
  const [selectedFile, setSelectedFile] = useState(null);
  const [schoolNames, setSchoolNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // State for blockchain transaction
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState('');

  // State for displaying registered schools
  const [registeredSchools, setRegisteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [totalSchools, setTotalSchools] = useState(0);

  // State for school details modal
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  // State for notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Automatically fetch schools data when component loads and user is connected
  useEffect(() => {
    const loadSchoolsData = async () => {
      if (isConnected) {
        await fetchRegisteredSchools();
      }
    };

    loadSchoolsData();
  }, [isConnected]);

  // Show notification function
  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Excel file upload and extraction
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

  // Extract school names from Excel file
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

        // Convert to JSON with headers
        const dataWithHeaders = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        // Also try without headers in case there are no column names
        const dataWithoutHeaders = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (dataWithHeaders.length === 0 && dataWithoutHeaders.length === 0) {
          setUploadError('The Excel file appears to be empty');
          setIsProcessing(false);
          return;
        }

        let extractedNames = [];

        // Method 1: Try to extract from named columns
        if (dataWithHeaders.length > 0) {
          extractedNames = dataWithHeaders.map((row, index) => {
            const schoolName = row['School Name'] ||
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
          }).filter(name => name && name.length > 0 && name !== 'School Name' && name !== 'Name');
        }

        // Method 2: If no valid names found, try first column from headerless data
        if (extractedNames.length === 0 && dataWithoutHeaders.length > 0) {
          extractedNames = dataWithoutHeaders.map((row, index) => {
            if (Array.isArray(row) && row.length > 0 && row[0]) {
              const schoolName = String(row[0]).trim();
              if (schoolName.toLowerCase().includes('school') && schoolName.toLowerCase().includes('name')) {
                return null;
              }
              return schoolName;
            }
            return null;
          }).filter(name => name && name.length > 0);
        }

        if (extractedNames.length === 0) {
          setUploadError('No valid school names found in the Excel file. Please ensure the first column contains school names.');
          setIsProcessing(false);
          return;
        }

        // Remove duplicates and clean up names
        const cleanedNames = [...new Set(extractedNames)].map(name =>
          name.replace(/\s+/g, ' ').trim()
        ).filter(name => name.length > 0);

        setSchoolNames(cleanedNames);
        setIsProcessing(false);

      } catch (error) {
        setUploadError(`Error reading Excel file: ${error.message}. Please check the file format.`);
        setIsProcessing(false);
      }
    };

    fileReader.onerror = () => {
      setUploadError('Error reading file. Please try again.');
      setIsProcessing(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  // Remove uploaded file
  const removeFile = () => {
    setSelectedFile(null);
    setSchoolNames([]);
    setUploadError('');
    setUploadSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setTransactionError('');
    setTransactionSuccess('');
    setUploadError('');

    // Enhanced validation
    if (!selectedFile) {
      setUploadError('Please upload an Excel file containing school names');
      return;
    }

    if (!schoolNames || schoolNames.length === 0) {
      setUploadError('No school names extracted from Excel file. Please check the file format and ensure it contains school names.');
      return;
    }

    // Validate school names are not empty or invalid
    const validSchoolNames = schoolNames.filter(name =>
      name &&
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.trim().length < 200
    );

    if (validSchoolNames.length === 0) {
      setUploadError('No valid school names found. Please ensure your Excel file contains proper school names.');
      return;
    }

    if (!isConnected) {
      setTransactionError('Please connect your wallet to submit institution data');
      return;
    }

    if (!formData.schoolCode || !formData.district || !formData.zone || !formData.category) {
      setTransactionError('Please fill in all required fields (School Code, District, Zone, Category)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare and validate final parameters
      const finalParams = {
        schoolNames: validSchoolNames,
        schoolCode: formData.schoolCode.trim(),
        district: formData.district.trim(),
        zone: formData.zone.trim(),
        category: formData.category.trim()
      };

      // Additional validation
      if (finalParams.schoolNames.some(name => !name || name.length === 0)) {
        throw new Error('Some school names are empty or invalid');
      }

      if (!finalParams.schoolCode || finalParams.schoolCode.length === 0) {
        throw new Error('School code cannot be empty');
      }

      // Call the smart contract function with validated data
      const result = await registerSecondarySchools(
        finalParams.schoolNames,
        finalParams.schoolCode,
        finalParams.district,
        finalParams.zone,
        finalParams.category
      );

      // Show success notification
      showNotificationMessage(`🎉 Successfully registered ${finalParams.schoolNames.length} institutions!`);

      // Refresh the schools list to show the newly added schools
      await fetchRegisteredSchools();

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      let errorMessage = 'Transaction failed. Please try again.';
      if (error.message.includes('Internal JSON-RPC error')) {
        errorMessage = 'Invalid transaction data. Please check all fields and try again.';
      } else if (error.message.includes('Network error')) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error.message.includes('Contract connection failed')) {
        errorMessage = 'Smart contract connection failed. Please refresh and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTransactionError(`Failed to register institutions: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch all registered secondary schools
  const fetchRegisteredSchools = async () => {
    try {
      setIsLoadingSchools(true);
      setTransactionError('');

      // Get total count first
      const total = await getTotalSecondarySchools();
      setTotalSchools(parseInt(total) || 0);

      // Get all schools data
      const schoolsData = await getAllSecondarySchools();

      // Process the data based on the contract structure
      let processedSchools = [];

      if (Array.isArray(schoolsData) && schoolsData.length > 0) {
        processedSchools = schoolsData.map((school, index) => ({
          id: index + 1,
          schoolName: school.schoolName || school[0] || '',
          schoolCode: school.schoolCode || school[1] || '',
          district: school.district || school[2] || '',
          zone: school.zone || school[3] || '',
          category: school.category || school[4] || '',
          registered: school.registered !== undefined ? school.registered : (school[5] || true)
        }));
      }

      setRegisteredSchools(processedSchools);

    } catch (error) {
      setTransactionError(`Failed to fetch schools: ${error.message}`);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Handle view school details
  const handleViewSchool = (school) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowSchoolModal(false);
    setSelectedSchool(null);
  };

  // Connect wallet function
  const handleConnectWallet = async () => {
    try {
      setTransactionError('');
      setTransactionSuccess('');

      await connectWallet();
      await updateStatus();
      showNotificationMessage('✅ Wallet connected successfully!');
    } catch (error) {
      setTransactionError(`Wallet connection failed: ${error.message}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      schoolCode: '',
      district: '',
      zone: '',
      category: ''
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

  return (
    <div className={styles.contentCard}>
      {/* Notification Popup */}
      {showNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <span className={styles.notificationIcon}>✅</span>
            <span className={styles.notificationMessage}>{notificationMessage}</span>
            <button 
              className={styles.notificationClose}
              onClick={() => setShowNotification(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerContent}>
          <h2 className={styles.pageTitle}>Manage Institutions</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.addInstitutionBtn}
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={20} />
              Add Institution
            </button>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search institutions..."
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Institution Form Overlay */}
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Institution</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowAddForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.institutionForm}>
              {/* File Upload Section */}
              <div className={styles.uploadSection}>
                {selectedFile ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileInfo}>
                      <FileText className={styles.fileIcon} />
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{selectedFile.name}</span>
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
                      <span className={styles.fileTypes}>Supported: .xlsx, .xls</span>
                    </div>
                  </label>
                )}

                {isProcessing && (
                  <div className={styles.processingMessage}>
                    Processing Excel file...
                  </div>
                )}

                {uploadError && (
                  <div className={styles.errorMessage}>
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="schoolCode" className={styles.formLabel}>
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
                  <label htmlFor="district" className={styles.formLabel}>
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
                    {malawiDistricts.map((district, index) => (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="zone" className={styles.formLabel}>
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
                  <label htmlFor="category" className={styles.formLabel}>
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

              {/* Extracted School Names Preview */}
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

              {/* Blockchain Messages */}
              {transactionError && (
                <div className={styles.errorMessage}>
                  {transactionError}
                </div>
              )}

              {!isConnected && (
                <div className={styles.warningMessage}>
                  <div>Please connect your wallet to register institutions</div>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className={styles.connectWalletBtn}
                    disabled={isSubmitting}
                  >
                    Connect Wallet
                  </button>
                </div>
              )}

              {/* Form Actions */}
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting || !isConnected || schoolNames.length === 0}
                >
                  {isSubmitting ? 'Registering...' : 'Register Institutions'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={styles.btnSecondary}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools List Card */}
      <div className={styles.schoolsCard}>
        <div className={styles.schoolsHeader}>
          <h3 className={styles.schoolsTitle}>Registered Schools</h3>
          <button
            onClick={fetchRegisteredSchools}
            className={styles.refreshBtn}
            disabled={isLoadingSchools}
          >
            {isLoadingSchools ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {isLoadingSchools ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading registered schools...</p>
          </div>
        ) : registeredSchools.length > 0 ? (
          <div className={styles.schoolsTable}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>School Name</th>
                  <th>School Code</th>
                  <th>District</th>
                  <th>Zone</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredSchools.map((school) => (
                  <tr key={school.id}>
                    <td>{school.id}</td>
                    <td className={styles.schoolNameCell}>{school.schoolName}</td>
                    <td className={styles.schoolCodeCell}>{school.schoolCode}</td>
                    <td className={styles.districtCell}>{school.district}</td>
                    <td className={styles.zoneCell}>{school.zone}</td>
                    <td className={styles.categoryCell}>
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
          <div className={styles.emptySchoolsState}>
            <div className={styles.emptyIcon}>
              <FileText size={48} />
            </div>
            <h4 className={styles.emptyTitle}>No Schools Registered Yet</h4>
            <p className={styles.emptyDescription}>
              Start by adding some institutions to the blockchain.
            </p>
          </div>
        )}
      </div>

      {/* School Details Modal */}
      {showSchoolModal && selectedSchool && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>School Details</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.schoolDetailCard}>
                <div className={styles.schoolDetailRow}>
                  <span className={styles.detailLabel}>School Name:</span>
                  <span className={styles.detailValue}>{selectedSchool.schoolName}</span>
                </div>
                <div className={styles.schoolDetailRow}>
                  <span className={styles.detailLabel}>School Code:</span>
                  <span className={styles.detailValue}>{selectedSchool.schoolCode}</span>
                </div>
                <div className={styles.schoolDetailRow}>
                  <span className={styles.detailLabel}>District:</span>
                  <span className={styles.detailValue}>{selectedSchool.district}</span>
                </div>
                <div className={styles.schoolDetailRow}>
                  <span className={styles.detailLabel}>Zone:</span>
                  <span className={styles.detailValue}>{selectedSchool.zone}</span>
                </div>
                <div className={styles.schoolDetailRow}>
                  <span className={styles.detailLabel}>Category:</span>
                  <span className={styles.detailValue}>{selectedSchool.category}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCloseButton}
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