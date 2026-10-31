import styles from './Dashboard.module.css';

export default function IntegrityPanel({ integrity, onVerify }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Blockchain integrity</h2>

      <div className={styles.kvGrid}>
        <div>
          <div className={styles.kvLabel}>Network</div>
          {integrity.network}
        </div>
        <div>
          <div className={styles.kvLabel}>Latest transaction</div>
          <code>{integrity.lastTx}</code>
        </div>
        <div>
          <div className={styles.kvLabel}>Records checked</div>
          {integrity.checked.toLocaleString()}
        </div>
        <div>
          <div className={styles.kvLabel}>Mismatches</div>
          <strong style={{ color: integrity.mismatches ? 'var(--danger)' : 'var(--success)' }}>
            {integrity.mismatches}
          </strong>
        </div>
      </div>

      <p className={styles.muted}>Last full check: {integrity.lastRun}</p>

      <button className={styles.btnPrimary} onClick={onVerify} disabled={integrity.running}>
        {integrity.running ? 'Checking…' : 'Verify integrity now'}
      </button>
    </div>
  );
}
