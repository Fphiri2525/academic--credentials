import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter, FileText, Users, School, CheckCircle } from 'lucide-react';
import styles from './report.module.css';
import { useUserManagement } from '../hooks/useSmartContract';

const ReportPage = () => {
  const [activeReport, setActiveReport] = useState('student-examination');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [formFourData, setFormFourData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    year: 'all',
    district: '',
    school: '',
    status: 'all'
  });

  const { 
    getAllFormFourDetails, 
    getAllSecondarySchools, 
    getAllVerificationRequests
  } = useUserManagement();

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const students = await getAllFormFourDetails();
      const schools = await getAllSecondarySchools();
      const verifications = await getAllVerificationRequests();

      setFormFourData(students || []);
      setSchoolData(schools || []);
      setVerificationData(verifications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const generateReport = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    
    try {
      let content;
      switch(activeReport) {
        case 'student-examination':
          content = generateStudentExaminationReport();
          break;
        case 'school-performance':
          content = generateSchoolPerformanceReport();
          break;
        case 'verification-status':
          content = generateVerificationStatusReport();
          break;
        case 'district-summary':
          content = generateDistrictSummaryReport();
          break;
        default:
          content = null;
      }
      
      setReportContent(content);
    } catch (error) {
      console.error('Error generating report:', error);
      setReportContent(
        <div className={styles.errorReport}>
          <h4>Error Generating Report</h4>
          <p>An error occurred while generating the report: {error.message}</p>
        </div>
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Report generation functions
  const generateStudentExaminationReport = () => {
    let filteredData = [...formFourData];
    
    if (filters.year !== 'all') {
      filteredData = filteredData.filter(student => 
        student.yearOfExamination === parseInt(filters.year)
      );
    }
    
    if (filters.district) {
      filteredData = filteredData.filter(student => 
        student.district?.toLowerCase().includes(filters.district.toLowerCase())
      );
    }

    return (
      <div className={styles.report}>
        <div className={styles.reportHeader}>
          <h4>MANEB Student Examination Report</h4>
          <div className={styles.reportMeta}>
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>Total Records: {filteredData.length}</span>
          </div>
        </div>
        
        <div className={styles.reportParameters}>
          <p><strong>Report Parameters:</strong></p>
          <ul>
            <li>Year: {filters.year === 'all' ? 'All Years' : filters.year}</li>
            <li>District: {filters.district || 'All Districts'}</li>
          </ul>
        </div>
        
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Examination Number</th>
              <th>School Name</th>
              <th>District</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((student, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.studentName}>{student.studentName}</td>
                  <td className={styles.examNumber}>{student.examinationNumber}</td>
                  <td>{student.schoolName}</td>
                  <td>{student.district || 'N/A'}</td>
                  <td>{student.yearOfExamination}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>No student data found for the selected filters</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className={styles.reportSummary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Students</span>
              <span className={styles.summaryValue}>{filteredData.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Unique Schools</span>
              <span className={styles.summaryValue}>
                {new Set(filteredData.map(s => s.schoolName)).size}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Unique Districts</span>
              <span className={styles.summaryValue}>
                {new Set(filteredData.map(s => s.district)).size}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateSchoolPerformanceReport = () => {
    const schoolPerformance = schoolData.map(school => {
      const schoolStudents = formFourData.filter(student => 
        student.schoolName === school.schoolName
      );
      
      return {
        schoolName: school.schoolName,
        schoolCode: school.schoolCode,
        district: school.district,
        totalStudents: schoolStudents.length,
        category: school.category
      };
    }).filter(school => school.totalStudents > 0)
      .sort((a, b) => b.totalStudents - a.totalStudents);

    return (
      <div className={styles.report}>
        <div className={styles.reportHeader}>
          <h4>MANEB School Performance Report</h4>
          <div className={styles.reportMeta}>
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>Total Schools: {schoolPerformance.length}</span>
          </div>
        </div>
        
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>School Name</th>
              <th>School Code</th>
              <th>District</th>
              <th>Category</th>
              <th>Students Registered</th>
            </tr>
          </thead>
          <tbody>
            {schoolPerformance.length > 0 ? (
              schoolPerformance.map((school, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.schoolName}>{school.schoolName}</td>
                  <td className={styles.schoolCode}>{school.schoolCode}</td>
                  <td>{school.district}</td>
                  <td>
                    <span className={`${styles.categoryBadge} ${
                      school.category === 'Public' ? styles.public : styles.private
                    }`}>
                      {school.category}
                    </span>
                  </td>
                  <td className={styles.studentCount}>{school.totalStudents}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>No school performance data available</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className={styles.reportSummary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Schools</span>
              <span className={styles.summaryValue}>{schoolPerformance.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Public Schools</span>
              <span className={styles.summaryValue}>
                {schoolPerformance.filter(s => s.category === 'Public').length}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Private Schools</span>
              <span className={styles.summaryValue}>
                {schoolPerformance.filter(s => s.category === 'Private').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateVerificationStatusReport = () => {
    let filteredData = [...verificationData];
    
    if (filters.status !== 'all') {
      filteredData = filteredData.filter(request => 
        filters.status === 'approved' ? request.dateOfApproval > 0 : request.dateOfApproval <= 0
      );
    }

    return (
      <div className={styles.report}>
        <div className={styles.reportHeader}>
          <h4>MANEB Verification Status Report</h4>
          <div className={styles.reportMeta}>
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>Total Requests: {filteredData.length}</span>
          </div>
        </div>
        
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Examination Number</th>
              <th>School Name</th>
              <th>Year</th>
              <th>Verification Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((request, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{request.studentName}</td>
                  <td className={styles.examNumber}>{request.examinationNumber}</td>
                  <td>{request.schoolName}</td>
                  <td>{request.yearOfExamination}</td>
                  <td>
                    {request.dateOfApproval > 0 
                      ? new Date(request.dateOfApproval * 1000).toLocaleDateString() 
                      : 'Pending'
                    }
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      request.dateOfApproval > 0 ? styles.approved : styles.pending
                    }`}>
                      {request.dateOfApproval > 0 ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.noData}>No verification requests found</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className={styles.reportSummary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Requests</span>
              <span className={styles.summaryValue}>{filteredData.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Approved</span>
              <span className={styles.summaryValue}>
                {filteredData.filter(r => r.dateOfApproval > 0).length}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pending</span>
              <span className={styles.summaryValue}>
                {filteredData.filter(r => r.dateOfApproval <= 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateDistrictSummaryReport = () => {
    const districtSummary = formFourData.reduce((acc, student) => {
      const district = student.district || 'Unknown';
      if (!acc[district]) {
        acc[district] = {
          district,
          totalStudents: 0,
          schools: new Set(),
          years: new Set()
        };
      }
      acc[district].totalStudents++;
      acc[district].schools.add(student.schoolName);
      acc[district].years.add(student.yearOfExamination);
      return acc;
    }, {});

    const districtArray = Object.values(districtSummary)
      .sort((a, b) => b.totalStudents - a.totalStudents);

    return (
      <div className={styles.report}>
        <div className={styles.reportHeader}>
          <h4>MANEB District Summary Report</h4>
          <div className={styles.reportMeta}>
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>Total Districts: {districtArray.length}</span>
          </div>
        </div>
        
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>District</th>
              <th>Total Students</th>
              <th>Number of Schools</th>
              <th>Examination Years</th>
              <th>Average per School</th>
            </tr>
          </thead>
          <tbody>
            {districtArray.length > 0 ? (
              districtArray.map((district, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.districtName}>{district.district}</td>
                  <td className={styles.studentCount}>{district.totalStudents}</td>
                  <td>{district.schools.size}</td>
                  <td>{Array.from(district.years).join(', ')}</td>
                  <td>{Math.round(district.totalStudents / district.schools.size)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>No district data available</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className={styles.reportSummary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Districts</span>
              <span className={styles.summaryValue}>{districtArray.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Students</span>
              <span className={styles.summaryValue}>
                {districtArray.reduce((sum, district) => sum + district.totalStudents, 0)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Schools</span>
              <span className={styles.summaryValue}>
                {new Set(formFourData.map(s => s.schoolName)).size}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className={styles.reportPage}>
      {/* Header Section */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            <FileText className={styles.titleIcon} />
            MANEB Reporting System
          </h1>
          <p className={styles.pageDescription}>
            Generate comprehensive reports for examination data, school performance, and student verification
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.reportContainer}>
        {/* Report Type Selection */}
        <div className={styles.reportSidebar}>
          <h3 className={styles.sidebarTitle}>Report Types</h3>
          <div className={styles.reportTypes}>
            <button
              className={`${styles.reportType} ${activeReport === 'student-examination' ? styles.active : ''}`}
              onClick={() => setActiveReport('student-examination')}
            >
              <Users size={18} />
              Student Examination
            </button>
            
            <button
              className={`${styles.reportType} ${activeReport === 'school-performance' ? styles.active : ''}`}
              onClick={() => setActiveReport('school-performance')}
            >
              <School size={18} />
              School Performance
            </button>
            
            <button
              className={`${styles.reportType} ${activeReport === 'verification-status' ? styles.active : ''}`}
              onClick={() => setActiveReport('verification-status')}
            >
              <CheckCircle size={18} />
              Verification Status
            </button>
            
            <button
              className={`${styles.reportType} ${activeReport === 'district-summary' ? styles.active : ''}`}
              onClick={() => setActiveReport('district-summary')}
            >
              <Filter size={18} />
              District Summary
            </button>
          </div>
        </div>

        {/* Report Configuration and Preview */}
        <div className={styles.reportMain}>
          {/* Report Configuration */}
          <div className={styles.reportConfig}>
            <h3 className={styles.configTitle}>
              {activeReport === 'student-examination' && 'Student Examination Report'}
              {activeReport === 'school-performance' && 'School Performance Report'}
              {activeReport === 'verification-status' && 'Verification Status Report'}
              {activeReport === 'district-summary' && 'District Summary Report'}
            </h3>
            
            <form onSubmit={generateReport} className={styles.configForm}>
              <div className={styles.filterGrid}>
                {activeReport === 'student-examination' && (
                  <>
                    <div className={styles.filterGroup}>
                      <label>Examination Year</label>
                      <select 
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                      >
                        <option value="all">All Years</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                      </select>
                    </div>
                    
                    <div className={styles.filterGroup}>
                      <label>District</label>
                      <input
                        type="text"
                        placeholder="Filter by district..."
                        value={filters.district}
                        onChange={(e) => handleFilterChange('district', e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                {activeReport === 'verification-status' && (
                  <div className={styles.filterGroup}>
                    <label>Verification Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="approved">Approved Only</option>
                      <option value="pending">Pending Only</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.generateButton}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating Report...' : 'Generate Report'}
                </button>
                
                <button 
                  type="button" 
                  className={styles.refreshButton}
                  onClick={fetchData}
                >
                  Refresh Data
                </button>
              </div>
            </form>
          </div>

          {/* Report Preview */}
          <div className={styles.reportPreview}>
            <div className={styles.previewHeader}>
              <h3>Report Preview</h3>
              <div className={styles.previewActions}>
                <button 
                  className={styles.exportButton}
                  onClick={() => handleExport('pdf')}
                  disabled={!reportContent}
                >
                  <Download size={16} />
                  Export PDF
                </button>
                <button 
                  className={styles.exportButton}
                  onClick={() => handleExport('csv')}
                  disabled={!reportContent}
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button 
                  className={styles.printButton}
                  onClick={() => window.print()}
                  disabled={!reportContent}
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
            
            <div className={styles.previewContent}>
              {isGenerating ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Generating report...</p>
                </div>
              ) : reportContent ? (
                reportContent
              ) : (
                <div className={styles.emptyState}>
                  <FileText size={48} className={styles.emptyIcon} />
                  <h4>No Report Generated</h4>
                  <p>Configure your report parameters and click "Generate Report" to view the preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;