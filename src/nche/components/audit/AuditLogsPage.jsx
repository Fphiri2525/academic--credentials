import { useMemo, useState } from 'react';
import {
  Search, ShieldCheck, Filter, X, User, Calendar, FileText,
  Ban, Globe, GraduationCap, Settings as SettingsIcon, LogIn, RotateCcw,
} from 'lucide-react';
import styles from './AuditLogsPage.module.css';

// TODO: replace with GET /api/audit-logs
const MOCK_LOGS = [
  {
    id: 'LOG-0001', actor: 'NCHE Admin', role: 'admin',
    action: 'SUSPEND_UNIVERSITY', category: 'accreditation',
    target: 'Unaccredited College A',
    description: 'Suspended university for accreditation expiry.',
    timestamp: '12 Mar 2026, 14:22',
    meta: {
      before: { status: 'ACCREDITED' },
      after:  { status: 'SUSPENDED' },
      reason: 'Accreditation expired (2024)',
      ip: '196.11.42.8',
    },
  },
  {
    id: 'LOG-0002', actor: 'NCHE Admin', role: 'admin',
    action: 'APPROVE_APPLICATION', category: 'foreign',
    target: 'FA-2026-0001 (BSc Nursing, Zambia)',
    description: 'Approved foreign certificate.',
    timestamp: '12 Mar 2026, 11:04',
    meta: {
      before: { status: 'UNDER_REVIEW' },
      after:  { status: 'APPROVED' },
      ip: '196.11.42.8',
    },
  },
  {
    id: 'LOG-0003', actor: 'MANEB', role: 'maneb',
    action: 'UPLOAD_RESULTS', category: 'maneb',
    target: 'MSCE 2026 Results',
    description: 'Uploaded 48,210 student results.',
    timestamp: '12 Mar 2026, 08:15',
    meta: { records: 48210, ip: '41.87.200.11' },
  },
  {
    id: 'LOG-0004', actor: 'NCHE Admin', role: 'admin',
    action: 'ACCREDIT_UNIVERSITY', category: 'accreditation',
    target: 'Lilongwe University of Agriculture',
    description: 'New accreditation granted.',
    timestamp: '11 Mar 2026, 16:40',
    meta: { before: null, after: { status: 'ACCREDITED' }, ip: '196.11.42.8' },
  },
  {
    id: 'LOG-0005', actor: 'NCHE Admin', role: 'admin',
    action: 'TOGGLE_SETTING', category: 'settings',
    target: 'Blockchain network: Sepolia',
    description: 'Switched RPC endpoint to Sepolia testnet.',
    timestamp: '10 Mar 2026, 09:12',
    meta: {
      before: { network: 'localhost' },
      after:  { network: 'sepolia' },
      ip: '196.11.42.8',
    },
  },
  {
    id: 'LOG-0006', actor: 'Sarah Mkandawire', role: 'university',
    action: 'LOGIN', category: 'auth',
    target: 'University account',
    description: 'Successful login.',
    timestamp: '10 Mar 2026, 08:05',
    meta: { ip: '41.87.198.3', agent: 'Chrome 122 / macOS' },
  },
];

const CATEGORY_LABELS = {
  accreditation: 'Accreditation',
  foreign: 'Foreign',
  maneb: 'MANEB',
  settings: 'Settings',
  auth: 'Authentication',
};

const CATEGORY_ICON = {
  accreditation: GraduationCap,
  foreign: Globe,
  maneb: FileText,
  settings: SettingsIcon,
  auth: LogIn,
};

const CATEGORY_COLOR = {
  accreditation: 'var(--accent)',
  foreign: 'var(--accent)',
  maneb: 'var(--success)',
  settings: 'var(--text-muted)',
  auth: 'var(--warning)',
};

