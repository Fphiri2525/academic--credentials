import { X, University, Users, Award, Calendar } from 'lucide-react';
import styles from './ProgramsPage.module.css';

export default function DetailsModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Certificate Details</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGroup}>
            <div className={styles.detailIcon}><University size={18} /></div>
            <div>
              <div className={styles.detailLabel}>University</div>
              <div className={styles.detailValue}>{item.universityName}</div>
            </div>
          </div>

          <div className={styles.detailGroup}>
            <div className={styles.detailIcon}><Users size={18} /></div>
            <div>
              <div className={styles.detailLabel}>Student Name</div>
              <div className={styles.detailValue}>{item.studentName}</div>
            </div>
          </div>

          <div className={styles.detailGroup}>
            <div className={styles.detailIcon}><Award size={18} /></div>
            <div>
              <div className={styles.detailLabel}>Program & Award</div>
              <div className={styles.detailValue}>{item.programOfStudy} ({item.award})</div>
            </div>
          </div>

          <div className={styles.detailGroup}>
            <div className={styles.detailIcon}><Calendar size={18} /></div>
            <div>
              <div className={styles.detailLabel}>Graduation Year</div>
              <div className={styles.detailValue}>{item.yearOfGraduation}</div>
            </div>
          </div>

          <div className={styles.detailGroup}>
            <div className={styles.detailIcon}><Users size={18} /></div>
            <div>
              <div className={styles.detailLabel}>Registration Number</div>
              <div className={styles.detailValue}>{item.registrationNumber}</div>
            </div>
          </div>

          {item.hashValue && (
            <div className={styles.hashBox}>
              <div className={styles.detailLabel}>Blockchain Hash</div>
              <code className={styles.hashValue}>{item.hashValue}</code>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}