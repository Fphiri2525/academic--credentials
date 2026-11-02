import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout
import Sidebar  from './components/layout/Sidebar'
import Header from './components/layout/Header';
import Notification from './components/layout/Notification';
import LogoutModal from './components/layout/LogoutModal';


// Hooks
import { useNotification } from './hooks/useNotification';
import { useUser } from './hooks/useUser';

import Dashboard from './components/dashboard/Dashboard';
import UniversitiesPage from './components/universities/UniversitiesPage';
import ProgramsPage from './components/programs/ProgramsPage';
import SuspensionsPage from './components/suspensions/SuspensionsPage';
import ForeignApplicationsPage from './components/foreign_applications/ForeignApplicationsPage';
import ReportsPage from './components/reports/ReportsPage';
import AuditLogsPage from './components/audit/AuditLogsPage';
import SettingsPage from './components/settings/SettingsPage';
import Users from '../Components/Users';
import Login from '../Login';

import styles from './style/Homepage.module.css';
import ReportPage from '../MANEB3/Reports';

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
    universities:    <UniversitiesPage {...common} />,
    programs:     <ProgramsPage {...common} />,
    suspensions: <SuspensionsPage {...common} />,
    foreign:     <ForeignApplicationsPage {...common} />,
    certificates: <ReportsPage {...common} />,
    report:       <ReportPage {...common} />,
    audit:         <AuditLogsPage {...common} />,
    users:        <Users {...common} />,
    settings:     <SettingsPage {...common} />,
    reports:      <ReportsPage {...common} />,
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

