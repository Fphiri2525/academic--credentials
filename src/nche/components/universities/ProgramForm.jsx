import { useState, useEffect } from 'react';
import styles from './UniversitiesPage.module.css';

export default function ProgramForm({ 
  universities, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  isConnected,
  defaultInstitution 
}) {
  const [form, setForm] = useState({
    institutionName: defaultInstitution || '',
    programName: '',
    programType: '',
    accreditationDate: '',
  });

  useEffect(() => {
    if (defaultInstitution) {
      setForm((p) => ({ ...p, institutionName: defaultInstitution }));
    }
  }, [defaultInstitution]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <select
            name="institutionName"
            value={form.institutionName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="" disabled hidden></option>
            <option value="NCHE">NCHE (National Council for Higher Education)</option>
            <option value="MANEB">MANEB (Malawi National Examinations Board)</option>
            {universities.length > 0 && (
              <option disabled>--- Accredited Universities ---</option>
            )}
            {universities.map((u) => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
          <label>Institution Name *</label>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <input
            type="text"
            name="programName"
            value={form.programName}
            onChange={handleChange}
            placeholder=" "
            required
            disabled={isSubmitting}
          />
          <label>Program Name *</label>
        </div>

        <div className={styles.formGroup}>
          <select
            name="programType"
            value={form.programType}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="" disabled hidden></option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
          </select>
          <label>Program Type *</label>
        </div>

        <div className={styles.formGroup}>
          <input
            type="date"
            name="accreditationDate"
            value={form.accreditationDate}
            onChange={handleChange}
            placeholder=" "
            required
            disabled={isSubmitting}
            style={{ paddingTop: '24px' }} // Keep text aligned for date inputs
          />
          <label>Accreditation Date *</label>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.btnGhost}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? 'Adding...' : 'Add Program'}
        </button>
      </div>
    </form>
  );
}