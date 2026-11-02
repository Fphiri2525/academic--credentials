import { useState } from 'react';
import {
  User, Lock, Link as LinkIcon, Sliders, Save, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import styles from './SettingsPage.module.css';

const TABS = [
  { id: 'profile',      label: 'Profile',      icon: User },
  { id: 'security',     label: 'Security',     icon: Lock },
  { id: 'blockchain',   label: 'Blockchain',   icon: LinkIcon },
  { id: 'preferences',  label: 'Preferences',  icon: Sliders },
];

export default function SettingsPage({ showSuccessNotification, showErrorNotification }) {
  const [tab, setTab] = useState('profile');

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile, security, blockchain connection, and system preferences.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar tabs */}
        <nav className={styles.tabs}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className={styles.panel}>
          {tab === 'profile'     && <ProfileTab     notify={{ ok: showSuccessNotification, err: showErrorNotification }} />}
          {tab === 'security'    && <SecurityTab    notify={{ ok: showSuccessNotification, err: showErrorNotification }} />}
          {tab === 'blockchain'  && <BlockchainTab  notify={{ ok: showSuccessNotification, err: showErrorNotification }} />}
          {tab === 'preferences' && <PreferencesTab notify={{ ok: showSuccessNotification, err: showErrorNotification }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function ProfileTab({ notify }) {
  const raw = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [form, setForm] = useState({
    name: raw.name || '',
    email: raw.email || '',
    role: raw.role || 'admin',
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    // TODO: PATCH /api/users/me
    await new Promise((r) => setTimeout(r, 500));
    try {
      localStorage.setItem('user', JSON.stringify({ ...raw, ...form }));
      notify.ok?.('Profile updated.');
    } catch {
      notify.err?.('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={save}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <p className={styles.sectionDesc}>Your basic account information.</p>
      </header>

      <div className={styles.grid2}>
        <Field label="Full name">
          <input
            className={styles.input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Yamikani Suwedi"
          />
        </Field>
        <Field label="Email address">
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@nche.mw"
          />
        </Field>
        <Field label="Role" hint="Managed by NCHE admins">
          <input className={styles.input} value={form.role} disabled />
        </Field>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} disabled={saving} type="submit">
          <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

/* ---------- Security ---------- */
function SecurityTab({ notify }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (form.next.length < 8) return notify.err?.('Password must be at least 8 characters.');
    if (form.next !== form.confirm) return notify.err?.('Passwords do not match.');
    setSaving(true);
    try {
      // TODO: POST /api/users/me/password
      await new Promise((r) => setTimeout(r, 500));
      notify.ok?.('Password updated.');
      setForm({ current: '', next: '', confirm: '' });
    } catch {
      notify.err?.('Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={save}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Security</h2>
        <p className={styles.sectionDesc}>Change your password. Use at least 8 characters.</p>
      </header>

      <div className={styles.grid2}>
        <Field label="Current password">
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              type={show ? 'text' : 'password'}
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
              placeholder="••••••••"
            />
            <button type="button" className={styles.inputAction} onClick={() => setShow(!show)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div />

        <Field label="New password">
          <input
            className={styles.input}
            type={show ? 'text' : 'password'}
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            placeholder="At least 8 characters"
          />
        </Field>

        <Field label="Confirm new password">
          <input
            className={styles.input}
            type={show ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Repeat new password"
          />
        </Field>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          <Lock size={16} /> {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

/* ---------- Blockchain ---------- */
function BlockchainTab({ notify }) {
  const [form, setForm] = useState({
    network: 'sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/…',
    contractAddress: '0x9f3a…c21e',
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: PATCH /api/settings/blockchain
      await new Promise((r) => setTimeout(r, 500));
      notify.ok?.('Blockchain settings saved.');
    } catch {
      notify.err?.('Failed to save blockchain settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={save}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Blockchain</h2>
        <p className={styles.sectionDesc}>
          Where NCHE records certificate hashes and audit trails.
        </p>
      </header>

      <div className={styles.grid2}>
        <Field label="Network">
          <select
            className={styles.input}
            value={form.network}
            onChange={(e) => setForm({ ...form, network: e.target.value })}
          >
            <option value="localhost">Local Ganache</option>
            <option value="sepolia">Sepolia testnet</option>
            <option value="mainnet">Ethereum mainnet</option>
          </select>
        </Field>

        <Field label="Contract address">
          <input
            className={styles.input}
            value={form.contractAddress}
            onChange={(e) => setForm({ ...form, contractAddress: e.target.value })}
            placeholder="0x…"
          />
        </Field>

        <Field label="RPC URL" full>
          <input
            className={styles.input}
            value={form.rpcUrl}
            onChange={(e) => setForm({ ...form, rpcUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save blockchain settings'}
        </button>
      </div>
    </form>
  );
}

/* ---------- Preferences ---------- */
function PreferencesTab({ notify }) {
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    tamperAlerts: true,
    weeklyDigest: false,
    defaultView: 'homepage',
  });

  const toggle = (key) => setPrefs({ ...prefs, [key]: !prefs[key] });

  const save = async () => {
    // TODO: PATCH /api/users/me/preferences
    await new Promise((r) => setTimeout(r, 300));
    notify.ok?.('Preferences saved.');
  };

  return (
    <div className={styles.form}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <p className={styles.sectionDesc}>Notifications and default views.</p>
      </header>

      <div className={styles.toggles}>
        <ToggleRow
          title="Email alerts"
          hint="Get notified by email when something needs your attention."
          checked={prefs.emailAlerts}
          onChange={() => toggle('emailAlerts')}
        />
        <ToggleRow
          title="Tamper alerts"
          hint="Immediate notification if a certificate fails the blockchain check."
          checked={prefs.tamperAlerts}
          onChange={() => toggle('tamperAlerts')}
        />
        <ToggleRow
          title="Weekly digest"
          hint="A summary of everything NCHE processed this week."
          checked={prefs.weeklyDigest}
          onChange={() => toggle('weeklyDigest')}
        />
      </div>

      <Field label="Default page after login">
        <select
          className={styles.input}
          value={prefs.defaultView}
          onChange={(e) => setPrefs({ ...prefs, defaultView: e.target.value })}
        >
          <option value="homepage">Dashboard</option>
          <option value="stock">Universities</option>
          <option value="programs">Programs</option>
          <option value="foreign">Foreign applications</option>
          <option value="audit">Audit logs</option>
        </select>
      </Field>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={save}>
          <CheckCircle2 size={16} /> Save preferences
        </button>
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */
function Field({ label, hint, full, children }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

function ToggleRow({ title, hint, checked, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <div className={styles.toggleTitle}>{title}</div>
        {hint && <div className={styles.hint}>{hint}</div>}
      </div>
      <button
        type="button"
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <span className={styles.toggleDot} />
      </button>
    </div>
  );
}