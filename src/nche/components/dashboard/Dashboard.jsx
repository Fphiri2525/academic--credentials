import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, School, BadgeCheck, Award, Flag, University, AlertTriangle } from 'lucide-react';

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
  useAccreditationManagement,
  useDashboardManagement,
  useConnectionStatus,
  APPLICATION_STATUS,
} from "../../../hooks/useSmartContract";// adjust the path if this file lives elsewhere

import styles from './Dashboard.module.css';

// ---- helpers ----
const ZERO_STATS = {
  accredited: 0,
  suspended: 0,
  programs: 0,
  graduates: 0,
  certificates: 0,
  pendingForeign: 0,
  verificationsToday: 0,
  tamperAlerts: 0,
};

const shortHash = (h) => (h && h.length > 14 ? `${h.slice(0, 6)}…${h.slice(-4)}` : h || '—');

const timeAgo = (seconds) => {
  if (!seconds) return 'Never';
  const diff = Math.max(0, Date.now() / 1000 - seconds);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return `${Math.floor(diff / 86400)} d ago`;
};

// Pull the revert reason out of a web3 error
const errorText = (error) => {
  const text = [error?.message, error?.cause?.message, error?.innerError?.message]
    .filter(Boolean)
    .join(' ');
  const reason = text.match(/revert\s+([^\n]+)/);
  if (reason) return reason[1].trim();
  if (text.includes('User denied transaction')) return 'Transaction was cancelled.';
  if (text.includes('insufficient funds')) return 'Insufficient funds for gas.';
  return error?.message || 'Something went wrong.';
};

// Run one read so a single failing call does not blank the whole dashboard
const safe = async (label, fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.warn(`Dashboard: ${label} failed`, error);
    return fallback;
  }
};

