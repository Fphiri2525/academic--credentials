import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, BarChart3 } from 'lucide-react';
import styles from './reportCard.module.css';

const ReportCard = ({ 
  title, 
  description, 
  reportType, 
  onGenerate, 
  onView, 
  onDownloadPDF,
  isGenerating, 
  isGenerated,
  generatedAt,
  totalCount,
  hasChart 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getReportIcon = () => {
    switch (reportType) {
      case 'accredited':
        return <FileText className={styles.cardIcon} />;
      case 'graduate':
        return <BarChart3 className={styles.cardIcon} />;
      case 'verification':
        return <Eye className={styles.cardIcon} />;
      default:
        return <FileText className={styles.cardIcon} />;
    }
  };

  const getReportColor = () => {
    switch (reportType) {
      case 'accredited':
        return styles.accreditedCard;
      case 'graduate':
        return styles.graduateCard;
      case 'verification':
        return styles.verificationCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <div className={`${styles.reportCard} ${getReportColor()}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIconContainer}>
          {getReportIcon()}
        </div>
        <div className={styles.cardTitleContainer}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>

      <div className={styles.cardContent}>
        {isGenerated && (
          <div className={styles.reportMeta}>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              <span>Generated: {generatedAt}</span>
            </div>
            {totalCount !== undefined && (
              <div className={styles.metaItem}>
                <BarChart3 className={styles.metaIcon} />
                <span>Total Records: {totalCount}</span>
              </div>
            )}
            {hasChart && (
              <div className={styles.metaItem}>
                <BarChart3 className={styles.metaIcon} />
                <span>Includes Charts</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.cardActions}>
          {!isGenerated ? (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`${styles.actionButton} ${styles.generateButton}`}
            >
              {isGenerating ? (
                <>
                  <div className={styles.spinner}></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className={styles.buttonIcon} />
                  Generate Report
                </>
              )}
            </button>
          ) : (
            <div className={styles.actionGroup}>
              <button
                onClick={onView}
                className={`${styles.actionButton} ${styles.viewButton}`}
              >
                <Eye className={styles.buttonIcon} />
                View Details
              </button>
              <button
                onClick={onDownloadPDF}
                className={`${styles.actionButton} ${styles.downloadButton}`}
              >
                <Download className={styles.buttonIcon} />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {isGenerated && (
        <div className={styles.cardFooter}>
          <div className={styles.statusIndicator}>
            <div className={styles.statusDot}></div>
            <span className={styles.statusText}>Report Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
