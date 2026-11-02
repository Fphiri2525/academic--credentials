import { certByStatus } from '../../constants/dashboard';
import styles from './Dashboard.module.css';

export default function CertStatusBar() {
  const total = certByStatus.reduce((n, c) => n + c.value, 0);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Certificates by status</h2>

      <div className={styles.progressList}>
        {certByStatus.map((c) => {
          const pct = (c.value / total) * 100;
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