// src/student_approval/QRCodeHistory.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Plus,
  Trash2,
  Calendar,
  GraduationCap,
  Award,
  ChevronRight,
} from "lucide-react";
import StudentStepper from "./StudentStepper";
import { getCertHistory, removeCert } from "./certHistory";
import styles from "./Student.module.css";

export default function QRCodeHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getCertHistory());

  const handleDelete = (id) => {
    removeCert(id);
    setItems(getCertHistory());
  };

  const openCert = (item) => {
    navigate(`/student/qrcode/${item.id}`, {
      state: {
        studentDetails: item.studentDetails,
        educationLevel: item.educationLevel,
      },
    });
  };

  return (
    <>
      <StudentStepper current="qrcode" />

      <div className={styles.card}>
        <div className={styles.heroHead}>
          <QrCode size={26} className={styles.accentIcon} />
          <div>
            <h2 className={styles.cardTitle}>My QR codes</h2>
            <p className={styles.cardSub}>
              Certificates you've generated on this device. Click one to view or
              re-download.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <QrCode size={40} className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>No certificates yet</div>
            <div className={styles.emptyText}>
              Verify your academic record to generate your first QR code.
            </div>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/student/lookup")}
            >
              <Plus size={16} /> Get my first certificate
            </button>
          </div>
        ) : (
          <div className={styles.certList}>
            {items.map((item) => {
              const isSecondary = item.educationLevel === "secondary";
              const Icon = isSecondary ? Award : GraduationCap;
              const subtitle = isSecondary
                ? `${item.studentDetails.schoolName || "School"} · ${item.studentDetails.yearOfExamination || ""}`
                : `${item.studentDetails.institutionName || "Institution"} · ${item.studentDetails.award || ""}`;
              return (
                <div key={item.id} className={styles.certRow}>
                  <button
                    className={styles.certRowMain}
                    onClick={() => openCert(item)}
                  >
                    <div className={styles.certIconWrap}>
                      <Icon size={20} />
                    </div>
                    <div className={styles.certMeta}>
                      <div className={styles.certName}>
                        {item.studentDetails.studentName}
                      </div>
                      <div className={styles.certSub}>{subtitle}</div>
                      <div className={styles.certDate}>
                        <Calendar size={12} />{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight size={18} className={styles.certChevron} />
                  </button>
                  <button
                    className={styles.certDelete}
                    onClick={() => handleDelete(item.id)}
                    title="Remove from list"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.formActions}>
            <button
              className={styles.btnGhost}
              onClick={() => navigate("/student/lookup")}
            >
              <Plus size={14} /> Add another certificate
            </button>
          </div>
        )}
      </div>
    </>
  );
}
