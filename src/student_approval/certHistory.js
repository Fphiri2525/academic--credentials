// src/student_approval/certHistory.js
const KEY = 'student_cert_history';

export function getCertHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCert(studentDetails, educationLevel) {
  const list = getCertHistory();
  const identity =
    educationLevel === 'secondary'
      ? `s:${studentDetails.examinationNumber}:${studentDetails.yearOfExamination}`
      : `t:${studentDetails.registrationNumber}:${studentDetails.award}`;

  const existing = list.find((c) => c.identity === identity);
  if (existing) {
    existing.studentDetails = studentDetails;
    existing.educationLevel = educationLevel;
    existing.createdAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(list));
    return existing.id;
  }

  const item = {
    id: `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    identity,
    studentDetails,
    educationLevel,
    createdAt: Date.now(),
  };
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list));
  return item.id;
}

export function removeCert(id) {
  const list = getCertHistory().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}