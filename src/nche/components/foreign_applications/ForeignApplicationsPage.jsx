import { useState } from 'react';
import {
  Search, CheckCircle2, XCircle, MessageSquare, Globe, X, FileText,
} from 'lucide-react';
import styles from './ForeignApplicationsPage.module.css';

// TODO: replace with GET /api/foreign-applications
const MOCK_APPLICATIONS = [
  {
    id: 'FA-2026-0005', name: 'Chanda Mulenga', country: 'Zambia',
    award: 'BSc Nursing', institution: 'University of Zambia',
    submitted: '10 Mar 2026', status: 'PENDING', email: 'c.mulenga@example.com',
    documents: [
      { name: 'Degree certificate', verified: true },
      { name: 'Transcript', verified: true },
      { name: 'NCHE evaluation', verified: false },
    ],
    history: [
      { date: '10 Mar 2026', action: 'Application submitted', by: 'Applicant' },
      { date: '11 Mar 2026', action: 'Assigned to reviewer', by: 'System' },
    ],
  },
  {
    id: 'FA-2026-0004', name: 'Sarah Mkandawire', country: 'United Kingdom',
    award: 'PhD Economics', institution: 'London School of Economics',
    submitted: '08 Mar 2026', status: 'UNDER_REVIEW', email: 's.mkandawire@example.com',
    documents: [
      { name: 'PhD certificate', verified: true },
      { name: 'Transcript', verified: true },
      { name: 'Thesis abstract', verified: true },
    ],
    history: [
      { date: '08 Mar 2026', action: 'Application submitted', by: 'Applicant' },
      { date: '09 Mar 2026', action: 'Assigned to reviewer', by: 'System' },
      { date: '09 Mar 2026', action: 'Under review', by: 'NCHE Admin' },
    ],
  },
  {
    id: 'FA-2026-0003', name: 'Tendai Moyo', country: 'Zimbabwe',
    award: 'MBA', institution: 'University of Zimbabwe',
    submitted: '05 Mar 2026', status: 'MORE_INFO_NEEDED', email: 't.moyo@example.com',
    documents: [
      { name: 'MBA certificate', verified: true },
      { name: 'Transcript', verified: false },
    ],
    history: [
      { date: '05 Mar 2026', action: 'Application submitted', by: 'Applicant' },
      { date: '06 Mar 2026', action: 'Requested transcript', by: 'NCHE Admin' },
    ],
  },
  {
    id: 'FA-2026-0002', name: 'Amina Hassan', country: 'Tanzania',
    award: 'BEd Mathematics', institution: 'University of Dar es Salaam',
    submitted: '02 Mar 2026', status: 'PENDING', email: 'a.hassan@example.com',
    documents: [
      { name: 'Degree certificate', verified: true },
      { name: 'Transcript', verified: false },
    ],
    history: [
      { date: '02 Mar 2026', action: 'Application submitted', by: 'Applicant' },
    ],
  },
];

const STATUS_LABEL = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under review',
  MORE_INFO_NEEDED: 'More info needed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function ForeignApplicationsPage({ showSuccessNotification, showErrorNotification }) {
  const [rows, setRows] = useState(MOCK_APPLICATIONS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = rows.filter((r) =>
    [r.name, r.country, r.award, r.institution, r.id]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const updateStatus = async (row, status) => {
    try {
      setBusy(true);
      // TODO: POST /api/foreign-applications/:id/decision { status, note }
      await new Promise((r) => setTimeout(r, 500));
      setRows((list) =>
        list.map((r) =>
          r.id === row.id
            ? {
                ...r,
                status,
                history: [
                  ...r.history,
                  {
                    date: new Date().toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    }),
                    action: `Marked ${STATUS_LABEL[status].toLowerCase()}`,
                    by: 'NCHE Admin',
                  },
                ],
              }
            : r
        )
      );
      setSelected((s) => s && { ...s, status });
      showSuccessNotification?.(`${row.id} marked as ${STATUS_LABEL[status].toLowerCase()}.`);
    } catch {
      showErrorNotification?.('Failed to update status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Foreign Applications</h1>
          <p className={styles.subtitle}>
            Review qualifications submitted from outside Malawi.
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, country, or ID"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Globe size={32} />
            <p>No applications match your search.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Country</th>
                  <th>Award</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{row.name}</span>
                        <span className={styles.subtle}>{row.id} · {row.institution}</span>
                      </div>
                    </td>
                    <td>{row.country}</td>
                    <td>{row.award}</td>
                    <td>{row.submitted}</td>
                    <td>
                      <span className={`${styles.chip} ${styles[`chip${row.status.replace(/_/g, '')}`]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.btnGhost} onClick={() => setSelected(row)}>
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Centered modal */}
      {selected && (
        <div className={styles.overlayBackdrop} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selected.id}</div>
                <h2 className={styles.modalTitle}>{selected.name}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Grid of key facts */}
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.metaLabel}>Country</div>
                  <div className={styles.metaValue}>{selected.country}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Email</div>
                  <div className={styles.metaValue}>{selected.email}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Institution</div>
                  <div className={styles.metaValue}>{selected.institution}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Award</div>
                  <div className={styles.metaValue}>{selected.award}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Submitted</div>
                  <div className={styles.metaValue}>{selected.submitted}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Current status</div>
                  <div className={styles.metaValue}>
                    <span className={`${styles.chip} ${styles[`chip${selected.status.replace(/_/g, '')}`]}`}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Documents</h3>
                <ul className={styles.docList}>
                  {selected.documents.map((doc, i) => (
                    <li key={i} className={styles.docItem}>
                      <FileText size={16} className={styles.docIcon} />
                      <span className={styles.docName}>{doc.name}</span>
                      {doc.verified ? (
                        <span className={styles.docVerified}>
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span className={styles.docPending}>Not verified</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              {/* History */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Status history</h3>
                <ul className={styles.timeline}>
                  {selected.history.map((h, i) => (
                    <li key={i} className={styles.timelineItem}>
                      <span className={styles.timelineDot} />
                      <div>
                        <div className={styles.timelineAction}>{h.action}</div>
                        <div className={styles.subtle}>{h.date} · {h.by}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSuccess}
                disabled={busy}
                onClick={() => updateStatus(selected, 'APPROVED')}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                className={styles.btnGhost}
                disabled={busy}
                onClick={() => updateStatus(selected, 'MORE_INFO_NEEDED')}
              >
                <MessageSquare size={16} /> Request info
              </button>
              <button
                className={styles.btnDanger}
                disabled={busy}
                onClick={() => updateStatus(selected, 'REJECTED')}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}