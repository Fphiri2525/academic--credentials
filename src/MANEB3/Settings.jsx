import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, Save, Lock } from 'lucide-react';
import { useTheme } from './maneb';
import { useUserManagement, useConnectionStatus } from '../hooks/useSmartContract';
import styles from './settings.module.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    role: 'maneb'
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const {
    getUserDetailsGivenEmail,
    updateUserEmailAndName,
    updateUserPassword,
    changeUserPasswordByEmail,
    loading,
    error
  } = useUserManagement();

  const { isConnected } = useConnectionStatus();

  // Load user data from localStorage or fetch from blockchain
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.email) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        contactInfo: userData.contactInfo || '',
        role: userData.role || 'maneb'
      });
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim() || !profileData.email.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect your wallet to update profile' });
      return;
    }

    setIsUpdating(true);
    try {
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const currentEmail = currentUserData.email;

      if (!currentEmail) {
        setMessage({ type: 'error', text: 'Current user email not found. Please login again.' });
        return;
      }

      // Update user email and name using smart contract
      await updateUserEmailAndName(
        currentEmail,           // current email
        profileData.email,      // new email
        profileData.name        // new name
      );

      // Update localStorage with new data
      const updatedUserData = {
        ...currentUserData,
        name: profileData.name,
        email: profileData.email,
        contactInfo: profileData.contactInfo
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: `Failed to update profile: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'New password is required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    if (!isConnected) {
      setPasswordMessage({ type: 'error', text: 'Please connect your wallet to update password' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      console.log('🔐 Starting password change process for email:', profileData.email);
      
      // Use the changeUserPasswordByEmail blockchain function
      const result = await changeUserPasswordByEmail(
        profileData.email,
        passwordData.newPassword
      );

      console.log('✅ Password changed successfully:', result);
      setPasswordMessage({ 
        type: 'success', 
        text: 'Password updated successfully using blockchain!' 
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error('❌ Error changing password:', error);
      setPasswordMessage({
        type: 'error',
        text: `Failed to change password: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (passwordMessage.text) {
      const timer = setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  return (
    <div className={`${styles.contentCard} ${darkMode ? styles.darkTheme : styles.lightTheme}`}>
      <h2 className={styles.pageTitle}>User Profile Settings</h2>

      {/* Message Display */}
      {message.text && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
          {message.text}
        </div>
      )}

      {/* Password Message Display */}
      {passwordMessage.text && (
        <div className={`${styles.message} ${passwordMessage.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
          {passwordMessage.text}
        </div>
      )}

      <div className={styles.settingsContent}>
        {/* Profile Information Section */}
        <div className={styles.settingsSection}>
          <h3>Profile Information</h3>
          <form onSubmit={handleUpdateProfile} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label>
                <User size={16} style={{ marginRight: '8px' }} />
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.formInput}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Mail size={16} style={{ marginRight: '8px' }} />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={styles.formInput}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Phone size={16} style={{ marginRight: '8px' }} />
                Contact Information
              </label>
              <input
                type="text"
                value={profileData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                className={styles.formInput}
                placeholder="Enter your contact information"
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Building size={16} style={{ marginRight: '8px' }} />
                Role
              </label>
              <input
                type="text"
                value={profileData.role}
                className={`${styles.formInput} ${styles.readOnly}`}
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isUpdating || !isConnected}
                className={styles.btnPrimary}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className={styles.settingsSection}>
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label>
                <Lock size={16} style={{ marginRight: '8px' }} />
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                className={styles.formInput}
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Lock size={16} style={{ marginRight: '8px' }} />
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                className={styles.formInput}
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isUpdatingPassword || !isConnected}
                className={styles.btnPrimary}
              >
                <Lock size={16} style={{ marginRight: '8px' }} />
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* System Preferences Section */}
        <div className={styles.settingsSection}>
          <h3>System Preferences</h3>
          <div className={styles.settingsOptions}>
            <div className={styles.settingsOption}>
              <span>Dark Mode</span>
              <div className={styles.toggle}>
                <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
                <span className={styles.toggleSlider}></span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className={styles.settingsSection}>
            <div className={styles.warningMessage}>
              ⚠️ Please connect your wallet to update profile information
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
