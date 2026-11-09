import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  RotateCcw,
  Search,
  X,
  Eye,
  Ban,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import styles from "./SuspensionsPage.module.css";
import {
  useAccreditationManagement,
  useConnectionStatus,
} from "../../../hooks/useSmartContract"; // adjust the path if this file lives elsewhere

// ---- Status helpers (enum: 0 = Active, 1 = Suspended) ----
const ACTIVE = 0;
const SUSPENDED = 1;
const isSuspended = (s) => Number(s) === SUSPENDED;
const statusLabel = (s) => (isSuspended(s) ? "Suspended" : "Active");

// ---- Normalizers: work with named fields, raw arrays, or a struct nested in `name` ----
const toText = (v) =>
  v === null || v === undefined || typeof v === "object" ? "" : String(v);

const unwrap = (x) =>
  x && typeof x.name === "object" && x.name !== null ? x.name : x;

const normalizeUniversity = (raw) => {
  const u = unwrap(raw);
  return {
    name: toText(u.name ?? u[0]),
    category: toText(u.category ?? u[1]),
    contactInfo: toText(u.contactInfo ?? u[2]),
    status: Number(u.status ?? u[3] ?? 0),
  };
};

const normalizeProgram = (raw) => {
  const p = unwrap(raw);
  return {
    institutionName: toText(p.institutionName ?? p[0]),
    programName: toText(p.programName ?? p[1]),
    programType: toText(p.programType ?? p[2]),
    accreditationDate: toText(p.accreditationDate ?? p[3]),
    status: Number(p.status ?? p[4] ?? 0),
  };
};

const friendlyError = (error) => {
  const msg = error?.message || "";
  if (msg.includes("Not authorized"))
    return "Your wallet is not authorized to change status. Use the owner or an authorized institution account.";
  if (msg.includes("User denied transaction")) return "Transaction was cancelled.";
  if (msg.includes("already has this status"))
    return "It already has that status.";
  if (msg.includes("not found")) return "Record not found.";
  if (msg.includes("insufficient funds")) return "Insufficient funds for gas.";
  if (msg.includes("out of gas")) return "Transaction failed due to insufficient gas.";
  return msg || "Failed to update status.";
};

