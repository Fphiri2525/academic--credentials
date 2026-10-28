import React, { useState } from 'react';
import { useUserManagement, useConnectionStatus } from '../hooks/useSmartContract';

const UserUpdateTest = () => {
  const [testData, setTestData] = useState({
    currentEmail: '',
    newEmail: '',
    newName: '',
    newPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const { updateUserEmailAndName, updateUserPassword } = useUserManagement();
  const { isConnected } = useConnectionStatus();

  const handleInputChange = (e) => {
    setTestData({
      ...testData,
      [e.target.name]: e.target.value
    });
  };

  const testUpdateEmailAndName = async () => {
    if (!testData.currentEmail || !testData.newEmail || !testData.newName) {
      setResult('Please fill in current email, new email, and new name');
      return;
    }

    setIsLoading(true);
    setResult('Testing user email/name update...');

    try {
      const result = await updateUserEmailAndName(
        testData.currentEmail,
        testData.newEmail,
        testData.newName
      );
      
      setResult(`✅ Success! Transaction hash: ${result.transactionHash}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdatePassword = async () => {
    if (!testData.newEmail || !testData.newPassword) {
      setResult('Please fill in email and new password');
      return;
    }

    setIsLoading(true);
    setResult('Testing user password update...');

    try {
      const result = await updateUserPassword(
        testData.newEmail,
        testData.newPassword
      );
      
      setResult(`✅ Success! Transaction hash: ${result.transactionHash}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>User Update Test Component</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Not Connected'}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Current Email:</label>
        <input
          type="email"
          name="currentEmail"
          value={testData.currentEmail}
          onChange={handleInputChange}
          placeholder="user@example.com"
          style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>New Email:</label>
        <input
          type="email"
          name="newEmail"
          value={testData.newEmail}
          onChange={handleInputChange}
          placeholder="newemail@example.com"
          style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>New Name:</label>
        <input
          type="text"
          name="newName"
          value={testData.newName}
          onChange={handleInputChange}
          placeholder="New User Name"
          style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>New Password:</label>
        <input
          type="password"
          name="newPassword"
          value={testData.newPassword}
          onChange={handleInputChange}
          placeholder="New Password"
          style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={testUpdateEmailAndName}
          disabled={isLoading || !isConnected}
          style={{
            padding: '0.75rem 1rem',
            marginRight: '0.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Update Email & Name'}
        </button>

        <button
          onClick={testUpdatePassword}
          disabled={isLoading || !isConnected}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Update Password'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '1rem',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Make sure your wallet is connected</li>
          <li>Fill in the current email of an existing user</li>
          <li>Fill in the new email and name you want to update to</li>
          <li>Click "Test Update Email & Name" to test the update</li>
          <li>Optionally, test password update with the new email</li>
        </ol>
      </div>
    </div>
  );
};

export default UserUpdateTest;
