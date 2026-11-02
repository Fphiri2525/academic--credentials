import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './UniversitiesPage.module.css';
import { useAccreditationManagement, useConnectionStatus } from '../../../hooks/useSmartContract';

// New components
import FormOverlay from './FormOverlay';
import UniversityForm from './UniversityForm';
import ProgramForm from './ProgramForm';

export default function UniversitiesPage({ showSuccessNotification, showErrorNotification }) {
  const [activeForm, setActiveForm] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState({});
  const [expandedUniversities, setExpandedUniversities] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultInstitution, setDefaultInstitution] = useState('');

  const {
    getAllAccreditedUniversities,
    addAccreditedUniversity,
    addProgram,
    getProgramsByUniversity,
    loading,
  } = useAccreditationManagement();

  const { isConnected } = useConnectionStatus();

  const fetchUniversities = async () => {
    try {
      if (!isConnected) {
        setUniversities([]);
        return;
      }
      const universitiesData = await getAllAccreditedUniversities();
      setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
    } catch (error) {
      setUniversities([]);
      showErrorNotification?.(`Error fetching universities: ${error.message}`);
    }
  };

  const fetchPrograms = async (universityName) => {
    try {
      if (!isConnected) {
        setPrograms((prev) => ({ ...prev, [universityName]: [] }));
        return;
      }
      const programsData = await getProgramsByUniversity(universityName);
      setPrograms((prev) => ({ ...prev, [universityName]: programsData }));
    } catch (error) {
      setPrograms((prev) => ({ ...prev, [universityName]: [] }));
      showErrorNotification?.(`Error fetching programs: ${error.message}`);
    }
  };

  // Handlers now receive clean data objects from the child forms
  const handleAddUniversity = async (data) => {
    try {
      setIsSubmitting(true);
      await addAccreditedUniversity({
        institutionName: data.universityName.trim(),
        category: data.category.trim(),
        contactInfo: data.contactInfo.trim(),
      });
      await fetchUniversities();
      showSuccessNotification?.('University added successfully!');
      setActiveForm(null);
    } catch (error) {
      showErrorNotification?.(`Error adding university: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProgram = async (data) => {
    try {
      setIsSubmitting(true);
      await addProgram({
        institutionName: data.institutionName.trim(),
        programName: data.programName.trim(),
        programType: data.programType.trim(),
        accreditationDate: data.accreditationDate.trim(),
      });

      if (data.institutionName) {
        await fetchPrograms(data.institutionName);
      }
      showSuccessNotification?.('Program added successfully!');
      setActiveForm(null);
    } catch (error) {
      let errorMessage = 'Failed to add program. Please try again.';
      if (error.message.includes('out of gas')) errorMessage = 'Transaction failed due to insufficient gas.';
      else if (error.message.includes('User denied transaction')) errorMessage = 'Transaction was cancelled.';
      else if (error.message.includes('insufficient funds')) errorMessage = 'Insufficient funds for gas.';
      
      showErrorNotification?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    if (isConnected) {
      fetchUniversities();
    }
  }, [isConnected]);

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <button onClick={() => setActiveForm('university')} className={styles.btnGhost} disabled={isSubmitting}>
          Add University
        </button>
        <button onClick={() => setActiveForm('program')} className={styles.btnPrimary} disabled={isSubmitting}>
          Add Program
        </button>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <span className={styles.alertIcon}><AlertTriangle size={18} /></span>
          <div className={styles.alertBody}>Please connect your wallet to interact with the blockchain.</div>
        </div>
      )}

      <div className={`${styles.card} ${activeForm ? styles.cardBlurred : ''}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Accredited Universities</h2>
          <button onClick={fetchUniversities} disabled={loading || isSubmitting} className={styles.btnGhost}>
            Refresh List
          </button>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading universities...</p>
          </div>
        )}

        {!loading && universities.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university, index) => {
                  const isExpanded = expandedUniversities.has(university.name);
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td style={{ fontWeight: 500 }}>{university.name}</td>
                        <td>{university.category}</td>
                        <td>{university.contactInfo}</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button onClick={() => handleViewPrograms(university.name)} className={styles.btnGhost}>
                              {isExpanded ? 'Hide Programs' : 'View Programs'}
                            </button>
                            <button
                              onClick={() => {
                                setDefaultInstitution(university.name);
                                setActiveForm('program');
                              }}
                              className={styles.btnGhost}
                            >
                              Add Program
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className={styles.programsRow}>
                          <td colSpan="4">
                            <div className={styles.programsWrapper}>
                              <div className={styles.programsHeader}>
                                <h3>Programs for {university.name}</h3>
                                <button
                                  onClick={() => {
                                    const next = new Set(expandedUniversities);
                                    next.delete(university.name);
                                    setExpandedUniversities(next);
                                  }}
                                  className={styles.btnGhost}
                                >
                                  Close
                                </button>
                              </div>
                              {programs[university.name]?.length > 0 ? (
                                <table className={styles.table}>
                                  <thead>
                                    <tr>
                                      <th>Program Name</th>
                                      <th>Program Type</th>
                                      <th>Accreditation Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {programs[university.name].map((prog, i) => (
                                      <tr key={i}>
                                        <td>{prog.name}</td>
                                        <td>{prog.programType}</td>
                                        <td>{prog.accreditationDate}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className={styles.emptyState} style={{ padding: '24px' }}>
                                  No programs found.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && universities.length === 0 && (
          <div className={styles.emptyState}>
            <p>No universities found.</p>
            {!isConnected && <p>Connect your wallet to view universities.</p>}
          </div>
        )}
      </div>

      {activeForm === 'university' && (
        <FormOverlay title="Add New University" onClose={() => setActiveForm(null)}>
          <UniversityForm
            onSubmit={handleAddUniversity}
            onCancel={() => setActiveForm(null)}
            isSubmitting={isSubmitting}
            isConnected={isConnected}
          />
        </FormOverlay>
      )}

      {activeForm === 'program' && (
        <FormOverlay title="Add New Program" onClose={() => setActiveForm(null)}>
          <ProgramForm
            universities={universities}
            onSubmit={handleAddProgram}
            onCancel={() => setActiveForm(null)}
            isSubmitting={isSubmitting}
            isConnected={isConnected}
            defaultInstitution={defaultInstitution}
          />
        </FormOverlay>
      )}
    </div>
  );
}