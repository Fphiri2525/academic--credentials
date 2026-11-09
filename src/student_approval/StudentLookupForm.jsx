
import React, { useRef, useState } from "react";
import {
  FileText,
  User,
  GraduationCap,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

import styles from "./StudentLookup.module.css";

const AWARDS = [
  "Certificate",
  "Diploma",
  "Degree",
  "Masters Degree",
  "PhD"
];

export default function StudentLookupForm({
  onBack,
  onSubmitApplication,
  isConnected
}) {
  const currentYear = new Date().getFullYear();
  const formRef = useRef(null);
  const nationalIdInputRef = useRef(null);
  const certificateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    studentName: "",
    registrationNumber: "",
    institutionName: "",
    programOfStudy: "",
    award: "",
    yearOfGraduation: ""
  });

  const [nationalId, setNationalId] = useState(null);
  const [academicCertificate, setAcademicCertificate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Validate and select uploaded documents
  const handleFileChange = (e, documentType) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG and PNG documents are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setError("File size must not exceed 10 MB.");
      e.target.value = "";
      return;
    }

    setError("");

    if (documentType === "nationalId") {
      setNationalId(file);
    } else {
      setAcademicCertificate(file);
    }
  };

  // Remove uploaded document
  const removeFile = (documentType) => {
    if (documentType === "nationalId") {
      setNationalId(null);

      if (nationalIdInputRef.current) {
        nationalIdInputRef.current.value = "";
      }
    } else {
      setAcademicCertificate(null);

      if (certificateInputRef.current) {
        certificateInputRef.current.value = "";
      }
    }
  };

  // First stage: Validate and display confirmation popup
  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!isConnected) {
      setError(
        "Please connect your wallet before submitting your application."
      );
      return;
    }

    const {
      studentName,
      registrationNumber,
      institutionName,
      programOfStudy,
      award,
      yearOfGraduation
    } = formData;

    if (
      !studentName.trim() ||
      !registrationNumber.trim() ||
      !institutionName.trim() ||
      !programOfStudy.trim() ||
      !award ||
      !yearOfGraduation
    ) {
      setError("Please complete all required student information.");
      return;
    }

    const graduationYear = Number(yearOfGraduation);

    if (
      !/^\d{4}$/.test(yearOfGraduation) ||
      !Number.isInteger(graduationYear) ||
      graduationYear < 1900 ||
      graduationYear > currentYear
    ) {
      setError(
        `Please enter a valid graduation year between 1900 and ${currentYear}.`
      );
      return;
    }

    if (!nationalId) {
      setError("Please upload your National ID.");
      return;
    }

    if (!academicCertificate) {
      setError(
        "Please upload your supporting academic certificate or degree."
      );
      return;
    }

    // Show confirmation popup instead of submitting immediately
    setShowConfirmation(true);
    setSubmissionSuccess(false);
  };

  // Second stage: Submit only after user confirms
  const confirmSubmission = async () => {
    try {
      setLoading(true);
      setError("");

      const graduationYear = Number(formData.yearOfGraduation);

      const dataPayload = new FormData();

      dataPayload.append(
        "student_name",
        formData.studentName.trim()
      );

      dataPayload.append(
        "registration_number",
        formData.registrationNumber.trim()
      );

      dataPayload.append(
        "institution_name",
        formData.institutionName.trim()
      );

      dataPayload.append(
        "program_of_study",
        formData.programOfStudy.trim()
      );

      dataPayload.append("award", formData.award);

      dataPayload.append(
        "year_of_graduation",
        graduationYear
      );

      dataPayload.append(
        "application_type",
        "International Certificate Verification"
      );

      dataPayload.append("education_level", "tertiary");

      dataPayload.append("national_id", nationalId);
      dataPayload.append("certificate", academicCertificate);

      const response = await fetch(
        "http://localhost:5000/api/student-verifications",
        {
          method: "POST",
          body: dataPayload
        }
      );

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response (Status ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          `Server error occurred with status ${response.status}.`
        );
      }

      console.log(
        "[DEBUG] Application submitted successfully:",
        result
      );

      if (typeof onSubmitApplication === "function") {
        onSubmitApplication(result);
      }

      // Reset form after successful submission
      setFormData({
        studentName: "",
        registrationNumber: "",
        institutionName: "",
        programOfStudy: "",
        award: "",
        yearOfGraduation: ""
      });

      setNationalId(null);
      setAcademicCertificate(null);

      if (formRef.current) {
        formRef.current.reset();
      }

      setSubmissionSuccess(true);

    } catch (err) {
      console.error("[DEBUG] Submission error:", err);

      setShowConfirmation(false);

      setError(
        err.message ||
        "Failed to submit your application. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // Close confirmation or success popup
  const closePopup = () => {
    if (loading) return;

    setShowConfirmation(false);
    setSubmissionSuccess(false);
  };

  return (
    <div className={styles.lookupCard}>

      {/* HEADER */}

      <div className={styles.lookupHeader}>
        <div className={styles.lookupIcon}>
          <GraduationCap size={30} />
        </div>

        <h2 className={styles.lookupTitle}>
          International Student Certificate Verification
        </h2>

        <p className={styles.lookupDescription}>
          Complete this application if you obtained your academic
          qualification from an institution outside Malawi.
          Provide accurate information and upload the required
          supporting documents.
        </p>
      </div>

      {/* WALLET WARNING */}

      {!isConnected && (
        <div className={`${styles.lookupAlert} ${styles.lookupWarning}`}>
          <AlertCircle size={18} />
          <span>
            Connect your wallet before submitting your application.
          </span>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className={`${styles.lookupAlert} ${styles.lookupDanger}`}>
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            className={styles.lookupAlertClose}
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.lookupForm}
      >

        {/* STUDENT INFORMATION */}

        <section className={styles.lookupSection}>

          <h3 className={styles.lookupSectionTitle}>
            <User size={19} />
            Student Information
          </h3>

          <Field label="Full Name *" styles={styles}>
            <input
              type="text"
              name="studentName"
              className={styles.lookupInput}
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Registration Number *" styles={styles}>
            <input
              type="text"
              name="registrationNumber"
              className={styles.lookupInput}
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Enter your university registration number"
              required
              disabled={loading}
            />
          </Field>

        </section>

        {/* ACADEMIC INFORMATION */}

        <section className={styles.lookupSection}>

          <h3 className={styles.lookupSectionTitle}>
            <GraduationCap size={19} />
            Academic Information
          </h3>

          <Field label="School / University of Graduation *" styles={styles}>
            <input
              type="text"
              name="institutionName"
              className={styles.lookupInput}
              value={formData.institutionName}
              onChange={handleChange}
              placeholder="Enter your university or college"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Program of Study *" styles={styles}>
            <input
              type="text"
              name="programOfStudy"
              className={styles.lookupInput}
              value={formData.programOfStudy}
              onChange={handleChange}
              placeholder="e.g. Bachelor of Information Technology"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Award Obtained *" styles={styles}>
            <select
              name="award"
              className={styles.lookupInput}
              value={formData.award}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select your qualification</option>

              {AWARDS.map((award) => (
                <option key={award} value={award}>
                  {award}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year of Graduation / Class of *" styles={styles}>
            <input
              type="number"
              name="yearOfGraduation"
              className={styles.lookupInput}
              value={formData.yearOfGraduation}
              onChange={handleChange}
              placeholder={`e.g. ${currentYear}`}
              min="1900"
              max={currentYear}
              step="1"
              required
              disabled={loading}
            />

            <small className={styles.lookupHelper}>
              Enter the year you completed your qualification.
              The graduation year cannot be greater than {currentYear}.
            </small>
          </Field>

        </section>

        {/* DOCUMENT UPLOADS */}

        <section className={styles.lookupSection}>

          <h3 className={styles.lookupSectionTitle}>
            <FileText size={19} />
            Supporting Documents
          </h3>

          <p className={styles.lookupDocumentInstructions}>
            Upload clear and readable copies of the following
            documents. Accepted formats: PDF, JPG and PNG.
            Maximum file size: 10 MB per document.
          </p>

          {/* NATIONAL ID */}

          <div className={styles.lookupUploadGroup}>

            <label className={styles.lookupUploadLabel}>
              National ID *
            </label>

            <div className={styles.lookupUploadBox}>
              <Upload size={24} />

              <p>Upload your National ID</p>

              <small>PDF, JPG or PNG</small>

              <input
                ref={nationalIdInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, "nationalId")}
                disabled={loading}
                required={!nationalId}
              />
            </div>

            {nationalId && (
              <div className={styles.lookupSelectedFile}>
                <FileText size={18} />

                <span>{nationalId.name}</span>

                <button
                  type="button"
                  onClick={() => removeFile("nationalId")}
                  disabled={loading}
                  title="Remove National ID"
                >
                  <X size={17} />
                </button>
              </div>
            )}

          </div>

          {/* ACADEMIC CERTIFICATE */}

          <div className={styles.lookupUploadGroup}>

            <label className={styles.lookupUploadLabel}>
              Supporting Academic Certificate / Degree *
            </label>

            <div className={styles.lookupUploadBox}>
              <Upload size={24} />

              <p>Upload your academic certificate or degree</p>

              <small>PDF, JPG or PNG</small>

              <input
                ref={certificateInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileChange(e, "academicCertificate")
                }
                disabled={loading}
                required={!academicCertificate}
              />
            </div>

            {academicCertificate && (
              <div className={styles.lookupSelectedFile}>
                <FileText size={18} />

                <span>{academicCertificate.name}</span>

                <button
                  type="button"
                  onClick={() => removeFile("academicCertificate")}
                  disabled={loading}
                  title="Remove academic certificate"
                >
                  <X size={17} />
                </button>
              </div>
            )}

          </div>

        </section>

        {/* APPLICATION NOTICE */}

        <div className={styles.lookupNotice}>
          <AlertCircle size={18} />

          <p>
            Ensure that all information is correct and that the
            uploaded documents belong to you. Your application
            will be subject to document review and verification.
          </p>
        </div>

        {/* FORM ACTIONS */}

        <div className={styles.lookupActions}>

          <button
            type="button"
            className={styles.lookupSecondaryButton}
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            className={styles.lookupPrimaryButton}
            disabled={loading || !isConnected}
          >
            <CheckCircle size={17} />
            Submit Application
          </button>

        </div>

      </form>

      {/* CENTERED CONFIRMATION / SUCCESS POPUP */}

      {showConfirmation && (
        <div
          className={styles.lookupModalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePopup();
            }
          }}
        >
          <div
            className={styles.lookupModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lookup-modal-title"
          >

            {!submissionSuccess ? (
              <>
                <div className={styles.lookupModalIcon}>
                  <ShieldCheck size={32} />
                </div>

                <h3
                  id="lookup-modal-title"
                  className={styles.lookupModalTitle}
                >
                  Confirm Application Submission
                </h3>

                <p className={styles.lookupModalDescription}>
                  Are you sure you want to submit your international
                  student certificate verification application?
                </p>

                <div className={styles.lookupModalNotice}>
                  <AlertCircle size={18} />

                  <span>
                    Please ensure that your academic information
                    and uploaded documents are correct before
                    proceeding.
                  </span>
                </div>

                <div className={styles.lookupModalActions}>

                  <button
                    type="button"
                    className={styles.lookupSecondaryButton}
                    onClick={closePopup}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={styles.lookupPrimaryButton}
                    onClick={confirmSubmission}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className={styles.lookupSpinner} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={17} />
                        Yes, Submit Application
                      </>
                    )}
                  </button>

                </div>
              </>
            ) : (
              <>
                <div className={styles.lookupSuccessIcon}>
                  <CheckCircle size={36} />
                </div>

                <h3
                  id="lookup-modal-title"
                  className={styles.lookupModalTitle}
                >
                  Application Submitted!
                </h3>

                <p className={styles.lookupModalDescription}>
                  Your international student certificate verification
                  application has been submitted successfully.
                  Your documents are now awaiting review.
                </p>

                <button
                  type="button"
                  className={styles.lookupPrimaryButton}
                  onClick={closePopup}
                >
                  <CheckCircle size={17} />
                  Done
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

function Field({ label, children, styles }) {
  return (
    <div className={styles.lookupField}>
      <label className={styles.lookupLabel}>
        {label}
      </label>

      {children}
    </div>
  );
}
