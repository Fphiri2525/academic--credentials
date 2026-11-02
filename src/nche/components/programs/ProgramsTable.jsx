import { Eye } from 'lucide-react';
import styles from './ProgramsPage.module.css';

export default function ProgramsTable({ results, onView }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Search Results ({results.length})</h2>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Program</th>
              <th>Award</th>
              <th>Year</th>
              <th>Reg. No.</th>
              <th>Verified Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{item.studentName}</td>
                <td>{item.programOfStudy}</td>
                <td>{item.award}</td>
                <td>{item.yearOfGraduation}</td>
                <td>{item.registrationNumber}</td>
                <td>{item.dateVerified}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button onClick={() => onView(item)} className={styles.btnGhost}>
                      <Eye size={16} /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}