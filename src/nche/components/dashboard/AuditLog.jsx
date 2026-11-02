import { Ban, Globe, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { auditLog } from '../../constants/dashboard';
import styles from './Dashboard.module.css';

const ICONS = {
  danger:  Ban,
  warning: Globe,
  accent:  GraduationCap,
  success: FileText,
};

export default function AuditLog({ onSeeAll }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Recent actions</h2>
        <button className={styles.btnGhost} onClick={onSeeAll}>See all</button>
      </div>

      <ul className={styles.list}>
        {auditLog.map((a, i) => {
          const Icon = ICONS[a.type] || BookOpen;
          return (
            <li key={i} className={styles.auditRow}>
              <span className={`${styles.auditIcon} ${styles[`audit${a.type}`]}`}>
                <Icon size={16} />
              </span>
              <div>
                {a.msg}
                <div className={styles.subtle}>{a.by} · {a.time}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
