import { certByYear } from '../../constants/dashboard';
import styles from './Dashboard.module.css';

export default function CertYearChart() {
  const max = Math.max(...certByYear.map((y) => y.value));

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Certificates issued per year</h2>

      <div className={styles.progressList}>
        {certByYear.map((y) => {
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