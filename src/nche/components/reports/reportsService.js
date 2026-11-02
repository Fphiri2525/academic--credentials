export async function generateAccreditedReport({ universities, getProgramsByUniversity, getTotalAccreditedUniversities }) {
  const totalCount = await getTotalAccreditedUniversities();

  const withPrograms = await Promise.all(
    universities.map(async (u) => {
      try {
        const programs = await getProgramsByUniversity(u.name);
        return { ...u, programs: programs || [], programCount: programs?.length || 0 };
      } catch {
        return { ...u, programs: [], programCount: 0 };
      }
    })
  );

  return {
    title: 'Accredited Universities in Malawi',
    description: 'A complete overview of all accredited universities and their programs.',
    universities: withPrograms,
    totalCount: totalCount || universities.length,
    generatedAt: new Date().toLocaleString(),
    chartData: withPrograms.map((u) => ({
      name: u.name.length > 20 ? u.name.slice(0, 20) + '...' : u.name,
      value: u.programCount,
    })),
  };
}

export async function generateGraduateReport({ universities, contract, getGraduatesByUniversityName, getTotalGraduatesByUniversityName }) {
  const total = await contract.callContract('certificateManagement', 'getTotalGraduates', []);
  const totalGraduates = parseInt(total) || 0;

  const withGraduates = await Promise.all(
    universities.map(async (u) => {
      try {
        const graduates = (await getGraduatesByUniversityName(u.name)) || [];
        const totalResult = await getTotalGraduatesByUniversityName(u.name);
        return {
          ...u,
          graduates,
          graduateCount: totalResult?.count || 0,
          graduatesByYear: groupBy(graduates, 'yearOfGraduation'),
          graduatesByProgram: groupBy(graduates, 'programOfStudy'),
        };
      } catch {
        return { ...u, graduates: [], graduateCount: 0, graduatesByYear: {}, graduatesByProgram: {} };
      }
    })
  );

  return {
    title: 'Graduate Report in Malawi',
    description: 'All graduates from accredited universities, grouped by university, program, and year.',
    universities: withGraduates,
    totalCount: totalGraduates,
    generatedAt: new Date().toLocaleString(),
    chartData: withGraduates.map((u) => ({
      name: u.name.length > 20 ? u.name.slice(0, 20) + '...' : u.name,
      value: u.graduateCount,
    })),
  };
}

export async function generateVerificationReport({ contract }) {
  const raw = await contract.callContract('certificateManagement', 'getAllVerificationRequests', []);
  const qrTotal = await contract.callContract('certificateManagement', 'getTotalQRCodesGenerated', []);

  const verifications = (Array.isArray(raw) ? raw : []).map((r, i) => ({
    id: i,
    universityName: r.universityName || r[0] || '',
    studentName: r.studentName || r[1] || '',
    programOfStudy: r.programOfStudy || r[2] || '',
    award: r.award || r[3] || '',
    yearOfGraduation: r.yearOfGraduation || r[4] || '',
    registrationNumber: r.registrationNumber || r[5] || '',
    dateVerified: r.dateVerified || r[6] || '',
  }));

  const byUniversity = {};
  verifications.forEach((v) => {
    const key = v.universityName || 'Unknown';
    if (!byUniversity[key]) {
      byUniversity[key] = { name: key, verifications: [], programs: new Set(), awards: new Set() };
    }
    byUniversity[key].verifications.push(v);
    byUniversity[key].programs.add(v.programOfStudy);
    byUniversity[key].awards.add(v.award);
  });

  const universities = Object.values(byUniversity).map((u) => ({
    ...u,
    count: u.verifications.length,
    programs: Array.from(u.programs),
    awards: Array.from(u.awards),
    programCount: u.programs.size,
    awardCount: u.awards.size,
  }));

  return {
    title: 'Verification Report',
    description: 'All certificate verifications made through the system, with QR code statistics.',
    universities,
    totalCount: verifications.length,
    totalQRCodes: parseInt(qrTotal) || 0,
    recentVerifications: verifications.slice(-10).reverse(),
    generatedAt: new Date().toLocaleString(),
    chartData: universities.map((u) => ({
      name: u.name.length > 20 ? u.name.slice(0, 20) + '...' : u.name,
      value: u.count,
    })),
  };
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
