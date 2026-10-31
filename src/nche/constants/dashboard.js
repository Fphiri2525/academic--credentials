export const initialStats = {
  accredited: 24,
  suspended: 2,
  programs: 156,
  graduates: 12450,
  certificates: 11234,
  pendingForeign: 5,
  verificationsToday: 87,
  tamperAlerts: 1,
};

export const certByStatus = [
  { label: 'Valid',     value: 11020, color: 'var(--success)' },
  { label: 'Suspended', value: 148,   color: 'var(--warning)' },
  { label: 'Revoked',   value: 66,    color: 'var(--danger)' },
];

export const certByYear = [
  { year: '2020', value: 1480 },
  { year: '2021', value: 1920 },
  { year: '2022', value: 2310 },
  { year: '2023', value: 2650 },
  { year: '2024', value: 2874 },
];

export const initialUniversities = [
  { id: 1, name: 'University of Malawi',   status: 'ACCREDITED', certs: 4120 },
  { id: 2, name: 'Mzuzu University',       status: 'ACCREDITED', certs: 2310 },
  { id: 3, name: 'LUANAR',                 status: 'ACCREDITED', certs: 1980 },
  { id: 4, name: 'Unaccredited College A', status: 'SUSPENDED',  certs: 148  },
];

export const initialApplications = [
  { id: 'FA-2026-0005', name: 'Chanda Mulenga',   country: 'Zambia',         award: 'BSc Nursing',     status: 'PENDING' },
  { id: 'FA-2026-0004', name: 'Sarah Mkandawire', country: 'United Kingdom', award: 'PhD Economics',   status: 'UNDER_REVIEW' },
  { id: 'FA-2026-0003', name: 'Tendai Moyo',      country: 'Zimbabwe',       award: 'MBA',             status: 'MORE_INFO_NEEDED' },
  { id: 'FA-2026-0002', name: 'Amina Hassan',     country: 'Tanzania',       award: 'BEd Mathematics', status: 'PENDING' },
];

export const recentVerifications = [
  { number: 'C-2026-001245', result: 'VALID',     time: '4 min ago' },
  { number: 'C-2026-000987', result: 'VALID',     time: '11 min ago' },
  { number: 'C-2025-004410', result: 'SUSPENDED', time: '32 min ago' },
  { number: 'C-2026-000312', result: 'TAMPERED',  time: '58 min ago' },
  { number: 'C-2024-002201', result: 'NOT_FOUND', time: '95 min ago' },
];

export const auditLog = [
  { type: 'danger',  msg: 'Suspended Unaccredited College A (accreditation expired)', by: 'NCHE Admin', time: '40 min ago' },
  { type: 'warning', msg: 'Approved foreign certificate FA-2026-0001 (BSc Nursing, Zambia)', by: 'NCHE Admin', time: '95 min ago' },
  { type: 'accent',  msg: 'Accredited Lilongwe University of Agriculture', by: 'NCHE Admin', time: '3 h ago' },
  { type: 'accent',  msg: 'Approved program: Bachelor of Data Science (MUST)', by: 'NCHE Admin', time: '5 h ago' },
  { type: 'success', msg: 'MANEB uploaded MSCE 2026 results (48,210 students)', by: 'MANEB', time: '8 h ago' },
];

export const chipColors = {
  VALID: 'var(--success)',
  ACCREDITED: 'var(--success)',
  APPROVED: 'var(--success)',
  SUSPENDED: 'var(--warning)',
  PENDING: 'var(--warning)',
  UNDER_REVIEW: 'var(--accent)',
  MORE_INFO_NEEDED: 'var(--warning)',
  REVOKED: 'var(--danger)',
  TAMPERED: 'var(--danger)',
  REJECTED: 'var(--danger)',
  NOT_FOUND: 'var(--text-muted)',
};
