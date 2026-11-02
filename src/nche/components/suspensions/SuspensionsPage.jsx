import { useState } from 'react';
import { AlertTriangle, RotateCcw, Search, X, Eye, Calendar, Ban } from 'lucide-react';
import styles from './SuspensionsPage.module.css';

// TODO: replace with API call
const MOCK_SUSPENDED = [
  {
    id: 1,
    name: 'Unaccredited College A',
    category: 'Private University',
    reason: 'Accreditation expired (2024)',
    suspendedAt: '12 Mar 2026',
    suspendedBy: 'NCHE Admin',
    certs: 148,
    history: [
      { date: '12 Mar 2026', action: 'Suspended for accreditation expiry', by: 'NCHE Admin' },
      { date: '03 Jan 2026', action: 'Warning issued (accreditation pending renewal)', by: 'NCHE Admin' },
    ],
  },
  {
    id: 2,
    name: 'Riverside Business Institute',
    category: 'College',
    reason: 'Failed quality audit — 3 out of 5 criteria unmet',
    suspendedAt: '02 Feb 2026',
    suspendedBy: 'NCHE Admin',
    certs: 42,
    history: [
      { date: '02 Feb 2026', action: 'Suspended after failed quality audit', by: 'NCHE Admin' },
    ],
  },
];

export default function SuspensionsPage({ showSuccessNotification, showErrorNotification }) {
  const [rows, setRows] = useState(MOCK_SUSPENDED);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.reason.toLowerCase().includes(query.toLowerCase())
  );

  const handleReinstate = async (row) => {
    const reason = window.prompt(`Reason for reinstating "${row.name}":`);
    if (!reason) return;
    try {
      setBusyId(row.id);
      // TODO: POST /api/universities/:id/reinstate  { reason }
      await new Promise((r) => setTimeout(r, 600));
      setRows((list) => list.filter((r) => r.id !== row.id));
      setSelected(null);
      showSuccessNotification?.(`${row.name} reinstated.`);
    } catch {
      showErrorNotification?.('Failed to reinstate university.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Suspended Universities</h1>
          <p className={styles.subtitle}>
            Institutions that cannot add graduates or issue certificates until reinstated.
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or reason"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={`${styles.alert} ${styles.alertWarning}`}>
        <AlertTriangle size={18} />
        <span>
          <strong>{rows.length}</strong> {rows.length === 1 ? 'university is' : 'universities are'} suspended.
          Employers see a warning on their certificates.
        </span>
      </div>

      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <RotateCcw size={32} />
            <p>No suspended universities match your search.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>University</th>
                  <th>Reason</th>
                  <th>Suspended</th>
                  <th>Certificates</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{row.name}</span>
                        <span className={styles.subtle}>{row.category}</span>
                      </div>
                    </td>
                    <td className={styles.reason}>{row.reason}</td>
                    <td>
                      <div className={styles.dateCell}>
                        <span>{row.suspendedAt}</span>
                        <span className={styles.subtle}>by {row.suspendedBy}</span>
                      </div>
                    </td>
                    <td>{row.certs.toLocaleString()}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.btnGhost} onClick={() => setSelected(row)}>
                          <Eye size={14} /> View
                        </button>
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleReinstate(row)}
                          disabled={busyId === row.id}
                        >
                          <RotateCcw size={14} />
                          {busyId === row.id ? 'Reinstating…' : 'Reinstate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      {selected && (
        <div className={styles.overlayBackdrop} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selected.category}</div>
                <h2 className={styles.modalTitle}>{selected.name}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={`${styles.alert} ${styles.alertWarning}`} style={{ margin: 0 }}>
                <Ban size={18} />
                <span>
                  <strong>Currently suspended.</strong> This university cannot issue certificates.
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.metaLabel}>Reason</div>
                  <div className={styles.metaValue}>{selected.reason}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Suspended</div>
                  <div className={styles.metaValue}>{selected.suspendedAt}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Suspended by</div>
                  <div className={styles.metaValue}>{selected.suspendedBy}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Certificates affected</div>
                  <div className={styles.metaValue}>{selected.certs.toLocaleString()}</div>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Suspension history</h3>
                <ul className={styles.timeline}>
                  {selected.history.map((h, i) => (
                    <li key={i} className={styles.timelineItem}>
                      <span className={styles.timelineDot} />
                      <div>
                        <div className={styles.timelineAction}>{h.action}</div>
                        <div className={styles.subtle}>
                          <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {h.date} · {h.by}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={() => setSelected(null)}>
                Close
              </button>
              <button
                className={styles.btnSuccess}
                disabled={busyId === selected.id}
                onClick={() => handleReinstate(selected)}
              >
                <RotateCcw size={14} />
                {busyId === selected.id ? 'Reinstating…' : 'Reinstate university'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}