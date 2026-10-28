import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  Menu,
  User,
  Sun,
  Moon,
  Home,
  Upload,
  CheckCircle,
  FileText,
  Building,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  X
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './maneb.module.css';
import { useUserManagement } from '../hooks/useSmartContract';

// Create Theme Context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ManebPortal = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState('Loading...');
  const [userRole, setUserRole] = useState('Administrator');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the getUserDetails hook from smart contract
  const { getUserDetails } = useUserManagement();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/maneb/dashboard' },
    { id: 'upload', label: 'Upload Results', icon: Upload, path: '/maneb/upload' },
    { id: 'verification', label: 'Verification Requests', icon: CheckCircle, path: '/maneb/verification' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/maneb/reports' },
    { id: 'institutions', label: 'Manage Institutions', icon: Building, path: '/maneb/institutions' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/maneb/settings' }
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setDarkMode(!darkMode);

  // Function to fetch user details from blockchain using getUserDetails smart contract function
  const fetchUserDetails = async () => {
    try {
      console.log('🔍 Starting to fetch user details from blockchain...');
      
      // Get user info from localStorage (stored during login)
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = userInfo.email;

      console.log('📧 User email from localStorage:', userEmail);

      if (!userEmail) {
        console.warn('❌ No user email found in localStorage');
        setUserName('Guest User');
        return;
      }

      // Call getUserDetails blockchain function using the hook
      console.log('🔗 Calling blockchain function: getUserDetails(' + userEmail + ')');
      const userDetails = await getUserDetails(userEmail);
      
      console.log('✅ Blockchain response received:', userDetails);
      
      // The getUserDetails hook returns: {name, email, contactInfo, role}
      const { name, contactInfo, role } = userDetails;
      
      console.log('📊 Parsed user details:', {
        name: name,
        contactInfo: contactInfo,
        role: role
      });
      
      if (name && name.trim() !== '') {
        setUserName(name);
        setUserRole(role || 'Administrator');
        console.log('✅ User name set to:', name);
        console.log('✅ User role set to:', role || 'Administrator');
      } else {
        console.warn('⚠️ Empty name received from blockchain, using fallback');
        setUserName('User');
      }
      
    } catch (error) {
      console.error('❌ Error fetching user details from blockchain:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      setUserName('User');
      setUserRole('Administrator');
    }
  };

  // Fetch user details from blockchain when component mounts
  useEffect(() => {
    // This will call the getUserDetails blockchain function to get the actual user's name
    fetchUserDetails();
  }, []);

  // Handle user profile click to show dropdown
  const handleUserProfileClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Handle logout click to show confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowUserDropdown(false);
  };

  // Handle logout confirmation
  const handleLogoutConfirm = () => {
    console.log('🚪 User confirmed logout');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Call the onLogout prop if provided
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to login page
    navigate('/login');
    
    setShowLogoutConfirm(false);
  };

  // Handle logout cancellation
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.userProfile')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleNavigation = (item) => {
    navigate(item.path);
    setSidebarOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`${styles.manebPortal} ${darkMode ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.portalLayout}>
        {/* Sidebar */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>MANEB Portal</h1>
            <button 
              className={styles.sidebarClose}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className={styles.sidebarNav}>
            <ul className={styles.navList}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`${styles.navItem} ${isActiveRoute(item.path) ? styles.navItemActive : ''}`}
                    >
                      <Icon className={styles.navIcon} />
                      {item.label}
                      {isActiveRoute(item.path) && (
                        <ChevronRight className={styles.navChevron} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className={styles.mainContent}>
          {/* Top bar */}
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button
                onClick={toggleSidebar}
                className={styles.menuToggle}
              >
                <Menu size={24} />
              </button>
              
              <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbText}>
                  MANEB Portal / {location.pathname.split('/').pop() || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className={styles.topbarRight}>
              <button className={styles.topbarBtn}>
                <Bell size={20} />
              </button>
              
              <button
                onClick={toggleTheme}
                className={styles.topbarBtn}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className={`${styles.userProfile} userProfile`} style={{ position: 'relative' }}>
                <div 
                  className={styles.userInfo}
                  onClick={handleUserProfileClick}
                  style={{ cursor: 'pointer' }}
                >
                  <p className={styles.userName}>{userName}</p>
                  <p className={styles.userRole}>{userRole}</p>
                </div>
                <button 
                  className={styles.userAvatar}
                  onClick={handleUserProfileClick}
                >
                  <User size={20} />
                </button>
                
                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownItem} onClick={handleLogoutClick}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className={styles.contentArea}>
            <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
              <Outlet />
            </ThemeContext.Provider>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.logoutModal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Logout</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to logout from the MANEB Portal?</p>
              <p className={styles.modalSubtext}>You will need to login again to access your dashboard.</p>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={handleLogoutConfirm}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManebPortal;