import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, CheckCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { useTheme } from './maneb';
import { useManebContract, useConnectionStatus } from '../hooks/useSmartContract';
import styles from './verification.module.css';

const VerificationRequests = () => {
  const { darkMode } = useTheme();
  const { isConnected } = useConnectionStatus();

  // State for verification requests data
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get MANEB contract functions
  const { 
    getAllVerificationRequests, 
    getVerifiedStudents,
    getVerificationHistory 
  } = useManebContract();

  // Fetch verification requests from blockchain
  const fetchVerificationRequests = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to view verification requests');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Fetching verification requests from MANEB contract...');

      // Get all verification requests from blockchain
      const requests = await getAllVerificationRequests();
      console.log('✅ Raw verification requests data:', requests);

      if (Array.isArray(requests) && requests.length > 0) {
        // Get verified students to track verification status
        const verifiedStudents = await getVerifiedStudents();
        console.log('✅ Verified students:', verifiedStudents);

        // Get verification history for audit trail
        const verificationHistory = await getVerificationHistory();
        console.log('✅ Verification history:', verificationHistory);

        // Format the data for display
        const formattedRequests = requests.map((request, index) => {
          const isVerified = verifiedStudents.some(
            student => student.examinationNumber === request.examinationNumber
          );
          
          const verificationRecord = verificationHistory.find(
            record => record.examinationNumber === request.examinationNumber
          );

          return {
            id: index + 1,
            studentName: request.studentName || '',
            examinationNumber: request.examinationNumber || '',
            schoolName: request.schoolName || '',
            yearOfExamination: request.yearOfExamination || '',
            dateOfApproval: request.dateOfApproval || '',
            status: isVerified ? 'Verified' : (request.dateOfApproval ? 'Approved' : 'Pending'),
            verificationDate: verificationRecord?.verificationDate || '',
            verifiedBy: verificationRecord?.verifiedBy || '',
            scanCount: verificationRecord?.scanCount || 0,
            lastScanned: verificationRecord?.lastScanned || ''
          };
        });

        console.log('✅ Formatted verification requests:', formattedRequests);
        setVerificationRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      } else {
        console.log('ℹ️ No verification requests found');
        setVerificationRequests([]);
        setFilteredRequests([]);
      }

    } catch (error) {
      console.error('❌ Error fetching verification requests:', error);
      setError(`Failed to fetch verification requests: ${error.message}`);
      setVerificationRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = verificationRequests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.examinationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request =>
        request.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, verificationRequests]);

  // Load data on component mount and when connection status changes
  useEffect(() => {
    if (isConnected) {
      fetchVerificationRequests();
    }
  }, [isConnected]);

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Not available';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return `${styles.statusBadge} ${styles.statusVerified}`;
      case 'approved':
        return `${styles.statusBadge} ${styles.statusApproved}`;
      case 'pending':
        return `${styles.statusBadge} ${styles.statusPending}`;
      default:
        return `${styles.statusBadge} ${styles.statusPending}`;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <CheckCircle size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  return (
    <div className={`${styles.contentCard} ${darkMode ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.cardHeader}>
        <h2 className={styles.pageTitle}>Verification Requests & Tracking</h2>
        <div className={styles.headerActions}>
          <button
            onClick={fetchVerificationRequests}
            disabled={isLoading || !isConnected}
            className={styles.refreshBtn}
            title="Refresh verification requests"
          >
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className={styles.warningMessage}>
          <AlertCircle size={16} />
          Please connect your wallet to view verification requests
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by student name, exam number, or school..."
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

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingMessage}>
          <RefreshCw size={16} className={styles.spinning} />
          Loading verification requests...
        </div>
      )}

      {/* Statistics Summary */}
      {verificationRequests.length > 0 && !isLoading && (
        <div className={styles.statsSummary}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{verificationRequests.length}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {verificationRequests.filter(r => r.status === 'Verified').length}
            </span>
            <span className={styles.statLabel}>Verified</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {verificationRequests.filter(r => r.status === 'Approved').length}
            </span>
            <span className={styles.statLabel}>Approved</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {verificationRequests.filter(r => r.status === 'Pending').length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
      )}

      {/* Verification Requests Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Student Name</th>
              <th>Examination Number</th>
              <th>School Name</th>
              <th>Year</th>
              <th>Status</th>
              <th>Scan Count</th>
              <th>Last Scanned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>VR{String(request.id).padStart(3, '0')}</td>
                  <td>{request.studentName}</td>
                  <td className={styles.monoFont}>{request.examinationNumber}</td>
                  <td>{request.schoolName}</td>
                  <td>{request.yearOfExamination}</td>
                  <td>
                    <span className={getStatusBadgeStyle(request.status)}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.scanCount}>
                      {request.scanCount > 0 ? request.scanCount : 'Never'}
                    </span>
                  </td>
                  <td>
                    {request.lastScanned ? formatDate(request.lastScanned) : 'Never'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(request)}
                      className={styles.btnSmall}
                      title="View details"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !isLoading && (
                <tr>
                  <td colSpan="9" className={styles.noDataMessage}>
                    {verificationRequests.length === 0 
                      ? 'No verification requests found' 
                      : 'No requests match your filters'
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Verification Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={styles.modalCloseBtn}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>Request ID:</label>
                  <span>VR{String(selectedRequest.id).padStart(3, '0')}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Student Name:</label>
                  <span>{selectedRequest.studentName}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Examination Number:</label>
                  <span className={styles.monoFont}>{selectedRequest.examinationNumber}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>School Name:</label>
                  <span>{selectedRequest.schoolName}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Year of Examination:</label>
                  <span>{selectedRequest.yearOfExamination}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Status:</label>
                  <span className={getStatusBadgeStyle(selectedRequest.status)}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label>Date of Approval:</label>
                  <span>{formatDate(selectedRequest.dateOfApproval)}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Scan Count:</label>
                  <span className={styles.scanCount}>
                    {selectedRequest.scanCount > 0 ? selectedRequest.scanCount : 'Never scanned'}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label>Last Scanned:</label>
                  <span>{formatDate(selectedRequest.lastScanned)}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Verified By:</label>
                  <span>{selectedRequest.verifiedBy || 'Not verified yet'}</span>
                </div>

                <div className={styles.detailItem}>
                  <label>Verification Date:</label>
                  <span>{formatDate(selectedRequest.verificationDate)}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={styles.btnSecondary}
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