import { X, Download } from 'lucide-react';
import styles from './ReportsPage.module.css';

export default function ReportDetailsModal({ data, type, onClose, onDownload }) {
  if (!data) return null;

  const chartTitle =
    type === 'graduate'     ? 'Universities vs Graduates' :
    type === 'verification' ? 'Universities vs Verifications' :
                              'Universities vs Programs';

  const maxChartValue = Math.max(...(data.chartData || []).map((d) => d.value), 1);

  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{data.title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaLabel}>Generated</div>
              <div className={styles.metaValue}>{data.generatedAt}</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Total Records</div>
              <div className={styles.metaValue}>{data.totalCount.toLocaleString()}</div>
            </div>
            {type === 'verification' && data.totalQRCodes !== undefined && (
              <div>
                <div className={styles.metaLabel}>QR Codes</div>
                <div className={styles.metaValue}>{data.totalQRCodes.toLocaleString()}</div>
              </div>
            )}
          </div>

          <p className={styles.description}>{data.description}</p>

          {data.chartData?.length > 0 && (
            <div className={styles.chartBlock}>
              <h3 className={styles.blockTitle}>{chartTitle}</h3>
              <div className={styles.barList}>
                {data.chartData.map((item, i) => (
                  <div key={i} className={styles.barRow}>
                    <div className={styles.barLabel} title={item.name}>{item.name}</div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(item.value / maxChartValue) * 100}%` }}
                      />
                    </div>
                    <div className={styles.barValue}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.universities?.length > 0 && (
            <div className={styles.universityList}>
              <h3 className={styles.blockTitle}>
                {type === 'graduate' ? 'Graduate Details' : type === 'verification' ? 'Verification Details' : 'Universities'}
              </h3>
              {data.universities.map((u, i) => (
                <div key={i} className={styles.universityCard}>
                  <div className={styles.universityHead}>
                    <span className={styles.universityName}>{u.name}</span>
                    <span className={styles.universityBadge}>
                      {type === 'graduate'
                        ? `${u.graduateCount || 0} graduates`
                        : type === 'verification'
                        ? `${u.count || 0} verifications`
                        : `${u.programCount || 0} programs`}
                    </span>
                  </div>

                  {type === 'accredited' && u.programs?.length > 0 && (
                    <ul className={styles.programList}>
                      {u.programs.slice(0, 5).map((p, pi) => (
                        <li key={pi}>{p.name || p}</li>
                      ))}
                      {u.programs.length > 5 && <li>+{u.programs.length - 5} more</li>}
                    </ul>
                  )}

                  {type === 'graduate' && u.graduates?.length > 0 && (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Program</th>
                            <th>Award</th>
                            <th>Year</th>
                            <th>Reg. No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {u.graduates.slice(0, 5).map((g, gi) => (
                            <tr key={gi}>
                              <td>{g.studentName}</td>
                              <td>{g.programOfStudy}</td>
                              <td>{g.award}</td>
                              <td>{g.yearOfGraduation}</td>
                              <td>{g.registrationNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {type === 'verification' && u.verifications?.length > 0 && (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Program</th>
                            <th>Award</th>
                            <th>Year</th>
                            <th>Verified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {u.verifications.slice(0, 5).map((v, vi) => (
                            <tr key={vi}>
                              <td>{v.studentName}</td>
                              <td>{v.programOfStudy}</td>
                              <td>{v.award}</td>
                              <td>{v.yearOfGraduation}</td>
                              <td>{v.dateVerified || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onDownload}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
