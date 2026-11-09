import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './UniversitiesPage.module.css';
import { useAccreditationManagement, useConnectionStatus } from '../../../hooks/useSmartContract';

import FormOverlay from './FormOverlay';
import UniversityForm from './UniversityForm';
import ProgramForm from './ProgramForm';

// ---- Status helpers (enum: 0 = Active, 1 = Suspended) ----
const STATUS_LABELS = ['Active', 'Suspended'];
const getStatusLabel = (s) => STATUS_LABELS[Number(s)] ?? 'Unknown';

function StatusBadge({ status }) {
  const isActive = Number(status) === 0;
  return (
    <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeSuspended}`}>
      {getStatusLabel(status)}
    </span>
  );
}

// ---- Normalizers: work with named fields, raw arrays, or a struct nested in `name` ----
const toText = (v) =>
  v === null || v === undefined || typeof v === 'object' ? '' : String(v);

// If the hook wrapped the struct inside `name`, unwrap it
const unwrap = (x) =>
  x && typeof x.name === 'object' && x.name !== null ? x.name : x;

const normalizeUniversity = (raw) => {
  const u = unwrap(raw);
  return {
    name: toText(u.name ?? u[0]),
    category: toText(u.category ?? u[1]),
    contactInfo: toText(u.contactInfo ?? u[2]),
    status: Number(u.status ?? u[3] ?? 0),
  };
};

const normalizeProgram = (raw) => {
  const p = unwrap(raw);
  return {
    institutionName: toText(p.institutionName ?? p[0]),
    programName: toText(p.programName ?? p[1]),
    programType: toText(p.programType ?? p[2]),
    accreditationDate: toText(p.accreditationDate ?? p[3]),
    status: Number(p.status ?? p[4] ?? 0),
  };
};

export default function UniversitiesPage({ showSuccessNotification, showErrorNotification }) {
  const [activeForm, setActiveForm] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState({});
  const [viewingUniversity, setViewingUniversity] = useState(null); // university object shown in the popup
  const [programsLoading, setProgramsLoading] = useState(false);
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
      const data = await getAllAccreditedUniversities();
      setUniversities(Array.isArray(data) ? data.map(normalizeUniversity) : []);
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
      const data = await getProgramsByUniversity(universityName);
      setPrograms((prev) => ({
        ...prev,
        [universityName]: Array.isArray(data) ? data.map(normalizeProgram) : [],
      }));
    } catch (error) {
      setPrograms((prev) => ({ ...prev, [universityName]: [] }));
      showErrorNotification?.(`Error fetching programs: ${error.message}`);
    }
  };

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
        await fetchPrograms(data.institutionName.trim());
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

  const handleViewPrograms = async (university) => {
    setViewingUniversity(university);
    setProgramsLoading(true);
    await fetchPrograms(university.name); // always refresh so status is current
    setProgramsLoading(false);
  };

  const closeProgramsModal = () => setViewingUniversity(null);

  // Close the popup with the Escape key
  useEffect(() => {
    if (!viewingUniversity) return;
    const onKey = (e) => e.key === 'Escape' && closeProgramsModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewingUniversity]);

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
        <button
          onClick={() => {
            setDefaultInstitution('');
            setActiveForm('program');
          }}
          className={styles.btnPrimary}
          disabled={isSubmitting}
        >
          Add Program
        </button>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <span className={styles.alertIcon}><AlertTriangle size={18} /></span>
          <div className={styles.alertBody}>Please connect your wallet to interact with the blockchain.</div>
        </div>
      )}

      <div className={`${styles.card} ${activeForm || viewingUniversity ? styles.cardBlurred : ''}`}>
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
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university, index) => {
                  return (
                    <React.Fragment key={`${university.name}-${index}`}>
                      <tr>
                        <td style={{ fontWeight: 500 }}>{university.name}</td>
                        <td>{university.category}</td>
                        <td>{university.contactInfo}</td>
                        <td><StatusBadge status={university.status} /></td>
                        <td>
                          <div className={styles.tableActions}>
                            <button onClick={() => handleViewPrograms(university)} className={styles.btnGhost}>
                              View Programs
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

      {viewingUniversity && (
        <div className={styles.overlayBackdrop} onClick={closeProgramsModal}>
          <div
            className={styles.programsModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="programs-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.programsModalHeader}>
              <div className={styles.programsModalTitleWrap}>
                <h3 id="programs-modal-title" className={styles.programsModalTitle}>
                  {viewingUniversity.name}
                </h3>
                <div className={styles.programsModalMeta}>
                  <span>{viewingUniversity.category || 'Uncategorized'}</span>
                  <StatusBadge status={viewingUniversity.status} />
                  {!programsLoading && (
                    <span className={styles.programsCount}>
                      {(programs[viewingUniversity.name] ?? []).length}{' '}
                      {(programs[viewingUniversity.name] ?? []).length === 1 ? 'program' : 'programs'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeProgramsModal}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.programsModalBody}>
              {programsLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading programs...</p>
                </div>
              ) : (programs[viewingUniversity.name] ?? []).length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      <th>Program Type</th>
                      <th>Accreditation Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs[viewingUniversity.name].map((prog, i) => (
                      <tr key={`${prog.programName}-${i}`}>
                        <td>{prog.programName}</td>
                        <td>{prog.programType}</td>
                        <td>{prog.accreditationDate}</td>
                        <td><StatusBadge status={prog.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>
                  <p>No programs have been added for this university yet.</p>
                </div>
              )}
            </div>

            <div className={styles.programsModalFooter}>
              <button onClick={closeProgramsModal} className={styles.btnGhost}>
                Close
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setDefaultInstitution(viewingUniversity.name);
                  closeProgramsModal();
                  setActiveForm('program');
                }}
              >
                Add Program
              </button>
            </div>
          </div>
        </div>
      )}

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