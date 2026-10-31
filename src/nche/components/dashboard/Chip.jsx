import { chipColors } from '../../constants/dashboard';
import styles from './Dashboard.module.css';

export default function Chip({ value }) {
  const color = chipColors[value] || 'var(--text-muted)';
  const label = value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span className={styles.chip}>
      <span className={styles.chipDot} style={{ background: color }} />
      {label}
    </span>
  );
}