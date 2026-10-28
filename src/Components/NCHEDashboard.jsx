import React, { useState, useEffect } from 'react';
import {
  FaHome, FaUniversity, FaUserAlt, FaAward, FaFlag, FaBan, FaCertificate,
  FaHistory, FaCog, FaQrcode
} from 'react-icons/fa';
import { MdSchool, MdVerified } from 'react-icons/md';

/* ------------------------------------------------------------------
   1. SIDEBAR ITEMS  (replace the navItems array in homepage.jsx)
   ------------------------------------------------------------------ */
export const navItems = [
  { title: 'Dashboard',            icon: <FaHome size={20} />,        view: 'homepage',     path: '/homepage' },
  { title: 'Universities',         icon: <FaUniversity size={20} />,  view: 'stock',        path: '/homepage/stock' },
  { title: 'Programs',             icon: <MdSchool size={20} />,      view: 'programs',     path: '/homepage/programs' },
  { title: 'Suspensions',          icon: <FaBan size={20} />,         view: 'suspensions',  path: '/homepage/suspensions' },
  { title: 'Foreign Applications', icon: <FaAward size={20} />,       view: 'foreign',      path: '/homepage/foreign' },
  { title: 'Certificates',         icon: <FaCertificate size={20} />, view: 'certificates', path: '/homepage/certificates' },
  { title: 'Verification Reports', icon: <FaQrcode size={20} />,      view: 'report',       path: '/homepage/report' },
  { title: 'Audit Logs',           icon: <FaHistory size={20} />,     view: 'audit',        path: '/homepage/audit' },
  { title: 'University Accounts',  icon: <FaUserAlt size={20} />,     view: 'users',        path: '/homepage/users' },
  { title: 'Settings',             icon: <FaCog size={20} />,         view: 'settings',     path: '/homepage/settings' },
];

/* ------------------------------------------------------------------
   2. MOCK DATA  (replace each block with an API call to your MySQL backend)
   ------------------------------------------------------------------ */
const ago = (mins) => new Date(Date.now() - mins * 60000).toLocaleString();

const initialStats = {
  accredited: 24, suspended: 2, programs: 156, graduates: 12450,
  certificates: 11234, pendingForeign: 5, verificationsToday: 87, tamperAlerts: 1,
};

const certByStatus = [
  { label: 'Valid', value: 11020, color: '#059669' },
  { label: 'Suspended', value: 148, color: '#d97706' },
  { label: 'Revoked', value: 66, color: '#dc2626' },
];

const certByYear = [
  { year: '2020', value: 1480 }, { year: '2021', value: 1920 },
  { year: '2022', value: 2310 }, { year: '2023', value: 2650 },
  { year: '2024', value: 2874 },
];

const initialUniversities = [
  { id: 1, name: 'University of Malawi',  status: 'ACCREDITED', certs: 4120 },
  { id: 2, name: 'Mzuzu University',      status: 'ACCREDITED', certs: 2310 },
  { id: 3, name: 'LUANAR',                status: 'ACCREDITED', certs: 1980 },
  { id: 4, name: 'Unaccredited College A', status: 'SUSPENDED',  certs: 148 },
];

const initialApplications = [
  { id: 'FA-2026-0005', name: 'Chanda Mulenga',  country: 'Zambia',       award: 'BSc Nursing',        status: 'PENDING' },
  { id: 'FA-2026-0004', name: 'Sarah Mkandawire', country: 'United Kingdom', award: 'PhD Economics',   status: 'UNDER_REVIEW' },
  { id: 'FA-2026-0003', name: 'Tendai Moyo',     country: 'Zimbabwe',     award: 'MBA',                status: 'MORE_INFO_NEEDED' },
  { id: 'FA-2026-0002', name: 'Amina Hassan',    country: 'Tanzania',     award: 'BEd Mathematics',    status: 'PENDING' },
];

const recentVerifications = [
  { number: 'C-2026-001245', result: 'VALID',     time: ago(4) },
  { number: 'C-2026-000987', result: 'VALID',     time: ago(11) },
  { number: 'C-2025-004410', result: 'SUSPENDED', time: ago(32) },
  { number: 'C-2026-000312', result: 'TAMPERED',  time: ago(58) },
  { number: 'C-2024-002201', result: 'NOT_FOUND', time: ago(95) },
];

