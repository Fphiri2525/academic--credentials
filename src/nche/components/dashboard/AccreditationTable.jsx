import Chip from './Chip';
import styles from './Dashboard.module.css';

export default function AccreditationTable({ universities, onToggle }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Accreditation control</h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>University</th>
              <th>Status</th>
              <th>Certificates</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {universities.map((u) => {
              const suspended = u.status === 'SUSPENDED';
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td><Chip value={u.status} /></td>
                  <td>{u.certs.toLocaleString()}</td>
                  <td className={styles.tableAction}>
                    <button
                      className={suspended ? styles.btnSuccess : styles.btnDanger}
                      onClick={() => onToggle(u)}
                    >
                      {suspended ? 'Reinstate' : 'Suspend'}
                    </button>
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
