import { useEffect, useState } from 'react';
import { GraduationCap, School, BadgeCheck, Award, Flag, University } from 'lucide-react';

import StatCard from './StatCard';
import AlertBanner from './AlertBanner';
import IntegrityPanel from './IntegrityPanel';
import CertStatusBar from './CertStatusBar';
import CertYearChart from './CertYearChart';
import AccreditationTable from './AccreditationTable';
import ForeignAppsTable from './ForeignAppsTable';
import RecentChecks from './RecentChecks';
import AuditLog from './AuditLog';

import {
  initialStats, initialUniversities, initialApplications,
} from '../../constants/dashboard';

import styles from './Dashboard.module.css';

export default function Dashboard({
  setCurrentView,
  showSuccessNotification, showErrorNotification,
  userName, isLoadingUserName,
}) {
  const [stats, setStats] = useState(initialStats);
  const [universities, setUniversities] = useState(initialUniversities);
  const [applications, setApplications] = useState(initialApplications);
  const [integrity, setIntegrity] = useState({
    running: false,
    checked: 11233,
    mismatches: 1,
    lastRun: '1 h ago',
    network: 'Sepolia testnet',
    lastTx: '0x9f3a…c21e',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const go = (view) => setCurrentView(view);

  const toggleSuspension = (u) => {
    const suspending = u.status === 'ACCREDITED';
    const reason = suspending
      ? window.prompt(`Reason for suspending ${u.name}:`)
      : 'Accreditation restored';
    if (suspending && !reason) return;

    setUniversities((list) =>
      list.map((x) =>
        x.id === u.id
          ? { ...x, status: suspending ? 'SUSPENDED' : 'ACCREDITED' }
          : x,
      ),
    );
    setStats((s) => ({
      ...s,
      accredited: s.accredited + (suspending ? -1 : 1),
      suspended: s.suspended + (suspending ? 1 : -1),
    }));
    suspending
      ? showErrorNotification(`${u.name} suspended. Uploads are now blocked.`)
      : showSuccessNotification(`${u.name} reinstated.`);
  };

  const decide = (app, status) => {
    setApplications((list) =>
      list.map((a) => (a.id === app.id ? { ...a, status } : a)),
    );
    setStats((s) => ({ ...s, pendingForeign: Math.max(0, s.pendingForeign - 1) }));
    status === 'APPROVED'
      ? showSuccessNotification(`${app.id} approved. Digital certificate issued.`)
      : showErrorNotification(`${app.id} rejected.`);
  };

  const verifyIntegrity = () => {
    setIntegrity((i) => ({ ...i, running: true }));
    setTimeout(() => {
      setIntegrity((i) => ({ ...i, running: false, lastRun: 'just now' }));
      integrity.mismatches > 0
        ? showErrorNotification(
            `${integrity.mismatches} certificate does not match the blockchain. Open Audit Logs.`,
          )
        : showSuccessNotification('All certificates match the blockchain.');
    }, 1500);
  };

  const statCards = [
    { label: 'Accredited universities', value: stats.accredited,         color: 'var(--accent)',  icon: School,        onClick: () => go('universities') },
    { label: 'Suspended universities',  value: stats.suspended,          color: 'var(--warning)', icon: University,    onClick: () => go('suspensions') },
    { label: 'Approved programs',       value: stats.programs,           color: 'var(--accent)',  icon: GraduationCap, onClick: () => go('programs') },
    { label: 'Graduates registered',    value: stats.graduates,          color: 'var(--accent)',  icon: Award },
    { label: 'Certificates issued',     value: stats.certificates,       color: 'var(--success)', icon: BadgeCheck,    onClick: () => go('certificates') },
    { label: 'Foreign applications',    value: stats.pendingForeign,     color: 'var(--warning)', icon: Award,         onClick: () => go('foreign') },
    { label: 'Employer checks today',   value: stats.verificationsToday, color: 'var(--accent)',  icon: BadgeCheck,    onClick: () => go('report') },
    { label: 'Tamper alerts',           value: stats.tamperAlerts,       color: 'var(--danger)',  icon: Flag,          onClick: () => go('audit') },
  ];

  return (
    <div className={styles.dashboard}>
      <header>
        <h1 className={styles.title}>
          {isLoadingUserName ? 'Loading…' : `Welcome back${userName ? `, ${userName}` : ''}`}
        </h1>
        <p className={styles.subtitle}>
          Control accreditation, approve foreign qualifications, and watch certificate integrity.
        </p>
      </header>

      {(stats.tamperAlerts > 0 || stats.suspended > 0) && (
        <div className={styles.alerts}>
          {stats.tamperAlerts > 0 && (
            <AlertBanner
              tone="Danger"
              icon={Flag}
              action={{ label: 'Investigate', onClick: () => go('audit') }}
            >
              <strong>{stats.tamperAlerts} certificate failed the blockchain check.</strong>{' '}
              Its database record no longer matches the on-chain hash.
            </AlertBanner>
          )}
          {stats.suspended > 0 && (
            <AlertBanner tone="Warning" icon={University}>
              <strong>{stats.suspended} universities are suspended.</strong>{' '}
              They cannot add graduates, and employers see a warning on their certificates.
            </AlertBanner>
          )}
        </div>
      )}

      <section className={styles.statsGrid}>
        {statCards.map((c) => (
          <StatCard key={c.label} loading={loading} {...c} />
        ))}
      </section>

      <section className={styles.grid3}>
        <IntegrityPanel integrity={integrity} onVerify={verifyIntegrity} />
        <CertStatusBar />
        <CertYearChart />
      </section>

      <section className={styles.grid2}>
        <AccreditationTable universities={universities} onToggle={toggleSuspension} />
        <ForeignAppsTable
          applications={applications}
          onDecide={decide}
          onView={() => go('foreign')}
        />
      </section>

      <section className={styles.grid2}>
        <RecentChecks />
        <AuditLog onSeeAll={() => go('audit')} />
      </section>
    </div>
  );
}
