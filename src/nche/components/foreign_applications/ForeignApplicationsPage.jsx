import { useState, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle2, XCircle, Globe, X, FileText, Loader2, AlertTriangle, ExternalLink,
} from 'lucide-react';
import styles from './ForeignApplicationsPage.module.css';
import { useCertificateManagement } from '../../../hooks/useSmartContract'; // adjust path to your hook file

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const API = `${API_BASE}/api/student-verifications`;

const STATUS_LABEL = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const fileUrl = (id, type) => `${API}/${encodeURIComponent(id)}/files/${type}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const formatSize = (bytes) => {
  const n = Number(bytes || 0);
  if (!n) return '';
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
};

// Shows an image from the database, or a link for PDFs
function FilePreview({ title, id, type, mimetype, filename, size }) {
  const url = fileUrl(id, type);
  const isImage = (mimetype || '').startsWith('image/');
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.fileCard}>
      <div className={styles.fileHeader}>
        <span className={styles.metaLabel}>{title}</span>
        <a href={url} target="_blank" rel="noreferrer" className={styles.fileLink}>
          Open <ExternalLink size={12} />
        </a>
      </div>

      {isImage && !failed ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={title} className={styles.fileImage} onError={() => setFailed(true)} />
        </a>
      ) : (
        <div className={styles.filePlaceholder}>
          <FileText size={28} />
          <span>{filename || 'Document'}</span>
          <a href={url} target="_blank" rel="noreferrer">View file</a>
        </div>
      )}

      <div className={styles.fileMeta}>
        {filename}{size ? ` · ${formatSize(size)}` : ''}
      </div>
    </div>
  );
}

export default function ForeignApplicationsPage({ showSuccessNotification, showErrorNotification }) {
  const { addForeignVerification } = useCertificateManagement();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(null); // { row, status }
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to load applications');
      setRows(await res.json());
    } catch (err) {
      showErrorNotification?.(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [showErrorNotification]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const filtered = rows.filter((r) =>
    [r.student_name, r.registration_number, r.institution_name, r.award, r.application_id]
      .join(' ').toLowerCase().includes(query.toLowerCase())
  );

  const patchStatus = async (id, verification_status, reviewer_notes) => {
    const res = await fetch(`${API}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status, reviewer_notes }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to update status');
    }
  };

  const openDetails = (row) => { setSelected(row); setNotes(row.reviewer_notes || ''); };
  const closeDetails = () => { if (!busy) { setSelected(null); setNotes(''); } };

  const askConfirm = (status) => {
    if (status === 'REJECTED' && !notes.trim()) {
      showErrorNotification?.('Please add a reviewer note explaining the rejection.');
      return;
    }
    setConfirm({ row: selected, status });
  };

  const handleConfirm = async () => {
    const { row, status } = confirm;
    const note = notes.trim() || null;
    setBusy(true);

    try {
      if (status === 'REJECTED') {
        setStep('Saving decision...');
        await patchStatus(row.application_id, 'REJECTED', note);
        showSuccessNotification?.(`${row.student_name}'s application was rejected.`);
      } else {
        // 1) Approve in the database
        setStep('Saving approval...');
        await patchStatus(row.application_id, 'APPROVED', note);

        // 2) Record on the blockchain (wallet asks the reviewer to sign)
        try {
          setStep('Waiting for blockchain transaction (confirm in your wallet)...');
          await addForeignVerification({
            universityName: row.institution_name,
            studentName: row.student_name,
            programOfStudy: row.program_of_study,
            award: row.award,
            yearOfGraduation: String(row.year_of_graduation),
            registrationNumber: row.registration_number,
          });
        } catch (chainErr) {
          // Roll back so the database and blockchain stay consistent
          await patchStatus(
            row.application_id, 'PENDING',
            'Blockchain registration failed; approval rolled back.'
          ).catch(() => {});
          throw new Error(
            `Blockchain registration failed: ${chainErr?.message || 'unknown error'}. Application kept as Pending.`
          );
        }
        showSuccessNotification?.(`${row.student_name}'s certificate was approved and recorded on the blockchain.`);
      }

      setConfirm(null);
      setSelected(null);
      setNotes('');
      await loadApplications();
    } catch (err) {
      showErrorNotification?.(err.message || 'Failed to update status.');
      setConfirm(null);
      await loadApplications();
    } finally {
      setBusy(false);
      setStep('');
    }
  };

  const chipClass = (s) => `${styles.chip} ${styles[`chip${s}`] || ''}`;
  const isDecided = selected && selected.verification_status !== 'PENDING';

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Foreign Applications</h1>
          <p className={styles.subtitle}>Review qualifications submitted from outside Malawi.</p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reg. number, or ID"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>
            <Loader2 size={28} className={styles.spin} />
            <p>Loading applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Globe size={32} />
            <p>No applications found.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Award</th>
                  <th>Graduated</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.application_id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{row.student_name}</span>
                        <span className={styles.subtle}>{row.registration_number} · {row.institution_name}</span>
                      </div>
                    </td>
                    <td>{row.award}</td>
                    <td>{row.year_of_graduation}</td>
                    <td>{formatDate(row.submitted_at)}</td>
                    <td>
                      <span className={chipClass(row.verification_status)}>
                        {STATUS_LABEL[row.verification_status] || row.verification_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.btnGhost} onClick={() => openDetails(row)}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className={styles.overlayBackdrop} onClick={closeDetails}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selected.application_id}</div>
                <h2 className={styles.modalTitle}>{selected.student_name}</h2>
              </div>
              <button className={styles.closeBtn} onClick={closeDetails}><X size={20} /></button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div><div className={styles.metaLabel}>Registration number</div><div className={styles.metaValue}>{selected.registration_number}</div></div>
                <div><div className={styles.metaLabel}>Institution</div><div className={styles.metaValue}>{selected.institution_name}</div></div>
                <div><div className={styles.metaLabel}>Program of study</div><div className={styles.metaValue}>{selected.program_of_study}</div></div>
                <div><div className={styles.metaLabel}>Award</div><div className={styles.metaValue}>{selected.award}</div></div>
                <div><div className={styles.metaLabel}>Year of graduation</div><div className={styles.metaValue}>{selected.year_of_graduation}</div></div>
                <div><div className={styles.metaLabel}>Submitted</div><div className={styles.metaValue}>{formatDate(selected.submitted_at)}</div></div>
                <div>
                  <div className={styles.metaLabel}>Current status</div>
                  <div className={styles.metaValue}>
                    <span className={chipClass(selected.verification_status)}>
                      {STATUS_LABEL[selected.verification_status] || selected.verification_status}
                    </span>
                  </div>
                </div>
                <div><div className={styles.metaLabel}>Application type</div><div className={styles.metaValue}>{selected.application_type}</div></div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Submitted documents</h3>
                <div className={styles.filesGrid}>
                  <FilePreview
                    title="National ID"
                    id={selected.application_id}
                    type="national-id"
                    mimetype={selected.national_id_mimetype}
                    filename={selected.national_id_filename}
                    size={selected.national_id_size_bytes}
                  />
                  <FilePreview
                    title="Academic certificate"
                    id={selected.application_id}
                    type="certificate"
                    mimetype={selected.certificate_mimetype}
                    filename={selected.certificate_filename}
                    size={selected.certificate_size_bytes}
                  />
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Reviewer notes</h3>
                <textarea
                  className={styles.notes}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your review (required when rejecting)"
                  disabled={busy || isDecided}
                />
              </section>
            </div>

            <div className={styles.modalFooter}>
              {isDecided ? (
                <span className={styles.subtle}>
                  This application was already {STATUS_LABEL[selected.verification_status]?.toLowerCase()}.
                </span>
              ) : (
                <>
                  <button className={styles.btnSuccess} disabled={busy} onClick={() => askConfirm('APPROVED')}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button className={styles.btnDanger} disabled={busy} onClick={() => askConfirm('REJECTED')}>
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation popup */}
      {confirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmBox} role="alertdialog" aria-modal="true">
            <div className={`${styles.confirmIcon} ${confirm.status === 'APPROVED' ? styles.confirmIconOk : styles.confirmIconBad}`}>
              {confirm.status === 'APPROVED' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
            </div>
            <h3 className={styles.confirmTitle}>
              {confirm.status === 'APPROVED' ? 'Approve this application?' : 'Reject this application?'}
            </h3>
            <p className={styles.confirmText}>
              {confirm.status === 'APPROVED' ? (
                <>You are about to approve <strong>{confirm.row.student_name}</strong> ({confirm.row.registration_number}). The certificate will be recorded permanently on the blockchain and your wallet will ask you to sign the transaction.</>
              ) : (
                <>You are about to reject <strong>{confirm.row.student_name}</strong> ({confirm.row.registration_number}). Your note will be saved with the decision.</>
              )}
            </p>

            {busy && (
              <div className={styles.confirmProgress}>
                <Loader2 size={16} className={styles.spin} /> {step}
              </div>
            )}

            <div className={styles.confirmActions}>
              <button className={styles.btnGhost} disabled={busy} onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={confirm.status === 'APPROVED' ? styles.btnSuccess : styles.btnDanger}
                disabled={busy}
                onClick={handleConfirm}
              >
                {busy ? 'Processing...' : confirm.status === 'APPROVED' ? 'Yes, approve' : 'Yes, reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}