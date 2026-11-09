
// src/student_approval/Student.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Award } from 'lucide-react';

import StudentLookupForm from './StudentLookupForm';

import {
  useAccreditationManagement,
  useManebContract,
  useConnectionStatus,
} from '../hooks/useSmartContract';

import styles from './Student.module.css';

export default function StudentPortal() {
  const navigate = useNavigate();

  const [showLookupForm, setShowLookupForm] = useState(false);

  const { isConnected } = useConnectionStatus();

  const { getStudentByAwardAndRegNumber } =
    useAccreditationManagement();

  const { getStudentDetailsByExamAndYear } =
    useManebContract();

  // Navigate to student details after successful verification
  const goToDetails = (studentDetails, level) => {
    navigate('/student/details', {
      state: {
        studentDetails,
        educationLevel: level,
      },
    });
  };

  return (
    <div className={styles.shell}>

      {!showLookupForm ? (

        // Student Dashboard
        <div className={styles.card}>

          <div className={styles.heroHead}>
            <div>
              <h2 className={styles.cardTitle}>
                Student Certificate Portal
              </h2>

              <p className={styles.cardSub}>
                Apply for certificate verification or access
                your digital certificate.
              </p>
            </div>
          </div>

          <div className={styles.formActions}>

            {/* Apply for Verification Certificate */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setShowLookupForm(true)}
            >
              <FileText size={17} />
              Apply for Verification Certificate
            </button>

            {/* Get Certificate */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/student/qrcode')}
            >
              <Award size={17} />
              Get Certificate
            </button>

          </div>

        </div>

      ) : (

        // Existing Student Lookup Form
        <StudentLookupForm
          onBack={() => setShowLookupForm(false)}
          onVerified={goToDetails}
          isConnected={isConnected}
          getStudentByAwardAndRegNumber={
            getStudentByAwardAndRegNumber
          }
          getStudentDetailsByExamAndYear={
            getStudentDetailsByExamAndYear
          }
        />

      )}

    </div>
  );
}