export default function Dashboard({
  setCurrentView,
  showSuccessNotification, showErrorNotification,
  userName, isLoadingUserName,
}) {
  const {
    getAllAccreditedUniversities,
    getProgramsByUniversity,
    updateUniversityStatus,
  } = useAccreditationManagement();

  const {
    getTotalGraduates,
    getTotalCertificatesIssued,
    getGraduateCountForUniversity,
    getCertificateStatusCounts,
    getCertificatesIssuedForYears,
    getIntegritySummary,
    completeIntegrityRun,
    getOpenForeignApplications,
    getTotalOpenForeignApplications,
    updateForeignApplicationStatus,
    getEmployerChecksToday,
  } = useDashboardManagement();

  const { isConnected } = useConnectionStatus();

  const [stats, setStats] = useState(ZERO_STATS);
  const [universities, setUniversities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certByStatus, setCertByStatus] = useState([]);
  const [certByYear, setCertByYear] = useState([]);
  const [integrity, setIntegrity] = useState({
    running: false,
    checked: 0,
    mismatches: 0,
    lastRun: 'Never',
    network: 'Local blockchain',
    lastTx: '—',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ---- Load everything from the contracts ----
  const loadData = useCallback(async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      const unis = await safe('universities', getAllAccreditedUniversities, []);

      const thisYear = new Date().getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => String(thisYear - 4 + i));

      const [
        perUniversity,
        graduates,
        certificates,
        statusCounts,
        openApps,
        openAppsTotal,
        checksToday,
        summary,
        yearCounts,
      ] = await Promise.all([
        // graduates and active programs for each university
        Promise.all(
          unis.map(async (u) => {
            const [certs, progs] = await Promise.all([
              safe(`graduates of ${u.name}`, () => getGraduateCountForUniversity(u.name), 0),
              safe(`programs of ${u.name}`, () => getProgramsByUniversity(u.name), []),
            ]);
            return { certs, activePrograms: progs.filter((p) => Number(p.status) === 0).length };
          }),
        ),
        safe('graduates', getTotalGraduates, 0),
        safe('certificates', getTotalCertificatesIssued, 0),
        safe('status counts', getCertificateStatusCounts, { valid: 0, suspended: 0, revoked: 0 }),
        safe('foreign applications', getOpenForeignApplications, []),
        safe('open applications total', getTotalOpenForeignApplications, 0),
        safe('employer checks today', getEmployerChecksToday, 0),
        safe('integrity summary', getIntegritySummary, { checked: 0, mismatches: 0, lastCheckAt: 0 }),
        safe('certificates per year', () => getCertificatesIssuedForYears(years), []),
      ]);

      const rows = unis.map((u, i) => ({
        id: u.id ?? i,
        name: u.name,
        status: Number(u.status) === 1 ? 'SUSPENDED' : 'ACCREDITED',
        certs: perUniversity[i]?.certs ?? 0,
      }));

      setUniversities(rows);
      setApplications(
        openApps.map((a) => ({
          id: a.applicationId,
          index: a.index,
          // several names for the same fields so the table finds what it expects
          applicant: a.applicantName,
          applicantName: a.applicantName,
          name: a.applicantName,
          country: a.country,
          award: a.award,
          qualification: a.award,
          status: a.statusLabel,
          date: a.submittedDate,
          submittedAt: a.submittedDate,
        })),
      );

      setStats({
        accredited: rows.filter((r) => r.status === 'ACCREDITED').length,
        suspended: rows.filter((r) => r.status === 'SUSPENDED').length,
        programs: perUniversity.reduce((n, p) => n + p.activePrograms, 0),
        graduates,
        certificates,
        pendingForeign: openAppsTotal,
        verificationsToday: checksToday,
        tamperAlerts: summary.mismatches,
      });

      setCertByStatus([
        { label: 'Valid', value: statusCounts.valid, color: 'var(--success)' },
        { label: 'Suspended', value: statusCounts.suspended, color: 'var(--warning)' },
        { label: 'Revoked', value: statusCounts.revoked, color: 'var(--danger)' },
      ]);
      setCertByYear(yearCounts);

      setIntegrity((i) => ({
        ...i,
        checked: summary.checked,
        mismatches: summary.mismatches,
        lastRun: timeAgo(summary.lastCheckAt),
      }));
    } catch (error) {
      console.error('Dashboard load failed:', error);
      showErrorNotification?.(`Error loading dashboard: ${errorText(error)}`);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const go = (view) => setCurrentView(view);

  // ---- Suspend / reinstate a university ----
  const toggleUniversity = async (u) => {
    if (busy) return;
    const suspending = u.status === 'ACCREDITED';
    const question = suspending
      ? `Suspend ${u.name}? It will not be able to add graduates.`
      : `Reinstate ${u.name}?`;
    if (!window.confirm(question)) return;

    try {
      setBusy(true);
      await updateUniversityStatus({ name: u.name, status: suspending ? 1 : 0 });
      await loadData();
      suspending
        ? showErrorNotification?.(`${u.name} suspended. Uploads are now blocked.`)
        : showSuccessNotification?.(`${u.name} reinstated.`);
    } catch (error) {
      showErrorNotification?.(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  // ---- Approve / reject a foreign application ----
  const decide = async (app, status) => {
    if (busy) return;
    const approved = status === 'APPROVED';

    try {
      setBusy(true);
      await updateForeignApplicationStatus(
        app.index,
        approved ? APPLICATION_STATUS.APPROVED : APPLICATION_STATUS.REJECTED,
      );
      await loadData();
      approved
        ? showSuccessNotification?.(`${app.id} approved.`)
        : showErrorNotification?.(`${app.id} rejected.`);
    } catch (error) {
      showErrorNotification?.(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  // ---- Record an integrity run ----
  // Comparing each record needs its database hash (checkRecordIntegrity in the hook),
  // which comes from your backend. This button records that a run finished.
  const verifyIntegrity = async () => {
    if (integrity.running) return;
    setIntegrity((i) => ({ ...i, running: true }));

    try {
      const tx = await completeIntegrityRun();
      const summary = await getIntegritySummary();
      setIntegrity((i) => ({
        ...i,
        running: false,
        checked: summary.checked,
        mismatches: summary.mismatches,
        lastRun: timeAgo(summary.lastCheckAt),
        lastTx: shortHash(tx?.transactionHash),
      }));
      setStats((s) => ({ ...s, tamperAlerts: summary.mismatches }));

      summary.mismatches > 0
        ? showErrorNotification?.(
            `${summary.mismatches} certificate does not match the blockchain. Open Audit Logs.`,
          )
        : showSuccessNotification?.('Integrity run recorded. No mismatches found.');
    } catch (error) {
      setIntegrity((i) => ({ ...i, running: false }));
      showErrorNotification?.(errorText(error));
    }
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

      {(!isConnected || stats.tamperAlerts > 0 || stats.suspended > 0) && (
        <div className={styles.alerts}>
          {!isConnected && (
            <AlertBanner tone="Warning" icon={AlertTriangle}>
              <strong>Wallet not connected.</strong>{' '}
              Connect your wallet to load live data from the blockchain.
            </AlertBanner>
          )}
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
        <CertStatusBar data={certByStatus} />
        <CertYearChart data={certByYear} />
      </section>

      <section className={styles.grid2}>
        <AccreditationTable universities={universities} onToggle={toggleUniversity} />
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