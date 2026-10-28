import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, GraduationCap, Menu, Sun, Moon, LogOut, ChevronDown, Settings as SettingsIcon, User } from 'lucide-react';
import Graduate from './Grsduate';
import Dashboard from './dashboard';
import SettingsPage from './Settings';
import styles from './university.module.css';
import { useUserManagement, useConnectionStatus, useCertificateManagement, useAccreditationManagement } from '../hooks/useSmartContract';

export default function universitymanagement() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const profileDropdownRef = useRef(null);

  // Use smart contract hooks
  const { getUserDetailsWithInstitution } = useUserManagement();
  const { isConnected } = useConnectionStatus();
  const { getTotalGraduatesByUniversityName, getGraduatesByUniversityName } = useCertificateManagement();
  const { getProgramsByUniversity } = useAccreditationManagement();

  // Add ref to prevent multiple calls
  const hasFetchedUserDetails = useRef(false);
  const hasFetchedDashboardData = useRef(false);
  const dashboardDataFetchKey = useRef('');

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalGraduates: 0,
    recentYearGraduates: 0,
    totalPrograms: 0,
  });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setShowLogoutModal(false);
    setShowLogoutSuccess(true);
    
    // Navigate after showing success message
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user details from blockchain - FIXED to prevent infinite calls
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Prevent multiple calls
      if (hasFetchedUserDetails.current) {
        return;
      }

      try {
        setIsLoadingUserDetails(true);
        
        // Get user email from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setIsLoadingUserDetails(false);
          return;
        }

        const { email } = JSON.parse(userData);

        if (!isConnected) {
          console.warn('Not connected to blockchain');
          setIsLoadingUserDetails(false);
          return;
        }

        // Call getUserDetailsWithInstitution from smart contract
        const details = await getUserDetailsWithInstitution(email);
        console.log('User details with institution from blockchain:', details);
        
        setUserDetails(details);
        hasFetchedUserDetails.current = true; // Mark as fetched
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      } finally {
        setIsLoadingUserDetails(false);
      }
    };

    if (isConnected && !hasFetchedUserDetails.current) {
      fetchUserDetails();
    }
  }, [isConnected]); // Removed getUserDetailsWithInstitution from dependencies

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userDetails?.institution || !isConnected) {
        console.log('⏳ Waiting for user details and connection...');
        return;
      }

      // Create a unique key for this fetch to prevent duplicates
      const fetchKey = `${userDetails.institution}-${isConnected}`;

      // Prevent multiple calls for the same data
      if (hasFetchedDashboardData.current && dashboardDataFetchKey.current === fetchKey) {
        return;
      }

      setIsLoadingDashboard(true);
      hasFetchedDashboardData.current = true;
      dashboardDataFetchKey.current = fetchKey;

      try {
        // Get all graduates to calculate recent year graduates and total programs
        const allGraduates = await getGraduatesByUniversityName(userDetails.institution);
        // The correct total is the length of the retrieved graduates for this university
        const totalGraduates = Array.isArray(allGraduates) ? allGraduates.length : 0;

        const currentYear = new Date().getFullYear();
        const recentYearGraduates = Array.isArray(allGraduates) ?
          allGraduates.filter(graduate => {
            const gradYear = parseInt(graduate.yearOfGraduation);
            return gradYear >= currentYear - 1;
          }).length : 0;

        // Calculate total programs from graduates data
        let totalPrograms = 0;
        try {
          const programsData = await getProgramsByUniversity(userDetails.institution);
          totalPrograms = Array.isArray(programsData) ? programsData.length : 0;

          // If no programs from contract, calculate from graduates data
          if (totalPrograms === 0 && Array.isArray(allGraduates) && allGraduates.length > 0) {
            const uniquePrograms = new Set(
              allGraduates
                .map(graduate => graduate.programOfStudy)
                .filter(program => program && program.trim() !== '')
            );
            totalPrograms = uniquePrograms.size;
          }
        } catch (programError) {
          if (Array.isArray(allGraduates) && allGraduates.length > 0) {
            const uniquePrograms = new Set(
              allGraduates
                .map(graduate => graduate.programOfStudy)
                .filter(program => program && program.trim() !== '')
            );
            totalPrograms = uniquePrograms.size;
          }
        }

        const newDashboardData = {
          totalGraduates,
          recentYearGraduates,
          totalPrograms
        };

        setDashboardData(newDashboardData);

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        // Reset the fetch flag on error so it can be retried
        hasFetchedDashboardData.current = false;
        dashboardDataFetchKey.current = '';

        // Don't reset to 0 if we already have data, just log the error
        setDashboardData(prevData => ({
          totalGraduates: prevData.totalGraduates || 0,
          recentYearGraduates: prevData.recentYearGraduates || 0,
          totalPrograms: prevData.totalPrograms || 0,
        }));
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    // Only fetch if we have the required data
    if (userDetails?.institution && isConnected) {
      fetchDashboardData();
    }
  }, [userDetails?.institution, isConnected]);

  return (
    <div className={`${styles['app-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? '' : styles['sidebar-collapsed']}`}>
        <div className={styles['sidebar-header']}>
          {sidebarOpen && <h1 className={styles.logo}>UniDashboard</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={styles['menu-button']}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className={styles['sidebar-menu']}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`${styles['menu-item']} ${currentPage === 'dashboard' ? styles.active : ''}`}
          >
            <Home size={18} className={styles['menu-icon']} />
            {sidebarOpen && <span className={styles['item-text']}>Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentPage('graduates')}
            className={`${styles['menu-item']} ${currentPage === 'graduates' ? styles.active : ''}`}
          >
            <GraduationCap size={18} className={styles['menu-icon']} />
            {sidebarOpen && <span className={styles['item-text']}>Graduates</span>}
          </button>

          <button
            onClick={() => setCurrentPage('settings')}
            className={`${styles['menu-item']} ${currentPage === 'settings' ? styles.active : ''}`}
          >
            <SettingsIcon size={18} className={styles['menu-icon']} />
            {sidebarOpen && <span className={styles['item-text']}>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles['main-content']}>
        <header className={styles['app-header']}>
          <h2 className={styles['page-title']}>
            {currentPage === 'dashboard' ? 'Dashboard Overview' : 
             currentPage === 'graduates' ? 'Graduate Records' : 'Settings'}
          </h2>
          <div className={styles['header-actions']}>
            <button
              onClick={toggleTheme}
              className={styles['theme-toggle']}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <>
                  <Sun size={16} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={16} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            {/* User Profile Dropdown */}
            <div className={styles['profile-container']} ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={styles['profile-button']}
                aria-label="User profile menu"
              >
                <User size={20} className={styles['profile-icon']} />
                <span className={styles['profile-name']}>{userDetails?.name || 'University Admin'}</span>
                <ChevronDown size={16} className={styles['dropdown-icon']} />
              </button>
              
              {showProfileDropdown && (
                <div className={styles['profile-dropdown']}>
                  <button
                    onClick={handleLogout}
                    className={styles['dropdown-logout-button']}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles['app-main']}>
          {currentPage === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              darkMode={darkMode}
              isLoading={isLoadingDashboard}
              userDetails={userDetails}
              isLoadingUserDetails={isLoadingUserDetails}
              isConnected={isConnected}
              onCardClick={() => setCurrentPage('graduates')}
            />
          )}
          {currentPage === 'graduates' && (
            <Graduate darkMode={darkMode} />
          )}
          {currentPage === 'settings' && (
            <SettingsPage
              userDetails={userDetails}
              darkMode={darkMode}
            />
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className={styles['modal-actions']}>
              <button onClick={cancelLogout} className={styles['cancel-button']}>
                Cancel
              </button>
              <button onClick={confirmLogout} className={styles['confirm-button']}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Success Message */}
      {showLogoutSuccess && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['success-icon']}>✓</div>
            <h3>Logout Successful</h3>
            <p>You have been logged out successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
}