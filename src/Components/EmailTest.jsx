import { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, Download, Trash2, Search, Filter } from 'lucide-react';
import { getContract, web3 } from '../web3service';
import { useActivityTracker } from '../hooks/useActivityTracker';
import styles from './Emails.module.css';

export default function SystemLogsPage({ showSuccessNotification, showErrorNotification }) {
  const [systemLogs, setSystemLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [tab, setTab] = useState('activities');

  const {
    activities, getFilteredActivities, clearActivities, exportActivities, trackSystem,
  } = useActivityTracker();

  useEffect(() => {
    trackSystem('Page Access', 'User accessed System Logs page');
  }, [trackSystem]);

  useEffect(() => {
    if (tab === 'blockchain') fetchLogs();
    const t = setInterval(() => { if (tab === 'blockchain') fetchLogs(); }, 30000);
    return () => clearInterval(t);
  }, [tab]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      if (!web3?.eth) { setSystemLogs([]); return; }
      const latest = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(0, Number(latest) - 1000);

      const contractNames = ['userManagement', 'accreditationManagement', 'certificateManagement'];
      const labels = { userManagement: 'User', accreditationManagement: 'Accreditation', certificateManagement: 'Certificate' };
      const logs = [];

      for (const name of contractNames) {
        let c; try { c = getContract(name); } catch { continue; }
        try {
          const events = await c.getPastEvents('allEvents', { fromBlock, toBlock: 'latest' });
          events.forEach((ev) => logs.push({
            id: `${name}_${ev.transactionHash}`,
            timestamp: new Date().toISOString(),
            type: labels[name],
            action: ev.event,
            details: `Block ${ev.blockNumber}`,
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
          }));
        } catch (err) { /* ignore */ }
      }

      logs.sort((a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0));
      setSystemLogs(logs.slice(0, 100));
    } catch (err) {
      showErrorNotification?.(`Failed to load logs: ${err.message}`);
    } finally { setLoadingLogs(false); }
  };

  const filteredActivities = getFilteredActivities({
    search: query,
    category: typeFilter === 'all' ? '' : typeFilter,
    user: userFilter,
    severity: severityFilter === 'all' ? '' : severityFilter,
  });

  const filteredLogs = systemLogs.filter((l) => {
    const hay = `${l.action} ${l.details} ${l.type}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (typeFilter !== 'all' && !l.type.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    return true;
  });

  const clearAll = () => {
    if (tab === 'activities') { clearActivities(); showSuccessNotification?.('Activity logs cleared.'); }
    else { setSystemLogs([]); showSuccessNotification?.('Blockchain logs cleared.'); }
  };

  const exportAll = () => {
    try {
      const data = tab === 'activities' ? exportActivities('json') : JSON.stringify(systemLogs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${tab}-logs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      showSuccessNotification?.('Logs exported.');
    } catch (err) { showErrorNotification?.(err.message); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>System Logs</h1>
          <p className={styles.subtitle}>Monitor user activities and blockchain events.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'activities' ? styles.tabActive : ''}`}
          onClick={() => setTab('activities')}
        >
          <ScrollText size={16} /> User activities ({activities.length})
        </button>
        <button
          className={`${styles.tab} ${tab === 'blockchain' ? styles.tabActive : ''}`}
          onClick={() => setTab('blockchain')}
        >
          Blockchain events ({systemLogs.length})
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs…"
          />
        </div>

        <select
          className={styles.select}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {tab === 'activities' ? (
            <>
              <option value="auth">Authentication</option>
              <option value="navigation">Navigation</option>
              <option value="user_management">User management</option>
              <option value="certificate">Certificate</option>
              <option value="system">System</option>
            </>
          ) : (
            <>
              <option value="user">User</option>
              <option value="accreditation">Accreditation</option>
              <option value="certificate">Certificate</option>
            </>
          )}
        </select>

        {tab === 'activities' && (
          <select
            className={styles.select}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        )}

        <div className={styles.actions}>
          {tab === 'blockchain' && (
            <button className={styles.btnGhost} onClick={fetchLogs} disabled={loadingLogs}>
              <RefreshCw size={14} /> {loadingLogs ? 'Loading…' : 'Refresh'}
            </button>
          )}
          <button className={styles.btnGhost} onClick={exportAll}>
            <Download size={14} /> Export
          </button>
          <button className={styles.btnGhostDanger} onClick={clearAll}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div className={styles.card}>
        {tab === 'activities' ? (
          filteredActivities.length === 0 ? (
            <EmptyState text={query ? 'No activities match your filters.' : 'No activities recorded yet.'} />
          ) : (
            <ul className={styles.logList}>
              {filteredActivities.map((a) => (
                <li key={a.id} className={styles.logItem}>
                  <div className={styles.logTop}>
                    <span className={`${styles.chip} ${styles[`chip${a.severity}`] || ''}`}>
                      {a.category}
                    </span>
                    <span className={styles.logTime}>{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <div className={styles.logAction}>{a.action}</div>
                  <div className={styles.logDetails}>{a.description}</div>
                  <div className={styles.logMeta}>
                    <span>User: {a.user.email} ({a.user.role})</span>
                    <span>Page: {a.metadata.pathname}</span>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : loadingLogs ? (
          <div className={styles.loadingState}><div className={styles.spinner} /><p>Loading blockchain logs…</p></div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState text={query ? 'No logs match your filters.' : 'No blockchain logs found.'} />
        ) : (
          <ul className={styles.logList}>
            {filteredLogs.map((l) => (
              <li key={l.id} className={styles.logItem}>
                <div className={styles.logTop}>
                  <span className={styles.chip}>{l.type}</span>
                  <span className={styles.logTime}>{new Date(l.timestamp).toLocaleString()}</span>
                </div>
                <div className={styles.logAction}>{l.action}</div>
                <div className={styles.logDetails}>{l.details}</div>
                {l.txHash && (
                  <div className={styles.logMeta}>
                    <code>{l.txHash.slice(0, 12)}…{l.txHash.slice(-8)}</code>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className={styles.emptyState}>
      <ScrollText size={32} />
      <p>{text}</p>
    </div>
  );
}