import styles from './Dashboard.module.css';

// `data` is [{ year, value }]. Dashboard passes live numbers from the contract.
export default function CertYearChart({ data = [] }) {
  const max = Math.max(1, ...data.map((y) => y.value));

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Certificates issued per year</h2>

      <div className={styles.progressList}>
        {data.map((y) => {
          const pct = (y.value / max) * 100;
          return (
            <div key={y.year} className={styles.progressRow}>
              <div className={styles.progressHead}>
                <span className={styles.progressLabel}>{y.year}</span>
                <span className={styles.progressValue}>
                  <strong>{y.value.toLocaleString()}</strong>
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}