import styles from './LogoutModal.module.css';

export default function LogoutModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Confirm Logout</h3>
        <p className={styles.text}>
          Are you sure you want to logout? You will need to login again to access the system.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancel</button>
          <button className={styles.confirm} onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
}