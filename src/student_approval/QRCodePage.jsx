// src/student_approval/QRCodePage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import QRCode from "qrcode";

import StudentStepper from "./StudentStepper";
import { getCertHistory } from "./certHistory";
import {
  useManebContract,
  useAccreditationManagement,
  useConnectionStatus,
} from "../hooks/useSmartContract";
import styles from "./Student.module.css";

export default function QRCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const stateBundle = location.state;
  const cached = !stateBundle
    ? getCertHistory().find((c) => c.id === id)
    : null;

  const studentDetails = stateBundle?.studentDetails || cached?.studentDetails;
  const educationLevel = stateBundle?.educationLevel || cached?.educationLevel;

  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { isConnected } = useConnectionStatus();
  const { getFormHashByExamAndYear } = useManebContract();
  const { getQRCodeByRegNumberAndAward, addQR } = useAccreditationManagement();

  useEffect(() => {
    if (studentDetails && educationLevel) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setError("");
    setLoading(true);
    try {
      if (!isConnected) throw new Error("Please connect your wallet first.");

      let hash = "";
      if (educationLevel === "secondary") {
        const res = await getFormHashByExamAndYear(
          studentDetails.examinationNumber,
          studentDetails.yearOfExamination,
        );
        hash = typeof res === "string" ? res : res?.hashValue;
      } else {
        const res = await getQRCodeByRegNumberAndAward(
          studentDetails.registrationNumber,
          studentDetails.award,
        );
        hash = res?.found ? res.qrCodeValue : "";
      }

      if (!hash || hash.length < 10)
        throw new Error("No valid hash returned from blockchain.");
      if (!hash.startsWith("0x") && /^[a-fA-F0-9]{64}$/.test(hash))
        hash = "0x" + hash;

      const url = await QRCode.toDataURL(hash, {
        width: 320,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrUrl(url);

      try {
        if (educationLevel === "tertiary") await addQR(hash);
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      setError(err.message || "Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!qrUrl || !studentDetails) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${studentDetails.studentName}_${educationLevel}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!studentDetails || !educationLevel) {
    return (
      <>
        <StudentStepper current="qrcode" />
        <div className={styles.card}>
          <div className={styles.heroHead}>
            <AlertCircle size={26} className={styles.accentIcon} />
            <div>
              <h2 className={styles.cardTitle}>Certificate not found</h2>
              <p className={styles.cardSub}>
                This certificate may have been removed from this device.
              </p>
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              className={styles.btnGhost}
              onClick={() => navigate("/student/qrcode")}
            >
              <ArrowLeft size={14} /> Back to list
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/student/lookup")}
            >
              Verify a new certificate
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StudentStepper current="qrcode" />

      <div className={styles.card}>
        <button
          className={styles.backLink}
          onClick={() => navigate("/student/qrcode")}
        >
          <ArrowLeft size={14} /> All QR codes
        </button>

        <div className={styles.heroHead}>
          <div>
            <h2 className={styles.cardTitle}>{studentDetails.studentName}</h2>
            <p className={styles.cardSub}>
              {educationLevel === "secondary"
                ? `${studentDetails.schoolName} · ${studentDetails.yearOfExamination}`
                : `${studentDetails.institutionName} · ${studentDetails.award}`}
            </p>
          </div>
        </div>

        {!isConnected && (
          <div className={`${styles.alert} ${styles.alertWarning}`}>
            <AlertCircle size={16} /> Connect your wallet to generate a QR code.
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.alertDanger}`}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <RefreshCw size={28} className={styles.spin} />
            <p>Generating from blockchain data…</p>
          </div>
        )}

        {!loading && qrUrl && (
          <>
            <div className={styles.qrWrap}>
              <img
                src={qrUrl}
                alt="Verification QR code"
                className={styles.qrImage}
              />
            </div>
            <div className={styles.formActions}>
              <button className={styles.btnGhost} onClick={generate}>
                <RefreshCw size={14} /> Regenerate
              </button>
              <button className={styles.btnPrimary} onClick={download}>
                <Download size={14} /> Download
              </button>
            </div>
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              <span>
                This QR code contains your verified {educationLevel} credential.
              </span>
            </div>
          </>
        )}

        {!loading && !qrUrl && !error && (
          <div className={styles.formActions}>
            <button className={styles.btnPrimary} onClick={generate}>
              <RefreshCw size={14} /> Generate
            </button>
          </div>
        )}
      </div>
    </>
  );
}
