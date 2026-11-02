// src/student_approval/Student.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, GraduationCap, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';

import StudentStepper from './StudentStepper';
import StudentLookupForm from './StudentLookupForm';
import {
  useAccreditationManagement,
  useManebContract,
  useConnectionStatus,
} from '../hooks/useSmartContract';
import styles from './Student.module.css';

export default function StudentPortal() {
  const navigate = useNavigate();
  const [step, setStep] = useState('intro'); // intro | level | form
  const [educationLevel, setEducationLevel] = useState('');

  const { isConnected } = useConnectionStatus();
  const { getStudentByAwardAndRegNumber } = useAccreditationManagement();
  const { getStudentDetailsByExamAndYear } = useManebContract();

  const goToDetails = (studentDetails, level) => {
    navigate('/student/details', { state: { studentDetails, educationLevel: level } });
  };

  const stepperKey = step === 'intro' ? 'start' : step === 'level' ? 'level' : 'verify';

  return (
    <>
      <StudentStepper current={stepperKey} />
      {step === 'intro' && <IntroCard onStart={() => setStep('level')} />}
      {step === 'level' && (
        <LevelCard
          onPick={(lvl) => { setEducationLevel(lvl); setStep('form'); }}
          onBack={() => setStep('intro')}
        />
      )}
      {step === 'form' && (
        <StudentLookupForm
          educationLevel={educationLevel}
          onBack={() => setStep('level')}
          onVerified={goToDetails}
          isConnected={isConnected}
          getStudentByAwardAndRegNumber={getStudentByAwardAndRegNumber}
          getStudentDetailsByExamAndYear={getStudentDetailsByExamAndYear}
        />
      )}
    </>
  );
}

function IntroCard({ onStart }) {
  return (
    <div className={styles.card}>
      <div className={styles.heroHead}>
        <Award size={28} className={styles.accentIcon} />
        <div>
          <h2 className={styles.cardTitle}>Digital certificate portal</h2>
          <p className={styles.cardSub}>
            Generate a secure, verifiable certificate from your academic record.
          </p>
        </div>
      </div>

      <div className={styles.featureGrid}>
        <Feature icon={ShieldCheck} title="Blockchain verified" text="Every certificate is anchored to an on-chain hash." />
        <Feature icon={Zap} title="Instant" text="Employers can verify your credential in seconds." />
        <Feature icon={BadgeCheck} title="Tamper-proof" text="Once issued, the record cannot be altered." />
      </div>

      <div className={styles.formActions}>
        <button className={styles.btnPrimary} onClick={onStart}>
          <FileText size={16} /> Get my digital certificate
        </button>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className={styles.feature}>
      <Icon size={20} className={styles.featureIcon} />
      <div>
        <div className={styles.featureTitle}>{title}</div>
        <div className={styles.featureText}>{text}</div>
      </div>
    </div>
  );
}

function LevelCard({ onPick, onBack }) {
  return (
    <div className={styles.card}>
      <div className={styles.heroHead}>
        <GraduationCap size={26} className={styles.accentIcon} />
        <div>
          <h2 className={styles.cardTitle}>Select your education level</h2>
          <p className={styles.cardSub}>We'll look up your record based on this.</p>
        </div>
      </div>

      <div className={styles.levelGrid}>
        <button className={styles.levelBtn} onClick={() => onPick('secondary')}>
          <Award size={22} />
          <div>
            <div className={styles.levelTitle}>Secondary (MSCE)</div>
            <div className={styles.levelHint}>Form Four examination results</div>
          </div>
        </button>
        <button className={styles.levelBtn} onClick={() => onPick('tertiary')}>
          <GraduationCap size={22} />
          <div>
            <div className={styles.levelTitle}>Tertiary</div>
            <div className={styles.levelHint}>University degree or diploma</div>
          </div>
        </button>
      </div>

      <div className={styles.formActions}>
        <button className={styles.btnGhost} onClick={onBack}>Back</button>
      </div>
    </div>
  );
}