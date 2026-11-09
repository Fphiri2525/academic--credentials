
import React, { useState } from "react";
import { Search, ArrowLeft, AlertCircle } from "lucide-react";

import styles from "./Student.module.css";

export default function StudentLookupForm({
  onBack,
  onSubmitApplication,
  isConnected
}) {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    registrationNumber: "",
    yearOfAward: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isConnected) {
      setError("Please connect your wallet before continuing.");
      return;
    }

    const { registrationNumber, yearOfAward } = formData;

    if (!registrationNumber.trim() || !yearOfAward) {
      setError("Please enter your registration number and year of award.");
      return;
    }

    const awardYear = Number(yearOfAward);

    if (
      !/^\d{4}$/.test(yearOfAward) ||
      awardYear < 1900 ||
      awardYear > currentYear
    ) {
      setError(
        `Please enter a valid year between 1900 and ${currentYear}.`
      );
      return;
    }

    try {
      setLoading(true);

      const applicationData = {
        registrationNumber: registrationNumber.trim(),
        yearOfAward: awardYear
      };

      if (typeof onSubmitApplication !== "function") {
        throw new Error("Submission handler is not configured.");
      }

      await onSubmitApplication(applicationData);

    } catch (err) {
      console.error("Student lookup error:", err);

      setError(
        err.message || "Unable to process your request. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>

      <div className={styles.applicationHeader}>
        <div className={styles.applicationIcon}>
          <Search size={30} />
        </div>

        <h2 className={styles.cardTitle}>
          Student Certificate Verification
        </h2>

        <p className={styles.applicationDescription}>
          Enter your registration number and year of award
          to proceed with certificate verification.
        </p>
      </div>

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertCircle size={18} />
          <span>
            Please connect your wallet before continuing.
          </span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.applicationSection}>

          <Field label="Registration Number *">
            <input
              type="text"
              name="registrationNumber"
              className={styles.input}
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Enter your registration number"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Year of Award / Class of *">
            <input
              type="number"
              name="yearOfAward"
              className={styles.input}
              value={formData.yearOfAward}
              onChange={handleChange}
              placeholder={`e.g. ${currentYear}`}
              min="1900"
              max={currentYear}
              step="1"
              required
              disabled={loading}
            />

            <small>
              Enter the year you received your qualification.
              Maximum year: {currentYear}.
            </small>
          </Field>

        </div>

        <div className={styles.formActions}>

          <button
            type="button"
            className={styles.btnGhost}
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading || !isConnected}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Search size={17} />
                Verify Student
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
      <label className={styles.label}>
        {label}
      </label>

      {children}
    </div>
  );
}