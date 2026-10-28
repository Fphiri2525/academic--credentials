import React, { useState, useEffect } from 'react';
import styles from './report.module.css';
import { useUserManagement } from '../hooks/useSmartContract';

const ReportPage = ({ initialReport = 'maneb-students', onBack }) => {
  const [activeReport, setActiveReport] = useState(initialReport || 'maneb-students');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [formFourData, setFormFourData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  const [filterYear, setFilterYear] = useState('all');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Get MANEB contract functions
  const { 
    getAllFormFourDetails, 
    getAllSecondarySchools, 
    getAllVerificationRequests,
    getFormFourStatistics,
    getFilteredFormFourDetails
  } = useUserManagement();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch statistics for dashboard
        const stats = await getFormFourStatistics();
        console.log('Form Four Statistics:', stats);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [getFormFourStatistics]);
  
  // Set the initial report type
  useEffect(() => {
    if (initialReport) {
      setActiveReport(initialReport);
    }
  }, [initialReport]);

  const handleReportChange = (reportType) => {
    setActiveReport(reportType);
    setReportContent(null);
  };

  const generateReport = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      let content;
      switch(activeReport) {
        case 'accredited':
          content = generateAccreditedReport();
          break;
        case 'graduate':
          content = generateGraduateReport();
          break;
        case 'verification':
          content = generateVerificationReport();
          break;
        case 'maneb-students':
          const studentData = await fetchManebStudentData();
          content = generateManebStudentReport(studentData);
          break;
        case 'maneb-schools':
          const schools = await fetchManebSchoolData();
          content = generateManebSchoolReport(schools);
          break;
        case 'maneb-verification':
          const verifications = await fetchManebVerificationData();
          content = generateManebVerificationReport(verifications);
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

  // Fetch MANEB student data from blockchain
  const fetchManebStudentData = async () => {
    try {
      let data;
      if (filterYear !== 'all') {
        data = await getFilteredFormFourDetails({ yearOfExamination: parseInt(filterYear) });
      } else {
        data = await getAllFormFourDetails();
      }
      setFormFourData(data);
      return data;
    } catch (error) {
      console.error('Error fetching MANEB student data:', error);
      throw error;
    }
  };

  // Fetch MANEB school data from blockchain
  const fetchManebSchoolData = async () => {
    try {
      const data = await getAllSecondarySchools();
      setSchoolData(data);
      return data;
    } catch (error) {
      console.error('Error fetching MANEB school data:', error);
      throw error;
    }
  };

  // Fetch MANEB verification data from blockchain
  const fetchManebVerificationData = async () => {
    try {
      const data = await getAllVerificationRequests();
      setVerificationData(data);
      return data;
    } catch (error) {
      console.error('Error fetching MANEB verification data:', error);
      throw error;
    }
  };

  // Report generation functions
  const generateAccreditedReport = () => (
    <div className={styles.report}>
      <h4>Accredited University & Program Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      
      <div className={styles.reportParameters}>
        <p><strong>Parameters:</strong> All Accredited Universities, All Programs, All Statuses</p>
      </div>
      
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>University</th>
            <th>Program</th>
            <th>Level</th>
            <th>Accreditation Status</th>
            <th>Valid Until</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>State University</td>
            <td>Computer Science</td>
            <td>Undergraduate</td>
            <td className={styles.statusFully}>Fully Accredited</td>
            <td>2026-12-31</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const generateGraduateReport = () => (
    <div className={styles.report}>
      <h4>Graduate Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      {/* Graduate report content */}
    </div>
  );

  const generateVerificationReport = () => (
    <div className={styles.report}>
      <h4>Verification Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      {/* Verification report content */}
    </div>
  );

  // MANEB Student Report
  const generateManebStudentReport = (data) => (
    <div className={styles.report}>
      <h4>MANEB Student Examination Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      
      <div className={styles.reportParameters}>
        <p><strong>Parameters:</strong> {filterYear === 'all' ? 'All Years' : `Year: ${filterYear}`}</p>
      </div>
      
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Examination Number</th>
            <th>School Name</th>
            <th>Year of Examination</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((student, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{student.studentName}</td>
                <td>{student.examinationNumber}</td>
                <td>{student.schoolName}</td>
                <td>{student.yearOfExamination}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className={styles.noData}>No student data available</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className={styles.reportSummary}>
        <p><strong>Total Students:</strong> {data ? data.length : 0}</p>
      </div>
    </div>
  );

  // MANEB School Report
  const generateManebSchoolReport = (data) => (
    <div className={styles.report}>
      <h4>MANEB Secondary Schools Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      
      <div className={styles.reportParameters}>
        <p><strong>Parameters:</strong> {filterDistrict ? `District: ${filterDistrict}` : 'All Districts'}</p>
      </div>
      
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>School Name</th>
            <th>School Code</th>
            <th>District</th>
            <th>Zone</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((school, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{school.schoolName}</td>
                <td>{school.schoolCode}</td>
                <td>{school.district}</td>
                <td>{school.zone}</td>
                <td>{school.category}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className={styles.noData}>No school data available</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className={styles.reportSummary}>
        <p><strong>Total Schools:</strong> {data ? data.length : 0}</p>
      </div>
    </div>
  );

  // MANEB Verification Report
  const generateManebVerificationReport = (data) => (
    <div className={styles.report}>
      <h4>MANEB Verification Requests Report</h4>
      <p className={styles.reportDate}>Generated on: {new Date().toLocaleDateString()}</p>
      
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Examination Number</th>
            <th>School Name</th>
            <th>Year of Examination</th>
            <th>Date of Approval</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((request, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{request.studentName}</td>
                <td>{request.examinationNumber}</td>
                <td>{request.schoolName}</td>
                <td>{request.yearOfExamination}</td>
                <td>{request.dateOfApproval > 0 
                  ? new Date(request.dateOfApproval * 1000).toLocaleDateString() 
                  : 'Pending'}</td>
                <td className={request.dateOfApproval > 0 ? styles.statusApproved : styles.statusPending}>
                  {request.dateOfApproval > 0 ? 'Approved' : 'Pending'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className={styles.noData}>No verification requests available</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className={styles.reportSummary}>
        <p><strong>Total Requests:</strong> {data ? data.length : 0}</p>
        <p><strong>Approved:</strong> {data ? data.filter(r => r.dateOfApproval > 0).length : 0}</p>
        <p><strong>Pending:</strong> {data ? data.filter(r => r.dateOfApproval <= 0).length : 0}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.reportPage}>
      <header className={styles.reportHeader}>
        {onBack && (
          <button 
            className={styles.backButton} 
            onClick={onBack}
          >
            ← Back to Reports
          </button>
        )}
        <h1>MANEB Reporting System</h1>
        <p>Generate official reports for examination, school, and verification data</p>
      </header>

      <div className={styles.reportSelectionContainer}>
        <div className={styles.reportTypeSelector}>
          <h2>Select Report Type</h2>
          <div className={styles.reportOptions}>
            <button 
              className={`${styles.reportOption} ${activeReport === 'maneb-students' ? styles.active : ''}`}
              onClick={() => handleReportChange('maneb-students')}
            >
              MANEB Student Examination Report
            </button>
            <button 
              className={`${styles.reportOption} ${activeReport === 'maneb-schools' ? styles.active : ''}`}
              onClick={() => handleReportChange('maneb-schools')}
            >
              MANEB Secondary Schools Report
            </button>
            <button 
              className={`${styles.reportOption} ${activeReport === 'maneb-verification' ? styles.active : ''}`}
              onClick={() => handleReportChange('maneb-verification')}
            >
              MANEB Verification Report
            </button>
            <button 
              className={`${styles.reportOption} ${activeReport === 'accredited' ? styles.active : ''}`}
              onClick={() => handleReportChange('accredited')}
            >
              Accredited University & Program
            </button>
            <button 
              className={`${styles.reportOption} ${activeReport === 'graduate' ? styles.active : ''}`}
              onClick={() => handleReportChange('graduate')}
            >
              Graduate Report
            </button>
            <button 
              className={`${styles.reportOption} ${activeReport === 'verification' ? styles.active : ''}`}
              onClick={() => handleReportChange('verification')}
            >
              Verification Report
            </button>
          </div>
        </div>

        {/* MANEB Student Report Form */}
        {activeReport === 'maneb-students' && (
          <div className={styles.reportForm}>
            <h3>MANEB Student Examination Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label htmlFor="examination-year">Examination Year</label>
                <select 
                  id="examination-year" 
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}

        {/* MANEB Schools Report Form */}
        {activeReport === 'maneb-schools' && (
          <div className={styles.reportForm}>
            <h3>MANEB Secondary Schools Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label htmlFor="district">District</label>
                <input 
                  type="text" 
                  id="district" 
                  placeholder="Enter district name (optional)" 
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                />
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}

        {/* MANEB Verification Report Form */}
        {activeReport === 'maneb-verification' && (
          <div className={styles.reportForm}>
            <h3>MANEB Verification Requests Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label>Verification Status</label>
                <div className={styles.radioGroup}>
                  <input type="radio" id="verify-all" name="verification-status" value="all" defaultChecked />
                  <label htmlFor="verify-all">All Requests</label>
                  
                  <input type="radio" id="verify-approved" name="verification-status" value="approved" />
                  <label htmlFor="verify-approved">Approved Only</label>
                  
                  <input type="radio" id="verify-pending" name="verification-status" value="pending" />
                  <label htmlFor="verify-pending">Pending Only</label>
                </div>
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}

        {/* Accredited University & Program Report Form */}
        {activeReport === 'accredited' && (
          <div className={styles.reportForm}>
            <h3>Accredited University & Program Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label htmlFor="university-name">University Name</label>
                <input type="text" id="university-name" placeholder="Enter university name" />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="accreditation-status">Accreditation Status</label>
                <select id="accreditation-status">
                  <option value="all">All Statuses</option>
                  <option value="fully">Fully Accredited</option>
                  <option value="provisional">Provisional</option>
                  <option value="probation">On Probation</option>
                </select>
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}

        {/* Graduate Report Form */}
        {activeReport === 'graduate' && (
          <div className={styles.reportForm}>
            <h3>Graduate Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label htmlFor="graduation-year">Graduation Year</label>
                <select id="graduation-year">
                  <option value="all">All Years</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}

        {/* Verification Report Form */}
        {activeReport === 'verification' && (
          <div className={styles.reportForm}>
            <h3>Verification Report</h3>
            <form onSubmit={generateReport}>
              <div className={styles.formGroup}>
                <label>Verification Type</label>
                <div className={styles.radioGroup}>
                  <input type="radio" id="verify-degree" name="verification-type" value="degree" defaultChecked />
                  <label htmlFor="verify-degree">Degree Verification</label>
                  
                  <input type="radio" id="verify-enrollment" name="verification-type" value="enrollment" />
                  <label htmlFor="verify-enrollment">Enrollment Verification</label>
                </div>
              </div>
              
              <button type="submit" className={styles.generateBtn} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className={styles.reportPreviewContainer}>
        <div className={styles.reportPreviewHeader}>
          <h3>Report Preview</h3>
          <div className={styles.reportActions}>
            <button className={styles.actionBtn}>Export PDF</button>
            <button className={styles.actionBtn}>Export CSV</button>
            <button className={styles.actionBtn}>Print Report</button>
          </div>
        </div>
        <div className={styles.reportPreviewContent}>
          {isGenerating ? (
            <div className={styles.loading}>Generating report...</div>
          ) : reportContent ? (
            reportContent
          ) : (
            <p>Select report parameters and click "Generate Report" to view preview</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;