// ---- Small shared components ----
function StatusBadge({ status }) {
  return (
    <span
      className={`${styles.badge} ${
        isSuspended(status) ? styles.badgeSuspended : styles.badgeActive
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function StatusAction({ status, onClick, disabled }) {
  const suspended = isSuspended(status);
  return (
    <button
      className={suspended ? styles.btnSuccess : styles.btnDanger}
      onClick={onClick}
      disabled={disabled}
    >
      {suspended ? <RotateCcw size={14} /> : <Ban size={14} />}
      {suspended ? "Reinstate" : "Suspend"}
    </button>
  );
}

export default function SuspensionsPage({
  showSuccessNotification,
  showErrorNotification,
}) {
  const {
    getAllAccreditedUniversities,
    getProgramsByUniversity,
    updateUniversityStatus,
    updateProgramStatus,
  } = useAccreditationManagement();
  const { isConnected } = useConnectionStatus();

  // Data
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState({}); // { [universityName]: Program[] }
  const [isLoading, setIsLoading] = useState(false);

  // List controls
  const [tab, setTab] = useState("universities"); // 'universities' | 'programs'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'suspended'
  const [query, setQuery] = useState("");

  // Modals
  const [viewingName, setViewingName] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // { type, university, program?, nextStatus }
  const [isUpdating, setIsUpdating] = useState(false);

  // Action bar
  const [barType, setBarType] = useState("university"); // 'university' | 'program'
  const [barUniversity, setBarUniversity] = useState("");
  const [barProgram, setBarProgram] = useState("");
  const [barStatus, setBarStatus] = useState(String(SUSPENDED));

  // ---- Load everything from the contract ----
  // Reads every university and its programs fresh from the contract
  const fetchSnapshot = async () => {
    const raw = await getAllAccreditedUniversities();
    const unis = Array.isArray(raw) ? raw.map(normalizeUniversity) : [];

    const entries = await Promise.all(
      unis.map(async (u) => {
        try {
          const p = await getProgramsByUniversity(u.name);
          return [u.name, Array.isArray(p) ? p.map(normalizeProgram) : []];
        } catch {
          return [u.name, []];
        }
      }),
    );

    return { unis, programMap: Object.fromEntries(entries) };
  };

  const loadData = useCallback(async () => {
    if (!isConnected) {
      setUniversities([]);
      setPrograms({});
      return;
    }
    try {
      setIsLoading(true);
      const { unis, programMap } = await fetchSnapshot();
      setUniversities(unis);
      setPrograms(programMap);
    } catch (error) {
      setUniversities([]);
      setPrograms({});
      showErrorNotification?.(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Derived data ----
  const allPrograms = useMemo(
    () =>
      universities.flatMap((u) =>
        (programs[u.name] ?? []).map((p) => ({ ...p, universityName: u.name })),
      ),
    [universities, programs],
  );

  const stats = useMemo(
    () => ({
      universities: universities.length,
      suspendedUniversities: universities.filter((u) => isSuspended(u.status)).length,
      programs: allPrograms.length,
      suspendedPrograms: allPrograms.filter((p) => isSuspended(p.status)).length,
    }),
    [universities, allPrograms],
  );

  const matchesStatus = (s) =>
    statusFilter === "all" ||
    (statusFilter === "suspended" ? isSuspended(s) : !isSuspended(s));

  const q = query.trim().toLowerCase();

  const filteredUniversities = universities.filter(
    (u) =>
      matchesStatus(u.status) &&
      (!q ||
        u.name.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q) ||
        u.contactInfo.toLowerCase().includes(q)),
  );

  const filteredPrograms = allPrograms.filter(
    (p) =>
      matchesStatus(p.status) &&
      (!q ||
        p.programName.toLowerCase().includes(q) ||
        p.programType.toLowerCase().includes(q) ||
        p.universityName.toLowerCase().includes(q)),
  );

  const viewingUniversity = universities.find((u) => u.name === viewingName) ?? null;

  // ---- Action bar derived values ----
  const barUniversityObj = universities.find((u) => u.name === barUniversity) ?? null;
  const barProgramsList = barUniversity ? programs[barUniversity] ?? [] : [];
  const barProgramObj = barProgramsList.find((p) => p.programName === barProgram) ?? null;
  const barCurrentStatus =
    barType === "university" ? barUniversityObj?.status : barProgramObj?.status;
  const barTargetSelected =
    barType === "university" ? Boolean(barUniversityObj) : Boolean(barProgramObj);
  const barNoChange =
    barTargetSelected && Number(barCurrentStatus) === Number(barStatus);

  // ---- Modal helpers ----
  const openConfirm = (target) => setConfirmTarget(target);

  const closeConfirm = () => {
    if (!isUpdating) setConfirmTarget(null);
  };

  const toggleUniversity = (university) =>
    openConfirm({
      type: "university",
      university,
      nextStatus: isSuspended(university.status) ? ACTIVE : SUSPENDED,
    });

  const toggleProgram = (university, program) =>
    openConfirm({
      type: "program",
      university,
      program,
      nextStatus: isSuspended(program.status) ? ACTIVE : SUSPENDED,
    });

  const handleApplyFromBar = () => {
    if (!barTargetSelected || barNoChange) return;
    if (barType === "university") {
      openConfirm({
        type: "university",
        university: barUniversityObj,
        nextStatus: Number(barStatus),
      });
    } else {
      openConfirm({
        type: "program",
        university: barUniversityObj,
        program: barProgramObj,
        nextStatus: Number(barStatus),
      });
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { type, university, program, nextStatus } = confirmTarget;

    try {
      setIsUpdating(true);

      let receipt;
      if (type === "university") {
        if (!updateUniversityStatus)
          throw new Error("updateUniversityStatus is missing from useSmartContract");
        receipt = await updateUniversityStatus({ name: university.name, status: nextStatus });
      } else {
        if (!updateProgramStatus)
          throw new Error("updateProgramStatus is missing from useSmartContract");
        receipt = await updateProgramStatus({
          institutionName: university.name,
          programName: program.programName,
          status: nextStatus,
        });
      }

      // A receipt that reports a failed transaction is not a success
      const receiptFailed =
        receipt &&
        (receipt.status === false ||
          (receipt.status !== undefined && Number(receipt.status) === 0));
      if (receiptFailed) throw new Error("The update was not accepted.");

      // Read the data back and make sure the new status is really saved
      const { unis, programMap } = await fetchSnapshot();
      setUniversities(unis);
      setPrograms(programMap);

      const savedStatus =
        type === "university"
          ? unis.find((u) => u.name === university.name)?.status
          : (programMap[university.name] ?? []).find(
              (p) => p.programName === program.programName,
            )?.status;

      if (Number(savedStatus) !== Number(nextStatus)) {
        throw new Error("The update could not be confirmed. Please refresh and try again.");
      }

      // Only now do we tell the user it worked
      const label = type === "university" ? "University" : "Program";
      const itemName = type === "university" ? university.name : program.programName;
      const verb = nextStatus === SUSPENDED ? "suspended" : "reinstated";
      showSuccessNotification?.(`${label} "${itemName}" has been ${verb}.`);
      setConfirmTarget(null);
    } catch (error) {
      showErrorNotification?.(friendlyError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  // ESC closes the top-most modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (confirmTarget) {
        if (!isUpdating) setConfirmTarget(null);
      } else {
        setViewingName(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmTarget, isUpdating]);

  // Lock page scroll while a modal is open
  const modalOpen = Boolean(viewingName || confirmTarget);
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  // ---- Render ----
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Accreditation Status</h1>
          <p className={styles.subtitle}>
            Suspend or reinstate accredited universities and their programs.
          </p>
        </div>
        <button
          className={styles.btnGhost}
          onClick={loadData}
          disabled={isLoading || isUpdating || !isConnected}
        >
          <RefreshCw size={14} className={isLoading ? styles.spin : ""} />
          Refresh
        </button>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertTriangle size={18} />
          <span>Please connect your wallet to view and update accreditation status.</span>
        </div>
      )}

      {/* Summary */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.universities}</span>
          <span className={styles.statLabel}>Universities</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${stats.suspendedUniversities ? styles.statDanger : ""}`}>
            {stats.suspendedUniversities}
          </span>
          <span className={styles.statLabel}>Suspended universities</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.programs}</span>
          <span className={styles.statLabel}>Programs</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${stats.suspendedPrograms ? styles.statDanger : ""}`}>
            {stats.suspendedPrograms}
          </span>
          <span className={styles.statLabel}>Suspended programs</span>
        </div>
      </div>

      {/* Update status action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarHead}>
          <h2 className={styles.actionBarTitle}>Update status</h2>
          <div className={styles.segmented} role="tablist" aria-label="What to update">
            {["university", "program"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={barType === t}
                className={`${styles.segment} ${barType === t ? styles.segmentActive : ""}`}
                onClick={() => {
                  setBarType(t);
                  setBarProgram("");
                }}
              >
                {t === "university" ? "University" : "Program"}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actionBarFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bar-university">University</label>
            <select
              id="bar-university"
              className={styles.select}
              value={barUniversity}
              onChange={(e) => {
                setBarUniversity(e.target.value);
                setBarProgram("");
              }}
              disabled={!isConnected || universities.length === 0}
            >
              <option value="">Select a university</option>
              {universities.map((u, i) => (
                <option key={`${u.name}-${i}`} value={u.name}>
                  {u.name} ({statusLabel(u.status)})
                </option>
              ))}
            </select>
          </div>

          {barType === "program" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="bar-program">Program</label>
              <select
                id="bar-program"
                className={styles.select}
                value={barProgram}
                onChange={(e) => setBarProgram(e.target.value)}
                disabled={!barUniversity || barProgramsList.length === 0}
              >
                <option value="">
                  {barUniversity && barProgramsList.length === 0
                    ? "No programs for this university"
                    : "Select a program"}
                </option>
                {barProgramsList.map((p, i) => (
                  <option key={`${p.programName}-${i}`} value={p.programName}>
                    {p.programName} ({statusLabel(p.status)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="bar-status">New status</label>
            <select
              id="bar-status"
              className={styles.select}
              value={barStatus}
              onChange={(e) => setBarStatus(e.target.value)}
            >
              <option value={SUSPENDED}>Suspended</option>
              <option value={ACTIVE}>Active (reinstate)</option>
            </select>
          </div>

          <button
            className={Number(barStatus) === SUSPENDED ? styles.btnDanger : styles.btnSuccess}
            onClick={handleApplyFromBar}
            disabled={!isConnected || !barTargetSelected || barNoChange || isUpdating}
          >
            {Number(barStatus) === SUSPENDED ? <Ban size={14} /> : <RotateCcw size={14} />}
            {Number(barStatus) === SUSPENDED ? "Suspend" : "Reinstate"}
          </button>
        </div>

        {barNoChange && (
          <p className={styles.fieldHint}>
            This {barType} is already {statusLabel(barCurrentStatus).toLowerCase()}.
          </p>
        )}
      </div>

      {/* Lists */}
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={tab === "universities"}
              className={`${styles.tab} ${tab === "universities" ? styles.tabActive : ""}`}
              onClick={() => setTab("universities")}
            >
              Universities <span className={styles.tabCount}>{universities.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "programs"}
              className={`${styles.tab} ${tab === "programs" ? styles.tabActive : ""}`}
              onClick={() => setTab("programs")}
            >
              Programs <span className={styles.tabCount}>{allPrograms.length}</span>
            </button>
          </div>

          <div className={styles.toolbarRight}>
            <select
              className={`${styles.select} ${styles.selectCompact}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === "universities" ? "Search universities" : "Search programs"}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading...</p>
          </div>
        ) : tab === "universities" ? (
          filteredUniversities.length === 0 ? (
            <div className={styles.emptyState}>
              <RotateCcw size={32} />
              <p>{isConnected ? "No universities match your filters." : "Connect your wallet to view universities."}</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Contact</th>
                    <th>Programs</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniversities.map((u, i) => {
                    const list = programs[u.name] ?? [];
                    const suspendedCount = list.filter((p) => isSuspended(p.status)).length;
                    return (
                      <tr key={`${u.name}-${i}`}>
                        <td>
                          <div className={styles.nameCell}>
                            <span className={styles.name}>{u.name}</span>
                            <span className={styles.subtle}>{u.category}</span>
                          </div>
                        </td>
                        <td className={styles.reason}>{u.contactInfo}</td>
                        <td>
                          <div className={styles.nameCell}>
                            <span>{list.length}</span>
                            {suspendedCount > 0 && (
                              <span className={styles.subtle}>{suspendedCount} suspended</span>
                            )}
                          </div>
                        </td>
                        <td><StatusBadge status={u.status} /></td>
                        <td>
                          <div className={styles.tableActions}>
                            <button className={styles.btnGhost} onClick={() => setViewingName(u.name)}>
                              <Eye size={14} /> View
                            </button>
                            <StatusAction
                              status={u.status}
                              onClick={() => toggleUniversity(u)}
                              disabled={isUpdating}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : filteredPrograms.length === 0 ? (
          <div className={styles.emptyState}>
            <RotateCcw size={32} />
            <p>{isConnected ? "No programs match your filters." : "Connect your wallet to view programs."}</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>University</th>
                  <th>Accreditation date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((p, i) => {
                  const uni = universities.find((u) => u.name === p.universityName);
                  return (
                    <tr key={`${p.universityName}-${p.programName}-${i}`}>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.name}>{p.programName}</span>
                          <span className={styles.subtle}>{p.programType}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span>{p.universityName}</span>
                          {uni && isSuspended(uni.status) && (
                            <span className={styles.subtle}>University suspended</span>
                          )}
                        </div>
                      </td>
                      <td>{p.accreditationDate}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div className={styles.tableActions}>
                          <StatusAction
                            status={p.status}
                            onClick={() => toggleProgram(uni, p)}
                            disabled={isUpdating || !uni}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal: university details + its programs */}
      {viewingUniversity && (
        <div className={styles.overlayBackdrop} onClick={() => setViewingName(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>{viewingUniversity.category}</div>
                <h2 id="view-modal-title" className={styles.modalTitle}>
                  {viewingUniversity.name}
                </h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setViewingName(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {isSuspended(viewingUniversity.status) && (
                <div className={`${styles.alert} ${styles.alertWarning}`} style={{ margin: 0 }}>
                  <Ban size={18} />
                  <span><strong>Currently suspended.</strong></span>
                </div>
              )}

              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.metaLabel}>Status</div>
                  <div className={styles.metaValue}><StatusBadge status={viewingUniversity.status} /></div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Contact</div>
                  <div className={styles.metaValue}>{viewingUniversity.contactInfo || "—"}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Category</div>
                  <div className={styles.metaValue}>{viewingUniversity.category || "—"}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Programs</div>
                  <div className={styles.metaValue}>{(programs[viewingUniversity.name] ?? []).length}</div>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Programs</h3>
                {(programs[viewingUniversity.name] ?? []).length === 0 ? (
                  <div className={styles.emptyInline}>No programs added yet.</div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Program</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs[viewingUniversity.name].map((p, i) => (
                          <tr key={`${p.programName}-${i}`}>
                            <td>
                              <div className={styles.nameCell}>
                                <span className={styles.name}>{p.programName}</span>
                                <span className={styles.subtle}>{p.programType}</span>
                              </div>
                            </td>
                            <td>{p.accreditationDate}</td>
                            <td><StatusBadge status={p.status} /></td>
                            <td>
                              <div className={styles.tableActions}>
                                <StatusAction
                                  status={p.status}
                                  onClick={() => toggleProgram(viewingUniversity, p)}
                                  disabled={isUpdating}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={() => setViewingName(null)}>
                Close
              </button>
              <StatusAction
                status={viewingUniversity.status}
                onClick={() => toggleUniversity(viewingUniversity)}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmTarget && (
        <div className={`${styles.overlayBackdrop} ${styles.overlayTop}`} onClick={closeConfirm}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 id="confirm-modal-title" className={styles.modalTitle}>
                  {confirmTarget.nextStatus === SUSPENDED ? "Suspend" : "Reinstate"}{" "}
                  {confirmTarget.type}
                </h2>
                <div className={styles.subtle}>
                  {confirmTarget.type === "university"
                    ? confirmTarget.university.name
                    : `${confirmTarget.program.programName} at ${confirmTarget.university.name}`}
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeConfirm} aria-label="Close" disabled={isUpdating}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.statusChange}>
                <StatusBadge
                  status={
                    confirmTarget.type === "university"
                      ? confirmTarget.university.status
                      : confirmTarget.program.status
                  }
                />
                <span className={styles.arrow}>to</span>
                <StatusBadge status={confirmTarget.nextStatus} />
              </div>
              <p className={styles.confirmText}>
                Do you want to {confirmTarget.nextStatus === SUSPENDED ? "suspend" : "reinstate"}{" "}
                <strong>
                  {confirmTarget.type === "university"
                    ? confirmTarget.university.name
                    : confirmTarget.program.programName}
                </strong>
                ?
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={closeConfirm} disabled={isUpdating}>
                No
              </button>
              <button
                className={confirmTarget.nextStatus === SUSPENDED ? styles.btnDanger : styles.btnSuccess}
                onClick={handleConfirm}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  "Please wait..."
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {confirmTarget.nextStatus === SUSPENDED ? "Yes, suspend" : "Yes, reinstate"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}