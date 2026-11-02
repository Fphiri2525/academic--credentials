import React, { useState, useEffect } from 'react';
import {
  Search, Download, Eye, Filter, Users, School,
  Calendar, BarChart3, X, RefreshCw, Inbox,
} from 'lucide-react';
import { useTheme } from './maneb';
import { useManebContract } from '../hooks/useSmartContract';
import * as XLSX from 'xlsx';
import styles from './formfourgraduates.module.css';

const FormFourGraduates = () => {
  const { darkMode } = useTheme();
  const {
    getAllFormFourDetails,
    getFilteredFormFourDetails,
    getFormFourStatistics,
  } = useManebContract();

  const [graduates, setGraduates] = useState([]);
  const [filteredGraduates, setFilteredGraduates] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalSchools: 0,
    yearRange: { min: null, max: null },
    schoolStats: [],
    yearStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    schoolName: '',
    yearOfExamination: '',
    studentName: '',
    examinationNumber: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadAllGraduates();
  }, []);

  useEffect(() => {
    filterGraduates();
  }, [graduates, searchTerm, filters]);

  const loadAllGraduates = async () => {
    try {
      setLoading(true);
      setError('');
      const [graduatesData, statsData] = await Promise.all([
        getAllFormFourDetails(),
        getFormFourStatistics(),
      ]);

      setGraduates(graduatesData || []);
      setStatistics(
        statsData || {
          totalStudents: 0,
          totalSchools: 0,
          yearRange: { min: null, max: null },
          schoolStats: [],
          yearStats: [],
        },
      );
    } catch (error) {
      setError(`Failed to load graduates: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterGraduates = () => {
    let filtered = [...graduates];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (graduate) =>
          graduate.studentName.toLowerCase().includes(term) ||
          graduate.examinationNumber.toLowerCase().includes(term) ||
          graduate.schoolName.toLowerCase().includes(term) ||
          graduate.yearOfExamination.toString().includes(term),
      );
    }

    if (filters.schoolName) {
      filtered = filtered.filter((graduate) =>
        graduate.schoolName
          .toLowerCase()
          .includes(filters.schoolName.toLowerCase()),
      );
    }

    if (filters.yearOfExamination) {
      filtered = filtered.filter(
        (graduate) =>
          graduate.yearOfExamination === Number(filters.yearOfExamination),
      );
    }

    if (filters.studentName) {
      filtered = filtered.filter((graduate) =>
        graduate.studentName
          .toLowerCase()
          .includes(filters.studentName.toLowerCase()),
      );
    }

    if (filters.examinationNumber) {
      filtered = filtered.filter((graduate) =>
        graduate.examinationNumber
          .toLowerCase()
          .includes(filters.examinationNumber.toLowerCase()),
      );
    }

    setFilteredGraduates(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      schoolName: '',
      yearOfExamination: '',
      studentName: '',
      examinationNumber: '',
    });
    setSearchTerm('');
  };

  const exportToExcel = () => {
    const exportData = filteredGraduates.map((graduate) => ({
      'Student Name': graduate.studentName,
      'Examination Number': graduate.examinationNumber,
      'School Name': graduate.schoolName,
      'Year of Examination': graduate.yearOfExamination,
      'Form Hash': graduate.formHash,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Form Four Graduates');
    XLSX.writeFile(
      wb,
      `form_four_graduates_${new Date().toISOString().split('T')[0]}.xlsx`,
    );
  };

  const totalPages = Math.ceil(filteredGraduates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGraduates = filteredGraduates.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  /* ============================================================
     RENDER
     ============================================================ */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.intro}>
          <div>
            <h1 className={styles.title}>Form Four Graduates</h1>
            <p className={styles.subtitle}>
              All registered Form Four examination details from the blockchain.
            </p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.loadingContainer}>
            <RefreshCw size={20} className={styles.spinner} />
            <span>Loading Form Four graduates from blockchain…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Form Four Graduates</h1>
          <p className={styles.subtitle}>
            All registered Form Four examination details from the blockchain.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={loadAllGraduates}
            className={styles.btnGhost}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={loading ? styles.spinner : ''}
            />
            Refresh
          </button>
          <button
            onClick={exportToExcel}
            className={styles.btnPrimary}
            disabled={filteredGraduates.length === 0}
          >
            <Download size={14} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>{statistics.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <School size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>{statistics.totalSchools}</h3>
            <p>Schools</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>
              {statistics.yearRange.min && statistics.yearRange.max
                ? `${statistics.yearRange.min} – ${statistics.yearRange.max}`
                : 'N/A'}
            </h3>
            <p>Year Range</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChart3 size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>{filteredGraduates.length}</h3>
            <p>Filtered Results</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Graduates</h2>
            <p className={styles.cardSub}>
              Showing {currentGraduates.length} of {filteredGraduates.length}
              {filteredGraduates.length !== graduates.length &&
                ` (filtered from ${graduates.length} total)`}
            </p>
          </div>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by student name, exam number, school, or year…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterActions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.btnGhost}
            >
              <Filter size={14} />
              Filters
            </button>
            {(searchTerm || Object.values(filters).some((f) => f)) && (
              <button onClick={clearFilters} className={styles.btnGhost}>
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label>School Name</label>
                <input
                  type="text"
                  value={filters.schoolName}
                  onChange={(e) =>
                    handleFilterChange('schoolName', e.target.value)
                  }
                  placeholder="Filter by school name"
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>Year of Examination</label>
                <select
                  value={filters.yearOfExamination}
                  onChange={(e) =>
                    handleFilterChange('yearOfExamination', e.target.value)
                  }
                  className={styles.filterSelect}
                >
                  <option value="">All Years</option>
                  {statistics.yearStats.map((yearStat) => (
                    <option key={yearStat.year} value={yearStat.year}>
                      {yearStat.year} ({yearStat.count} students)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Student Name</label>
                <input
                  type="text"
                  value={filters.studentName}
                  onChange={(e) =>
                    handleFilterChange('studentName', e.target.value)
                  }
                  placeholder="Filter by student name"
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>Examination Number</label>
                <input
                  type="text"
                  value={filters.examinationNumber}
                  onChange={(e) =>
                    handleFilterChange('examinationNumber', e.target.value)
                  }
                  placeholder="Filter by exam number"
                  className={styles.filterInput}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <Inbox size={16} />
            <span>{error}</span>
          </div>
        )}

        {currentGraduates.length > 0 ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Examination Number</th>
                    <th>School Name</th>
                    <th>Year</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGraduates.map((graduate, index) => (
                    <tr key={graduate.id || index}>
                      <td>{startIndex + index + 1}</td>
                      <td className={styles.studentName}>
                        {graduate.studentName}
                      </td>
                      <td className={styles.examNumber}>
                        {graduate.examinationNumber}
                      </td>
                      <td>{graduate.schoolName}</td>
                      <td>{graduate.yearOfExamination}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={styles.viewBtn}
                          title="View Details"
                          onClick={() => console.log('View details:', graduate)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`${styles.pageBtn} ${
                          currentPage === page ? styles.activePage : ''
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <Inbox size={40} />
            <p className={styles.emptyStateTitle}>
              {graduates.length === 0
                ? 'No graduates found'
                : 'No graduates match your filters'}
            </p>
            <p className={styles.emptyStateText}>
              {graduates.length === 0
                ? 'No Form Four graduates have been added to the blockchain yet.'
                : 'Try clearing the search or adjusting the filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormFourGraduates;