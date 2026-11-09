import { useState, useEffect, useCallback } from 'react';
import { useDashboardManagement } from  "../../../hooks/useSmartContract"; // adjust path to src/hooks
import Chip from './Chip';
import styles from './Dashboard.module.css';

const LIMIT = 10;
const POLL_MS = 30000;

export default function RecentChecks() {
  const { getLatestEmployerChecks, listenToEvent } = useDashboardManagement();

  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await getLatestEmployerChecks(LIMIT); // newest first
      setChecks(list.slice(0, LIMIT));
      setError('');
    } catch (err) {
      console.error('Failed to load employer checks:', err);
      setError('Could not load checks from the blockchain.');
    } finally {
      setLoading(false);
    }
  }, [getLatestEmployerChecks]);

  useEffect(() => {
    load();

    // 1) Live updates: refresh whenever the contract emits EmployerCheckLogged
    let subscription;
    try {
      subscription = listenToEvent('certificateManagement', 'EmployerCheckLogged', () => load());
    } catch (err) {
      console.warn('Event listener not available, using polling only:', err);
    }

    // 2) Fallback: poll in case events are not supported by the provider
    const timer = setInterval(load, POLL_MS);

    return () => {
      clearInterval(timer);
      try { subscription?.remove?.(); } catch { /* ignore */ }
    };
  }, [load, listenToEvent]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Latest employer checks</h2>
        <span className={styles.muted}>Live from blockchain</span>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading checks...</p>
      ) : error ? (
        <p className={styles.muted}>{error}</p>
      ) : checks.length === 0 ? (
        <p className={styles.muted}>No employer checks yet.</p>
      ) : (
        <ul className={styles.list}>
          {checks.map((c) => (
            <li key={`${c.registrationNumber}-${c.checkedAt}-${c.id}`} className={styles.listRow}>
              <span>
                <code>{c.registrationNumber}</code>
                <div className={styles.subtle}>{c.checkedDate}</div>
              </span>
              <Chip value={c.resultLabel} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}