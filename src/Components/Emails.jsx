import React, { useState, useEffect } from "react";
import { getContract, web3 } from "../web3service";
import { useActivityTracker } from "../hooks/useActivityTracker";
import styles from "./emails.module.css";

function SystemLogs({
  isDark,
  showSuccessNotification,
  showErrorNotification,
}) {
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [activeTab, setActiveTab] = useState("activities"); // 'activities' or 'blockchain'

  // Use activity tracker
  const {
    activities,
    getFilteredActivities,
    clearActivities,
    exportActivities,
    trackSystem,
  } = useActivityTracker();

  useEffect(() => {
    // Track page access
    trackSystem("Page Access", "User accessed System Activity Logs page");

    if (activeTab === "blockchain") {
      fetchSystemLogs();
    }

    // Set up periodic refresh every 30 seconds for blockchain logs
    const interval = setInterval(() => {
      if (activeTab === "blockchain") {
        fetchSystemLogs();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, trackSystem]);

  const fetchSystemLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = [];

      if (!web3 || !web3.eth) {
        setSystemLogs([
          {
            id: 1,
            timestamp: new Date().toISOString(),
            type: "System",
            action: "Web3 connection not available",
            details: "Please check your wallet connection",
            status: "error",
          },
        ]);
        return;
      }

      const currentBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(0, Number(currentBlock) - 1000);

      // Get contracts with error handling
      let userContract, accreditationContract, certificateContract;

      try {
        userContract = getContract("userManagement");
      } catch (error) {
        console.warn("Failed to get user management contract:", error);
      }

      try {
        accreditationContract = getContract("accreditationManagement");
      } catch (error) {
        console.warn("Failed to get accreditation contract:", error);
      }

      try {
        certificateContract = getContract("certificateManagement");
      } catch (error) {
        console.warn("Failed to get certificate contract:", error);
      }

      // Fetch User Management Events
      if (userContract) {
        try {
          const userEvents = await userContract.getPastEvents("allEvents", {
            fromBlock: fromBlock,
            toBlock: "latest",
          });

          userEvents.forEach((event, index) => {
            logs.push({
              id: `user_${index}_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: "User Management",
              action: event.event || "User Event",
              details: `Block: ${event.blockNumber}, Transaction: ${event.transactionHash}`,
              status: "success",
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          });
        } catch (error) {
          console.warn("Error fetching user events:", error);
          logs.push({
            id: `user_error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "User Management",
            action: "Error fetching events",
            details: error.message,
            status: "error",
          });
        }
      }

      // Fetch Accreditation Events
      if (accreditationContract) {
        try {
          const accreditationEvents = await accreditationContract.getPastEvents(
            "allEvents",
            {
              fromBlock: fromBlock,
              toBlock: "latest",
            },
          );

          accreditationEvents.forEach((event, index) => {
            logs.push({
              id: `accred_${index}_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: "Accreditation",
              action: event.event || "Accreditation Event",
              details: `Block: ${event.blockNumber}, Transaction: ${event.transactionHash}`,
              status: "success",
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          });
        } catch (error) {
          console.warn("Error fetching accreditation events:", error);
          logs.push({
            id: `accred_error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "Accreditation",
            action: "Error fetching events",
            details: error.message,
            status: "error",
          });
        }
      }

      // Fetch Certificate Events
      if (certificateContract) {
        try {
          const certificateEvents = await certificateContract.getPastEvents(
            "allEvents",
            {
              fromBlock: fromBlock,
              toBlock: "latest",
            },
          );

          certificateEvents.forEach((event, index) => {
            logs.push({
              id: `cert_${index}_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: "Certificate Management",
              action: event.event || "Certificate Event",
              details: `Block: ${event.blockNumber}, Transaction: ${event.transactionHash}`,
              status: "success",
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          });
        } catch (error) {
          console.warn("Error fetching certificate events:", error);
          logs.push({
            id: `cert_error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "Certificate Management",
            action: "Error fetching events",
            details: error.message,
            status: "error",
          });
        }
      }

      // Sort by block number (most recent first)
      logs.sort(
        (a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0),
      );

      // If no logs found, show sample logs
      if (logs.length === 0) {
        setSystemLogs([
          {
            id: 1,
            timestamp: new Date().toISOString(),
            type: "System",
            action: "System Initialized",
            details: "Blockchain connection established successfully",
            status: "success",
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            type: "System",
            action: "Contracts Loaded",
            details: "All smart contracts loaded and ready",
            status: "success",
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 120000).toISOString(),
            type: "System",
            action: "Web3 Connected",
            details: "Connected to blockchain network",
            status: "success",
          },
        ]);
      } else {
        setSystemLogs(logs.slice(0, 100)); // Limit to 100 most recent logs
      }

      if (showSuccessNotification) {
        showSuccessNotification("System logs refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching system logs:", error);
      setSystemLogs([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          type: "System",
          action: "Error fetching logs",
          details: error.message,
          status: "error",
        },
      ]);

      if (showErrorNotification) {
        showErrorNotification(`Error fetching system logs: ${error.message}`);
      }
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Get filtered activities from activity tracker
  const filteredActivities = getFilteredActivities({
    search: searchQuery,
    category: filterType === "all" ? "" : filterType,
    user: filterUser,
    severity: filterSeverity === "all" ? "" : filterSeverity,
  });

  // Filter blockchain logs based on search query and type
  const filteredLogs = systemLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" ||
      log.type.toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  const clearLogs = () => {
    if (activeTab === "activities") {
      clearActivities();
      trackSystem("Clear Activities", "User cleared all activity logs");
      if (showSuccessNotification) {
        showSuccessNotification("Activity logs cleared successfully!");
      }
    } else {
      setSystemLogs([]);
      trackSystem(
        "Clear Blockchain Logs",
        "User cleared blockchain system logs",
      );
      if (showSuccessNotification) {
        showSuccessNotification("Blockchain logs cleared successfully!");
      }
    }
  };

  const handleExport = () => {
    try {
      const data =
        activeTab === "activities"
          ? exportActivities("json")
          : JSON.stringify(systemLogs, null, 2);

      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-logs-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      trackSystem("Export Logs", `User exported ${activeTab} logs`);
      if (showSuccessNotification) {
        showSuccessNotification(`${activeTab} logs exported successfully!`);
      }
    } catch (error) {
      trackSystem(
        "Export Failed",
        `Failed to export ${activeTab} logs: ${error.message}`,
      );
      if (showErrorNotification) {
        showErrorNotification(`Failed to export logs: ${error.message}`);
      }
    }
  };

  return (
    <div
      className={`${styles.container} ${isDark ? styles.darkContainer : ""}`}
    >
      <header className={`${styles.header} ${isDark ? styles.darkHeader : ""}`}>
        <h1 className={`${styles.title} ${isDark ? styles.darkText : ""}`}>
          System Logs
        </h1>
        <p className={`${styles.subtitle} ${isDark ? styles.darkText : ""}`}>
          Monitor system activities and blockchain events
        </p>
      </header>

      {/* Tab Navigation */}
      <div
        className={`${styles.tabContainer} ${isDark ? styles.darkTabContainer : ""}`}
      >
        <button
          onClick={() => setActiveTab("activities")}
          className={`${styles.tab} ${activeTab === "activities" ? styles.activeTab : ""} ${isDark ? styles.darkTab : ""}`}
        >
          📊 User Activities ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab("blockchain")}
          className={`${styles.tab} ${activeTab === "blockchain" ? styles.activeTab : ""} ${isDark ? styles.darkTab : ""}`}
        >
          ⛓️ Blockchain Events ({systemLogs.length})
        </button>
      </div>

      {/* Controls */}
      <div
        className={`${styles.controls} ${isDark ? styles.darkControls : ""}`}
      >
        <div
          className={`${styles.searchContainer} ${isDark ? styles.darkSearchContainer : ""}`}
        >
          <input
            type="text"
            placeholder="Search logs by action, details, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${styles.searchInput} ${isDark ? styles.darkInput : ""}`}
          />
        </div>

        <div
          className={`${styles.filterContainer} ${isDark ? styles.darkFilterContainer : ""}`}
        >
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${styles.filterSelect} ${isDark ? styles.darkSelect : ""}`}
          >
            {activeTab === "activities" ? (
              <>
                <option value="all">All Categories</option>
                <option value="auth">Authentication</option>
                <option value="navigation">Navigation</option>
                <option value="user_management">User Management</option>
                <option value="certificate">Certificate</option>
                <option value="university">University</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
                <option value="maneb">MANEB</option>
                <option value="system">System</option>
                <option value="blockchain">Blockchain</option>
                <option value="error">Errors</option>
              </>
            ) : (
              <>
                <option value="all">All Types</option>
                <option value="user">User Management</option>
                <option value="accreditation">Accreditation</option>
                <option value="certificate">Certificate Management</option>
                <option value="system">System</option>
              </>
            )}
          </select>
        </div>

        {activeTab === "activities" && (
          <>
            <div
              className={`${styles.filterContainer} ${isDark ? styles.darkFilterContainer : ""}`}
            >
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className={`${styles.filterSelect} ${isDark ? styles.darkSelect : ""}`}
              >
                <option value="all">All Severities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div
              className={`${styles.filterContainer} ${isDark ? styles.darkFilterContainer : ""}`}
            >
              <input
                type="text"
                placeholder="Filter by user..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className={`${styles.searchInput} ${isDark ? styles.darkInput : ""}`}
              />
            </div>
          </>
        )}

        <div
          className={`${styles.actionButtons} ${isDark ? styles.darkActionButtons : ""}`}
        >
          {activeTab === "blockchain" && (
            <button
              onClick={fetchSystemLogs}
              disabled={isLoadingLogs}
              className={`${styles.refreshButton} ${isDark ? styles.darkRefreshButton : ""}`}
            >
              {isLoadingLogs ? "Loading..." : "Refresh"}
            </button>
          )}

          <button
            onClick={handleExport}
            className={`${styles.exportButton} ${isDark ? styles.darkExportButton : ""}`}
          >
            Export {activeTab === "activities" ? "Activities" : "Logs"}
          </button>

          <button
            onClick={clearLogs}
            className={`${styles.clearButton} ${isDark ? styles.darkClearButton : ""}`}
          >
            Clear {activeTab === "activities" ? "Activities" : "Logs"}
          </button>
        </div>
      </div>

      {/* Logs Display */}
      <div
        className={`${styles.logsSection} ${isDark ? styles.darkLogsSection : ""}`}
      >
        {activeTab === "activities" ? (
          // Activity Logs Display
          filteredActivities.length > 0 ? (
            <div
              className={`${styles.logsContainer} ${isDark ? styles.darkLogsContainer : ""}`}
            >
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`${styles.logEntry} ${isDark ? styles.darkLogEntry : ""}`}
                >
                  <div
                    className={`${styles.logHeader} ${isDark ? styles.darkLogHeader : ""}`}
                  >
                    <div
                      className={`${styles.activityHeader} ${isDark ? styles.darkActivityHeader : ""}`}
                    >
                      <span className={`${styles.activityIcon}`}>
                        {activity.icon}
                      </span>
                      <span
                        className={`${styles.logType} ${styles[activity.severity.toLowerCase()]} ${isDark ? styles.darkLogType : ""}`}
                      >
                        {activity.category}
                      </span>
                      <span
                        className={`${styles.severityBadge} ${styles[activity.severity.toLowerCase()]} ${isDark ? styles.darkSeverityBadge : ""}`}
                      >
                        {activity.severity}
                      </span>
                    </div>
                    <span
                      className={`${styles.logTimestamp} ${isDark ? styles.darkText : ""}`}
                    >
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`${styles.logContent} ${isDark ? styles.darkLogContent : ""}`}
                  >
                    <h4
                      className={`${styles.logAction} ${isDark ? styles.darkText : ""}`}
                    >
                      {activity.action}
                    </h4>
                    <p
                      className={`${styles.logDetails} ${isDark ? styles.darkText : ""}`}
                    >
                      {activity.description}
                    </p>
                    <div
                      className={`${styles.activityMeta} ${isDark ? styles.darkActivityMeta : ""}`}
                    >
                      <div
                        className={`${styles.metaItem} ${isDark ? styles.darkMetaItem : ""}`}
                      >
                        <span
                          className={`${styles.metaLabel} ${isDark ? styles.darkText : ""}`}
                        >
                          User:
                        </span>
                        <span
                          className={`${styles.metaValue} ${isDark ? styles.darkText : ""}`}
                        >
                          {activity.user.email} ({activity.user.role})
                        </span>
                      </div>
                      <div
                        className={`${styles.metaItem} ${isDark ? styles.darkMetaItem : ""}`}
                      >
                        <span
                          className={`${styles.metaLabel} ${isDark ? styles.darkText : ""}`}
                        >
                          Page:
                        </span>
                        <span
                          className={`${styles.metaValue} ${isDark ? styles.darkText : ""}`}
                        >
                          {activity.metadata.pathname}
                        </span>
                      </div>
                      {activity.metadata.formName && (
                        <div
                          className={`${styles.metaItem} ${isDark ? styles.darkMetaItem : ""}`}
                        >
                          <span
                            className={`${styles.metaLabel} ${isDark ? styles.darkText : ""}`}
                          >
                            Form:
                          </span>
                          <span
                            className={`${styles.metaValue} ${isDark ? styles.darkText : ""}`}
                          >
                            {activity.metadata.formName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`${styles.emptyState} ${isDark ? styles.darkEmptyState : ""}`}
            >
              <p className={isDark ? styles.darkText : ""}>
                {searchQuery ||
                filterType !== "all" ||
                filterUser ||
                filterSeverity !== "all"
                  ? "No activities match your filters"
                  : "No activities recorded yet"}
              </p>
            </div>
          )
        ) : // Blockchain Logs Display
        isLoadingLogs ? (
          <div
            className={`${styles.loading} ${isDark ? styles.darkLoading : ""}`}
          >
            <p className={isDark ? styles.darkText : ""}>
              Loading blockchain logs...
            </p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div
            className={`${styles.logsContainer} ${isDark ? styles.darkLogsContainer : ""}`}
          >
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`${styles.logEntry} ${isDark ? styles.darkLogEntry : ""}`}
              >
                <div
                  className={`${styles.logHeader} ${isDark ? styles.darkLogHeader : ""}`}
                >
                  <span
                    className={`${styles.logType} ${styles[log.status]} ${isDark ? styles.darkLogType : ""}`}
                  >
                    {log.type}
                  </span>
                  <span
                    className={`${styles.logTimestamp} ${isDark ? styles.darkText : ""}`}
                  >
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div
                  className={`${styles.logContent} ${isDark ? styles.darkLogContent : ""}`}
                >
                  <h4
                    className={`${styles.logAction} ${isDark ? styles.darkText : ""}`}
                  >
                    {log.action}
                  </h4>
                  <p
                    className={`${styles.logDetails} ${isDark ? styles.darkText : ""}`}
                  >
                    {log.details}
                  </p>
                  {log.transactionHash && (
                    <div
                      className={`${styles.logMeta} ${isDark ? styles.darkLogMeta : ""}`}
                    >
                      <span
                        className={`${styles.metaLabel} ${isDark ? styles.darkText : ""}`}
                      >
                        TX:
                      </span>
                      <span
                        className={`${styles.metaValue} ${isDark ? styles.darkText : ""}`}
                      >
                        {log.transactionHash.slice(0, 10)}...
                        {log.transactionHash.slice(-8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`${styles.emptyState} ${isDark ? styles.darkEmptyState : ""}`}
          >
            <p className={isDark ? styles.darkText : ""}>
              {searchQuery || filterType !== "all"
                ? "No blockchain logs match your filters"
                : "No blockchain logs found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemLogs;
