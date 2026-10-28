import React, { useState, useEffect } from 'react';
import styles from './student.module.css';

const Student = () => {
  const [showAccreditationForm, setShowAccreditationForm] = useState(false);
  const [educationLevel, setEducationLevel] = useState('');
  const [totalGraduates, setTotalGraduates] = useState(0);
  const [isLoadingGraduates, setIsLoadingGraduates] = useState(false);

  useEffect(() => {
    fetchTotalGraduates();
  }, []);

  const fetchTotalGraduates = async () => {
    try {
      setIsLoadingGraduates(true);
      // Replace with actual smart contract call
      setTotalGraduates(1250);
    } catch (error) {
      console.error('Error fetching total graduates:', error);
      setTotalGraduates(0);
    } finally {
      setIsLoadingGraduates(false);
    }
  };

  const handleApplyForAccreditation = () => {
    setShowAccreditationForm(true);
    setEducationLevel('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Student Portal</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Graduates:</span>
            <span className={styles.statValue}>
              {isLoadingGraduates ? 'Loading...' : totalGraduates.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {!showAccreditationForm ? (
            <div className={styles.initialView}>
              <h2>Welcome to the Student Portal</h2>
              <p>Access your academic records and apply for verification</p>
              <button 
                onClick={handleApplyForAccreditation}
                className={styles.applyButton}
              >
                Apply for Verification
              </button>
            </div>
          ) : (
            <div className={styles.accreditationForm}>
              <h2>Verification Application</h2>
              
              {!educationLevel ? (
                <div className={styles.educationLevelSelection}>
                  <h3>Select Your Education Level</h3>
                  <div className={styles.levelOptions}>
                    <button
                      onClick={() => setEducationLevel('secondary')}
                      className={styles.levelButton}
                    >
                      Secondary (MSCE)
                    </button>
                    <button
                      onClick={() => setEducationLevel('tertiary')}
                      className={styles.levelButton}
                    >
                      Tertiary Education
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.formContainer}>
                  <h3>Verification Form</h3>
                  <form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Registration Number:</label>
                      <input
                        type="text"
                        placeholder="Enter your registration number"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Year of Graduation:</label>
                      <input
                        type="text"
                        placeholder="e.g., 2023"
                      />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                      Submit Verification Request
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;
