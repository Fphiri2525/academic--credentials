import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout
import Sidebar  from './components/layout/Sidebar'
import Header from './components/layout/Header';
import Notification from './components/layout/Notification';
import LogoutModal from './components/layout/LogoutModal';
import PageStub from './components/layout/PageStub';

// Hooks
import { useNotification } from './hooks/useNotification';
import { useUser } from './hooks/useUser';

// Existing page components (still in src/Components)
import Dashboard from './components/dashboard/Dashboard';
import Stock from '../Components/Stock';
import Staff from '../Components/Staff';
import Report from '../Components/Report';
import Reports from '../Components/Reports';
import Users from '../Components/Users';
import Login from '../Login';

import styles from './style/Homepage.module.css';

const PENDING_COUNT = 5;

export default function Homepage({ onLogout }) {
  const navigate = useNavigate();
  const { userName, loading: loadingUser } = useUser();
  const notif = useNotification();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState('homepage');
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark);
  }, [isDark]);

  const handleNavigate = (view, title) => {
    setCurrentView(view);
    notif.info(`Opened ${title}`);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    try {
      onLogout?.();
      notif.success('Logged out. Redirectingâ€¦');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      notif.error('Logout failed. Please try again.');
    }
  };

  const common = {
    isDark,
    showSuccessNotification: notif.success,
    showErrorNotification: notif.error,
    showInfoNotification: notif.info,
  };

  const viewComponents = {
    homepage: (
      <Dashboard
        {...common}
        setCurrentView={setCurrentView}
        navigate={navigate}
        userName={userName}
        isLoadingUserName={loadingUser}
      />
    ),
    stock:        <Stock {...common} />,
    programs:     <Staff {...common} />,
    suspensions:  <PageStub title="Suspensions" description="List of suspended universities with reason, date, and a Reinstate action. Populate from the universities table where accreditation_status = 'SUSPENDED'." />,
    foreign:      <PageStub title="Foreign Applications" description="Review applicant details, documents, status history, and Approve / Reject / Request info. Quick actions are available on the dashboard." />,
    certificates: <Reports {...common} />,
    report:       <Report {...common} />,
    audit:        <PageStub title="Audit Logs" description="Every important action: actor, change, and timestamp. Populate from the audit_logs table with filters for user, action, and date." />,
    users:        <Users {...common} />,
    settings:     <PageStub title="Settings" description="Profile, password change, blockchain network settings, and system preferences." />,
    reports:      <Reports {...common} />,
    login:        <Login isDark={isDark} />,
  };

  return (
    <div className={`${styles.app} ${isDark ? 'dark-theme' : ''}`}>
      {isMobile && sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        onToggle={() => setSidebarOpen(v => !v)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <div
        className={styles.main}
        style={{ marginLeft: isMobile ? 0 : sidebarOpen ? 240 : 64 }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDark={isDark}
          onToggleTheme={() => setIsDark(v => !v)}
          userName={userName}
          loadingUser={loadingUser}
          pendingCount={PENDING_COUNT}
          onBellClick={() => handleNavigate('foreign', 'Foreign Applications')}
          onLogout={() => setLogoutOpen(true)}
        />

        <main className={styles.content}>
          {viewComponents[currentView]}
        </main>
      </div>

      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      <Notification
        notification={notif.notification}
        visible={notif.visible}
        onDismiss={notif.dismiss}
      />
    </div>
  );
}
