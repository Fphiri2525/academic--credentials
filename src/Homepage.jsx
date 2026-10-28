import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import {
  Search, Bell, Moon, Sun, X, LogOut, PanelLeftOpen, PanelLeftClose,
  LayoutDashboard, GraduationCap, BookOpen, Ban, Globe,
  Award, FileText, ScrollText, Users as UsersIcon, Settings,
} from 'lucide-react';
import Stock from './Components/Stock';
import Users from './Components/Users';
import Staff from './Components/Staff';
import Login from './Login';
import Report from './Components/Report';
import Reports from './Components/Reports';
import Dashboard from './Components/NCHEDashboard';
import styles from './homepage.module.css';

// Sidebar menu. `view` must match a key in viewComponents inside Homepage.
const navItems = [
  { title: 'Dashboard',            view: 'homepage',     icon: <LayoutDashboard size={20} /> },
  { title: 'Universities',         view: 'stock',        icon: <GraduationCap size={20} /> },
  { title: 'Accredited Programs',  view: 'programs',     icon: <BookOpen size={20} /> },
  { title: 'Suspensions',          view: 'suspensions',  icon: <Ban size={20} /> },
  { title: 'Foreign Applications', view: 'foreign',      icon: <Globe size={20} /> },
  { title: 'Certificates',         view: 'certificates', icon: <Award size={20} /> },
  { title: 'Verification Reports', view: 'report',       icon: <FileText size={20} /> },
  { title: 'Audit Logs',           view: 'audit',        icon: <ScrollText size={20} /> },
  { title: 'University Accounts',  view: 'users',        icon: <UsersIcon size={20} /> },
  { title: 'Settings',             view: 'settings',     icon: <Settings size={20} /> },
];

/* Placeholder page for sidebar items you have not built yet. */
const PageStub = ({ title, description, isDark }) => (
  <div
    style={{
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#0f172a',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 10,
      padding: 24,
    }}
  >
    <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>{description}</p>
  </div>
);

