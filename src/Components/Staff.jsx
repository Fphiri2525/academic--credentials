import React, { useState } from 'react';
import { Search, X, Eye, University, Users, Award, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import styles from './staff.module.css';
import { useConnectionStatus, useAccreditationManagement } from '../hooks/useSmartContract';

// List of universities in Malawi
const MALAWI_UNIVERSITIES = [
  'University of Malawi',
  'Mzuzu University',
  'Lilongwe University of Agriculture and Natural Resources',
  'Malawi University of Science and Technology',
  'Catholic University of Malawi',
  'Malawi University of Business and Applied Sciences',
  'Malawi Assemblies of God University',
  'Daeyang University',
  'DMI St. John the Baptist University',
  'African Bible College',
  'Exploits University'
];

function Staff({ isDark }) {
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Modal state for viewing details
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Use smart contract hooks
  const { isConnected } = useConnectionStatus();
  const { getAllGraduatesByUniversity } = useAccreditationManagement();

  // Calculate statistics from search results
  const calculateStatistics = (results) => {
    if (!results || results.length === 0) return null;

    // Group by award
    const awardCounts = {};
    results.forEach(item => {
      awardCounts[item.award] = (awardCounts[item.award] || 0) + 1;
    });

    // Group by year
    const yearCounts = {};
    results.forEach(item => {
      yearCounts[item.yearOfGraduation] = (yearCounts[item.yearOfGraduation] || 0) + 1;
    });

    // Group by program
    const programCounts = {};
    results.forEach(item => {
      programCounts[item.programOfStudy] = (programCounts[item.programOfStudy] || 0) + 1;
    });

    // Get most common values
    const mostCommonAward = Object.keys(awardCounts).reduce((a, b) => 
      awardCounts[a] > awardCounts[b] ? a : b, '');
    const mostCommonYear = Object.keys(yearCounts).reduce((a, b) => 
      yearCounts[a] > yearCounts[b] ? a : b, '');
    const mostCommonProgram = Object.keys(programCounts).reduce((a, b) => 
      programCounts[a] > programCounts[b] ? a : b, '');

    return {
      totalCertificates: results.length,
      uniquePrograms: Object.keys(programCounts).length,
      uniqueAwards: Object.keys(awardCounts).length,
      yearRange: {
        earliest: Math.min(...results.map(r => parseInt(r.yearOfGraduation))),
        latest: Math.max(...results.map(r => parseInt(r.yearOfGraduation)))
      },
      awardDistribution: awardCounts,
      yearDistribution: yearCounts,
      programDistribution: programCounts,
      mostCommon: {
        award: mostCommonAward,
        year: mostCommonYear,
        program: mostCommonProgram
      }
    };
  };

  // Search for verification by university name
  const handleSearch = async () => {
    if (!selectedUniversity) {
      setError('Please select a university to search');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to search verification details');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);
    setStatistics(null);

    try {
      console.log('🔍 Searching for verifications by university:', selectedUniversity);

      // Get graduates by university name
      const graduates = await getAllGraduatesByUniversity(selectedUniversity);

      console.log('✅ Search results:', graduates);

      if (Array.isArray(graduates) && graduates.length > 0) {
        // Format and sort the data for display
        const formattedData = graduates.map((graduate, index) => ({
          id: index + 1,
          universityName: graduate.universityName || '',
          studentName: graduate.studentName || '',
          programOfStudy: graduate.programOfStudy || '',
          award: graduate.award || '',
          yearOfGraduation: graduate.yearOfGraduation || '',
          registrationNumber: graduate.registrationNumber || '',
          dateVerified: new Date().toLocaleDateString(),
          hashValue: graduate.hashValue || ''
        }));

        // Sort by university name first, then by student name
        const sortedData = formattedData.sort((a, b) => {
          if (a.universityName !== b.universityName) {
            return a.universityName.localeCompare(b.universityName);
          }
          return a.studentName.localeCompare(b.studentName);
        });

        setSearchResults(sortedData);
        setStatistics(calculateStatistics(sortedData));
        setHasSearched(true);
      } else {
        setSearchResults([]);
        setStatistics(null);
        setHasSearched(true);
        setError(`No verification records found for "${selectedUniversity}". Please try another university.`);
      }

    } catch (error) {
      console.error('❌ Error searching verification details:', error);
      setError(`Failed to search verification details: ${error.message}`);
      setSearchResults([]);
      setStatistics(null);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle view details
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedItem(null);
  };

  // Clear search results
  const handleClearSearch = () => {
    setSelectedUniversity('');
    setSearchResults([]);
    setStatistics(null);
    setHasSearched(false);
    setError('');
  };

  // Handle Enter key press in select
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedUniversity) {
      handleSearch();
    }
  };

  // Analytics Component
  const AnalyticsSection = () => {
    if (!statistics) return null;

    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsHeader}>
          <h3 className={styles.analyticsTitle}>
            <BarChart3 size={24} />
            Certificate Analytics
          </h3>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Award size={32} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.totalCertificates}</div>
              <div className={styles.statLabel}>Total Certificates</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={32} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.uniquePrograms}</div>
              <div className={styles.statLabel}>Unique Programs</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={32} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.uniqueAwards}</div>
              <div className={styles.statLabel}>Award Types</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={32} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {statistics.yearRange.earliest} - {statistics.yearRange.latest}
              </div>
              <div className={styles.statLabel}>Year Range</div>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className={styles.chartsGrid}>
          {/* Award Distribution */}
          <div className={styles.chartCard}>
            <h4 className={styles.chartTitle}>
              <PieChart size={18} />
              Award Distribution
            </h4>
            <div className={styles.chartContent}>
              {Object.entries(statistics.awardDistribution).map(([award, count]) => (
                <div key={award} className={styles.chartRow}>
                  <span className={styles.chartLabel}>{award}</span>
                  <div className={styles.chartBarContainer}>
                    <div 
                      className={styles.chartBar}
                      style={{ 
                        width: `${(count / statistics.totalCertificates) * 100}%` 
                      }}
                    />
                    <span className={styles.chartValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Year Distribution */}
          <div className={styles.chartCard}>
            <h4 className={styles.chartTitle}>
              <TrendingUp size={18} />
              Year Distribution
            </h4>
            <div className={styles.chartContent}>
              {Object.entries(statistics.yearDistribution)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .slice(0, 5)
                .map(([year, count]) => (
                <div key={year} className={styles.chartRow}>
                  <span className={styles.chartLabel}>{year}</span>
                  <div className={styles.chartBarContainer}>
                    <div 
                      className={styles.chartBar}
                      style={{ 
                        width: `${(count / statistics.totalCertificates) * 100}%` 
                      }}
                    />
                    <span className={styles.chartValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Programs */}
          <div className={styles.chartCard}>
            <h4 className={styles.chartTitle}>
              <University size={18} />
              Top Programs
            </h4>
            <div className={styles.chartContent}>
              {Object.entries(statistics.programDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([program, count]) => (
                <div key={program} className={styles.chartRow}>
                  <span className={styles.chartLabel}>{program}</span>
                  <div className={styles.chartBarContainer}>
                    <div 
                      className={styles.chartBar}
                      style={{ 
                        width: `${(count / statistics.totalCertificates) * 100}%` 
                      }}
                    />
                    <span className={styles.chartValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Common Section */}
        <div className={styles.insightsCard}>
          <h4 className={styles.insightsTitle}>Key Insights</h4>
          <div className={styles.insightsGrid}>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Most Common Award:</span>
              <span className={styles.insightValue}>{statistics.mostCommon.award}</span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Most Active Year:</span>
              <span className={styles.insightValue}>{statistics.mostCommon.year}</span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Most Popular Program:</span>
              <span className={styles.insightValue}>{statistics.mostCommon.program}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Details Modal Component
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedItem) return null;

    return (
      <div className={styles.modalOverlay} onClick={closeDetailsModal}>
        <div className={`${styles.modalContent} ${isDark ? styles.darkModal : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={`${styles.modalTitle} ${isDark ? styles.darkText : ''}`}>
              📋 Certificate Verification Details
            </h2>
            <button
              className={styles.closeButton}
              onClick={closeDetailsModal}
              title="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.detailsGrid}>
              {/* University Information */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <University className={styles.sectionIcon} />
                  <h3 className={`${styles.sectionTitle} ${isDark ? styles.darkText : ''}`}>University Information</h3>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>University Name:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.universityName}</span>
                </div>
              </div>

              {/* Student Information */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <Users className={styles.sectionIcon} />
                  <h3 className={`${styles.sectionTitle} ${isDark ? styles.darkText : ''}`}>Student Information</h3>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Student Name:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.studentName}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Registration Number:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.registrationNumber}</span>
                </div>
              </div>

              {/* Academic Information */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <Award className={styles.sectionIcon} />
                  <h3 className={`${styles.sectionTitle} ${isDark ? styles.darkText : ''}`}>Academic Information</h3>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Program of Study:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.programOfStudy}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Award:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.award}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Year of Graduation:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.yearOfGraduation}</span>
                </div>
              </div>

              {/* Verification Information */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <Calendar className={styles.sectionIcon} />
                  <h3 className={`${styles.sectionTitle} ${isDark ? styles.darkText : ''}`}>Verification Information</h3>
                </div>
                <div className={styles.detailItem}>
                  <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Date Verified:</span>
                  <span className={`${styles.detailValue} ${isDark ? styles.darkText : ''}`}>{selectedItem.dateVerified}</span>
                </div>
                {selectedItem.hashValue && (
                  <div className={styles.detailItem}>
                    <span className={`${styles.detailLabel} ${isDark ? styles.darkText : ''}`}>Hash Value:</span>
                    <span className={`${styles.detailValue} ${styles.hashValue} ${isDark ? styles.darkText : ''}`}>
                      {selectedItem.hashValue.substring(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.closeModalButton}
              onClick={closeDetailsModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.darkContainer : ''}`}>
      {/* Details Modal */}
      <DetailsModal />
  
      {/* Search Bar */}
      <div className={`${styles.searchContainer} ${isDark ? styles.darkSearchContainer : ''}`}>
        <div className={styles.searchInputWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${styles.searchSelect} ${isDark ? styles.darkSearchInput : ''}`}
          >
            <option value="">Select a university...</option>
            {MALAWI_UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
          {selectedUniversity && (
            <button
              onClick={handleClearSearch}
              className={styles.clearButton}
              title="Clear selection"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !selectedUniversity || !isConnected}
          className={`${styles.searchButton} ${isDark ? styles.darkSearchButton : ''}`}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className={`${styles.warningContainer} ${isDark ? styles.darkWarningContainer : ''}`}>
          <p className={styles.warningText}>Please connect your wallet to search for verification details</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`${styles.errorContainer} ${isDark ? styles.darkErrorContainer : ''}`}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <section className={`${styles.section} ${isDark ? styles.darkSection : ''}`}>
        {isSearching ? (
          <div className={`${styles.loadingContainer} ${isDark ? styles.darkLoadingContainer : ''}`}>
            <div className={styles.spinner}></div>
            <p className={isDark ? styles.darkText : ''}>Searching verification details from blockchain...</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <>
              {/* Analytics Section */}
              <AnalyticsSection />

              {/* Results Section */}
              <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <h3 className={`${styles.resultsTitle} ${isDark ? styles.darkText : ''}`}>
                  <University size={20} />
                  Search Results for "{selectedUniversity}" ({searchResults.length} found)
                </h3>
              </div>

              {/* White Table Design */}
              <div className={styles.whiteTableContainer}>
                <table className={styles.whiteTable}>
                  <thead>
                    <tr className={styles.whiteTableHeaderRow}>
                      <th className={styles.whiteTableHeaderCell}>University</th>
                      <th className={styles.whiteTableHeaderCell}>Student Name</th>
                      <th className={styles.whiteTableHeaderCell}>Program</th>
                      <th className={styles.whiteTableHeaderCell}>Award</th>
                      <th className={styles.whiteTableHeaderCell}>Year</th>
                      <th className={styles.whiteTableHeaderCell}>Reg. No.</th>
                      <th className={styles.whiteTableHeaderCell}>Verified Date</th>
                      <th className={styles.whiteTableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item) => (
                      <tr key={item.id} className={styles.whiteTableRow}>
                        <td className={styles.whiteTableCell}>
                          <div className={styles.universityCell}>
                            <University size={16} className={styles.universityIcon} />
                            {item.universityName}
                          </div>
                        </td>
                        <td className={styles.whiteTableCell}>
                          <div className={styles.studentCell}>
                            <Users size={16} className={styles.userIcon} />
                            {item.studentName}
                          </div>
                        </td>
                        <td className={styles.whiteTableCell}>{item.programOfStudy}</td>
                        <td className={styles.whiteTableCell}>{item.award}</td>
                        <td className={styles.whiteTableCell}>{item.yearOfGraduation}</td>
                        <td className={styles.whiteTableCell}>{item.registrationNumber}</td>
                        <td className={styles.whiteTableCell}>{item.dateVerified}</td>
                        <td className={styles.whiteTableCell}>
                          <button
                            className={styles.viewButton}
                            onClick={() => handleViewDetails(item)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            </>
          ) : (
            <div className={`${styles.emptyState} ${isDark ? styles.darkEmptyState : ''}`}>
              <University size={48} />
              <h3>No Verification Records Found</h3>
              <p className={isDark ? styles.darkText : ''}>
                No verified certificates found for "{selectedUniversity}".
                Please try another university.
              </p>
            </div>
          )
        ) : (
          <div className={`${styles.welcomeState} ${isDark ? styles.darkWelcomeState : ''}`}>
            <University size={64} />
            <h3>Search Verification Records</h3>
            <p className={isDark ? styles.darkText : ''}>
              Select a university from the dropdown above to search for verified certificates and graduation records.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Staff;