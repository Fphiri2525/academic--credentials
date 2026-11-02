import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Notification.module.css';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function Notification({ notification, visible, onDismiss }) {
  if (!notification) return null;
  const Icon = ICONS[notification.type] || Info;

  return (
    <div className={`${styles.container} ${visible ? styles.show : styles.hide}`}>
      <div className={`${styles.toast} ${styles[notification.type]}`}>
        <Icon size={20} className={styles.icon} />
        <span className={styles.message}>{notification.message}</span>
        <button className={styles.close} onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}