import { X } from 'lucide-react';
import styles from './UniversitiesPage.module.css';

export default function FormOverlay({ title, onClose, children }) {
  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.formOverlay} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formTitle}>
          {title}
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}