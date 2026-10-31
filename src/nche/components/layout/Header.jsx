import { useEffect, useRef, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import {
  Search, Bell, Moon, Sun, LogOut, PanelLeftOpen, PanelLeftClose,
} from 'lucide-react';
import styles from './Header.module.css';

export default function Header({
  sidebarOpen, onToggleSidebar, isMobile,
  searchQuery, onSearchChange,
  isDark, onToggleTheme,
  userName, loadingUser,
  pendingCount, onBellClick,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!profileRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header
      className={styles.header}
      style={{
        left: isMobile ? 0 : sidebarOpen ? 240 : 64,
        width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? 240 : 64}px)`,
      }}
    >
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onToggleSidebar} aria-label="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {!isMobile && (
          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search certificate, student, or university"
              className={styles.searchInput}
            />
          </div>
        )}
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={onBellClick} aria-label="Notifications">
          <Bell size={20} />
          {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
        </button>

        <button className={styles.iconBtn} onClick={onToggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={styles.profile} ref={profileRef}>
          <button className={styles.profileBtn} onClick={() => setMenuOpen(v => !v)}>
            <FaUserCircle size={28} />
            {sidebarOpen && !isMobile && (
              <div className={styles.profileMeta}>
                <span className={styles.profileName}>{loadingUser ? '…' : userName}</span>
                <span className={styles.profileRole}>Administrator</span>
              </div>
            )}
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              <div className={styles.menuHeader}>
                <strong>{loadingUser ? '…' : userName}</strong>
                <span>Administrator</span>
              </div>
              <button
                className={styles.logoutBtn}
                onClick={() => { setMenuOpen(false); onLogout(); }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}