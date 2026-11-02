import { useState } from 'react';
import { Search, X, AlertTriangle, University } from 'lucide-react';
import styles from './ProgramsPage.module.css';
import { useConnectionStatus, useAccreditationManagement } from '../../../hooks/useSmartContract';

// Components
import AnalyticsSection from './AnalyticsSection';
import ProgramsTable from './ProgramsTable';
import DetailsModal from './DetailsModal';

const MALAWI_UNIVERSITIES = [
  "University of Malawi",
  "Mzuzu University",
  "Lilongwe University of Agriculture and Natural Resources",
  "Malawi University of Science and Technology",
  "Catholic University of Malawi",
  "Malawi University of Business and Applied Sciences",
  "Malawi Assemblies of God University",
  "Daeyang University",
  "DMI St. John the Baptist University",
  "African Bible College",
  "Exploits University",
];

export default function ProgramsPage({ showErrorNotification }) {
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { isConnected } = useConnectionStatus();
  const { getAllGraduatesByUniversity } = useAccreditationManagement();

  const calculateStatistics = (results) => {
    if (!results || results.length === 0) return null;
    const awardCounts = {}, yearCounts = {}, programCounts = {};
    
    results.forEach((item) => {
      awardCounts[item.award] = (awardCounts[item.award] || 0) + 1;
      yearCounts[item.yearOfGraduation] = (yearCounts[item.yearOfGraduation] || 0) + 1;
      programCounts[item.programOfStudy] = (programCounts[item.programOfStudy] || 0) + 1;
    });

    const getMostCommon = (obj) => Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b, "");

    return {
      totalCertificates: results.length,
      uniquePrograms: Object.keys(programCounts).length,
      uniqueAwards: Object.keys(awardCounts).length,
      yearRange: {
        earliest: Math.min(...results.map((r) => parseInt(r.yearOfGraduation))),
        latest: Math.max(...results.map((r) => parseInt(r.yearOfGraduation))),
      },
      awardDistribution: awardCounts,
      yearDistribution: yearCounts,
      programDistribution: programCounts,
      mostCommon: {
        award: getMostCommon(awardCounts),
        year: getMostCommon(yearCounts),
        program: getMostCommon(programCounts),
      },
    };
  };

  const handleSearch = async () => {
    if (!selectedUniversity) return setError("Please select a university.");
    if (!isConnected) return setError("Please connect your wallet to search.");

    setIsSearching(true);
    setError("");
    setSearchResults([]);
    setStatistics(null);
    setHasSearched(true);

    try {
      const graduates = await getAllGraduatesByUniversity(selectedUniversity);
      
      if (Array.isArray(graduates) && graduates.length > 0) {
        const formattedData = graduates.map((g, i) => ({
          id: i + 1,
          universityName: g.universityName || selectedUniversity,
          studentName: g.studentName || "",
          programOfStudy: g.programOfStudy || "",
          award: g.award || "",
          yearOfGraduation: g.yearOfGraduation || "",
          registrationNumber: g.registrationNumber || "",
          dateVerified: new Date().toLocaleDateString(),
          hashValue: g.hashValue || "",
        })).sort((a, b) => a.studentName.localeCompare(b.studentName));

        setSearchResults(formattedData);
        setStatistics(calculateStatistics(formattedData));
      } else {
        setError(`No records found for "${selectedUniversity}".`);
      }
    } catch (err) {
      setError(`Failed to search: ${err.message}`);
      showErrorNotification?.(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSelectedUniversity("");
    setSearchResults([]);
    setStatistics(null);
    setHasSearched(false);
    setError("");
  };

  return (
    <div className={styles.container}>
      {selectedItem && <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {/* Search Bar */}
      <div className={styles.searchCard}>
        <div className={styles.searchInputWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className={styles.searchSelect}
          >
            <option value="">Select a university...</option>
            {MALAWI_UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          {selectedUniversity && (
            <button onClick={handleClear} className={styles.clearBtn}>
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !selectedUniversity || !isConnected}
          className={styles.btnPrimary}
        >
          {isSearching ? "Searching..." : "Search Records"}
        </button>
      </div>

      {/* Alerts */}
      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertTriangle size={18} />
          <div>Please connect your wallet to search for verification details.</div>
        </div>
      )}
      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* States */}
      {isSearching ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Searching blockchain records...</p>
        </div>
      ) : hasSearched && searchResults.length > 0 ? (
        <>
          <AnalyticsSection statistics={statistics} />
          <ProgramsTable results={searchResults} onView={setSelectedItem} />
        </>
      ) : hasSearched && searchResults.length === 0 ? (
        <div className={styles.emptyState}>
          <University size={48} />
          <h3>No Records Found</h3>
          <p>Try searching for a different university.</p>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <University size={48} />
          <h3>Search Verification Records</h3>
          <p>Select a university above to view their certified graduates.</p>
        </div>
      )}
    </div>
  );
}