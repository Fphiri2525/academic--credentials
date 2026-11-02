import { useState, useEffect } from "react";
import { UserPlus, Eye, X, Search, AlertTriangle, Save } from "lucide-react";
import {
  useUserManagement,
  useConnectionStatus,
  useAccreditationManagement,
} from "../hooks/useSmartContract";
import { emailService } from "../services/emailService";
import styles from "./Users.module.css";

export default function UsersPage({
  showSuccessNotification,
  showErrorNotification,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactInfo: "",
    password: "",
    role: "",
    institution: "",
  });

  const { getAllUsers, registerUser, loading } = useUserManagement();
  const { getAllAccreditedUniversities } = useAccreditationManagement();
  const { isConnected } = useConnectionStatus();

  const fetchUsers = async () => {
    if (!isConnected) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsers([]);
      setStatus(`Error fetching users: ${e.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUniversities = async () => {
    if (!isConnected) {
      setUniversities([]);
      return;
    }
    try {
      setLoadingUnis(true);
      const data = await getAllAccreditedUniversities();
      setUniversities(Array.isArray(data) ? data : []);
    } catch {
      setUniversities([]);
    } finally {
      setLoadingUnis(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchUsers();
      fetchUniversities();
    } else {
      setLoadingUsers(false);
    }
  }, [isConnected]);

  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      contactInfo: "",
      password: "",
      role: "",
      institution: "",
    });

  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.contactInfo.trim() ||
      !form.password.trim() ||
      !form.role.trim() ||
      !form.institution.trim()
    ) {
      return showErrorNotification?.("Please fill in all fields.");
    }
    try {
      setSubmitting(true);
      await registerUser(form);
      try {
        await emailService.sendWelcomeEmail(form);
      } catch {}
      resetForm();
      setFormOpen(false);
      await fetchUsers();
      showSuccessNotification?.("User added.");
    } catch (err) {
      showErrorNotification?.(`Error adding user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role, u.institution]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>University Accounts</h1>
          <p className={styles.subtitle}>
            Manage NCHE, university, MANEB, and employer accounts.
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or role"
            />
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setFormOpen(true);
              resetForm();
            }}
            disabled={submitting || !isConnected}
          >
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertTriangle size={18} />
          <span>
            Not connected to blockchain. Connect your wallet to manage users.
          </span>
        </div>
      )}

      {status && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertTriangle size={18} />
          <span>{status}</span>
        </div>
      )}

      <div className={styles.card}>
        {loadingUsers || loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading users from blockchain…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {query ? "No users match your search." : "No users found yet."}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Institution</th>
                  <th>Contact</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`${styles.chip} ${styles[`chip${(u.role || "").replace(/^\w/, (c) => c.toUpperCase())}`] || ""}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.institution}</td>
                    <td>{u.contactInfo}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.btnGhost}
                          onClick={() => setViewing(u)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add user modal */}
      {formOpen && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setFormOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New User</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setFormOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <Field label="Full name *">
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field label="Email *">
                  <input
                    className={styles.input}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field label="Contact info *">
                  <input
                    className={styles.input}
                    value={form.contactInfo}
                    onChange={(e) =>
                      setForm({ ...form, contactInfo: e.target.value })
                    }
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field label="Password *">
                  <input
                    className={styles.input}
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field label="Role *">
                  <select
                    className={styles.input}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select role</option>
                    <option value="student">Student</option>
                    <option value="university">University</option>
                    <option value="nche">NCHE</option>
                    <option value="employer">Employer</option>
                    <option value="maneb">MANEB</option>
                  </select>
                </Field>
                <Field label="Institution *">
                  <select
                    className={styles.input}
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                    required
                    disabled={submitting || loadingUnis}
                  >
                    <option value="">
                      {loadingUnis
                        ? "Loading institutions…"
                        : "Select institution"}
                    </option>
                    <option value="NCHE">NCHE</option>
                    <option value="MANEB">MANEB</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setFormOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitting || !isConnected}
                >
                  <Save size={16} /> {submitting ? "Adding…" : "Add user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View user modal */}
      {viewing && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setViewing(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{viewing.name}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setViewing(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <Info label="Email" value={viewing.email} />
                <Info label="Contact" value={viewing.contactInfo} />
                <Info label="Role" value={viewing.role} />
                <Info label="Institution" value={viewing.institution} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnGhost}
                onClick={() => setViewing(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  );
}