const auditLog = [
  { icon: '🚫', color: '#dc2626', msg: 'Suspended Unaccredited College A (reason: accreditation expired)', by: 'NCHE Admin', time: ago(40) },
  { icon: '🌍', color: '#f59e0b', msg: 'Approved foreign certificate FA-2026-0001 (BSc Nursing, Zambia)', by: 'NCHE Admin', time: ago(95) },
  { icon: '🏫', color: '#2563eb', msg: 'Accredited Lilongwe University of Agriculture', by: 'NCHE Admin', time: ago(180) },
  { icon: '📚', color: '#8b5cf6', msg: 'Approved program: Bachelor of Data Science (MUST)', by: 'NCHE Admin', time: ago(300) },
  { icon: '📜', color: '#059669', msg: 'MANEB uploaded MSCE 2026 results (48,210 students)', by: 'MANEB', time: ago(520) },
];

/* ------------------------------------------------------------------
   3. SMALL HELPERS
   ------------------------------------------------------------------ */
const chipColors = {
  VALID: '#059669', ACCREDITED: '#059669', APPROVED: '#059669',
  SUSPENDED: '#d97706', PENDING: '#d97706', UNDER_REVIEW: '#2563eb',
  MORE_INFO_NEEDED: '#8b5cf6', REVOKED: '#dc2626', TAMPERED: '#dc2626',
  REJECTED: '#dc2626', NOT_FOUND: '#6b7280',
};

