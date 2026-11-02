import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import Login from './Login';
import Homepage from './nche/Homepage';
import UniversitiesPage from './nche/components/universities/UniversitiesPage';
import Users from './Components/Users';
import Emails from './Components/Emails';
import ReportsPage from './nche/components/reports/ReportsPage';
import StudentAccreditationPortal from './student_approval/Student';
import StudentDetails from './student_approval/StudentDetails';
import QRCodePage from './student_approval/QRCodePage';
import Graduate from './university_dashboard/Grsduate';

import EmployerDashboard from './employer';
import UniversityManagement from './university_dashboard/university';
import ManebPortal from './MANEB3/maneb';
import Dashboard from './MANEB3/Dashboard';
import UploadResults from './MANEB3/UploadResults';
import VerificationRequests from './MANEB3/VerificationRequests';
import Reports from './MANEB3/Reports';
import ManageInstitutions from './MANEB3/ManageInstitutions';
import Settings from './MANEB3/Settings';
import FormPage from './form';
import ProgramsPage from './nche/components/programs/ProgramsPage';

const Auth = Login; // same component, kept as alias

/* ---------------- Auth helpers ---------------- */
const getAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return { user, isLoggedIn: isLoggedIn && !!user?.role };
  } catch {
    return { user: null, isLoggedIn: false };
  }
};

// âš ï¸ Adjust to the role names your backend actually returns
const HOMEPAGE_ROLES = ['admin', 'staff'];

const roleHome = (role = '') => {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'staff':      return '/homepage';
    case 'university': return '/university/graduate';
    case 'employer':   return '/employer';
    case 'maneb':      return '/maneb';
    case 'student':    return '/student';
    default:           return '/auth';
  }
};

/* ---------------- Web3 ---------------- */
const Web3Context = createContext(null);

const Web3Provider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    let interval;
    let cancelled = false;

    (async () => {
      try {
        const { web3Service, waitForInitialization } = await import('./web3service');
        const status = await waitForInitialization();
        if (cancelled) return;

        setConnectionStatus(status);
        setIsInitialized(true);

        interval = setInterval(() => {
          setConnectionStatus(web3Service.getConnectionStatus());
        }, 5000);
      } catch (error) {
        console.error('Failed to initialize Web3 Provider:', error);
        if (cancelled) return;
        setConnectionStatus('error');
        setIsInitialized(true);
      }
    })();

    // Cleanup now actually runs (the old return was inside the async fn)
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
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};

// Layout route: wraps children in Web3Provider once
const Web3Layout = () => (
  <Web3Provider>
    <Outlet />
  </Web3Provider>
);

/* ---------------- Protected route ---------------- */
// allowedRoles: array of roles. requiredRole kept for backward compatibility.
const ProtectedRoute = ({ allowedRoles, requiredRole, redirectPath = '/login' }) => {
  const location = useLocation();
  const { user, isLoggedIn } = getAuth();

  if (!isLoggedIn) {
    // remember where the user wanted to go, so login can send them back
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  const roles = (allowedRoles || (requiredRole ? [requiredRole] : []))
    .map((r) => r.toLowerCase());

  if (roles.length && !roles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

/* ---------------- App ---------------- */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuth().isLoggedIn);

  const handleLogin = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    // add your token removal here too, e.g. localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* ---------- Public routes (with Web3) ---------- */}
        <Route element={<Web3Layout />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<FormPage onLogin={handleLogin} />} />
          <Route path="/register" element={<FormPage onLogin={handleLogin} />} />
          <Route path="/legacy-login" element={<Login onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<Login onLogin={handleLogin} />} />

          {/* Student pages: protect with role "student" if they should require login */}
          <Route path="/student" element={<StudentAccreditationPortal onLogout={handleLogout} />} />
          <Route path="/student/details" element={<StudentDetails />} />
          <Route path="/student/qrcode" element={<QRCodePage />} />

          <Route>
            <Route path="/homepage" element={<Homepage onLogout={handleLogout} />}>
              <Route path="universities" element={<UniversitiesPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="users" element={<Users />} />
              <Route path="emails" element={<Emails />} />
              <Route path="report" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ---------- University: protection moved to the PARENT ---------- */}
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

        <Route
          path="/unauthorized"
          element={
            <div className="flex flex-col items-center justify-center h-screen text-center p-8">
              <h1 className="text-red-600 mb-4 text-2xl font-bold">ðŸš« Unauthorized Access</h1>
              <p className="mb-8 text-slate-500">You don't have permission to access this page.</p>
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




