import styles from './Dashboard.module.css';

export default function StatCard({ icon: Icon, label, value, color, loading, onClick }) {
  return (
    <div
      className={`${styles.statCard} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon} style={{ color }}>
          <Icon size={18} />
        </span>
      </div>
      <div className={styles.statValue} style={{ color: loading ? 'var(--text-muted)' : 'var(--text)' }}>
        {loading ? '…' : value.toLocaleString()}
      </div>
    </div>
  );
}