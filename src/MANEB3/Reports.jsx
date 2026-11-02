import { useEffect, useState } from 'react';
import {
  FileText, Download, Printer, Filter, Users, School, CheckCircle2, RefreshCw,
} from 'lucide-react';
import styles from './Reports.module.css';
import { useUserManagement } from '../hooks/useSmartContract';

const REPORT_TYPES = [
  { id: 'student-examination', label: 'Student Examination', icon: Users },
  { id: 'school-performance',  label: 'School Performance',  icon: School },
  { id: 'verification-status', label: 'Verification Status', icon: CheckCircle2 },
  { id: 'district-summary',    label: 'District Summary',    icon: Filter },
];

const REPORT_TITLES = {
  'student-examination': 'Student Examination Report',
  'school-performance':  'School Performance Report',
  'verification-status': 'Verification Status Report',
  'district-summary':    'District Summary Report',
};

export default function ReportsPage() {
  const [active, setActive] = useState('student-examination');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState(null);
  const [formFourData, setFormFourData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  const [filters, setFilters] = useState({
    year: 'all', district: '', school: '', status: 'all',
  });

  const {
    getAllFormFourDetails,
    getAllSecondarySchools,
    getAllVerificationRequests,
  } = useUserManagement();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [students, schools, verifications] = await Promise.all([
        getAllFormFourDetails(),
        getAllSecondarySchools(),
        getAllVerificationRequests(),
      ]);
      setFormFourData(students || []);
      setSchoolData(schools || []);
      setVerificationData(verifications || []);
    } catch (err) {
      console.error('Failed to fetch MANEB data:', err);
    }
  };

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const generate = async (e) => {
    e?.preventDefault();
    setGenerating(true);
    try {
      const generators = {
        'student-examination': generateStudentExamination,
        'school-performance':  generateSchoolPerformance,
        'verification-status': generateVerificationStatus,
        'district-summary':    generateDistrictSummary,
      };
      setContent(generators[active]?.() ?? null);
    } catch (err) {
      setContent(
        <div className={styles.errorBlock}>
          <h4>Failed to generate report</h4>
          <p>{err.message}</p>
        </div>
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ---------- Report builders ---------- */

  const generateStudentExamination = () => {
    let rows = [...formFourData];
    if (filters.year !== 'all') {
      rows = rows.filter((s) => s.yearOfExamination === parseInt(filters.year));
    }
    if (filters.district) {
      rows = rows.filter((s) =>
        (s.district || '').toLowerCase().includes(filters.district.toLowerCase())
      );
    }

    return (
      <ReportShell
        title="MANEB Student Examination Report"
        meta={[
          ['Total records', rows.length],
          ['Year', filters.year === 'all' ? 'All years' : filters.year],
          ['District', filters.district || 'All districts'],
        ]}
      >
        <Table
          headers={['#', 'Student', 'Exam No.', 'School', 'District', 'Year']}
          rows={rows.map((s, i) => [
            i + 1,
            s.studentName,
            s.examinationNumber,
            s.schoolName,
            s.district || '—',
            s.yearOfExamination,
          ])}
        />
        <Summary
          items={[
            ['Total students', rows.length],
            ['Unique schools', new Set(rows.map((s) => s.schoolName)).size],
            ['Unique districts', new Set(rows.map((s) => s.district)).size],
          ]}
        />
      </ReportShell>
    );
  };

  const generateSchoolPerformance = () => {
    const rows = schoolData
      .map((s) => {
        const students = formFourData.filter((f) => f.schoolName === s.schoolName);
        return {
          schoolName: s.schoolName,
          schoolCode: s.schoolCode,
          district: s.district,
          category: s.category,
          totalStudents: students.length,
        };
      })
      .filter((s) => s.totalStudents > 0)
      .sort((a, b) => b.totalStudents - a.totalStudents);

    return (
      <ReportShell
        title="MANEB School Performance Report"
        meta={[['Total schools', rows.length]]}
      >
        <Table
          headers={['#', 'School', 'Code', 'District', 'Category', 'Students']}
          rows={rows.map((s, i) => [
            i + 1,
            s.schoolName,
            s.schoolCode,
            s.district,
            <span className={styles.chip} key={i}>{s.category}</span>,
            s.totalStudents,
          ])}
        />
        <Summary
          items={[
            ['Total schools', rows.length],
            ['Public', rows.filter((s) => s.category === 'Public').length],
            ['Private', rows.filter((s) => s.category === 'Private').length],
          ]}
        />
      </ReportShell>
    );
  };

  const generateVerificationStatus = () => {
    let rows = [...verificationData];
    if (filters.status !== 'all') {
      rows = rows.filter((r) =>
        filters.status === 'approved' ? r.dateOfApproval > 0 : r.dateOfApproval <= 0
      );
    }

    return (
      <ReportShell
        title="MANEB Verification Status Report"
        meta={[['Total requests', rows.length]]}
      >
        <Table
          headers={['#', 'Student', 'Exam No.', 'School', 'Year', 'Verified', 'Status']}
          rows={rows.map((r, i) => [
            i + 1,
            r.studentName,
            r.examinationNumber,
            r.schoolName,
            r.yearOfExamination,
            r.dateOfApproval > 0
              ? new Date(r.dateOfApproval * 1000).toLocaleDateString()
              : '—',
            <span
              key={i}
              className={`${styles.chip} ${r.dateOfApproval > 0 ? styles.chipSuccess : styles.chipWarning}`}
            >
              {r.dateOfApproval > 0 ? 'Approved' : 'Pending'}
            </span>,
          ])}
        />
        <Summary
          items={[
            ['Total', rows.length],
            ['Approved', rows.filter((r) => r.dateOfApproval > 0).length],
            ['Pending', rows.filter((r) => r.dateOfApproval <= 0).length],
          ]}
        />
      </ReportShell>
    );
  };

  const generateDistrictSummary = () => {
    const acc = formFourData.reduce((map, s) => {
      const key = s.district || 'Unknown';
      if (!map[key]) map[key] = { district: key, students: 0, schools: new Set(), years: new Set() };
      map[key].students += 1;
      map[key].schools.add(s.schoolName);
      map[key].years.add(s.yearOfExamination);
      return map;
    }, {});

    const rows = Object.values(acc).sort((a, b) => b.students - a.students);

    return (
      <ReportShell
        title="MANEB District Summary Report"
        meta={[['Total districts', rows.length]]}
      >
        <Table
          headers={['#', 'District', 'Students', 'Schools', 'Years', 'Avg / school']}
          rows={rows.map((d, i) => [
            i + 1,
            d.district,
            d.students,
            d.schools.size,
            Array.from(d.years).join(', '),
            Math.round(d.students / Math.max(1, d.schools.size)),
          ])}
        />
        <Summary
          items={[
            ['Districts', rows.length],
            ['Total students', rows.reduce((n, d) => n + d.students, 0)],
            ['Total schools', new Set(formFourData.map((s) => s.schoolName)).size],
          ]}
        />
      </ReportShell>
    );
  };

  /* ---------- Layout ---------- */

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>
            <FileText size={20} /> MANEB Reporting
          </h1>
          <p className={styles.subtitle}>
            Generate reports for examinations, school performance, and verification.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Report type sidebar */}
        <nav className={styles.typeNav}>
          <h3 className={styles.typeNavTitle}>Report types</h3>
          {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.typeItem} ${active === id ? styles.typeActive : ''}`}
              onClick={() => { setActive(id); setContent(null); }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* Main panel */}
        <div className={styles.panel}>
          {/* Config */}
          <form className={styles.config} onSubmit={generate}>
            <h2 className={styles.configTitle}>{REPORT_TITLES[active]}</h2>

            <div className={styles.filterGrid}>
              {active === 'student-examination' && (
                <>
                  <Field label="Examination year">
                    <select
                      className={styles.input}
                      value={filters.year}
                      onChange={(e) => setFilter('year', e.target.value)}
                    >
                      <option value="all">All years</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                    </select>
                  </Field>
                  <Field label="District">
                    <input
                      className={styles.input}
                      value={filters.district}
                      onChange={(e) => setFilter('district', e.target.value)}
                      placeholder="Filter by district…"
                    />
                  </Field>
                </>
              )}

              {active === 'verification-status' && (
                <Field label="Verification status">
                  <select
                    className={styles.input}
                    value={filters.status}
                    onChange={(e) => setFilter('status', e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="approved">Approved only</option>
                    <option value="pending">Pending only</option>
                  </select>
                </Field>
              )}
            </div>

            <div className={styles.formActions}>
              <button className={styles.btnGhost} type="button" onClick={fetchData}>
                <RefreshCw size={14} /> Refresh data
              </button>
              <button className={styles.btnPrimary} type="submit" disabled={generating}>
                {generating ? 'Generating…' : 'Generate report'}
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div className={styles.previewActions}>
                <button
                  className={styles.btnGhost}
                  onClick={() => alert('Export PDF — hook up your PDF lib here')}
                  disabled={!content}
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => alert('Export CSV — hook up your CSV lib here')}
                  disabled={!content}
                >
                  <Download size={14} /> CSV
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => window.print()}
                  disabled={!content}
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div className={styles.previewBody}>
              {generating ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Generating report…</p>
                </div>
              ) : content ? (
                content
              ) : (
                <div className={styles.emptyState}>
                  <FileText size={32} />
                  <h4>No report yet</h4>
                  <p>Choose filters above and click Generate report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared sub-components ---------- */

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function ReportShell({ title, meta = [], children }) {
  return (
    <div className={styles.reportShell}>
      <div className={styles.reportHeader}>
        <h3 className={styles.reportTitle}>{title}</h3>
        <div className={styles.reportMeta}>
          <span>Generated {new Date().toLocaleDateString()}</span>
          {meta.map(([k, v]) => (
            <span key={k}>{k}: <strong>{v}</strong></span>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className={styles.noRows}>No data matches the selected filters.</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Summary({ items }) {
  return (
    <div className={styles.summary}>
      {items.map(([label, value]) => (
        <div key={label} className={styles.summaryItem}>
          <div className={styles.summaryLabel}>{label}</div>
          <div className={styles.summaryValue}>{value}</div>
        </div>
      ))}
    </div>
  );
}