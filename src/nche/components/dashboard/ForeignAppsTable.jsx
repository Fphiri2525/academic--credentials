import Chip from './Chip';
import styles from './Dashboard.module.css';

const OPEN = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_NEEDED'];

export default function ForeignAppsTable({ applications, onDecide, onView }) {
  const openCount = applications.filter((a) => OPEN.includes(a.status)).length;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Foreign applications</h2>
        <span className={styles.muted}>{openCount} open</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Award</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => {
              const isOpen = OPEN.includes(a.status);
              return (
                <tr key={a.id}>
                  <td>
                    {a.name}
                    <div className={styles.subtle}>{a.country} · {a.id}</div>
                  </td>
                  <td>{a.award}</td>
                  <td><Chip value={a.status} /></td>
                  <td className={styles.tableAction}>
                    {isOpen ? (
                      <>
                        <button className={styles.btnSuccess} onClick={() => onDecide(a, 'APPROVED')}>
                          Approve
                        </button>
                        <button className={styles.btnDanger} onClick={() => onDecide(a, 'REJECTED')}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <button className={styles.btnGhost} onClick={onView}>View</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