const Homepage = ({ onLogout }) => {
  // State
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentView, setCurrentView] = useState('homepage');
  const [userName, setUserName] = useState('');
  const [isLoadingUserName, setIsLoadingUserName] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  // Number shown on the bell: foreign applications waiting for NCHE (replace with an API value)
  const [pendingCount] = useState(5);

  const navigate = useNavigate();

  // ---------- Notifications ----------
  const pushNotification = (type, icon, message, duration) => {
    setNotification({ type, icon, message });
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setTimeout(() => setNotification(null), 300);
    }, duration);
  };

  const showSuccessNotification = (message) => pushNotification('success', '✅', message, 3000);
  const showErrorNotification = (message) => pushNotification('error', '❌', message, 4000);
  const showInfoNotification = (message) => pushNotification('info', 'ℹ️', message, 3000);

  // ---------- Logout ----------
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleLogoutCancel = () => setShowLogoutConfirm(false);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    try {
      if (onLogout) onLogout();
      showSuccessNotification('Successfully logged out. Redirecting to login page...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Logout error:', error);
      showErrorNotification('Logout failed. Please try again.');
    }
  };

  // ---------- User name ----------
  const fetchUserName = () => {
    setIsLoadingUserName(true);
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const { email, name } = JSON.parse(userData);
        setUserName(name || email?.split('@')[0] || 'User');
        showSuccessNotification(`Welcome back, ${name || 'User'}! 👋`);
      } else {
        setUserName('User');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
      showErrorNotification('Failed to load user information');
    } finally {
      setIsLoadingUserName(false);
    }
  };

  // Props shared by every page component
  const common = { isDark, showSuccessNotification, showErrorNotification, showInfoNotification };

  const viewComponents = {
    homepage: (
      <Dashboard
        {...common}
        setCurrentView={setCurrentView}
        navigate={navigate}
        userName={userName}
        isLoadingUserName={isLoadingUserName}
      />
    ),
    stock: <Stock {...common} />, // Universities
    programs: <Staff {...common} />, // Accredited programs
    suspensions: (
      <PageStub
        isDark={isDark}
        title="Suspensions"
        description="List of suspended universities with reason, date suspended, and a Reinstate button. Build this page from the universities table where accreditation_status = 'SUSPENDED'."
      />
    ),
    foreign: (
      <PageStub
        isDark={isDark}
        title="Foreign Applications"
        description="Full review page: applicant details, uploaded documents, status history, and Approve, Reject, or Request more information. Quick Approve and Reject buttons already work from the dashboard."
      />
    ),
    certificates: <Reports {...common} />, // All issued certificates (replace with a Certificates page)
    report: <Report {...common} />, // Verification reports
    audit: (
      <PageStub
        isDark={isDark}
        title="Audit Logs"
        description="Every important action: who did it, what changed, and when. Build this page from the audit_logs table, with filters for user, action, and date."
      />
    ),
    users: <Users {...common} />, // University accounts
    settings: (
      <PageStub
        isDark={isDark}
        title="Settings"
        description="Profile, password change, blockchain network settings, and system preferences."
      />
    ),
    reports: <Reports {...common} />,
    login: <Login isDark={isDark} />,
  };

  // ---------- Effects ----------
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark);
  }, [isDark]);

  useEffect(() => {
    fetchUserName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (newIsMobile && isSidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`${styles.appContainer} ${isDark ? styles.darkTheme : ''}`}>
      {isMobile && isSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={toggleSidebar}></div>
      )}

      <aside
        className={`${styles.appSidebar} ${isSidebarOpen ? styles.open : styles.closed} ${isDark ? styles.darkSidebar : ''}`}
        style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}
      >
        <SidebarHeader
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          isDark={isDark}
        />
        <SidebarNav
          navItems={navItems}
          isSidebarOpen={isSidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          navigate={navigate}
          isDark={isDark}
          showSuccessNotification={showSuccessNotification}
          showErrorNotification={showErrorNotification}
        />
      </aside>

      <div
        className={styles.mainContent}
        style={{
          marginLeft: isMobile ? '0' : isSidebarOpen ? '240px' : '60px',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        }}
      >
        <Header
          toggleSidebar={toggleSidebar}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDark={isDark}
          toggleTheme={toggleTheme}
          isSidebarOpen={isSidebarOpen}
          userName={userName}
          isLoadingUserName={isLoadingUserName}
          isMobile={isMobile}
          handleLogoutClick={handleLogoutClick}
          pendingCount={pendingCount}
          onBellClick={() => setCurrentView('foreign')}
        />
        <main className={styles.mainArea}>{viewComponents[currentView]}</main>
      </div>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${isDark ? styles.darkModal : ''}`}>
            <div className={styles.modalHeader}>
              <h3 className={`${styles.modalTitle} ${isDark ? styles.darkText : ''}`}>Confirm Logout</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={`${styles.modalText} ${isDark ? styles.darkText : ''}`}>
                Are you sure you want to logout? You will need to login again to access the system.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalButton} ${styles.cancelButton} ${isDark ? styles.darkCancelButton : ''}`}
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button className={`${styles.modalButton} ${styles.confirmButton}`} onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`${styles.notificationContainer} ${showNotification ? styles.notificationShow : styles.notificationHide}`}
        >
          <div
            className={`${styles.notification} ${
              styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]
            } ${isDark ? styles.darkNotification : ''}`}
          >
            <span className={styles.notificationIcon}>{notification.icon}</span>
            <span className={styles.notificationMessage}>{notification.message}</span>
            <button
              className={styles.notificationClose}
              onClick={() => {
                setShowNotification(false);
                setTimeout(() => setNotification(null), 300);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarHeader = ({ isSidebarOpen, isMobile, toggleSidebar, isDark }) => (
  <div className={styles.sidebarHeader}>
    <div className={styles.appLogo}>
      {isSidebarOpen ? (
        <h3 className={`${styles.appTitle} ${isDark ? styles.darkText : ''}`} style={{ color: '#2563eb' }}>
          NCHE Dashboard
        </h3>
      ) : (
        <h3 className={styles.appIcon} style={{ color: '#2563eb' }}>
          NCHE
        </h3>
      )}
    </div>
    {isMobile && <X size={24} color={isDark ? '#ffffff' : '#2563eb'} onClick={toggleSidebar} />}
  </div>
);

const SidebarNav = ({
  navItems,
  isSidebarOpen,
  currentView,
  setCurrentView,
  navigate,
  isDark,
  showSuccessNotification,
  showErrorNotification,
}) => (
  <nav className={styles.sidebarNav}>
    {navItems.map((item) => {
      const active = currentView === item.view;
      const color = active ? '#2563eb' : isDark ? '#e2e8f0' : '#64748b';
      return (
        <div
          key={item.title}
          title={item.title}
          className={`${styles.navItem} ${active ? styles.active : ''} ${isDark ? styles.darkNavItem : ''}`}
          onClick={() => {
            try {
              if (item.view) setCurrentView(item.view);
              if (item.path) navigate(item.path);
              if (showSuccessNotification) showSuccessNotification(`Navigated to ${item.title}`);
            } catch (error) {
              console.error('Navigation error:', error);
              if (showErrorNotification) showErrorNotification(`Failed to navigate to ${item.title}`);
            }
          }}
          style={{
            backgroundColor: active ? (isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)') : 'transparent',
            borderLeft: active ? '3px solid #2563eb' : 'none',
          }}
        >
          <span className={styles.navIcon} style={{ color }}>
            {item.icon}
          </span>
          {isSidebarOpen && (
            <span className={`${styles.navText} ${isDark ? styles.darkText : ''}`} style={{ color }}>
              {item.title}
            </span>
          )}
        </div>
      );
    })}
  </nav>
);

const Header = ({
  toggleSidebar,
  searchQuery,
  setSearchQuery,
  isDark,
  toggleTheme,
  isSidebarOpen,
  userName,
  isLoadingUserName,
  isMobile,
  handleLogoutClick,
  pendingCount,
  onBellClick,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => setIsProfileOpen((prev) => !prev);
  const closeProfileMenu = () => setIsProfileOpen(false);

  useEffect(() => {
    if (!isSidebarOpen) closeProfileMenu();
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.profileSection}`)) closeProfileMenu();
    };
    if (isProfileOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header
      className={`${styles.appHeader} ${isDark ? styles.darkHeader : ''}`}
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        left: isMobile ? '0' : isSidebarOpen ? '240px' : '60px',
        width: isMobile ? '100%' : `calc(100% - ${isSidebarOpen ? '240px' : '60px'})`,
      }}
    >
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuButton}
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          {/* Search: certificate number, student name, or university */}
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 16,
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                background: isDark ? '#0f172a' : '#f8fafc',
              }}
            >
              <Search size={16} color={isDark ? '#94a3b8' : '#64748b'} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificate, student, or university"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: 280,
                  color: isDark ? '#e2e8f0' : '#0f172a',
                  fontSize: 14,
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          {/* Bell: foreign applications waiting for review */}
          <button
            onClick={onBellClick}
            title={`${pendingCount} foreign applications waiting`}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              display: 'flex',
            }}
          >
            <Bell size={20} color={isDark ? '#e2e8f0' : '#64748b'} />
            {pendingCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  background: '#dc2626',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 4px',
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <div className={styles.themeToggle} onClick={toggleTheme}>
            {isDark ? <Sun size={20} color="#e2e8f0" /> : <Moon size={20} color="#64748b" />}
          </div>

          <div className={styles.profileSection}>
            <button
              className={styles.profileTrigger}
              onClick={(event) => {
                event.stopPropagation();
                toggleProfileMenu();
              }}
              title="Account menu"
            >
              <div className={styles.profileIcon}>
                <FaUserCircle size={30} color={isDark ? '#e2e8f0' : '#64748b'} />
              </div>
              {isSidebarOpen && (
                <div className={styles.profileInfo}>
                  <span className={`${styles.profileName} ${isDark ? styles.darkText : ''}`}>
                    {isLoadingUserName ? 'Loading...' : userName || 'User'}
                  </span>
                  <span className={`${styles.profileRole} ${isDark ? styles.darkText : ''}`}>NCHE Administrator</span>
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileDropdownHeader}>
                  <span className={styles.profileDropdownName}>
                    {isLoadingUserName ? 'Loading…' : userName || 'User'}
                  </span>
                  <span className={styles.profileDropdownRole}>NCHE Administrator</span>
                </div>
                <hr className={styles.profileDropdownDivider} />
                <div className={styles.profileDropdownFooter}>
                  <button
                    className={styles.profileDropdownButton}
                    onClick={() => {
                      closeProfileMenu();
                      handleLogoutClick();
                    }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Homepage;