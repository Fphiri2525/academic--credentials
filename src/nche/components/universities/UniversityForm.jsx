import { useState } from 'react';
import styles from './UniversitiesPage.module.css';

export default function UniversityForm({ onSubmit, onCancel, isSubmitting, isConnected }) {
  const [form, setForm] = useState({ universityName: '', category: '', contactInfo: '' });

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
        <div className={styles.formGroup}>
          <input
            type="text"
            name="universityName"
            value={form.universityName}
            onChange={handleChange}
            placeholder=" "
            required
            disabled={isSubmitting}
          />
          <label>University Name *</label>
        </div>

        <div className={styles.formGroup}>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="" disabled hidden></option>
            <option value="Public University">Public University</option>
            <option value="Private University">Private University</option>
            <option value="College">College</option>
            <option value="Institute">Institute</option>
          </select>
          <label>Category *</label>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <input
            type="text"
            name="contactInfo"
            value={form.contactInfo}
            onChange={handleChange}
            placeholder=" "
            required
            disabled={isSubmitting}
          />
          <label>Contact Information (Phone, email, or address) *</label>
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
          {isSubmitting ? 'Adding...' : 'Add University'}
        </button>
      </div>
    </form>
  );
}