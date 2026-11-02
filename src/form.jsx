import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
  User,
  Phone,
  Lock,
  Building2,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import styles from "./Form.module.css";
import { web3, getContract } from "./web3service";
import { useActivityTracker } from "./hooks/useActivityTracker";

export default function FormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegistering = location.pathname === "/register";

  const contract = getContract("userManagement");
  const { trackAuth, trackError, updateCurrentUser } = useActivityTracker();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactInfo: "",
    password: "",
    worker: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    trackAuth(
      "Page Access",
      `User accessed ${isRegistering ? "registration" : "login"} page`,
    );
  }, [isRegistering, trackAuth]);

  useEffect(() => {
    (async () => {
      try {
        if (web3 && contract) {
          const accounts = await web3.eth.getAccounts();
          if (!accounts.length)
            setError("Please connect your MetaMask wallet to continue.");
        }
      } catch {
        setError("Wallet connection failed. Please check MetaMask.");
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goToRoleHome = (role) => {
    const map = {
      student: "/student",
      university: "/university",
      nche: "/homepage",
      employer: "/employer",
      maneb: "/maneb/dashboard",
    };
    window.location.href = map[role.trim().toLowerCase()] || "/dashboard";
  };

  const signIn = async (email, password) => {
    if (!web3) throw new Error("Web3 not initialized. Please refresh.");
    if (!contract) throw new Error("Smart contract not available.");
    const accounts = await web3.eth.getAccounts();
    if (!accounts.length)
      throw new Error("Connect your MetaMask wallet first.");

    const role = await contract.methods
      .signIn(email, password)
      .call({ from: accounts[0] });
    if (!role || !role.trim()) throw new Error("Invalid credentials.");
    return role;
  };

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.contactInfo ||
      !formData.password ||
      !formData.worker ||
      !formData.institution
    ) {
      return setError("Please fill in all fields.");
    }

    trackAuth("Registration Started", `Email: ${formData.email}`);
    const accounts = await web3.eth.getAccounts();

    let gasLimit = 500000;
    try {
      const estimate = await contract.methods
        .registerUser(
          formData.name,
          formData.email,
          formData.contactInfo,
          formData.password,
          formData.worker,
          formData.institution,
        )
        .estimateGas({ from: accounts[0] });
      gasLimit = Math.floor(estimate * 1.3);
    } catch {
      /* fallback to default */
    }

    const result = await contract.methods
      .registerUser(
        formData.name,
        formData.email,
        formData.contactInfo,
        formData.password,
        formData.worker,
        formData.institution,
      )
      .send({ from: accounts[0], gas: gasLimit, gasPrice: "25000000000" });

    trackAuth("Registration Success", `Email: ${formData.email}`, {
      transactionHash: result.transactionHash,
    });

    setSuccess("Registration successful — redirecting to login…");
    setTimeout(() => navigate("/login"), 1500);
  };

  const handleLogin = async () => {
    trackAuth("Login Attempt", `Email: ${formData.email}`);
    const role = await signIn(formData.email, formData.password);

    const user = { email: formData.email, role };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    updateCurrentUser(user);
    trackAuth("Login Success", `Role: ${role}`);

    setLoginSuccess(true);
    setTimeout(() => goToRoleHome(role), 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isRegistering) await handleRegister();
      else await handleLogin();
    } catch (err) {
      const msg = err.message.includes("revert")
        ? "Invalid email or password."
        : err.message.includes("insufficient funds")
          ? "Insufficient funds for gas."
          : err.message.includes("User denied")
            ? "Transaction cancelled."
            : err.message || "Something went wrong.";
      setError(msg);
      trackError(err, isRegistering ? "Registration" : "Login", {
        email: formData.email,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Top bar with subtle Malawian flag accent */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.brandWrap}>
            <span className={styles.brand}>Malawi CertSecure</span>
          </div>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>
              {isRegistering ? "Create your account" : "Welcome back"}
            </h1>
            <p className={styles.cardSubtitle}>
              {isRegistering
                ? "Join Malawi CertSecure to issue and verify credentials."
                : "Sign in to continue to your dashboard."}
            </p>
          </header>

          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {isRegistering ? (
              <>
                {/* Registration Grid */}
                <div className={styles.field}>
                  <label className={styles.label}>Full name</label>
                  <div className={styles.inputWrap}>
                    <User size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Contact info</label>
                  <div className={styles.inputWrap}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="text"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      placeholder="+265 111 222 333"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Role</label>
                  <div className={styles.inputWrap}>
                    <Briefcase size={16} className={styles.inputIcon} />
                    <select
                      className={styles.input}
                      name="worker"
                      value={formData.worker}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select role</option>
                      <option value="employer">Employer</option>
                      <option value="student">Student</option>
                      <option value="university">University</option>
                      <option value="nche">NCHE</option>
                      <option value="maneb">MANEB</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Institution / Company</label>
                  <div className={styles.inputWrap}>
                    <Building2 size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Your organisation"
                      required
                    />
                  </div>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login Grid */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              className={`${styles.btnPrimary} ${styles.fullWidth}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  {isRegistering ? "Creating account…" : "Signing in…"}
                </>
              ) : isRegistering ? (
                <>
                  <UserPlus size={16} /> Create account
                </>
              ) : (
                <>
                  <LogIn size={16} /> Sign in
                </>
              )}
            </button>
          </form>

          <footer className={styles.footer}>
            {isRegistering ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => navigate("/register")}
                >
                  Create one
                </button>
              </p>
            )}
          </footer>
        </div>
      </main>

      {/* Login success modal */}
      {loginSuccess && (
        <div className={styles.overlay} onClick={() => setLoginSuccess(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 size={36} className={styles.modalIcon} />
            <h3 className={styles.modalTitle}>Signed in</h3>
            <p className={styles.modalText}>Redirecting to your dashboard…</p>
          </div>
        </div>
      )}
    </div>
  );
}
