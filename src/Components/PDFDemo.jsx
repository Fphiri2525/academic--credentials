import React, { useRef } from 'react';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';

const PDFDemo = () => {
  const chartRef = useRef(null);

  // Sample report data for testing
  const sampleReportData = {
    title: 'Sample Accredited Universities Report',
    description: 'This is a sample report demonstrating the PDF generation functionality with high-quality charts and formatting.',
    universities: [
      {
        name: 'University of Malawi',
        category: 'Public University',
        contactInfo: 'info@unima.ac.mw',
        programCount: 5,
        programs: [
          { name: 'Computer Science' },
          { name: 'Business Administration' },
          { name: 'Engineering' },
          { name: 'Medicine' },
          { name: 'Law' }
        ]
      },
      {
        name: 'Mzuzu University',
        category: 'Public University',
        contactInfo: 'info@mzuni.ac.mw',
        programCount: 3,
        programs: [
          { name: 'Information Technology' },
          { name: 'Education' },
          { name: 'Environmental Science' }
        ]
      },
      {
        name: 'Lilongwe University of Agriculture',
        category: 'Public University',
        contactInfo: 'info@luanar.ac.mw',
        programCount: 4,
        programs: [
          { name: 'Agriculture' },
          { name: 'Natural Resources' },
          { name: 'Development Studies' },
          { name: 'Food Science' }
        ]
      }
    ],
    totalCount: 3,
    generatedAt: new Date().toLocaleString(),
    chartData: [
      { name: 'University of Malawi', programs: 5 },
      { name: 'Mzuzu University', programs: 3 },
      { name: 'Lilongwe Univ. of Agric.', programs: 4 }
    ]
  };

  const handleDownloadPDF = async () => {
    try {
      const chartElement = chartRef.current;
      const success = await generateAndDownloadPDF(sampleReportData, chartElement);
      
      if (success) {
        alert('PDF downloaded successfully!');
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>PDF Generation Demo</h1>
      <p>This demo shows the PDF generation functionality with sample data.</p>
      
      {/* Sample Chart for PDF */}
      <div ref={chartRef} style={{ 
        background: '#ffffff', 
        padding: '2rem', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
          Universities vs Number of Programs
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'space-around',
          height: '300px',
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '6px'
        }}>
          {sampleReportData.chartData.map((item, index) => {
            const maxPrograms = Math.max(...sampleReportData.chartData.map(d => d.programs));
            const height = (item.programs / maxPrograms) * 100;
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '60px',
                  height: `${height}%`,
                  minHeight: '20px',
                  background: `linear-gradient(135deg, ${
                    index === 0 ? '#3b82f6' : 
                    index === 1 ? '#10b981' : '#f59e0b'
                  } 0%, ${
                    index === 0 ? '#1d4ed8' : 
                    index === 1 ? '#059669' : '#d97706'
                  } 100%)`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  {item.programs}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  textAlign: 'center',
                  maxWidth: '80px',
                  lineHeight: '1.2'
                }}>
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          📄 Download Sample PDF Report
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Sample Report Data:</h3>
        <ul>
          <li>Total Universities: {sampleReportData.totalCount}</li>
          <li>Generated: {sampleReportData.generatedAt}</li>
          <li>Includes: University details, programs, and charts</li>
          <li>Format: High-quality PDF with professional formatting</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFDemo;
