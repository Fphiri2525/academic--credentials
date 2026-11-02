import { useState, useEffect } from "react";
import { useTheme } from "./maneb";
import {
  CheckCircle,
  BarChart3,
  Users,
  School,
  Calendar,
  QrCode,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import { useManebContract } from "../hooks/useSmartContract";
import styles from "./dashboard.module.css";

const Dashboard = () => {
  const { darkMode } = useTheme();
  const {
    getFormFourStatistics,
    getAllFormFourDetails,
    getTotalVerificationCertificates,
    getTotalQRCodesGenerated,
    getTotalSecondarySchools,
  } = useManebContract();

  // State for Form Four data
  const [formFourStats, setFormFourStats] = useState({
    totalStudents: 0,
    totalSchools: 0,
    yearRange: { min: null, max: null },
    schoolStats: [],
    yearStats: [],
  });
  const [recentGraduates, setRecentGraduates] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for analytics data from blockchain
  const [analyticsData, setAnalyticsData] = useState({
    totalCertificates: 0,
    verifiedCertificates: 0,
    notVerifiedCertificates: 0,
    institutions: 0,
    totalGraduates: 0,
    totalStudents: 0,
    totalQRCodes: 0,
    formFourStudents: 0,
    digitalCertificatesGenerated: 0,
    digitalCertificatesNotGenerated: 0,
    monthlyGrowth: 0,
    verificationRate: 100,
  });

  // Load Form Four data on component mount
  useEffect(() => {
    loadFormFourData();
  }, []);

  const loadFormFourData = async () => {
    try {
      setLoading(true);
      console.log("📊 Loading dashboard data from blockchain...");

      // Load all data in parallel using correct ABI functions
      const [
        formFourStats,
        allGraduates,
        totalVerificationCertificates,
        totalQRCodes,
        totalSchools,
      ] = await Promise.all([
        getFormFourStatistics(),
        getAllFormFourDetails(),
        getTotalVerificationCertificates(),
        getTotalQRCodesGenerated(),
        getTotalSecondarySchools(),
      ]);

      // Update Form Four statistics
      setFormFourStats(
        formFourStats || {
          totalStudents: 0,
          totalSchools: 0,
          yearRange: { min: null, max: null },
          schoolStats: [],
          yearStats: [],
        },
      );

      // Get the 5 most recent graduates
      const recent = (allGraduates || []).slice(-5).reverse();
      setRecentGraduates(recent);

      // Calculate digital certificates generated vs not generated
      const totalFormFourStudents = formFourStats?.totalStudents || 0;
      const digitalGenerated = totalQRCodes || 0; // Assuming QR codes represent digital certificates
      const digitalNotGenerated = Math.max(
        0,
        totalFormFourStudents - digitalGenerated,
      );

      // Update analytics data with real blockchain values
      setAnalyticsData({
        totalCertificates: totalVerificationCertificates || 0,
        verifiedCertificates: totalVerificationCertificates || 0,
        notVerifiedCertificates: 0,
        institutions: totalSchools || 0,
        totalQRCodes: totalQRCodes || 0,
        formFourStudents: totalFormFourStudents,
        digitalCertificatesGenerated: digitalGenerated,
        digitalCertificatesNotGenerated: digitalNotGenerated,
        monthlyGrowth: 0,
        verificationRate: 100,
      });

      console.log("✅ Dashboard data loaded:", {
        formFourStats,
        totalVerificationCertificates,
        totalQRCodes,
        totalSchools,
        recentCount: recent.length,
      });
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages from current analytics data

  // Calculate percentages
  const verifiedPercentage =
    analyticsData.totalCertificates > 0
      ? (
          (analyticsData.verifiedCertificates /
            analyticsData.totalCertificates) *
          100
        ).toFixed(1)
      : "0.0";
  const notVerifiedPercentage =
    analyticsData.totalCertificates > 0
      ? (
          (analyticsData.notVerifiedCertificates /
            analyticsData.totalCertificates) *
          100
        ).toFixed(1)
      : "0.0";

  // Recent activities - populated from Form Four data
  const recentActivities = recentGraduates.map((graduate, index) => ({
    id: index + 1,
    type: "Form Four Added",
    description: `${graduate.studentName} from ${graduate.schoolName}`,
    time: `Year ${graduate.yearOfExamination}`,
    status: "verified",
  }));

  // Dashboard Card Component (same as homepage)
  const DashboardCard = ({
    icon,
    title,
    value,
    isDark,
    onClick,
    isClickable = false,
  }) => (
    <div
      className={`${styles.dashboardCard} ${isDark ? styles.darkCard : ""} ${isClickable ? styles.clickableCard : ""}`}
      onClick={onClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <div className={styles.dashboardCardContent}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardInfo}>
          <h4
            className={`${styles.dashboardTitle} ${isDark ? styles.darkText : ""}`}
          >
            {title}
          </h4>
          <p
            className={`${styles.dashboardValue} ${isDark ? styles.darkText : ""}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`${styles.dashboardContainer} ${darkMode ? styles.darkTheme : styles.lightTheme}`}
    >
      <header className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>MANEB Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Certificate verification analytics and system overview
        </p>
      </header>

      {/* Dashboard Cards Grid - Same as Homepage */}
      <div className={styles.dashboardGrid}>
        <DashboardCard
          icon={<Users size={24} color="#2563eb" />}
          title="Total Students"
          value={loading ? "Loading..." : formFourStats.totalStudents}
          isDark={darkMode}
          isClickable={true}
          onClick={() => (window.location.href = "/maneb/upload")}
        />
        <DashboardCard
          icon={<School size={24} color="#f59e0b" />}
          title="Total Schools"
          value={loading ? "Loading..." : formFourStats.totalSchools}
          isDark={darkMode}
        />
        <DashboardCard
          icon={<CheckCircle size={24} color="#10b981" />}
          title="Digital Certificates"
          value={
            loading ? "Loading..." : analyticsData.digitalCertificatesGenerated
          }
          isDark={darkMode}
        />
        <DashboardCard
          icon={<QrCode size={24} color="#8b5cf6" />}
          title="QR Codes Generated"
          value={loading ? "Loading..." : analyticsData.totalQRCodes}
          isDark={darkMode}
        />
      </div>

      {/* Digital Certificates Analytics Section */}
      <div className={styles.analyticsSection}>
        <div className={`${styles.card} ${styles.analyticsCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Digital Certificates Analytics</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsItem}>
                <div className={styles.analyticsIcon}>
                  <CheckCircle className={styles.iconDigitalGenerated} />
                </div>
                <div className={styles.analyticsData}>
                  <h4>Digital Certificates Generated</h4>
                  <p className={styles.analyticsValue}>
                    {analyticsData.digitalCertificatesGenerated}
                  </p>
                  <p className={styles.analyticsDescription}>
                    Certificates with digital verification
                  </p>
                </div>
              </div>

              <div className={styles.analyticsItem}>
                <div className={styles.analyticsIcon}>
                  <BarChart3 className={styles.iconDigitalNotGenerated} />
                </div>
                <div className={styles.analyticsData}>
                  <h4>Digital Certificates Not Generated</h4>
                  <p className={styles.analyticsValue}>
                    {analyticsData.digitalCertificatesNotGenerated}
                  </p>
                  <p className={styles.analyticsDescription}>
                    Pending digital verification
                  </p>
                </div>
              </div>

              <div className={styles.analyticsItem}>
                <div className={styles.pieChartContainer}>
                  <div className={styles.pieChart}>
                    <div
                      className={styles.chartSegment}
                      style={{
                        background: `conic-gradient(
                        #10b981 0deg ${(analyticsData.digitalCertificatesGenerated / (analyticsData.digitalCertificatesGenerated + analyticsData.digitalCertificatesNotGenerated)) * 360 || 0}deg,
                        #f59e0b ${(analyticsData.digitalCertificatesGenerated / (analyticsData.digitalCertificatesGenerated + analyticsData.digitalCertificatesNotGenerated)) * 360 || 0}deg 360deg
                      )`,
                      }}
                    >
                      <div className={styles.chartCenter}>
                        <span className={styles.chartPercentage}>
                          {analyticsData.digitalCertificatesGenerated +
                            analyticsData.digitalCertificatesNotGenerated >
                          0
                            ? Math.round(
                                (analyticsData.digitalCertificatesGenerated /
                                  (analyticsData.digitalCertificatesGenerated +
                                    analyticsData.digitalCertificatesNotGenerated)) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                        <span className={styles.chartLabel}>Generated</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColorGenerated}></span>
                      <span>
                        Generated ({analyticsData.digitalCertificatesGenerated})
                      </span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColorNotGenerated}></span>
                      <span>
                        Not Generated (
                        {analyticsData.digitalCertificatesNotGenerated})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Card - Full width */}
      <div className={styles.activitySection}>
        <div className={`${styles.card} ${styles.activityCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Activity</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.activityList}>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIndicator}>
                      <div className={styles.activityDot}></div>
                      {index < recentActivities.length - 1 && (
                        <div className={styles.activityLine}></div>
                      )}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>{activity.message}</p>
                      <p className={styles.activityTime}>{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>
                    No recent activities to display
                  </p>
                  <p className={styles.emptyStateSubtext}>
                    Activities will appear here when system events occur
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
