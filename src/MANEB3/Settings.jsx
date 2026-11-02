import React, { useState, useEffect } from 'react';
import {
  User, Mail, Building, Phone, Save, Lock,
  AlertCircle, CheckCircle2, Info, RefreshCw,
} from 'lucide-react';
import { useTheme } from './maneb';
import { useUserManagement, useConnectionStatus } from '../hooks/useSmartContract';
import styles from './settings.module.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    role: 'maneb',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({
    type: '',
    text: '',
  });

  const {
    getUserDetailsGivenEmail,
    updateUserEmailAndName,
    updateUserPassword,
    changeUserPasswordByEmail,
    loading,
    error,
  } = useUserManagement();

  const { isConnected } = useConnectionStatus();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.email) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        contactInfo: userData.contactInfo || '',
        role: userData.role || 'maneb',
      });
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim() || !profileData.email.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    if (!isConnected) {
      setMessage({
        type: 'error',
        text: 'Please connect your wallet to update profile',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const currentUserData = JSON.parse(
        localStorage.getItem('userData') || '{}',
      );
      const currentEmail = currentUserData.email;

      if (!currentEmail) {
        setMessage({
          type: 'error',
          text: 'Current user email not found. Please login again.',
        });
        return;
      }

      await updateUserEmailAndName(
        currentEmail,
        profileData.email,
        profileData.name,
      );

      const updatedUserData = {
        ...currentUserData,
        name: profileData.name,
        email: profileData.email,
        contactInfo: profileData.contactInfo,
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: `Failed to update profile: ${error.message || 'Unknown error'}`,
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
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long',
      });
      return;
    }

    if (!isConnected) {
      setPasswordMessage({
        type: 'error',
        text: 'Please connect your wallet to update password',
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const result = await changeUserPasswordByEmail(
        profileData.email,
        passwordData.newPassword,
      );

      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully using blockchain!',
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({
        type: 'error',
        text: `Failed to change password: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

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

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile, security, and system preferences.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`${styles.alert} ${
            message.type === 'error' ? styles.alertDanger : styles.alertSuccess
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {passwordMessage.text && (
        <div
          className={`${styles.alert} ${
            passwordMessage.type === 'error'
              ? styles.alertDanger
              : styles.alertSuccess
          }`}
        >
          {passwordMessage.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{passwordMessage.text}</span>
        </div>
      )}

      {!isConnected && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <Info size={16} />
          <span>
            Please connect your wallet to update profile information.
          </span>
        </div>
      )}

      {/* Profile Information */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Profile Information</h2>
            <p className={styles.cardSub}>
              Basic details associated with your MANEB account.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.input}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Mail size={14} />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={styles.input}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Phone size={14} />
                Contact Information
              </label>
              <input
                type="text"
                value={profileData.contactInfo}
                onChange={(e) =>
                  handleInputChange('contactInfo', e.target.value)
                }
                className={styles.input}
                placeholder="Phone, email, or address"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Building size={14} />
                Role
              </label>
              <input
                type="text"
                value={profileData.role}
                className={`${styles.input} ${styles.readOnly}`}
                readOnly
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={isUpdating || !isConnected}
              className={styles.btnPrimary}
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={14} /> Updating…
                </>
              ) : (
                <>
                  <Save size={14} /> Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Change Password</h2>
            <p className={styles.cardSub}>
              Passwords are stored securely on the blockchain.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Lock size={14} />
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordInputChange('newPassword', e.target.value)
                }
                className={styles.input}
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Lock size={14} />
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordInputChange('confirmPassword', e.target.value)
                }
                className={styles.input}
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={isUpdatingPassword || !isConnected}
              className={styles.btnPrimary}
            >
              {isUpdatingPassword ? (
                <>
                  <RefreshCw size={14} /> Updating…
                </>
              ) : (
                <>
                  <Lock size={14} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>System Preferences</h2>
            <p className={styles.cardSub}>
              Personalize your MANEB portal experience.
            </p>
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleTitle}>Dark Mode</span>
            <span className={styles.toggleHint}>
              Switch to a darker color scheme across the portal.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggle} ${
              darkMode ? styles.toggleOn : ''
            }`}
            onClick={toggleTheme}
            aria-pressed={darkMode}
          >
            <span className={styles.toggleDot} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;