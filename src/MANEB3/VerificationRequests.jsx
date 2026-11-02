import React, { useState, useEffect } from 'react';
import {
  Eye, RefreshCw, CheckCircle, Clock, AlertCircle,
  Search, Filter, X, Inbox, ShieldCheck, FileText,
} from 'lucide-react';
import { useTheme } from './maneb';
import { useManebContract, useConnectionStatus } from '../hooks/useSmartContract';
import styles from './verification.module.css';

const VerificationRequests = () => {
  const { darkMode } = useTheme();
  const { isConnected } = useConnectionStatus();

  const [verificationRequests, setVerificationRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    getAllVerificationRequests,
    getVerifiedStudents,
    getVerificationHistory,
  } = useManebContract();

  const fetchVerificationRequests = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to view verification requests');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requests = await getAllVerificationRequests();

      if (Array.isArray(requests) && requests.length > 0) {
        const verifiedStudents = await getVerifiedStudents();
        const verificationHistory = await getVerificationHistory();

        const formattedRequests = requests.map((request, index) => {
          const isVerified = verifiedStudents.some(
            (student) =>
              student.examinationNumber === request.examinationNumber,
          );

          const verificationRecord = verificationHistory.find(
            (record) =>
              record.examinationNumber === request.examinationNumber,
          );

          return {
            id: index + 1,
            studentName: request.studentName || '',
            examinationNumber: request.examinationNumber || '',
            schoolName: request.schoolName || '',
            yearOfExamination: request.yearOfExamination || '',
            dateOfApproval: request.dateOfApproval || '',
            status: isVerified
              ? 'Verified'
              : request.dateOfApproval
              ? 'Approved'
              : 'Pending',
            verificationDate: verificationRecord?.verificationDate || '',
            verifiedBy: verificationRecord?.verifiedBy || '',
            scanCount: verificationRecord?.scanCount || 0,
            lastScanned: verificationRecord?.lastScanned || '',
          };
        });

        setVerificationRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      } else {
        setVerificationRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      setError(`Failed to fetch verification requests: ${error.message}`);
      setVerificationRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = verificationRequests;

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.examinationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.schoolName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (request) =>
          request.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, verificationRequests]);

  useEffect(() => {
    if (isConnected) {
      fetchVerificationRequests();
    }
  }, [isConnected]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Not available';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const statusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return `${styles.badge} ${styles.badgeVerified}`;
      case 'approved':
        return `${styles.badge} ${styles.badgeApproved}`;
      case 'pending':
        return `${styles.badge} ${styles.badgePending}`;
      default:
        return `${styles.badge} ${styles.badgePending}`;
    }
  };

  const statusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Verification Requests</h1>
          <p className={styles.subtitle}>
            Track certificate verification requests and audit trails.
          </p>
        </div>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertCircle size={16} />
          <span>
            Please connect your wallet to view verification requests.
          </span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {verificationRequests.length > 0 && !isLoading && (
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <p className={styles.statLabel}>Total Requests</p>
            <p className={styles.statValue}>{verificationRequests.length}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statVerified}`}>
            <p className={styles.statLabel}>Verified</p>
            <p className={styles.statValue}>
              {
                verificationRequests.filter((r) => r.status === 'Verified')
                  .length
              }
            </p>
          </div>
          <div className={`${styles.statCard} ${styles.statApproved}`}>
            <p className={styles.statLabel}>Approved</p>
            <p className={styles.statValue}>
              {
                verificationRequests.filter((r) => r.status === 'Approved')
                  .length
              }
            </p>
          </div>
          <div className={`${styles.statCard} ${styles.statPending}`}>
            <p className={styles.statLabel}>Pending</p>
            <p className={styles.statValue}>
              {
                verificationRequests.filter((r) => r.status === 'Pending')
                  .length
              }
            </p>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Requests</h2>
          <button
            onClick={fetchVerificationRequests}
            disabled={isLoading || !isConnected}
            className={styles.btnGhost}
            title="Refresh verification requests"
          >
            <RefreshCw
              size={14}
              className={isLoading ? styles.spinner : ''}
            />
            Refresh
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by student name, exam number, or school…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <RefreshCw size={20} className={styles.spinner} />
            <span>Loading verification requests…</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student Name</th>
                  <th>Exam Number</th>
                  <th>School</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Scan Count</th>
                  <th>Last Scanned</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className={styles.mono}>
                      VR{String(request.id).padStart(3, '0')}
                    </td>
                    <td>{request.studentName}</td>
                    <td className={styles.mono}>
                      {request.examinationNumber}
                    </td>
                    <td>{request.schoolName}</td>
                    <td>{request.yearOfExamination}</td>
                    <td>
                      <span className={statusBadgeClass(request.status)}>
                        {statusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.scanCount > 0 ? request.scanCount : 'Never'}
                    </td>
                    <td>
                      {request.lastScanned
                        ? formatDate(request.lastScanned)
                        : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewDetails(request)}
                        className={styles.btnGhost}
                        title="View details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Inbox size={40} />
            <p className={styles.emptyStateTitle}>
              {verificationRequests.length === 0
                ? 'No verification requests yet'
                : 'No requests match your filters'}
            </p>
            <p className={styles.emptyStateText}>
              {verificationRequests.length === 0
                ? 'Requests will appear here once certificates are verified.'
                : 'Try clearing the search or changing the status filter.'}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.subtle}>
                  VR{String(selectedRequest.id).padStart(3, '0')}
                </div>
                <h2 className={styles.modalTitle}>
                  Verification Request Details
                </h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.metaLabel}>Student Name</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.studentName}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Examination Number</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.examinationNumber}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>School Name</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.schoolName}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Year of Examination</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.yearOfExamination}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Status</div>
                  <div className={styles.metaValue}>
                    <span className={statusBadgeClass(selectedRequest.status)}>
                      {statusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Date of Approval</div>
                  <div className={styles.metaValue}>
                    {formatDate(selectedRequest.dateOfApproval)}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Scan Count</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.scanCount > 0
                      ? selectedRequest.scanCount
                      : 'Never scanned'}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Last Scanned</div>
                  <div className={styles.metaValue}>
                    {formatDate(selectedRequest.lastScanned)}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Verified By</div>
                  <div className={styles.metaValue}>
                    {selectedRequest.verifiedBy || 'Not verified yet'}
                  </div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Verification Date</div>
                  <div className={styles.metaValue}>
                    {formatDate(selectedRequest.verificationDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={styles.btnGhost}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequests;