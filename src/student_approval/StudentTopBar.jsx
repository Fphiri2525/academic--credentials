import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, X } from 'lucide-react';
import styles from './Student.module.css';

export default function StudentTopBar({
  userName,
  loadingUser,
  onReset,
  showReset = false,
  onLogout,
}) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <GraduationCap size={24} className={styles.brandIcon} />
            <h1 className={styles.brandName}>Student Portal</h1>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.userPill}>
              <span className={styles.userName}>
                {loadingUser ? 'Loading…' : userName || 'Student'}
              </span>
              <span className={styles.userRole}>Student</span>
            </div>

            {showReset && onReset && (
              <button className={styles.iconBtn} onClick={onReset} title="Start over">
                <X size={18} />
              </button>
            )}

            <button
              className={styles.logoutBtn}
              onClick={() => setShowLogoutConfirm(true)}
              title="Logout"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className={styles.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm logout</h3>
            <p className={styles.modalText}>
              You will need to log in again to access the student portal.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={confirmLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}