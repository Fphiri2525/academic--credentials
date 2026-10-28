
import { Home, GraduationCap } from 'lucide-react';
import styles from './dashboard.module.css';

export default function Dashboard({ data, darkMode, isLoading, userDetails, isLoadingUserDetails, isConnected, onCardClick }) {
  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <WelcomeSection 
        userDetails={userDetails} 
        isLoadingUserDetails={isLoadingUserDetails} 
        isConnected={isConnected}
      />
      <StatisticsSection data={data} isLoading={isLoading} onCardClick={onCardClick} />
    </div>
  );
}

function WelcomeSection({ userDetails, isLoadingUserDetails, isConnected }) {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeTitle}>
          {!isConnected 
            ? "🔗 Please connect your wallet to view user details"
            : isLoadingUserDetails 
              ? "⏳ Loading User Details..."
              : userDetails?.name 
                ? `👋 Welcome, ${userDetails.name}!`
                : "loading..."
          }
        </h1>
        
        {isConnected && !isLoadingUserDetails && userDetails && (
          <div className={styles.welcomeMessage}>
                    </div>
        )}
      </div>
    </div>
  );
}

function StatisticsSection({ data, isLoading, onCardClick }) {
  return (
    <div className={styles.statsGrid}>
      <StatisticCard
        title="Total Graduates"
        value={isLoading ? 'Loading...' : (data?.totalGraduates || 0).toLocaleString()}
        icon={<GraduationCap size={20} />}
        subtitle={isLoading ? '' : `All time graduates from university`}
        isLoading={isLoading}
        onClick={onCardClick}
      />
      <StatisticCard
        title="Recent Year Graduates"
        value={isLoading ? 'Loading...' : (data?.recentYearGraduates || 0).toLocaleString()}
        icon={<GraduationCap size={20} />}
        subtitle={isLoading ? '' : `Graduates from ${new Date().getFullYear() - 1} onwards`}
        isLoading={isLoading}
        onClick={onCardClick}
      />
      <StatisticCard
        title="Total Programs"
        value={isLoading ? 'Loading...' : (data?.totalPrograms || 0).toLocaleString()}
        icon={<Home size={20} />}
        subtitle={isLoading ? '' : `Academic programs offered`}
        isLoading={isLoading}
        onClick={onCardClick}
      />
    </div>
  );
}

function StatisticCard({ title, value, icon, subtitle, isLoading, onClick }) {
  const handleClick = () => {
    if (!isLoading && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`${styles.statCard} ${isLoading ? styles.loading : ''} ${onClick && !isLoading ? styles.clickable : ''}`}
      onClick={handleClick}
      role={onClick && !isLoading ? "button" : undefined}
      tabIndex={onClick && !isLoading ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !isLoading) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.iconContainer}>
        {icon}
      </div>
      <h2 className={styles.statTitle}>{title}</h2>
      <p className={styles.statValue}>{value}</p>
      {subtitle && !isLoading && <p className={styles.statSubtitle}>{subtitle}</p>}
      {onClick && !isLoading && (
        <div className={styles.clickIndicator}>
          <span>Click to view details →</span>
        </div>
      )}
    </div>
  );
}