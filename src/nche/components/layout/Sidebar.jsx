import { NAV_ITEMS } from '../../constants/navigation';
import styles from './Sidebar.module.css';
import { X } from 'lucide-react';

// Items to hide, and items to rename (matched ignoring upper/lower case)
const HIDDEN = [/^accredited programs?$/i, /^certificates?$/i];
const RENAMES = [
  [/^verification reports?$/i, 'Report'],
  [/^university accounts?$/i, 'Accounts'],
];

const ITEMS = NAV_ITEMS
  .filter(({ title }) => !HIDDEN.some((re) => re.test(title.trim())))
  .map((item) => {
    const hit = RENAMES.find(([re]) => re.test(item.title.trim()));
    return hit ? { ...item, title: hit[1] } : item;
  });

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
        {ITEMS.map(({ title, view, Icon }) => {
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