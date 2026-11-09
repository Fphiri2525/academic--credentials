import styles from './Dashboard.module.css';

// `data` is [{ label, value, color }]. Dashboard passes live numbers from the contract.
export default function CertStatusBar({ data = [] }) {
  const total = data.reduce((n, c) => n + c.value, 0);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Certificates by status</h2>

      <div className={styles.progressList}>
        {data.map((c) => {
          const pct = total ? (c.value / total) * 100 : 0;
          return (
            <div key={c.label} className={styles.progressRow}>
              <div className={styles.progressHead}>
                <span className={styles.progressLabel}>
                  <span
                    className={styles.chipDot}
                    style={{ background: c.color, width: 8, height: 8 }}
                  />
                  {c.label}
                </span>
                <span className={styles.progressValue}>
                  <strong>{c.value.toLocaleString()}</strong> &nbsp;·&nbsp; {pct.toFixed(1)}%
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: c.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}