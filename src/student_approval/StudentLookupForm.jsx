import { useState } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './Student.module.css';

const AWARDS = ['Diploma', 'Degree', 'Masters Degree', 'PhD'];

export default function StudentLookupForm({
  educationLevel,
  onBack,
  onVerified,
  isConnected,
  getStudentByAwardAndRegNumber,
  getStudentDetailsByExamAndYear,
}) {
  const [tertiary, setTertiary] = useState({ registrationNumber: '', award: '' });
  const [secondary, setSecondary] = useState({ examinationNumber: '', yearOfExamination: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isConnected) {
      return setError('Please connect your wallet to verify your details.');
    }
    setLoading(true);
    try {
      if (educationLevel === 'tertiary') {
        if (!tertiary.registrationNumber || !tertiary.award) {
          throw new Error('Please enter your registration number and award.');
        }
        const result = await getStudentByAwardAndRegNumber(
          tertiary.registrationNumber,
          tertiary.award,
        );
        if (result?.found && result.studentDetails) {
          const studentData = {
            found: true,
            educationLevel: 'tertiary',
            institutionName: result.studentDetails.universityName,
            studentName: result.studentDetails.studentName,
            programOfStudy: result.studentDetails.programOfStudy,
            award: result.studentDetails.award,
            yearOfGraduation: result.studentDetails.yearOfGraduation,
            registrationNumber: result.studentDetails.registrationNumber,
          };
          onVerified(studentData, 'tertiary');
        } else {
          throw new Error('No student record found with those details.');
        }
      } else {
        if (!secondary.examinationNumber || !secondary.yearOfExamination) {
          throw new Error('Please enter your examination number and year.');
        }
        const result = await getStudentDetailsByExamAndYear(
          secondary.examinationNumber,
          secondary.yearOfExamination,
        );
        if (result?.studentName) {
          const studentData = {
            educationLevel: 'secondary',
            studentName: result.studentName,
            examinationNumber: result.examinationNumber,
            schoolName: result.schoolName,
            yearOfExamination: result.yearOfExamination,
            hashValue: result.hashValue,
          };
          onVerified(studentData, 'secondary');
        } else {
          throw new Error('No student record found for those details.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to verify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        {educationLevel === 'secondary' ? 'MSCE verification' : 'University verification'}
      </h2>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertCircle size={16} />
          <span>Connect your wallet to verify your details.</span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className={styles.form}>
        {educationLevel === 'tertiary' ? (
          <>
            <Field label="Registration number">
              <input
                className={styles.input}
                value={tertiary.registrationNumber}
                onChange={(e) =>
                  setTertiary({ ...tertiary, registrationNumber: e.target.value })
                }
                placeholder="e.g. UNIMA/2019/0001"
              />
            </Field>
            <Field label="Award">
              <select
                className={styles.input}
                value={tertiary.award}
                onChange={(e) => setTertiary({ ...tertiary, award: e.target.value })}
              >
                <option value="">Select award</option>
                {AWARDS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Examination year">
              <input
                className={styles.input}
                value={secondary.yearOfExamination}
                onChange={(e) =>
                  setSecondary({ ...secondary, yearOfExamination: e.target.value })
                }
                placeholder="e.g. 2024"
              />
            </Field>
            <Field label="Examination number">
              <input
                className={styles.input}
                value={secondary.examinationNumber}
                onChange={(e) =>
                  setSecondary({ ...secondary, examinationNumber: e.target.value })
                }
                placeholder="e.g. MSCE2024001"
              />
            </Field>
          </>
        )}

        <div className={styles.formActions}>
          <button type="button" className={styles.btnGhost} onClick={onBack}>
            Back
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} /> Verifying…
              </>
            ) : (
              <>
                <Search size={16} /> Verify details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}