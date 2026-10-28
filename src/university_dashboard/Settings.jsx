import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, Save, RefreshCw, Lock } from 'lucide-react';
import styles from './settings.module.css';
import { useUserManagement, useAccreditationManagement, useConnectionStatus } from '../hooks/useSmartContract';

const Settings = ({ userDetails, darkMode }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    institution: '',
    contactInfo: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // State for universities dropdown
  const [universities, setUniversities] = useState([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);

  const {
    getUserDetailsGivenEmail,
    updateUserEmailAndName,
    updateUserPassword,
    changeUserPasswordByEmail,
    loading,
    error
  } = useUserManagement();

  const {
    getAllAccreditedUniversities,
    loading: accreditationLoading,
    error: accreditationError
  } = useAccreditationManagement();

  const { isConnected } = useConnectionStatus();

  // Fetch universities for dropdown
  const fetchUniversities = async () => {
    try {
      setIsLoadingUniversities(true);
      console.log('Fetching universities from blockchain...');

      if (!isConnected) {
        console.warn('Not connected to blockchain');
        setUniversities([]);
        return;
      }

      const universitiesData = await getAllAccreditedUniversities();
      console.log('Universities fetched:', universitiesData);

      if (universitiesData && Array.isArray(universitiesData)) {
        setUniversities(universitiesData);
      } else {
        setUniversities([]);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
    } finally {
      setIsLoadingUniversities(false);
    }
  };

  useEffect(() => {
    if (userDetails) {
      setProfileData({
        name: userDetails.name || '',
        email: userDetails.email || '',
        institution: userDetails.institution || '',
        contactInfo: userDetails.contactInfo || '',
        role: userDetails.role || ''
      });
    }
  }, [userDetails]);

  useEffect(() => {
    if (isConnected) {
      fetchUniversities();
    }
  }, [isConnected]);

  const fetchUserProfile = async () => {
    if (!profileData.email) return;
    
    setIsLoading(true);
    try {
      const userData = await getUserDetailsGivenEmail(profileData.email);
      if (userData) {
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          institution: userData.institution || '',
          contactInfo: userData.contactInfo || '',
          role: userData.role || ''
        });
        setMessage({ type: 'success', text: 'Profile data refreshed successfully!' });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage({ type: 'error', text: 'Failed to fetch profile data' });
    } finally {
      setIsLoading(false);
    }
  };

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

    // Check if user details are available to get current email
    if (!userDetails || !userDetails.email) {
      setMessage({ type: 'error', text: 'Current user email not available. Please refresh the page.' });
      return;
    }

    setIsUpdating(true);
    try {
      // Update user email and name using smart contract
      await updateUserEmailAndName(
        userDetails.email,  // current email
        profileData.email,  // new email
        profileData.name    // new name
      );

      setMessage({
        type: 'success',
        text: 'Profile updated successfully! Note: Institution and contact info updates require admin privileges.'
      });

      // Refresh user profile data after successful update
      setTimeout(() => {
        fetchUserProfile();
      }, 2000);

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
      setPasswordMessage({ type: 'error', text: 'Please connect your wallet to change password' });
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
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <div className={`${styles.header} ${darkMode ? styles.darkHeader : ''}`}>
        <h1 className={`${styles.title} ${darkMode ? styles.darkText : ''}`}>User Profile Management</h1>
        <p className={`${styles.subtitle} ${darkMode ? styles.darkText : ''}`}>
          Manage your account information and preferences
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]} ${darkMode ? styles.darkMessage : ''}`}>
          {message.text}
        </div>
      )}

      {/* Password Message Display */}
      {passwordMessage.text && (
        <div className={`${styles.message} ${styles[passwordMessage.type]} ${darkMode ? styles.darkMessage : ''}`}>
          {passwordMessage.text}
        </div>
      )}

      <div className={`${styles.content} ${darkMode ? styles.darkContent : ''}`}>
        {/* Profile Form */}
        <div className={`${styles.profileCard} ${darkMode ? styles.darkProfileCard : ''}`}>
          <div className={`${styles.cardHeader} ${darkMode ? styles.darkCardHeader : ''}`}>
            <h2 className={`${styles.cardTitle} ${darkMode ? styles.darkText : ''}`}>Profile Information</h2>
            <button
              onClick={fetchUserProfile}
              disabled={isLoading || !profileData.email}
              className={`${styles.refreshButton} ${darkMode ? styles.darkRefreshButton : ''}`}
            >
              <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
            <div className={styles.formGrid}>
              {/* Name Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <User size={16} className={styles.labelIcon} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <Mail size={16} className={styles.labelIcon} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Institution Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <Building size={16} className={styles.labelIcon} />
                  Institution
                </label>
                <select
                  value={profileData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  disabled={isLoadingUniversities}
                >
                  <option value="">
                    {isLoadingUniversities ? 'Loading institutions...' : 'Select Institution'}
                  </option>
                  {/* Default Institutions */}
                  <option value="NCHE">NCHE (National Council for Higher Education)</option>
                  <option value="MANEB">MANEB (Malawi National Examinations Board)</option>
                  {/* Separator */}
                  {universities.length > 0 && (
                    <option disabled>--- Accredited Universities ---</option>
                  )}
                  {/* Accredited Universities */}
                  {universities.map((university) => (
                    <option key={university.id} value={university.name}>
                      {university.name}
                    </option>
                  ))}
                </select>
                {!isConnected && (
                  <small style={{ color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    Please connect your wallet to load universities
                  </small>
                )}
              </div>

              {/* Contact Info Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <Phone size={16} className={styles.labelIcon} />
                  Contact Information
                </label>
                <input
                  type="text"
                  value={profileData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Enter your contact information"
                />
              </div>

              {/* Role Field (Read-only) */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  Role
                </label>
                <input
                  type="text"
                  value={profileData.role}
                  className={`${styles.input} ${styles.readOnly} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Your role"
                  readOnly
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isUpdating}
                className={`${styles.updateButton} ${darkMode ? styles.darkUpdateButton : ''}`}
              >
                <Save size={16} />
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Update Form */}
        <div className={`${styles.profileCard} ${darkMode ? styles.darkProfileCard : ''}`}>
          <div className={`${styles.cardHeader} ${darkMode ? styles.darkCardHeader : ''}`}>
            <h2 className={`${styles.cardTitle} ${darkMode ? styles.darkText : ''}`}>Change Password</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className={styles.profileForm}>
            <div className={styles.formGrid}>
              {/* New Password Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <Lock size={16} className={styles.labelIcon} />
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${darkMode ? styles.darkText : ''}`}>
                  <Lock size={16} className={styles.labelIcon} />
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  className={`${styles.input} ${darkMode ? styles.darkInput : ''}`}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className={`${styles.updateButton} ${darkMode ? styles.darkUpdateButton : ''}`}
              >
                <Lock size={16} />
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className={`${styles.infoCard} ${darkMode ? styles.darkInfoCard : ''}`}>
          <h3 className={`${styles.infoTitle} ${darkMode ? styles.darkText : ''}`}>Account Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={`${styles.infoLabel} ${darkMode ? styles.darkText : ''}`}>Account Type:</span>
              <span className={`${styles.infoValue} ${darkMode ? styles.darkText : ''}`}>
                {profileData.role || 'Not specified'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={`${styles.infoLabel} ${darkMode ? styles.darkText : ''}`}>Institution:</span>
              <span className={`${styles.infoValue} ${darkMode ? styles.darkText : ''}`}>
                {profileData.institution || 'Not specified'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={`${styles.infoLabel} ${darkMode ? styles.darkText : ''}`}>Last Updated:</span>
              <span className={`${styles.infoValue} ${darkMode ? styles.darkText : ''}`}>
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
