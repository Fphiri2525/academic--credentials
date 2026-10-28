import React, { useState } from 'react';
import { emailService } from '../services/emailService';

const EmailTest = () => {
  const [testData, setTestData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    role: 'Student',
    institution: 'Test University',
    password: 'testpassword123'
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testEmailConnection = async () => {
    setLoading(true);
    setStatus('Testing email connection...');
    
    try {
      const result = await emailService.testConnection();
      if (result) {
        setStatus('✅ Email connection successful!');
      } else {
        setStatus('❌ Email connection failed');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    setLoading(true);
    setStatus('Sending test welcome email...');
    
    try {
      await emailService.sendWelcomeEmail(testData);
      setStatus('✅ Test welcome email sent successfully!');
    } catch (error) {
      setStatus(`❌ Error sending email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConfigStatus = async () => {
    setLoading(true);
    setStatus('Checking email configuration...');
    
    try {
      const config = await emailService.getConfigStatus();
      if (config.isConfigured) {
        setStatus('✅ Email service is properly configured');
      } else {
        setStatus('❌ Email service is not configured properly');
      }
    } catch (error) {
      setStatus(`❌ Error checking config: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Email Service Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Data</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={testData.name}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={testData.email}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={testData.role}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            name="institution"
            placeholder="Institution"
            value={testData.institution}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            name="password"
            placeholder="Password"
            value={testData.password}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={checkConfigStatus}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Config
        </button>
        
        <button
          onClick={testEmailConnection}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Connection
        </button>
        
        <button
          onClick={testWelcomeEmail}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Send Test Email
        </button>
      </div>

      {status && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>First, check if the backend server is running on port 5000</li>
          <li>Click "Check Config" to verify email settings</li>
          <li>Click "Test Connection" to verify email service</li>
          <li>Update the test data with a real email address</li>
          <li>Click "Send Test Email" to send a welcome email</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTest; 