export default function AuditLogsPage() {
  const [logs] = useState(MOCK_LOGS);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const actors = useMemo(
    () => Array.from(new Set(logs.map((l) => l.actor))),
    [logs]
  );

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (query) {
        const haystack = `${l.actor} ${l.action} ${l.target} ${l.description}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      if (category && l.category !== category) return false;
      if (actorFilter && l.actor !== actorFilter) return false;
      if (dateFilter) {
        // timestamp format: "12 Mar 2026, 14:22"
        const logDate = l.timestamp.split(',')[0]; // "12 Mar 2026"
        const d = new Date(logDate);
        if (Number.isNaN(d.getTime())) return false;
        const iso = d.toISOString().slice(0, 10);
        if (iso !== dateFilter) return false;
      }
      return true;
    });
  }, [logs, query, category, actorFilter, dateFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.subtitle}>
            Every important action: who did it, what changed, and when.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, target, or action"
            className={styles.searchInput}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={styles.select}
        />

        {(query || category || actorFilter || dateFilter) && (
          <button
            className={styles.btnGhost}
            onClick={() => { setQuery(''); setCategory(''); setActorFilter(''); setDateFilter(''); }}
          >
            <RotateCcw size={14} /> Clear
          </button>
        )}
      </div>

      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <ShieldCheck size={32} />
            <p>No log entries match your filters.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const Icon = CATEGORY_ICON[log.category] || FileText;
                  const color = CATEGORY_COLOR[log.category] || 'var(--text-muted)';
                  return (
                    <tr key={log.id}>
                      <td className={styles.mono}>{log.timestamp}</td>
                      <td>
                        <div className={styles.actorCell}>
                          <User size={14} className={styles.subtleIcon} />
                          <span>{log.actor}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryPill} style={{ color, borderColor: color }}>
                          <Icon size={12} /> {CATEGORY_LABELS[log.category]}
                        </span>
                      </td>
                      <td className={styles.action}>{log.action}</td>
                      <td className={styles.target}>{log.target}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className={styles.btnGhost} onClick={() => setSelected(log)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selected && (
        <div className={styles.overlayBackdrop} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{selected.id} · {selected.timestamp}</div>
                <h2 className={styles.modalTitle}>{selected.action}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.metaLabel}>Actor</div>
                  <div className={styles.metaValue}>{selected.actor} ({selected.role})</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Category</div>
                  <div className={styles.metaValue}>{CATEGORY_LABELS[selected.category]}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Target</div>
                  <div className={styles.metaValue}>{selected.target}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Timestamp</div>
                  <div className={styles.metaValue}>{selected.timestamp}</div>
                </div>
              </div>

              <p className={styles.description}>{selected.description}</p>

              {/* Before / After */}
              {(selected.meta?.before !== undefined || selected.meta?.after !== undefined) && (
                <div className={styles.diffGrid}>
                  <div className={styles.diffColumn}>
                    <h4 className={styles.diffTitle}>Before</h4>
                    <pre className={styles.code}>
                      {selected.meta.before
                        ? JSON.stringify(selected.meta.before, null, 2)
                        : '—'}
                    </pre>
                  </div>
                  <div className={styles.diffColumn}>
                    <h4 className={styles.diffTitle}>After</h4>
                    <pre className={styles.code}>
                      {selected.meta.after
                        ? JSON.stringify(selected.meta.after, null, 2)
                        : '—'}
                    </pre>
                  </div>
                </div>
              )}

              {selected.meta?.reason && (
                <div className={styles.note}>
                  <Ban size={14} /> <strong>Reason:</strong> {selected.meta.reason}
                </div>
              )}

              <div className={styles.infoGrid}>
                {selected.meta?.ip && (
                  <div>
                    <div className={styles.metaLabel}>IP address</div>
                    <div className={styles.metaValue}>{selected.meta.ip}</div>
                  </div>
                )}
                {selected.meta?.agent && (
                  <div>
                    <div className={styles.metaLabel}>User agent</div>
                    <div className={styles.metaValue}>{selected.meta.agent}</div>
                  </div>
                )}
                {selected.meta?.records !== undefined && (
                  <div>
                    <div className={styles.metaLabel}>Records affected</div>
                    <div className={styles.metaValue}>{selected.meta.records.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}