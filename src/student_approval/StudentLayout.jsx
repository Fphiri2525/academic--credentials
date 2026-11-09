
// src/student_approval/StudentLayout.jsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import {
  useUserManagement,
  useConnectionStatus,
} from "../hooks/useSmartContract";

import styles from "./Student.module.css";

const NAV = [
  {
    key: "home",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student",
  },
];

export default function StudentLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [userName, setUserName] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const { getUserDetailsWithInstitution } = useUserManagement();
  const { isConnected } = useConnectionStatus();

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("user");

        if (raw) {
          const { email } = JSON.parse(raw);
          const details = await getUserDetailsWithInstitution(email);
          setUserName(details?.name || "Student");
        } else {
          setUserName("Student");
        }
      } catch {
        setUserName("Student");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [getUserDetailsWithInstitution]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const activeKey = "home";

  const doLogout = () => {
    setConfirmLogout(false);

    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    }
  };

  const pageTitle = "Dashboard";

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${
          mobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarBrand}>
          <GraduationCap size={26} className={styles.brandIcon} />

          <div>
            <div className={styles.brandName}>Student Portal</div>
            <div className={styles.brandSub}>Digital Certificates</div>
          </div>

          <button
            className={styles.sidebarClose}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Menu</div>

          {NAV.map(({ key, label, icon: Icon, path }) => {
            const isActive = key === activeKey;

            return (
              <button
                key={key}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
                onClick={() => navigate(path)}
              >
                <Icon size={18} />
                <span>{label}</span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className={styles.navChevron}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {(userName || "S").charAt(0).toUpperCase()}
            </div>

            <div className={styles.userMeta}>
              <div className={styles.userName}>
                {loadingUser ? "Loading…" : userName || "Student"}
              </div>

              <div className={styles.userRole}>Verified student</div>
            </div>
          </div>

          <button
            className={styles.sidebarLogout}
            onClick={() => setConfirmLogout(true)}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={styles.mainCol}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className={styles.topbarTitle}>{pageTitle}</div>

          <div className={styles.topbarSpacer} />

          <div
            className={`${styles.topbarPill} ${
              !isConnected ? styles.topbarPillOff : ""
            }`}
          >
            <span className={styles.topbarDot} />
            {isConnected ? "Connected" : "Not connected"}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {confirmLogout && (
        <div
          className={styles.overlay}
          onClick={() => setConfirmLogout(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Confirm logout</h3>

            <p className={styles.modalText}>
              You will need to log in again to access the student portal.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.btnGhost}
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>

              <button
                className={styles.btnDanger}
                onClick={doLogout}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
