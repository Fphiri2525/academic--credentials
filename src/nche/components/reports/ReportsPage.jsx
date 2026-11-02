import { useState } from 'react';
import { AlertTriangle, FileText, BarChart3, Eye } from 'lucide-react';

import ReportCard from './ReportCard';
import ReportDetailsModal from './ReportDetailsModal';
import { useAccreditationManagement, useConnectionStatus, useCertificateManagement, useSmartContract } from '../../../hooks/useSmartContract';
import { generateAndDownloadPDF } from '../../../utilis/PDFGenerator';
import {
  generateAccreditedReport,
  generateGraduateReport,
  generateVerificationReport,
} from './reportsService';
import styles from './ReportsPage.module.css';

const REPORT_CONFIGS = [
  {
    id: 'accredited',
    title: 'Accredited University Report',
    description: 'Comprehensive report of all accredited universities and their programs in Malawi.',
    type: 'accredited',
    icon: FileText,
  },
  {
    id: 'graduate',
    title: 'Graduate Report in Malawi',
    description: 'All graduates from accredited universities, with detailed statistics by university, program, and year.',
    type: 'graduate',
    icon: BarChart3,
  },
  {
    id: 'verification',
    title: 'Verification Report',
    description: 'All certificate verifications through the system, with QR code stats and verification trends.',
    type: 'verification',
    icon: Eye,
  },
];

export default function ReportsPage() {
  const [reportData, setReportData] = useState({});
  const [generating, setGenerating] = useState({});
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState('');

  const { getAllAccreditedUniversities, getProgramsByUniversity, getTotalAccreditedUniversities } = useAccreditationManagement();
  const { getGraduatesByUniversityName, getTotalGraduatesByUniversityName } = useCertificateManagement();
  const { isConnected } = useConnectionStatus();
  const { contract } = useSmartContract();

  const generate = async (id) => {
    if (!isConnected) return setError('Please connect your wallet first.');
    setError('');
    setGenerating((g) => ({ ...g, [id]: true }));
    try {
      const universities = await getAllAccreditedUniversities();
      let data;
      if (id === 'accredited') {
        data = await generateAccreditedReport({ universities, getProgramsByUniversity, getTotalAccreditedUniversities });
      } else if (id === 'graduate') {
        data = await generateGraduateReport({ universities, contract, getGraduatesByUniversityName, getTotalGraduatesByUniversityName });
      } else {
        data = await generateVerificationReport({ contract });
      }
      setReportData((prev) => ({ ...prev, [id]: data }));
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setGenerating((g) => ({ ...g, [id]: false }));
    }
  };

  const download = async (id) => {
    const data = reportData[id];
    if (!data) return;
    try {
      await generateAndDownloadPDF(data);
    } catch {
      setError('Failed to download PDF.');
    }
  };

  return (
    <div className={styles.container}>
      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <AlertTriangle size={18} />
          <span>Please connect your wallet to generate reports.</span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.grid}>
        {REPORT_CONFIGS.map((config) => (
          <ReportCard
            key={config.id}
            title={config.title}
            description={config.description}
            reportType={config.type}
            onGenerate={() => generate(config.id)}
            onView={() => setViewing(config.id)}
            onDownload={() => download(config.id)}
            isGenerating={!!generating[config.id]}
            isGenerated={!!reportData[config.id]}
            generatedAt={reportData[config.id]?.generatedAt}
            totalCount={reportData[config.id]?.totalCount}
            hasChart={(reportData[config.id]?.chartData?.length || 0) > 0}
          />
        ))}
      </div>

      {viewing && reportData[viewing] && (
        <ReportDetailsModal
          data={reportData[viewing]}
          type={viewing}
          onClose={() => setViewing(null)}
          onDownload={() => download(viewing)}
        />
      )}
    </div>
  );
}