const Chip = ({ value }) => (
  <span style={{
    background: `${chipColors[value] || '#6b7280'}1f`,
    color: chipColors[value] || '#6b7280',
    padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
  }}>
    {value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
  </span>
);

/* ------------------------------------------------------------------
   4. DASHBOARD  (use this in place of the Dashboard in homepage.jsx)
   ------------------------------------------------------------------ */
const Dashboard = ({
  isDark, setCurrentView, navigate,
  showSuccessNotification, showErrorNotification, showInfoNotification,
  userName, isLoadingUserName,
}) => {
  const [stats, setStats] = useState(initialStats);
  const [universities, setUniversities] = useState(initialUniversities);
  const [applications, setApplications] = useState(initialApplications);
  const [integrity, setIntegrity] = useState({
    running: false, checked: 11233, mismatches: 1, lastRun: ago(60),
    network: 'Sepolia testnet', lastTx: '0x9f3a…c21e',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400); // replace with API fetches
    return () => clearTimeout(t);
  }, []);

  const t = isDark
    ? { card: '#1e293b', text: '#e2e8f0', sub: '#94a3b8', line: '#334155', soft: '#0f172a' }
    : { card: '#ffffff', text: '#0f172a', sub: '#64748b', line: '#e2e8f0', soft: '#f1f5f9' };

  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 10, padding: 18, color: t.text };
  const h2 = { fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: t.text };
  const btn = (bg, fg = '#fff') => ({
    background: bg, color: fg, border: 'none', borderRadius: 6,
    padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  });
  const go = (view, path) => { setCurrentView(view); navigate(path); };

  /* ---- Actions ---- */
  const toggleSuspension = (u) => {
    const suspending = u.status === 'ACCREDITED';
    const reason = suspending ? window.prompt(`Reason for suspending ${u.name}:`) : 'Accreditation restored';
    if (suspending && !reason) return;
    // TODO: PATCH /api/universities/:id/status  -> updates MySQL, certificates, and writes the event to the blockchain
    setUniversities((list) => list.map((x) => (x.id === u.id ? { ...x, status: suspending ? 'SUSPENDED' : 'ACCREDITED' } : x)));
    setStats((s) => ({ ...s, accredited: s.accredited + (suspending ? -1 : 1), suspended: s.suspended + (suspending ? 1 : -1) }));
    suspending
      ? showErrorNotification(`${u.name} suspended. Uploads are now blocked.`)
      : showSuccessNotification(`${u.name} reinstated.`);
  };

  const decide = (app, status) => {
    // TODO: POST /api/foreign-applications/:id/decision  -> on APPROVED, create the certificate and write its hash to the blockchain
    setApplications((list) => list.map((a) => (a.id === app.id ? { ...a, status } : a)));
    setStats((s) => ({ ...s, pendingForeign: Math.max(0, s.pendingForeign - 1) }));
    status === 'APPROVED'
      ? showSuccessNotification(`${app.id} approved. Digital certificate issued.`)
      : showInfoNotification(`${app.id} rejected.`);
  };

  const verifyIntegrity = () => {
    setIntegrity((i) => ({ ...i, running: true }));
    // TODO: GET /api/blockchain/verify-all -> compare each MySQL hash with its on-chain hash
    setTimeout(() => {
      setIntegrity((i) => ({ ...i, running: false, lastRun: new Date().toLocaleString() }));
      integrity.mismatches > 0
        ? showErrorNotification(`${integrity.mismatches} certificate does not match the blockchain. Open Audit Logs.`)
        : showSuccessNotification('All certificates match the blockchain.');
    }, 1500);
  };

  const totalCerts = certByStatus.reduce((n, c) => n + c.value, 0);
  const maxYear = Math.max(...certByYear.map((y) => y.value));
  const openApps = applications.filter((a) => ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_NEEDED'].includes(a.status));

  const statCards = [
    { label: 'Accredited universities', value: stats.accredited, color: '#2563eb', icon: <MdSchool size={22} />, onClick: () => go('stock', '/homepage/stock') },
    { label: 'Suspended universities', value: stats.suspended, color: '#d97706', icon: <FaUniversity size={20} />, onClick: () => go('suspensions', '/homepage/suspensions') },
    { label: 'Approved programs', value: stats.programs, color: '#8b5cf6', icon: <MdSchool size={22} />, onClick: () => go('programs', '/homepage/programs') },
    { label: 'Graduates registered', value: stats.graduates, color: '#0891b2', icon: <FaAward size={20} /> },
    { label: 'Certificates issued', value: stats.certificates, color: '#059669', icon: <MdVerified size={22} />, onClick: () => go('certificates', '/homepage/certificates') },
    { label: 'Foreign applications waiting', value: stats.pendingForeign, color: '#f59e0b', icon: <FaAward size={20} />, onClick: () => go('foreign', '/homepage/foreign') },
    { label: 'Employer checks today', value: stats.verificationsToday, color: '#6366f1', icon: <FaQrcode size={20} />, onClick: () => go('report', '/homepage/report') },
    { label: 'Tamper alerts', value: stats.tamperAlerts, color: '#dc2626', icon: <FaFlag size={20} />, onClick: () => go('audit', '/homepage/audit') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: t.text }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: 24, margin: 0, color: t.text }}>
          {isLoadingUserName ? 'Loading…' : `Welcome back${userName ? `, ${userName}` : ''}`}
        </h1>
        <p style={{ margin: '4px 0 0', color: t.sub }}>
          Control accreditation, approve foreign qualifications, and watch certificate integrity.
        </p>
      </div>

      {/* Alerts that need action */}
      {(stats.tamperAlerts > 0 || stats.suspended > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.tamperAlerts > 0 && (
            <div style={{ background: '#dc26261a', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span><strong>{stats.tamperAlerts} certificate failed the blockchain check.</strong> Its database record no longer matches the on-chain hash.</span>
              <button style={btn('#dc2626')} onClick={() => go('audit', '/homepage/audit')}>Investigate</button>
            </div>
          )}
          {stats.suspended > 0 && (
            <div style={{ background: '#d977061a', border: '1px solid #d97706', color: '#b45309', borderRadius: 8, padding: '10px 14px' }}>
              <strong>{stats.suspended} universities are suspended.</strong> They cannot add graduates, and employers see a warning on their certificates.
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {statCards.map((c) => (
          <div
            key={c.label}
            onClick={c.onClick}
            style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: c.onClick ? 'pointer' : 'default', borderLeft: `4px solid ${c.color}` }}
          >
            <span style={{ color: c.color }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 13, color: t.sub }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{loading ? '…' : c.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Integrity panel + certificate status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <div style={card}>
          <h2 style={h2}>Blockchain integrity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14 }}>
            <div><div style={{ color: t.sub }}>Network</div>{integrity.network}</div>
            <div><div style={{ color: t.sub }}>Latest transaction</div><code>{integrity.lastTx}</code></div>
            <div><div style={{ color: t.sub }}>Records checked</div>{integrity.checked.toLocaleString()}</div>
            <div>
              <div style={{ color: t.sub }}>Mismatches</div>
              <strong style={{ color: integrity.mismatches ? '#dc2626' : '#059669' }}>{integrity.mismatches}</strong>
            </div>
          </div>
          <p style={{ color: t.sub, fontSize: 13, margin: '12px 0' }}>Last full check: {integrity.lastRun}</p>
          <button style={btn('#2563eb')} onClick={verifyIntegrity} disabled={integrity.running}>
            {integrity.running ? 'Checking…' : 'Verify integrity now'}
          </button>
        </div>

        <div style={card}>
          <h2 style={h2}>Certificates by status</h2>
          <div style={{ display: 'flex', height: 18, borderRadius: 9, overflow: 'hidden', background: t.soft }}>
            {certByStatus.map((c) => (
              <div key={c.label} title={`${c.label}: ${c.value}`} style={{ width: `${(c.value / totalCerts) * 100}%`, background: c.color }} />
            ))}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 8, fontSize: 14 }}>
            {certByStatus.map((c) => (
              <li key={c.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: c.color, marginRight: 8 }} />{c.label}</span>
                <span>{c.value.toLocaleString()} ({((c.value / totalCerts) * 100).toFixed(1)}%)</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={card}>
          <h2 style={h2}>Certificates issued per year</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 150 }}>
            {certByYear.map((y) => (
              <div key={y.year} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: t.sub }}>
                <div style={{ color: t.text, marginBottom: 4 }}>{y.value.toLocaleString()}</div>
                <div style={{ height: `${(y.value / maxYear) * 110}px`, background: '#2563eb', borderRadius: '4px 4px 0 0' }} />
                <div style={{ marginTop: 4 }}>{y.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Universities + Foreign applications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}>
        <div style={card}>
          <h2 style={h2}>Accreditation control</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: t.sub }}>
                  <th style={{ padding: '6px 4px' }}>University</th><th>Status</th><th>Certificates</th><th></th>
                </tr>
              </thead>
              <tbody>
                {universities.map((u) => (
                  <tr key={u.id} style={{ borderTop: `1px solid ${t.line}` }}>
                    <td style={{ padding: '10px 4px' }}>{u.name}</td>
                    <td><Chip value={u.status} /></td>
                    <td>{u.certs.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button style={u.status === 'ACCREDITED' ? btn('#dc2626') : btn('#059669')} onClick={() => toggleSuspension(u)}>
                        {u.status === 'ACCREDITED' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={h2}>Foreign applications to review</h2>
            <span style={{ color: t.sub, fontSize: 13 }}>{openApps.length} open</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: t.sub }}>
                  <th style={{ padding: '6px 4px' }}>Applicant</th><th>Award</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => {
                  const open = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_NEEDED'].includes(a.status);
                  return (
                    <tr key={a.id} style={{ borderTop: `1px solid ${t.line}` }}>
                      <td style={{ padding: '10px 4px' }}>
                        {a.name}
                        <div style={{ fontSize: 12, color: t.sub }}>{a.country} · {a.id}</div>
                      </td>
                      <td>{a.award}</td>
                      <td><Chip value={a.status} /></td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {open ? (
                          <>
                            <button style={btn('#059669')} onClick={() => decide(a, 'APPROVED')}>Approve</button>{' '}
                            <button style={btn('#dc2626')} onClick={() => decide(a, 'REJECTED')}>Reject</button>
                          </>
                        ) : (
                          <button style={btn(t.soft, t.text)} onClick={() => go('foreign', '/homepage/foreign')}>View</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verification checks + audit trail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}>
        <div style={card}>
          <h2 style={h2}>Latest employer checks</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentVerifications.map((v) => (
              <li key={v.number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${t.line}`, fontSize: 14 }}>
                <span><code>{v.number}</code><div style={{ fontSize: 12, color: t.sub }}>{v.time}</div></span>
                <Chip value={v.result} />
              </li>
            ))}
          </ul>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={h2}>Recent actions (audit log)</h2>
            <button style={btn(t.soft, t.text)} onClick={() => go('audit', '/homepage/audit')}>See all</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {auditLog.map((a, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderTop: `1px solid ${t.line}` }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{a.icon}</span>
                <div style={{ fontSize: 14 }}>
                  {a.msg}
                  <div style={{ fontSize: 12, color: t.sub }}>{a.by} · {a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;