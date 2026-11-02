import { useState, useEffect } from "react";
import { useTheme } from "./maneb";
import {
  CheckCircle,
  BarChart3,
  Users,
  School,
  QrCode,
  FileCheck,
  Activity,
  ArrowRight,
  TrendingUp,
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

  const [formFourStats, setFormFourStats] = useState({
    totalStudents: 0,
    totalSchools: 0,
    yearRange: { min: null, max: null },
    schoolStats: [],
    yearStats: [],
  });
  const [recentGraduates, setRecentGraduates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState({
    totalCertificates: 0,
    verifiedCertificates: 0,
    notVerifiedCertificates: 0,
    institutions: 0,
    totalQRCodes: 0,
    formFourStudents: 0,
    digitalCertificatesGenerated: 0,
    digitalCertificatesNotGenerated: 0,
  });

  useEffect(() => {
    loadFormFourData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFormFourData = async () => {
    try {
      setLoading(true);
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

      setFormFourStats(
        formFourStats || {
          totalStudents: 0,
          totalSchools: 0,
          yearRange: { min: null, max: null },
          schoolStats: [],
          yearStats: [],
        },
      );

      const recent = (allGraduates || []).slice(-5).reverse();
      setRecentGraduates(recent);

      const totalFormFourStudents = formFourStats?.totalStudents || 0;
      const digitalGenerated = totalQRCodes || 0;
      const digitalNotGenerated = Math.max(
        0,
        totalFormFourStudents - digitalGenerated,
      );

      setAnalyticsData({
        totalCertificates: totalVerificationCertificates || 0,
        verifiedCertificates: totalVerificationCertificates || 0,
        notVerifiedCertificates: 0,
        institutions: totalSchools || 0,
        totalQRCodes: totalQRCodes || 0,
        formFourStudents: totalFormFourStudents,
        digitalCertificatesGenerated: digitalGenerated,
        digitalCertificatesNotGenerated: digitalNotGenerated,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = recentGraduates.map((graduate, index) => ({
    id: index + 1,
    type: "Form Four Added",
    description: `${graduate.studentName} from ${graduate.schoolName}`,
    time: `Year ${graduate.yearOfExamination}`,
    status: "verified",
  }));

  const totalForChart =
    analyticsData.digitalCertificatesGenerated +
    analyticsData.digitalCertificatesNotGenerated;

  const generatedPercent =
    totalForChart > 0
      ? Math.round(
          (analyticsData.digitalCertificatesGenerated / totalForChart) * 100,
        )
      : 0;

  const DashboardCard = ({
    icon,
    title,
    value,
    isClickable = false,
    onClick,
  }) => (
    <div
      className={`${styles.dashboardCard} ${isClickable ? styles.clickableCard : ""}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className={styles.dashboardCardContent}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardInfo}>
          <h4 className={styles.dashboardTitle}>{title}</h4>
          <p className={styles.dashboardValue}>
            {loading ? (
              <span className={styles.skeletonText}>Loading…</span>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1 className={styles.mainTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Certificate verification analytics and system overview.
        </p>
      </header>

      {/* ============ Top Stat Cards ============ */}
      <div className={styles.dashboardGrid}>
        <DashboardCard
          icon={<Users size={22} color="#2563eb" />}
          title="Total Students"
          value={formFourStats.totalStudents.toLocaleString()}
          isClickable
          onClick={() => (window.location.href = "/maneb/upload")}
        />
        <DashboardCard
          icon={<School size={22} color="#f59e0b" />}
          title="Total Schools"
          value={formFourStats.totalSchools.toLocaleString()}
        />
        <DashboardCard
          icon={<CheckCircle size={22} color="#10b981" />}
          title="Digital Certificates"
          value={analyticsData.digitalCertificatesGenerated.toLocaleString()}
        />
        <DashboardCard
          icon={<QrCode size={22} color="#8b5cf6" />}
          title="QR Codes Generated"
          value={analyticsData.totalQRCodes.toLocaleString()}
        />
      </div>

      {/* ============ Analytics + Activity (side by side) ============ */}
      <div className={styles.grid2}>
        {/* ---- Analytics Card ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Certificate Analytics</h3>
              <p className={styles.cardSub}>
                Breakdown of generated vs pending certificates.
              </p>
            </div>
          </div>

          <div className={styles.analyticsGrid}>
            {/* Pie Chart Block */}
            <div className={styles.pieChartContainer}>
              <div className={styles.pieChart}>
                <div
                  className={styles.chartSegment}
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${generatedPercent * 3.6}deg,
                      #f59e0b ${generatedPercent * 3.6}deg 360deg
                    )`,
                  }}
                >
                  <div className={styles.chartCenter}>
                    <span className={styles.chartPercentage}>
                      {generatedPercent}%
                    </span>
                    <span className={styles.chartLabel}>Generated</span>
                  </div>
                </div>
              </div>

              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendColorGenerated} />
                  <span>Generated</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColorNotGenerated} />
                  <span>Not Generated</span>
                </div>
              </div>
            </div>

            {/* Mini Stat Blocks */}
            <div className={styles.analyticsStats}>
              <div className={`${styles.analyticsItem} ${styles.analyticsItemSuccess}`}>
                <div className={`${styles.analyticsIcon} ${styles.iconGeneratedBg}`}>
                  <CheckCircle size={18} color="#10b981" />
                </div>
                <div className={styles.analyticsData}>
                  <h4>Generated</h4>
                  <p className={styles.analyticsValue}>
                    {analyticsData.digitalCertificatesGenerated.toLocaleString()}
                  </p>
                  <p className={styles.analyticsDescription}>
                    Certificates with digital verification
                  </p>
                </div>
              </div>

              <div className={`${styles.analyticsItem} ${styles.analyticsItemWarning}`}>
                <div className={`${styles.analyticsIcon} ${styles.iconNotGeneratedBg}`}>
                  <BarChart3 size={18} color="#f59e0b" />
                </div>
                <div className={styles.analyticsData}>
                  <h4>Not Generated</h4>
                  <p className={styles.analyticsValue}>
                    {analyticsData.digitalCertificatesNotGenerated.toLocaleString()}
                  </p>
                  <p className={styles.analyticsDescription}>
                    Pending digital verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Recent Activity Card ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={18} color="var(--text-muted)" />
              <h3 className={styles.cardTitle}>Recent Activity</h3>
            </div>
            <button className={styles.viewAllBtn}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {recentActivities.length > 0 ? (
            <div className={styles.activityList}>
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIndicator}>
                    <div className={styles.activityDot} />
                    {index < recentActivities.length - 1 && (
                      <div className={styles.activityLine} />
                    )}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>{activity.description}</p>
                    <p className={styles.activityTime}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FileCheck
                size={32}
                color="var(--text-muted)"
                style={{ marginBottom: 12, opacity: 0.7 }}
              />
              <p className={styles.emptyStateText}>No recent activities</p>
              <p className={styles.emptyStateSubtext}>
                Activities will appear here when system events occur.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============ Full-width bottom notice (optional) ============ */}
      <div className={styles.card}>
        <div
          className={styles.cardHeader}
          style={{ marginBottom: 0, alignItems: "flex-start" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className={styles.cardTitle} style={{ fontSize: "1rem" }}>
                {generatedPercent}% of all students have generated a digital certificate
              </h3>
              <p className={styles.cardSub}>
                Based on {totalForChart.toLocaleString()} total students across{" "}
                {formFourStats.totalSchools.toLocaleString()} registered schools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;