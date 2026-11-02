// src/student_approval/StudentStepper.jsx
import { Check } from 'lucide-react';
import styles from './Student.module.css';

const STEPS = [
  { key: 'start',   label: 'Start' },
  { key: 'level',   label: 'Level' },
  { key: 'verify',  label: 'Verify' },
  { key: 'details', label: 'Details' },
  { key: 'qrcode',  label: 'QR code' },
];

export default function StudentStepper({ current }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className={styles.stepper}>
      {STEPS.map((step, i) => {
        const state = i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'todo';
        return (
          <li key={step.key} className={`${styles.step} ${styles['step_' + state]}`}>
            <div className={styles.stepDot}>
              {state === 'done' ? <Check size={12} /> : i + 1}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
            {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          </li>
        );
      })}
    </ol>
  );
}