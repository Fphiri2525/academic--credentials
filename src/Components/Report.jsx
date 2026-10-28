import { useState, useRef } from 'react';
import { useAccreditationManagement, useConnectionStatus, useCertificateManagement, useSmartContract } from '../hooks/useSmartContract';
import { generateAndDownloadPDF } from "../utilis/PDFGenerator";
import ReportCard from './ReportCard';
import styles from './report.module.css';

const Report = () => {
  const [reportData, setReportData] = useState({});
  const [isGenerating, setIsGenerating] = useState({});
  const [viewingReport, setViewingReport] = useState(null);
  const chartRef = useRef(null);

  const { getAllAccreditedUniversities, getProgramsByUniversity, getTotalAccreditedUniversities, getTotalQRCodesGenerated } = useAccreditationManagement();
  const { getTotalGraduatesByUniversityName, getGraduatesByUniversityName } = useCertificateManagement();
  const { isConnected } = useConnectionStatus();
  const { contract } = useSmartContract();

  // Helper function to get total graduates across all universities
  const getTotalGraduates = async () => {
    try {
      const total = await contract.callContract('certificateManagement', 'getTotalGraduates', []);
      return parseInt(total) || 0;
    } catch (error) {
      console.error('Error fetching total graduates:', error);
      return 0;
    }
  };

  // Helper function to get all verification requests
  const getAllVerificationRequests = async () => {
    try {
      const verificationRequests = await contract.callContract('certificateManagement', 'getAllVerificationRequests', []);

      if (Array.isArray(verificationRequests) && verificationRequests.length > 0) {
        return verificationRequests.map((request, index) => ({
          id: index,
          universityName: request.universityName || request[0] || '',
          studentName: request.studentName || request[1] || '',
          programOfStudy: request.programOfStudy || request[2] || '',
          award: request.award || request[3] || '',
          yearOfGraduation: request.yearOfGraduation || request[4] || '',
          registrationNumber: request.registrationNumber || request[5] || '',
          dateVerified: request.dateVerified || request[6] || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      return [];
    }
  };

  // Helper function to get total QR codes generated
  const getTotalQRCodes = async () => {
    try {
      const total = await contract.callContract('certificateManagement', 'getTotalQRCodesGenerated', []);
      return parseInt(total) || 0;
    } catch (error) {
      console.error('Error fetching total QR codes:', error);
      return 0;
    }
  };

  // Report configurations
  const reportConfigs = [
    {
      id: 'accredited',
      title: 'Accredited University Report',
      description: 'Comprehensive report of all accredited universities and their programs in Malawi.',
      type: 'accredited'
    },
    {
      id: 'graduate',
      title: 'Graduate Report in Malawi',
      description: 'Comprehensive report of all graduates from accredited universities in Malawi, with detailed statistics by university, program, and year.',
      type: 'graduate'
    },
    {
      id: 'verification',
      title: 'Verification Report',
      description: 'Comprehensive report of all certificate verifications made through the system, including QR code generation statistics and verification trends.',
      type: 'verification'
    }
  ];

  // Generate report for specific type
  const generateReport = async (reportType) => {
    setIsGenerating(prev => ({ ...prev, [reportType]: true }));

    try {
      let data = null;

      switch (reportType) {
        case 'accredited':
          data = await generateAccreditedUniversityReport();
          break;
        case 'graduate':
          data = await generateGraduateReport();
          break;
        case 'verification':
          data = await generateVerificationReport();
          break;
        default:
          throw new Error('Unknown report type');
      }

      setReportData(prev => ({ ...prev, [reportType]: data }));
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const generateAccreditedUniversityReport = async () => {
    if (!isConnected) {
      throw new Error('Please connect to blockchain network first');
    }

    // Get all accredited universities
    const universities = await getAllAccreditedUniversities();
    const totalCount = await getTotalAccreditedUniversities();

    // Get programs for each university
    const universitiesWithPrograms = await Promise.all(
      universities.map(async (university) => {
        try {
          const programs = await getProgramsByUniversity(university.name);
          return {
            ...university,
            programs: programs || [],
            programCount: programs ? programs.length : 0
          };
        } catch (error) {
          console.error(`Error fetching programs for ${university.name}:`, error);
          return {
            ...university,
            programs: [],
            programCount: 0
          };
        }
      }) 
    );

    return {
      title: 'Accredited Universities in Malawi',
      description: 'This report provides a comprehensive overview of all accredited universities in Malawi, including their programs and statistical analysis.',
      universities: universitiesWithPrograms,
      totalCount: totalCount || universities.length,
      generatedAt: new Date().toLocaleString(),
      chartData: universitiesWithPrograms.map(uni => ({
        name: uni.name.length > 20 ? uni.name.substring(0, 20) + '...' : uni.name,
        programs: uni.programCount
      }))
    };
  };

  const generateGraduateReport = async () => {
    if (!isConnected) {
      throw new Error('Please connect to blockchain network first');
    }

    try {
      // Get all accredited universities first
      const universities = await getAllAccreditedUniversities();

      // Get total graduates across all universities
      const totalGraduates = await getTotalGraduates();

      // Get graduates for each university
      const universitiesWithGraduates = await Promise.all(
        universities.map(async (university) => {
          try {
            const graduatesData = await getGraduatesByUniversityName(university.name);
            const totalResult = await getTotalGraduatesByUniversityName(university.name);

            return {
              ...university,
              graduates: graduatesData || [],
              graduateCount: totalResult?.count || 0,
              graduatesByYear: groupGraduatesByYear(graduatesData || []),
              graduatesByProgram: groupGraduatesByProgram(graduatesData || [])
            };
          } catch (error) {
            console.error(`Error fetching graduates for ${university.name}:`, error);
            return {
              ...university,
              graduates: [],
              graduateCount: 0,
              graduatesByYear: {},
              graduatesByProgram: {}
            };
          }
        })
      );

      return {
        title: 'Graduate Report in Malawi',
        description: 'Comprehensive report of all graduates from accredited universities in Malawi, including detailed statistics by university, program, and year.',
        universities: universitiesWithGraduates,
        totalCount: totalGraduates,
        generatedAt: new Date().toLocaleString(),
        chartData: universitiesWithGraduates.map(uni => ({
          name: uni.name.length > 20 ? uni.name.substring(0, 20) + '...' : uni.name,
          graduates: uni.graduateCount
        }))
      };
    } catch (error) {
      console.error('Error generating graduate report:', error);
      throw error;
    }
  };

  // Helper function to group graduates by year
  const groupGraduatesByYear = (graduates) => {
    return graduates.reduce((acc, graduate) => {
      const year = graduate.yearOfGraduation || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
  };

  // Helper function to group graduates by program
  const groupGraduatesByProgram = (graduates) => {
    return graduates.reduce((acc, graduate) => {
      const program = graduate.programOfStudy || 'Unknown';
      acc[program] = (acc[program] || 0) + 1;
      return acc;
    }, {});
  };

  const generateVerificationReport = async () => {
    if (!isConnected) {
      throw new Error('Please connect to blockchain network first');
    }

    try {
      // Get all verification requests
      const allVerifications = await getAllVerificationRequests();

      // Get total QR codes generated
      const totalQRCodes = await getTotalQRCodes();

      // Process verification data by university
      const verificationsByUniversity = {};
      const verificationsByYear = {};
      const verificationsByMonth = {};

      allVerifications.forEach(verification => {
        const university = verification.universityName || 'Unknown';
        const year = verification.yearOfGraduation || 'Unknown';
        const verificationDate = verification.dateVerified || '';

        // Group by university
        if (!verificationsByUniversity[university]) {
          verificationsByUniversity[university] = {
            name: university,
            verifications:    [],
            count: 0,
            programs: new Set(),
            awards: new Set()
          };
        }
        verificationsByUniversity[university].verifications.push(verification);
        verificationsByUniversity[university].count++;
        verificationsByUniversity[university].programs.add(verification.programOfStudy);
        verificationsByUniversity[university].awards.add(verification.award);

        // Group by graduation year
        verificationsByYear[year] = (verificationsByYear[year] || 0) + 1;

        // Group by verification month (if date available)
        if (verificationDate) {
          try {
            const date = new Date(verificationDate);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            verificationsByMonth[monthYear] = (verificationsByMonth[monthYear] || 0) + 1;
          } catch (error) {
            // Handle invalid date format
          }
        }
      });

      // Convert to array format for display
      const universitiesWithVerifications = Object.values(verificationsByUniversity).map(uni => ({
        ...uni,
        programs: Array.from(uni.programs),
        awards: Array.from(uni.awards),
        programCount: uni.programs.size,
        awardCount: uni.awards.size
      }));

      return {
        title: 'Verification Report',
        description: 'Comprehensive report of all certificate verifications made through the system, including QR code generation statistics and verification trends.',
        universities: universitiesWithVerifications,
        totalCount: allVerifications.length,
        totalQRCodes: totalQRCodes,
        verificationsByYear,
        verificationsByMonth,
        recentVerifications: allVerifications.slice(-10).reverse(), // Last 10 verifications
        generatedAt: new Date().toLocaleString(),
        chartData: universitiesWithVerifications.map(uni => ({
          name: uni.name.length > 20 ? uni.name.substring(0, 20) + '...' : uni.name,
          verifications: uni.count
        }))
      };
    } catch (error) {
      console.error('Error generating verification report:', error);
      throw error;
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (reportType) => {
    const data = reportData[reportType];
    if (!data) {
      alert('No report data available. Please generate the report first.');
      return;
    }

    try {
      const chartElement = chartRef.current;
      const success = await generateAndDownloadPDF(data, chartElement);

      if (success) {
        alert('PDF report downloaded successfully!');
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // Handle view report details
  const handleViewReport = (reportType) => {
    setViewingReport(reportType);
  };

  return (
    <div className={styles.reportPage}>
      <div className={styles.reportContainer}>

        {!isConnected && (
          <div className={styles.connectionWarning}>
            <p>⚠️ Please connect to blockchain network to generate reports</p>
          </div>
        )}

        <div className={styles.reportCardsContainer}>
          {reportConfigs.map((config) => (
            <ReportCard
              key={config.id}
              title={config.title}
              description={config.description}
              reportType={config.type}
              onGenerate={() => generateReport(config.id)}
              onView={() => handleViewReport(config.id)}
              onDownloadPDF={() => handleDownloadPDF(config.id)}
              isGenerating={isGenerating[config.id] || false}
              isGenerated={!!reportData[config.id]}
              generatedAt={reportData[config.id]?.generatedAt}
              totalCount={reportData[config.id]?.totalCount}
              hasChart={reportData[config.id]?.chartData?.length > 0}
            />
          ))}
        </div>

        {/* Detailed Report View Modal */}
        {viewingReport && reportData[viewingReport] && (
          <div className={styles.reportModal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{reportData[viewingReport].title}</h2>
                <button
                  onClick={() => setViewingReport(null)}
                  className={styles.closeButton}
                >
                  ✕ Close
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.reportMeta}>
                  <p><strong>Generated on:</strong> {reportData[viewingReport].generatedAt}</p>
                  <p><strong>Total Records:</strong> {reportData[viewingReport].totalCount}</p>
                  {viewingReport === 'verification' && reportData[viewingReport].totalQRCodes !== undefined && (
                    <p><strong>Total QR Codes Generated:</strong> {reportData[viewingReport].totalQRCodes}</p>
                  )}
                </div>

                <div className={styles.reportDescription}>
                  <p>{reportData[viewingReport].description}</p>
                </div>

                {/* Chart for PDF generation */}
                {reportData[viewingReport].chartData && reportData[viewingReport].chartData.length > 0 && (
                  <div className={styles.chartContainer} ref={chartRef}>
                    <h4 className={styles.chartTitle}>
                      {viewingReport === 'graduate' ? 'Universities vs Number of Graduates' :
                       viewingReport === 'verification' ? 'Universities vs Number of Verifications' :
                       'Universities vs Number of Programs'}
                    </h4>
                    <div className={styles.barChart}>
                      {reportData[viewingReport].chartData.map((item, index) => {
                        const maxValue = Math.max(...reportData[viewingReport].chartData.map(d =>
                          viewingReport === 'graduate' ? d.graduates :
                          viewingReport === 'verification' ? d.verifications : d.programs
                        ));
                        const value = viewingReport === 'graduate' ? item.graduates :
                                     viewingReport === 'verification' ? item.verifications : item.programs;
                        return (
                          <div key={index} className={styles.barItem}>
                            <div className={styles.barLabel}>{item.name}</div>
                            <div className={styles.barWrapper}>
                              <div
                                className={styles.bar}
                                style={{
                                  height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                                  minHeight: value > 0 ? '20px' : '5px'
                                }}
                              >
                                <span className={styles.barValue}>{value}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Universities List */}
                {reportData[viewingReport].universities && reportData[viewingReport].universities.length > 0 && (
                  <div className={styles.universitiesList}>
                    <h3>{viewingReport === 'graduate' ? 'Graduate Details by University' :
                         viewingReport === 'verification' ? 'Verification Details by University' :
                         'Detailed Information'}</h3>
                    {reportData[viewingReport].universities.map((university, index) => (
                      <div key={index} className={styles.universityCard}>
                        <div className={styles.universityHeader}>
                          <h4>{university.name}</h4>
                          <span className={styles.programCount}>
                            {viewingReport === 'graduate' ?
                              `${university.graduateCount || 0} Graduates` :
                              viewingReport === 'verification' ?
                              `${university.count || 0} Verifications` :
                              `${university.programCount || 0} Programs`
                            }
                          </span>
                        </div>
                        <div className={styles.universityDetails}>
                          {viewingReport !== 'verification' && (
                            <>
                              <p><strong>Category:</strong> {university.category}</p>
                              <p><strong>Contact:</strong> {university.contactInfo}</p>
                            </>
                          )}
                          {viewingReport === 'verification' && university.count > 0 && (
                            <>
                              <p><strong>Total Verifications:</strong> {university.count}</p>
                              <p><strong>Programs Verified:</strong> {university.programCount || 0}</p>
                              <p><strong>Award Types:</strong> {university.awardCount || 0}</p>
                              {university.programs && university.programs.length > 0 && (
                                <div className={styles.verificationPrograms}>
                                  <strong>Programs with Verifications:</strong>
                                  <ul>
                                    {university.programs.slice(0, 5).map((program, pIndex) => (
                                      <li key={pIndex}>{program}</li>
                                    ))}
                                    {university.programs.length > 5 && (
                                      <li>... and {university.programs.length - 5} more</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                          {viewingReport === 'graduate' && university.graduateCount > 0 && (
                            <>
                              <p><strong>Total Graduates:</strong> {university.graduateCount}</p>
                              {university.graduatesByYear && Object.keys(university.graduatesByYear).length > 0 && (
                                <div className={styles.graduatesByYear}>
                                  <strong>Graduates by Year:</strong>
                                  <ul>
                                    {Object.entries(university.graduatesByYear)
                                      .sort(([a], [b]) => b.localeCompare(a))
                                      .map(([year, count]) => (
                                        <li key={year}>{year}: {count} graduates</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                              {university.graduatesByProgram && Object.keys(university.graduatesByProgram).length > 0 && (
                                <div className={styles.graduatesByProgram}>
                                  <strong>Graduates by Program:</strong>
                                  <ul>
                                    {Object.entries(university.graduatesByProgram)
                                      .sort(([, a], [, b]) => b - a)
                                      .map(([program, count]) => (
                                        <li key={program}>{program}: {count} graduates</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {viewingReport !== 'graduate' && university.programs && university.programs.length > 0 && (
                          <div className={styles.programsList}>
                            <h5>Programs Offered:</h5>
                            <ul>
                              {university.programs.map((program, pIndex) => (
                                <li key={pIndex}>{program.name || program}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewingReport === 'graduate' && university.graduates && university.graduates.length > 0 && (
                          <div className={styles.graduatesList}>
                            <h5>Recent Graduates (Sample):</h5>
                            <div className={styles.graduatesTable}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Student Name</th>
                                    <th>Program</th>
                                    <th>Award</th>
                                    <th>Year</th>
                                    <th>Registration No.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {university.graduates.slice(0, 5).map((graduate, gIndex) => (
                                    <tr key={gIndex}>
                                      <td>{graduate.studentName}</td>
                                      <td>{graduate.programOfStudy}</td>
                                      <td>{graduate.award}</td>
                                      <td>{graduate.yearOfGraduation}</td>
                                      <td>{graduate.registrationNumber}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {university.graduates.length > 5 && (
                                <p className={styles.moreGraduates}>
                                  ... and {university.graduates.length - 5} more graduates
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {viewingReport === 'verification' && university.verifications && university.verifications.length > 0 && (
                          <div className={styles.verificationsList}>
                            <h5>Recent Verifications (Sample):</h5>
                            <div className={styles.verificationsTable}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Student Name</th>
                                    <th>Program</th>
                                    <th>Award</th>
                                    <th>Graduation Year</th>
                                    <th>Verification Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {university.verifications.slice(0, 5).map((verification, vIndex) => (
                                    <tr key={vIndex}>
                                      <td>{verification.studentName}</td>
                                      <td>{verification.programOfStudy}</td>
                                      <td>{verification.award}</td>
                                      <td>{verification.yearOfGraduation}</td>
                                      <td>{verification.dateVerified || 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {university.verifications.length > 5 && (
                                <p className={styles.moreVerifications}>
                                  ... and {university.verifications.length - 5} more verifications
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Verifications Summary for Verification Report */}
                {viewingReport === 'verification' && reportData[viewingReport].recentVerifications && (
                  <div className={styles.recentVerificationsSection}>
                    <h3>Recent Verification Activity</h3>
                    <div className={styles.verificationsTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>University</th>
                            <th>Program</th>
                            <th>Award</th>
                            <th>Verification Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData[viewingReport].recentVerifications.map((verification, index) => (
                            <tr key={index}>
                              <td>{verification.studentName}</td>
                              <td>{verification.universityName}</td>
                              <td>{verification.programOfStudy}</td>
                              <td>{verification.award}</td>
                              <td>{verification.dateVerified || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={() => handleDownloadPDF(viewingReport)}
                  className={styles.downloadPDFButton}
                >
                  📄 Download PDF Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
