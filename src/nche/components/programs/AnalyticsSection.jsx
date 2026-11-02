import { BarChart3, PieChart, TrendingUp, University, Award, Users, Calendar } from 'lucide-react';
import styles from './ProgramsPage.module.css';

export default function AnalyticsSection({ statistics }) {
  if (!statistics) return null;

  const renderBarChart = (data, total, maxSlices = 5, sortFn) => {
    const entries = Object.entries(data);
    if (sortFn) entries.sort(sortFn);
    
    return entries.slice(0, maxSlices).map(([label, count]) => (
      <div key={label} className={styles.progressRow}>
        <div className={styles.progressHead}>
          <span className={styles.progressLabel}>{label}</span>
          <span className={styles.progressValue}><strong>{count}</strong></span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.analyticsContainer}>
      <h3 className={styles.sectionTitle}>
        <BarChart3 size={20} />
        Certificate Analytics
      </h3>

      {/* Top Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Certificates</span>
            <Award size={18} color="var(--accent)" />
          </div>
          <div className={styles.statValue}>{statistics.totalCertificates}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Unique Programs</span>
            <Users size={18} color="var(--accent)" />
          </div>
          <div className={styles.statValue}>{statistics.uniquePrograms}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Award Types</span>
            <TrendingUp size={18} color="var(--accent)" />
          </div>
          <div className={styles.statValue}>{statistics.uniqueAwards}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Year Range</span>
            <Calendar size={18} color="var(--accent)" />
          </div>
          <div className={styles.statValue}>
            {statistics.yearRange.earliest} - {statistics.yearRange.latest}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}><PieChart size={16} /> Award Distribution</h4>
          <div className={styles.progressList}>
            {renderBarChart(statistics.awardDistribution, statistics.totalCertificates)}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}><TrendingUp size={16} /> Year Distribution</h4>
          <div className={styles.progressList}>
            {renderBarChart(
              statistics.yearDistribution, 
              statistics.totalCertificates, 
              5, 
              ([a], [b]) => parseInt(b) - parseInt(a)
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}><University size={16} /> Top Programs</h4>
          <div className={styles.progressList}>
            {renderBarChart(
              statistics.programDistribution, 
              statistics.totalCertificates,
              5,
              ([, a], [, b]) => b - a
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className={styles.insightsCard}>
        <h4 className={styles.chartTitle}>Key Insights</h4>
        <div className={styles.insightsGrid}>
          <div>
            <div className={styles.insightLabel}>Most Common Award</div>
            <div className={styles.insightValue}>{statistics.mostCommon.award || 'N/A'}</div>
          </div>
          <div>
            <div className={styles.insightLabel}>Most Active Year</div>
            <div className={styles.insightValue}>{statistics.mostCommon.year || 'N/A'}</div>
          </div>
          <div>
            <div className={styles.insightLabel}>Most Popular Program</div>
            <div className={styles.insightValue}>{statistics.mostCommon.program || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}