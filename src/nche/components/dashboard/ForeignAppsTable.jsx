import { useState, useEffect } from 'react';
import Chip from './Chip';
import styles from './Dashboard.module.css';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const API = `${API_BASE}/api/student-verifications`;
const MAX_ROWS = 10;

export default function ForeignAppsTable({ onDecide, onView }) {
  const [applications, setApplications] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const [listRes, statsRes] = await Promise.all([
          fetch(`${API}?limit=${MAX_ROWS}`),
          fetch(`${API}/stats/summary`),
        ]);
        if (!listRes.ok) throw new Error('Failed to load applications');

        const rows = await listRes.json();
        const stats = statsRes.ok ? await statsRes.json() : null;
        if (cancelled) return;

        // Map database fields to what the table uses (never more than 10)
        setApplications(
          rows.slice(0, MAX_ROWS).map((r) => ({
            id: r.application_id,
            name: r.student_name,
            institution: r.institution_name,
            award: r.award,
            status: r.verification_status,
          }))
        );
        // Open = all pending applications in the database, not only the 10 shown
        setOpenCount(stats?.status_breakdown?.PENDING ?? rows.filter((r) => r.verification_status === 'PENDING').length);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load applications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Approving needs the documents and a wallet signature, so the buttons open the review page.
  const review = (a, status) => (onDecide ? onDecide(a, status) : onView?.(a));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Foreign applications</h2>
        <span className={styles.muted}>{openCount} open</span>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading applications...</p>
      ) : error ? (
        <p className={styles.muted}>{error}</p>
      ) : applications.length === 0 ? (
        <p className={styles.muted}>No applications yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Award</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const isOpen = a.status === 'PENDING';
                return (
                  <tr key={a.id}>
                    <td>
                      {a.name}
                      <div className={styles.subtle}>{a.institution}</div>
                    </td>
                    <td>{a.award}</td>
                    <td><Chip value={a.status} /></td>
                    <td className={styles.tableAction}>
                      {isOpen ? (
                        <>
                          <button className={styles.btnSuccess} onClick={() => review(a, 'APPROVED')}>
                            Approve
                          </button>
                          <button className={styles.btnDanger} onClick={() => review(a, 'REJECTED')}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <button className={styles.btnGhost} onClick={() => onView?.(a)}>View</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}