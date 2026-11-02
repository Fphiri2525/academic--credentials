import { recentVerifications } from '../../constants/dashboard';
import Chip from './Chip';
import styles from './Dashboard.module.css';

export default function RecentChecks() {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Latest employer checks</h2>
      <ul className={styles.list}>
        {recentVerifications.map((v) => (
          <li key={v.number} className={styles.listRow}>
            <span>
              <code>{v.number}</code>
              <div className={styles.subtle}>{v.time}</div>
            </span>
            <Chip value={v.result} />
          </li>
        ))}
      </ul>
    </div>
  );
}
