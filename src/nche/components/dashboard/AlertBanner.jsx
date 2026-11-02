import styles from './Dashboard.module.css';

export default function AlertBanner({ tone, icon: Icon, children, action }) {
  return (
    <div className={`${styles.alert} ${styles[`alert${tone}`]}`}>
      <span className={styles.alertIcon}><Icon size={18} /></span>
      <div className={styles.alertBody}>{children}</div>
      {action && (
        <button className={styles.alertBtn} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
