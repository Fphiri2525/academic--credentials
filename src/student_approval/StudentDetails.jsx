// src/student_approval/StudentDetails.jsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  User,
  Hash,
  School,
  Calendar,
  AlertCircle,
} from "lucide-react";
import StudentStepper from "./StudentStepper";
import { saveCert } from "./certHistory";
import styles from "./Student.module.css";

export default function StudentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentDetails, educationLevel } = location.state || {};

  if (!studentDetails || !educationLevel) {
    return (
      <>
        <StudentStepper current="details" />
        <div className={styles.card}>
          <div className={styles.heroHead}>
            <AlertCircle size={26} className={styles.accentIcon} />
            <div>
              <h2 className={styles.cardTitle}>No certificate to review yet</h2>
              <p className={styles.cardSub}>
                Verify your details first to generate a QR code.
              </p>
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/student/lookup")}
            >
              Start verification
            </button>
          </div>
        </div>
      </>
    );
  }

  const isSecondary = educationLevel === "secondary";
  const fields = isSecondary
    ? [
        {
          icon: User,
          label: "Student name",
          value: studentDetails.studentName,
        },
        {
          icon: Hash,
          label: "Examination number",
          value: studentDetails.examinationNumber,
        },
        { icon: School, label: "School", value: studentDetails.schoolName },
        {
          icon: Calendar,
          label: "Exam year",
          value: studentDetails.yearOfExamination,
        },
      ]
    : [
        {
          icon: User,
          label: "Student name",
          value: studentDetails.studentName,
        },
        {
          icon: Hash,
          label: "Registration",
          value: studentDetails.registrationNumber,
        },
        {
          icon: School,
          label: "Institution",
          value: studentDetails.institutionName,
        },
        {
          icon: School,
          label: "Program",
          value: studentDetails.programOfStudy,
        },
        { icon: CheckCircle2, label: "Award", value: studentDetails.award },
        {
          icon: Calendar,
          label: "Graduated",
          value: studentDetails.yearOfGraduation,
        },
      ];

  const handleConfirm = () => {
    const id = saveCert(studentDetails, educationLevel);
    navigate(`/student/qrcode/${id}`, {
      state: { studentDetails, educationLevel },
    });
  };

  return (
    <>
      <StudentStepper current="details" />

      <div className={styles.card}>
        <div className={styles.heroHead}>
          <CheckCircle2 size={26} className={styles.successIcon} />
          <div>
            <h2 className={styles.cardTitle}>Review your details</h2>
            <p className={styles.cardSub}>
              These are the details we found on-chain. Confirm to generate your
              QR code.
            </p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className={styles.detailRow}>
              <Icon size={16} className={styles.detailIcon} />
              <div>
                <div className={styles.detailLabel}>{label}</div>
                <div className={styles.detailValue}>{value || "—"}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.btnGhost}
            onClick={() => navigate("/student/lookup")}
          >
            Back
          </button>
          <button className={styles.btnPrimary} onClick={handleConfirm}>
            <CheckCircle2 size={16} /> Confirm &amp; generate QR code
          </button>
        </div>
      </div>
    </>
  );
}
