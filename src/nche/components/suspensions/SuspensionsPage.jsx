import { useState, useEffect } from "react";
import {
  AlertTriangle,
  RotateCcw,
  Search,
  X,
  Eye,
  Calendar,
  Ban,
  CheckCircle2,
} from "lucide-react";
import styles from "./SuspensionsPage.module.css";

// TODO: replace with API call
const MOCK_SUSPENDED = [
  {
    id: 1,
    name: "Unaccredited College A",
    category: "Private University",
    reason: "Accreditation expired (2024)",
    suspendedAt: "12 Mar 2026",
    suspendedBy: "NCHE Admin",
    certs: 148,
    history: [
      {
        date: "12 Mar 2026",
        action: "Suspended for accreditation expiry",
        by: "NCHE Admin",
      },
      {
        date: "03 Jan 2026",
        action: "Warning issued (accreditation pending renewal)",
        by: "NCHE Admin",
      },
    ],
  },
  {
    id: 2,
    name: "Riverside Business Institute",
    category: "College",
    reason: "Failed quality audit — 3 out of 5 criteria unmet",
    suspendedAt: "02 Feb 2026",
    suspendedBy: "NCHE Admin",
    certs: 42,
    history: [
      {
        date: "02 Feb 2026",
        action: "Suspended after failed quality audit",
        by: "NCHE Admin",
      },
    ],
  },
];

export default function SuspensionsPage({
  showSuccessNotification,
  showErrorNotification,
}) {
  const [rows, setRows] = useState(MOCK_SUSPENDED);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  // State for the custom reinstate modal
  const [reinstateTarget, setReinstateTarget] = useState(null);
  const [reinstateReason, setReinstateReason] = useState("");

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.reason.toLowerCase().includes(query.toLowerCase()),
  );

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelected(null);
        setReinstateTarget(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock page scroll while a modal is open
  const modalOpen = Boolean(selected || reinstateTarget);
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const openReinstateModal = (row) => {
    setReinstateTarget(row);
    setReinstateReason("");
    setSelected(null); // Close the view modal if open
  };

  const handleConfirmReinstate = async () => {
    if (!reinstateReason.trim()) return;

    try {
      setBusyId(reinstateTarget.id);
      // TODO: POST /api/universities/:id/reinstate  { reason: reinstateReason }
      await new Promise((r) => setTimeout(r, 600));

      setRows((list) => list.filter((r) => r.id !== reinstateTarget.id));
      showSuccessNotification?.(`${reinstateTarget.name} reinstated.`);
      setReinstateTarget(null); // Close modal
    } catch {
      showErrorNotification?.("Failed to reinstate university.");
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
            Institutions that cannot add graduates or issue certificates until
            reinstated.
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
          <strong>{rows.length}</strong>{" "}
          {rows.length === 1 ? "university is" : "universities are"} suspended.
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
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td data-label="University">
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{row.name}</span>
                        <span className={styles.subtle}>{row.category}</span>
                      </div>
                    </td>
                    <td data-label="Reason" className={styles.reason}>
                      {row.reason}
                    </td>
                    <td data-label="Suspended">
                      <div className={styles.dateCell}>
                        <span>{row.suspendedAt}</span>
                        <span className={styles.subtle}>
                          by {row.suspendedBy}
                        </span>
                      </div>
                    </td>
                    <td data-label="Certificates">
                      {row.certs.toLocaleString()}
                    </td>
                    <td data-label="Actions">
                      <div className={styles.tableActions}>
                        <button
                          className={styles.btnGhost}
                          onClick={() => setSelected(row)}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className={styles.btnSuccess}
                          onClick={() => openReinstateModal(row)}
                          disabled={busyId === row.id}
                        >
                          <RotateCcw size={14} />
                          Reinstate
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

      {/* 1. View Modal */}
      {selected && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setSelected(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selected.category}</div>
                <h2 className={styles.modalTitle}>{selected.name}</h2>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div
                className={`${styles.alert} ${styles.alertWarning}`}
                style={{ margin: 0 }}
              >
                <Ban size={18} />
                <span>
                  <strong>Currently suspended.</strong> This university cannot
                  issue certificates.
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
                  <div className={styles.metaValue}>
                    {selected.certs.toLocaleString()}
                  </div>
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
                          <Calendar
                            size={12}
                            style={{ verticalAlign: "middle", marginRight: 4 }}
                          />
                          {h.date} · {h.by}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                className={styles.btnSuccess}
                onClick={() => openReinstateModal(selected)}
              >
                <RotateCcw size={14} />
                Reinstate university
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reinstate Modal */}
      {reinstateTarget && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setReinstateTarget(null)}
        >
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Reinstate University</h2>
                <div className={styles.subtle}>{reinstateTarget.name}</div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setReinstateTarget(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="reinstate-reason">
                  Reason for reinstatement
                </label>
                <textarea
                  id="reinstate-reason"
                  className={styles.textarea}
                  placeholder="e.g. Accreditation renewed, audit passed..."
                  value={reinstateReason}
                  onChange={(e) => setReinstateReason(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <p className={styles.fieldHint}>
                  This reason will be recorded in the university's audit
                  history.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={() => setReinstateTarget(null)}
                disabled={busyId !== null}
              >
                Cancel
              </button>
              <button
                className={styles.btnSuccess}
                onClick={handleConfirmReinstate}
                disabled={
                  !reinstateReason.trim() || busyId === reinstateTarget.id
                }
              >
                {busyId === reinstateTarget.id ? (
                  <>Reinstating…</>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirm Reinstate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
