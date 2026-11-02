import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// Public / entry pages
import LandingPage from "./LandingPage";
import FormPage from "./Form";

// NCHE (admin) shell
import Homepage from "./nche/Homepage";

// Student
import StudentLayout from "./student_approval/StudentLayout";
import StudentPortal from "./student_approval/Student";
import StudentDetails from "./student_approval/StudentDetails";
import QRCodeHistory from "./student_approval/QRCodeHistory";
import QRCodePage from "./student_approval/QRCodePage";

// University
import Graduate from "./university_dashboard/Grsduate";
import UniversityManagement from "./university_dashboard/university";

// Employer
import EmployerDashboard from "./employer";

// MANEB
import ManebPortal from "./MANEB3/maneb";
import Dashboard from "./MANEB3/Dashboard";
import UploadResults from "./MANEB3/UploadResults";
import VerificationRequests from "./MANEB3/VerificationRequests";
import Reports from "./MANEB3/Reports";
import ManageInstitutions from "./MANEB3/ManageInstitutions";
import Settings from "./MANEB3/Settings";

/* ---------------- Auth helpers ---------------- */
const getAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return { user, isLoggedIn: isLoggedIn && !!user?.role };
  } catch {
    return { user: null, isLoggedIn: false };
  }
};

const roleHome = (role = "") => {
  switch (role.toLowerCase()) {
    case "nche":
    case "admin":
    case "staff":
      return "/homepage";
    case "university":
      return "/university/graduate";
    case "employer":
      return "/employer";
    case "maneb":
      return "/maneb";
    case "student":
      return "/student";
    default:
      return "/auth";
  }
};

/* ---------------- Web3 ---------------- */
const Web3Context = createContext(null);

const Web3Provider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    let interval;
    let cancelled = false;

    (async () => {
      try {
        const { web3Service, waitForInitialization } =
          await import("./web3service");
        const status = await waitForInitialization();
        if (cancelled) return;

        setConnectionStatus(status);
        setIsInitialized(true);

        interval = setInterval(() => {
          setConnectionStatus(web3Service.getConnectionStatus());
        }, 5000);
      } catch (error) {
        console.error("Failed to initialize Web3 Provider:", error);
        if (cancelled) return;
        setConnectionStatus("error");
        setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ isInitialized, connectionStatus }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within a Web3Provider");
  return ctx;
};

const Web3Layout = () => (
  <Web3Provider>
    <Outlet />
  </Web3Provider>
);

/* ---------------- Protected route ---------------- */
const ProtectedRoute = ({
  allowedRoles,
  requiredRole,
  redirectPath = "/login",
}) => {
  const location = useLocation();
  const { user, isLoggedIn } = getAuth();

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  const roles = (allowedRoles || (requiredRole ? [requiredRole] : [])).map(
    (r) => r.toLowerCase(),
  );

  if (roles.length && !roles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

/* ---------------- App ---------------- */
function App() {
  const [, setIsLoggedIn] = useState(() => getAuth().isLoggedIn);

  const handleLogin = (userData) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* ---------- Public (with Web3) ---------- */}
        <Route element={<Web3Layout />}>
          <Route path="/auth" element={<LandingPage />} />
          <Route path="/login" element={<FormPage onLogin={handleLogin} />} />
          <Route path="/register" element={<FormPage onLogin={handleLogin} />} />
          <Route path="/legacy-login" element={<FormPage onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<FormPage onLogin={handleLogin} />} />

          {/* Student — protected, layout route */}
          <Route >
            <Route path="/student" element={<StudentLayout onLogout={handleLogout} />}>
              <Route index element={<StudentPortal />} />
              <Route path="lookup" element={<StudentPortal />} />
              <Route path="details" element={<StudentDetails />} />
              <Route path="qrcode" element={<QRCodeHistory />} />
              <Route path="qrcode/:id" element={<QRCodePage />} />
            </Route>
          </Route>

          {/* Homepage */}
          <Route path="/homepage" element={<Homepage onLogout={handleLogout} />} />
        </Route>

        {/* ---------- University ---------- */}
        <Route element={<ProtectedRoute requiredRole="university" />}>
          <Route path="/university" element={<UniversityManagement />}>
            <Route path="graduate" element={<Graduate onLogout={handleLogout} />} />
          </Route>
        </Route>

        {/* ---------- Employer ---------- */}
        <Route element={<ProtectedRoute requiredRole="employer" />}>
          <Route path="/employer" element={<EmployerDashboard onLogout={handleLogout} />} />
        </Route>

        {/* ---------- MANEB ---------- */}
        <Route element={<ProtectedRoute requiredRole="maneb" />}>
          <Route path="/maneb" element={<ManebPortal onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadResults />} />
            <Route path="verification" element={<VerificationRequests />} />
            <Route path="reports" element={<Reports />} />
            <Route path="institutions" element={<ManageInstitutions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ---------- Unauthorized ---------- */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex flex-col items-center justify-center h-screen text-center p-8">
              <h1 className="text-red-600 mb-4 text-2xl font-bold">Unauthorized</h1>
              <p className="mb-8 text-slate-500">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => (window.location.href = roleHome(getAuth().user?.role))}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to my dashboard
              </button>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;