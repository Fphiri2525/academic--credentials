import React, { useState, createContext, useContext, useEffect } from "react";
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
  X,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./maneb.module.css";
import { useUserManagement } from "../hooks/useSmartContract";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ManebPortal = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("Administrator");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { getUserDetails } = useUserManagement();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/maneb/dashboard",
    },
    {
      id: "upload",
      label: "Upload Results",
      icon: Upload,
      path: "/maneb/upload",
    },
    {
      id: "verification",
      label: "Verification Requests",
      icon: CheckCircle,
      path: "/maneb/verification",
    },
    { id: "reports", label: "Reports", icon: FileText, path: "/maneb/reports" },
    {
      id: "institutions",
      label: "Manage Institutions",
      icon: Building,
      path: "/maneb/institutions",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/maneb/settings",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserDetails = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = userInfo.email;
      if (!userEmail) {
        setUserName("Guest User");
        return;
      }

      const userDetails = await getUserDetails(userEmail);
      if (userDetails?.name) {
        setUserName(userDetails.name);
        setUserRole(userDetails.role || "Administrator");
      } else {
        setUserName("User");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserName("User");
      setUserRole("Administrator");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".userProfile")) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    if (onLogout) onLogout();
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const handleNavigation = (item) => {
    navigate(item.path);
    if (isMobile) setSidebarOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <div
      className={`${styles.manebPortal} ${darkMode ? styles.darkTheme : styles.lightTheme}`}
    >
      <div className={styles.portalLayout}>
        {/* Sidebar Overlay (Mobile) */}
        {isMobile && sidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
        >
          <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>MANEB</h1>
            {isMobile && (
              <button
                className={styles.sidebarClose}
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <nav className={styles.sidebarNav}>
            <ul className={styles.navList}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`${styles.navItem} ${isActiveRoute(item.path) ? styles.navItemActive : ""}`}
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

        {/* Main Content */}
        <div className={styles.mainContent}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button
                className={styles.menuToggle}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>
              <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbText}>
                  MANEB / {location.pathname.split("/").pop() || "Dashboard"}
                </span>
              </div>
            </div>

            <div className={styles.topbarRight}>
              <button className={styles.topbarBtn}>
                <Bell size={20} />
              </button>
              <button
                className={styles.topbarBtn}
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className={`${styles.userProfile} userProfile`}>
                <div
                  className={styles.userInfo}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <p className={styles.userName}>{userName}</p>
                  <p className={styles.userRole}>{userRole}</p>
                </div>
                <button
                  className={styles.userAvatar}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <User size={20} />
                </button>

                {showUserDropdown && (
                  <div className={styles.userDropdown}>
                    <div
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowUserDropdown(false);
                      }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className={styles.contentArea}>
            <ThemeContext.Provider
              value={{ darkMode, toggleTheme: () => setDarkMode(!darkMode) }}
            >
              <Outlet />
            </ThemeContext.Provider>
          </main>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.logoutModal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Logout</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to logout from the MANEB Portal?</p>
              <p className={styles.modalSubtext}>
                You will need to login again to access your dashboard.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleLogoutConfirm}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManebPortal;
