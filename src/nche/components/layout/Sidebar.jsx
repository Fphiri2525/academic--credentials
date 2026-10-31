import { NAV_ITEMS } from '../../constants/navigation';
import styles from './Sidebar.module.css';
import { X } from 'lucide-react';

export default function Sidebar({ open, isMobile, onToggle, currentView, onNavigate }) {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <span className={styles.brand}>{open ? 'NCHE' : 'N'}</span>
        {isMobile && (
          <button className={styles.closeBtn} onClick={onToggle} aria-label="Close sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ title, view, Icon }) => {
          const active = currentView === view;
          return (
            <button
              key={title}
              title={title}
              onClick={() => onNavigate(view, title)}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              <Icon size={20} className={styles.icon} />
              {open && <span className={styles.label}>{title}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
