import React, { useState, useEffect } from 'react';
import styles from './stock.module.css';
import { useAccreditationManagement, useConnectionStatus } from '../hooks/useSmartContract';

const Stockpage = ({ isDark, showSuccessNotification, showErrorNotification, showInfoNotification }) => {
  const [activeForm, setActiveForm] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState({});
  const [expandedUniversities, setExpandedUniversities] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    getAllAccreditedUniversities, 
    addAccreditedUniversity, 
    addProgram,
    getProgramsByUniversity,
    loading, 
    error
  } = useAccreditationManagement();

  const { isConnected } = useConnectionStatus();

  const [universityForm, setUniversityForm] = useState({
    universityName: '',
    category: '',
    contactInfo: '',
  });

  const [programForm, setProgramForm] = useState({
    institutionName: '',
    programName: '',
    programType: '',
    accreditationDate: ''
  });

  const fetchUniversities = async () => {
    try {
      if (!isConnected) {
        setUniversities([]);
        return;
      }

      const universitiesData = await getAllAccreditedUniversities();
      
      if (universitiesData && Array.isArray(universitiesData)) {
        setUniversities(universitiesData);
      } else {
        setUniversities([]);
      }
    } catch (error) {
      setUniversities([]);
      if (showErrorNotification) {
        showErrorNotification(`Error fetching universities: ${error.message}`);
      }
    }
  };

  const fetchPrograms = async (universityName) => {
    try {
      if (!isConnected) {
        setPrograms(prev => ({ ...prev, [universityName]: [] }));
        return;
      }

      const programsData = await getProgramsByUniversity(universityName);
      setPrograms(prev => ({ ...prev, [universityName]: programsData }));
    } catch (error) {
      setPrograms(prev => ({ ...prev, [universityName]: [] }));
      if (showErrorNotification) {
        showErrorNotification(`Error fetching programs: ${error.message}`);
      }
    }
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    
    if (!universityForm.universityName.trim() || !universityForm.category.trim() || !universityForm.contactInfo.trim()) {
      if (showErrorNotification) {
        showErrorNotification('Please fill in all fields');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      await addAccreditedUniversity({
        institutionName: universityForm.universityName.trim(),
        category: universityForm.category.trim(),
        contactInfo: universityForm.contactInfo.trim()
      });

      setUniversityForm({
        universityName: '',
        category: '',
        contactInfo: '',
      });

      await fetchUniversities();

      if (showSuccessNotification) {
        showSuccessNotification('University added successfully!');
      }
      setActiveForm(null);

    } catch (error) {
      if (showErrorNotification) {
        showErrorNotification(`Error adding university: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    

    if (!programForm.institutionName.trim() || !programForm.programName.trim() ||
        !programForm.programType.trim() || !programForm.accreditationDate.trim()) {
      console.log('❌ Validation failed - missing fields');
      if (showErrorNotification) {
        showErrorNotification('Please fill in all program fields');
      }
      return;
    }

    try {
      setIsSubmitting(true);
    

      const programData = {
        institutionName: programForm.institutionName.trim(),
        programName: programForm.programName.trim(),
        programType: programForm.programType.trim(),
        accreditationDate: programForm.accreditationDate.trim()
      };

      console.log('📤 Sending program data:', programData);

      await addProgram(programData);

      console.log('✅ Program added successfully to certificate secure system!');

      setProgramForm({
        institutionName: '',
        programName: '',
        programType: '',
        accreditationDate: ''
      });

      if (programForm.institutionName) {
        console.log('🔄 Refreshing programs for:', programForm.institutionName);
        await fetchPrograms(programForm.institutionName);
      }

      if (showSuccessNotification) {
        showSuccessNotification('Program added successfully to certificate secure system!');
      }
      setActiveForm(null);
      console.log('🎉 Add program process completed successfully!');

    } catch (error) {
      console.error('❌ Error adding program:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      let errorMessage = 'Failed to add program. Please try again.';

      // Handle specific error types
      if (error.message.includes('out of gas')) {
        errorMessage = 'Transaction failed due to insufficient gas. Please try again.';
      } else if (error.message.includes('User denied transaction')) {
        errorMessage = 'Transaction was cancelled. Please try again.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas. Please add more ETH to your wallet.';
      }

      if (showErrorNotification) {
        showErrorNotification(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Add program process finished');
    }
  };

  const handleUniversityFormChange = (e) => {
    const { name, value } = e.target;
    setUniversityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgramFormChange = (e) => {
    const { name, value } = e.target;
    setProgramForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewPrograms = async (universityName) => {
    const newExpanded = new Set(expandedUniversities);
    if (newExpanded.has(universityName)) {
      newExpanded.delete(universityName);
    } else {
      newExpanded.add(universityName);
      if (!programs[universityName]) {
        await fetchPrograms(universityName);
      }
    }
    setExpandedUniversities(newExpanded);
  };

  const handleAddProgramForUniversity = (universityName) => {
    setActiveForm('program');
    setProgramForm(prev => ({
      ...prev,
      institutionName: universityName
    }));
  };

  useEffect(() => {
    if (isConnected) {
      fetchUniversities();
    }
  }, [isConnected]);

  return (
    <div className={`${styles.container} ${isDark ? styles.darkMode : ''}`}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.header}>
          
          <div className={styles.headerActions}>
            <button
              onClick={() => setActiveForm('university')}
              className={styles.addButton}
              disabled={isSubmitting}
            >
              Add University
            </button>
            <button
              onClick={() => setActiveForm('program')}
              className={styles.addButton}
              disabled={isSubmitting}
            >
              Add Program
            </button>
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className={styles.connectionWarning}>
            ⚠️ Please connect your wallet to interact with the blockchain
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Processing universities details...</p>
          </div>
        )}

        {/* Overlay Forms */}
        {activeForm && (
          <div className={`${styles.formOverlay} ${isDark ? styles.darkMode : ''}`}>
            <div className={styles.formTitle}>
              {activeForm === 'university' ? 'Add New University' : 'Add New Program'}
              <button
                onClick={() => setActiveForm(null)}
                className={styles.closeFormButton}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            
            {activeForm === 'university' ? (
              <form onSubmit={handleAddUniversity} className={styles.universityForm}>
                <div className={styles.formGroup}>
                  <label>University Name *</label>
                  <input
                    type="text"
                    name="universityName"
                    value={universityForm.universityName}
                    onChange={handleUniversityFormChange}
                    placeholder="Enter university name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    name="category"
                    value={universityForm.category}
                    onChange={handleUniversityFormChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    <option value="Public University">Public University</option>
                    <option value="Private University">Private University</option>
                    <option value="College">College</option>
                    <option value="Institute">Institute</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Contact Information *</label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={universityForm.contactInfo}
                    onChange={handleUniversityFormChange}
                    placeholder="Phone, email, or address"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !isConnected}
                    className={styles.submitButton}
                  >
                    {isSubmitting ? 'Adding to Blockchain...' : 'Add University'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    disabled={isSubmitting}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddProgram} className={styles.programForm}>
                <div className={styles.formGroup}>
                  <label>Institution Name *</label>
                  <select
                    name="institutionName"
                    value={programForm.institutionName}
                    onChange={handleProgramFormChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Institution</option>
                    {/* Default Institutions */}
                    <option value="NCHE">NCHE (National Council for Higher Education)</option>
                    <option value="MANEB">MANEB (Malawi National Examinations Board)</option>
                    {/* Separator */}
                    {universities.length > 0 && (
                      <option disabled>--- Accredited Universities ---</option>
                    )}
                    {/* Accredited Universities */}
                    {universities.map((university) => (
                      <option key={university.id} value={university.name}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                  {!isConnected && (
                    <small style={{ color: '#dc2626', marginTop: '4px', display: 'block' }}>
                      Please connect your wallet to load universities
                    </small>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Program Name *</label>
                  <input
                    type="text"
                    name="programName"
                    value={programForm.programName}
                    onChange={handleProgramFormChange}
                    placeholder="Enter program name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Program Type *</label>
                  <select
                    name="programType"
                    value={programForm.programType}
                    onChange={handleProgramFormChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select program type</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Accreditation Date *</label>
                  <input
                    type="date"
                    name="accreditationDate"
                    value={programForm.accreditationDate}
                    onChange={handleProgramFormChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !isConnected}
                    className={styles.submitButton}
                  >
                    {isSubmitting ? 'Adding to Blockchain...' : 'Add Program'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    disabled={isSubmitting}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Table Section */}
        <div className={`${styles.tableSection} ${activeForm ? styles.formActive : ''}`}>
          <div className={styles.tableHeader}>
            <h2>Accredited Universities</h2>
            <button
              onClick={fetchUniversities}
              disabled={loading || isSubmitting}
              className={styles.refreshButton}
            >
              Refresh List
            </button>
          </div>

          {universities.length > 0 ? (
            <table className={`${styles.dataTable} ${isDark ? styles.darkMode : ''}`}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Contact Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university, index) => (
                  <React.Fragment key={index}>
                    <tr className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td>{university.name}</td>
                      <td>{university.category}</td>
                      <td>{university.contactInfo}</td>
                      <td className={styles.actionsCell}>
                        <button
                          onClick={() => handleViewPrograms(university.name)}
                          className={styles.viewButton}
                        >
                          {expandedUniversities.has(university.name) ? 'Close Programs' : 'View Programs'}
                        </button>
                        <button
                          onClick={() => handleAddProgramForUniversity(university.name)}
                          className={styles.addProgramButton}
                        >
                          Add Program
                        </button>
                      </td>
                    </tr>
                    {expandedUniversities.has(university.name) && (
                      <tr>
                        <td colSpan="4" className={styles.programsRow}>
                          <div className={`${styles.programsSection} ${isDark ? styles.darkMode : ''}`}>
                            <div className={styles.programsHeader}>
                              <h3>Programs for {university.name}</h3>
                              <button 
                                onClick={() => setExpandedUniversities(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(university.name);
                                  return newSet;
                                })}
                                className={styles.closeButton}
                              >
                                Close
                              </button>
                            </div>
                            {programs[university.name] && programs[university.name].length > 0 ? (
                              <table className={styles.programsTable}>
                                <thead>
                                  <tr>
                                    <th>Program Name</th>
                                    <th>Program Type</th>
                                    <th>Accreditation Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {programs[university.name].map((program, programIndex) => (
                                    <tr key={programIndex} className={programIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                      <td>{program.name}</td>
                                      <td>{program.programType}</td>
                                      <td>{program.accreditationDate}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className={styles.noPrograms}>No programs found for {university.name}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`${styles.emptyState} ${isDark ? styles.darkMode : ''}`}>
              <p>No universities found. {!isConnected && 'Connect your wallet to view universities.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stockpage;