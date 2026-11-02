import { FileText, Download, Eye, Calendar, BarChart3, CheckCircle2 } from 'lucide-react';
import styles from './ReportCard.module.css';

export default function ReportCard({
  title, description, reportType,
  onGenerate, onView, onDownload,
  isGenerating, isGenerated,
  generatedAt, totalCount, hasChart,
}) {
  const accent = {
    accredited:   'var(--accent)',
    graduate:     'var(--success)',
    verification: 'var(--warning)',
  }[reportType] || 'var(--text-muted)';

  return (
    <div className={styles.card} style={{ borderTopColor: accent }}>
      <div className={styles.header}>
        <div className={styles.icon} style={{ color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
          <FileText size={20} />
        </div>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      {isGenerated && (
        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <Calendar size={14} />
            <span>Generated {generatedAt}</span>
          </div>
          {totalCount !== undefined && (
            <div className={styles.metaRow}>
              <BarChart3 size={14} />
              <span>{totalCount.toLocaleString()} records</span>
            </div>
          )}
          {hasChart && (
            <div className={styles.metaRow}>
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
              <span>Chart included</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {!isGenerated ? (
          <button className={styles.btnPrimary} onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <span className={styles.spinner} />
                Generating...
              </>
            ) : (
              <>
                <FileText size={16} />
                Generate Report
              </>
            )}
          </button>
        ) : (
          <>
            <button className={styles.btnGhost} onClick={onView}>
              <Eye size={16} /> View
            </button>
            <button className={styles.btnPrimary} onClick={onDownload}>
              <Download size={16} /> PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}
