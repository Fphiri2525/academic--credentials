import React, { useState, useEffect } from "react";
import { FaUserPlus, FaEye } from "react-icons/fa";
import { useUserManagement, useConnectionStatus, useAccreditationManagement } from "../hooks/useSmartContract";
import { emailService } from "../services/emailService";
import styles from "./user.module.css";

const UsersPage = ({ isDark }) => {
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactInfo: "",
    password: "",
    role: "",
    institution: "",
  });

  // State for universities dropdown
  const [universities, setUniversities] = useState([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);

  // Use the smart contract hooks
  const {
    getAllUsers,
    registerUser,
    updateUserEmailAndName,
    updateUserPassword,
    deleteUser,
    loading,
    error
  } = useUserManagement();

  const {
    getAllAccreditedUniversities,
    loading: accreditationLoading,
    error: accreditationError
  } = useAccreditationManagement();

  const { isConnected } = useConnectionStatus();

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contactInfo: "",
      password: "",
      role: "",
      institution: "",
    });
  };

  const toggleAddUserForm = () => {
    setIsAddUserFormOpen(!isAddUserFormOpen);
    if (!isAddUserFormOpen) resetForm();
  };

  // Fetch all accredited universities for dropdown
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

  // Fetch all users from smart contract
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      console.log('Fetching users from blockchain...');

      if (!isConnected) {
        console.warn('Not connected to blockchain');
        setUsers([]);
        return;
      }

      const usersData = await getAllUsers();
      console.log('Users fetched:', usersData);
      
      if (usersData && Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.warn('No users data or invalid format:', usersData);
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTransactionStatus(`Error fetching users: ${error.message}`);
      setTimeout(() => setTransactionStatus(''), 5000);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchUsers();
      fetchUniversities();
    }
  }, [isConnected]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || 
        !formData.contactInfo.trim() || !formData.password.trim() || 
        !formData.role.trim() || !formData.institution.trim()) {
      setTransactionStatus('Error: Please fill in all fields');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    try {
      setIsSubmitting(true);
      setTransactionStatus('Adding user to blockchain...');
      
      const result = await registerUser(formData);
      console.log('User registered successfully:', result);

      // Send welcome email after successful registration
      let emailSent = false;
      try {
        setTransactionStatus('Sending welcome email...');
        await emailService.sendWelcomeEmail(formData);
        console.log('Welcome email sent successfully');
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the entire registration if email fails
        console.warn('Email service unavailable - user registration completed without email notification');
      }

      resetForm();
      setIsAddUserFormOpen(false);
      await fetchUsers();
      
      if (emailSent) {
        setTransactionStatus('User added successfully! Welcome email sent.');
      } else {
        setTransactionStatus('User added successfully! (Email service unavailable)');
      }
      setTimeout(() => setTransactionStatus(''), 3000);
      
    } catch (error) {
      console.error('Error adding user:', error);
      setTransactionStatus(`Error adding user: ${error.message}`);
      setTimeout(() => setTransactionStatus(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };



  const handleUpdateUser = async (event) => {
    event.preventDefault();

    // Check connection status
    if (!isConnected) {
      setTransactionStatus('Error: Please connect your wallet to update users');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    // Validate form data
    if (!formData.name.trim() || !formData.email.trim()) {
      setTransactionStatus('Error: Name and email are required');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setTransactionStatus('Error: Please enter a valid email address');
      setTimeout(() => setTransactionStatus(''), 5000);
      return;
    }

    // Check if there are actual changes
    const hasEmailChange = selectedUser.email !== formData.email;
    const hasNameChange = selectedUser.name !== formData.name;
    const hasPasswordChange = formData.password && formData.password.trim();

    if (!hasEmailChange && !hasNameChange && !hasPasswordChange) {
      setTransactionStatus('No changes detected');
      setTimeout(() => setTransactionStatus(''), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      setTransactionStatus('Updating user on blockchain...');

      // Update email and name if changed
      if (hasEmailChange || hasNameChange) {
        console.log('Updating user email/name:', {
          currentEmail: selectedUser.email,
          newEmail: formData.email,
          newName: formData.name
        });

        await updateUserEmailAndName(
          selectedUser.email,
          formData.email,
          formData.name
        );

        setTransactionStatus('User details updated. Processing password...');
      }

      // Update password if provided
      if (hasPasswordChange) {
        console.log('Updating user password for:', formData.email);

        await updateUserPassword(
          formData.email,
          formData.password
        );
      }

      setTransactionStatus('User updated successfully!');
      setIsEditModalOpen(false);
      await fetchUsers();
      setTimeout(() => setTransactionStatus(''), 3000);

    } catch (error) {
      console.error('Error updating user:', error);

      // Provide more specific error messages
      let errorMessage = 'Error updating user: ';
      if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for transaction fees';
      } else if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected';
      } else if (error.message.includes('Network error')) {
        errorMessage += 'Network connection issue. Please check your connection and try again';
      } else if (error.message.includes('execution reverted')) {
        errorMessage += 'Transaction failed. The user might not exist or email might be already taken';
      } else {
        errorMessage += error.message;
      }

      setTransactionStatus(errorMessage);
      setTimeout(() => setTransactionStatus(''), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setIsSubmitting(true);
        setTransactionStatus('Deleting user from blockchain...');
        
        await deleteUser(userEmail);
        setTransactionStatus('User deleted successfully!');
        await fetchUsers();
        setTimeout(() => setTransactionStatus(''), 3000);
        
      } catch (error) {
        console.error('Error deleting user:', error);
        setTransactionStatus(`Error deleting user: ${error.message}`);
        setTimeout(() => setTransactionStatus(''), 5000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <button
          onClick={toggleAddUserForm}
          className={styles.addButton}
          disabled={isSubmitting || !isConnected}
        >
          <FaUserPlus /> Add User
        </button>
      </div>

      {!isConnected && (
        <div className={styles.connectionWarning}>
          ⚠️ Not connected to blockchain. Please connect your wallet to manage users.
        </div>
      )}

      {transactionStatus && (
        <div className={`${styles.transactionStatus} ${transactionStatus.includes('Error') ? styles.error : styles.success}`}>
          {transactionStatus}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Processing blockchain transaction...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          ❌ {error}
        </div>
      )}

      {/* Add User Form */}
      {isAddUserFormOpen && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <h2>Add New User</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Contact Info *</label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    placeholder="Phone number or address"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="university">University</option>
                    <option value="nche">NCHE</option>
                    <option value="employer">Employer</option>
                    <option value="maneb">MANEB</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Institution *</label>
                  <select
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting || isLoadingUniversities}
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
              </div>
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !isConnected}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Adding to Blockchain...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={toggleAddUserForm}
                  disabled={isSubmitting}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={styles.usersContainer}>
        {isLoadingUsers ? (
          <div className={styles.loading}>Loading users from blockchain...</div>
        ) : users.length > 0 ? (
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Institution</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[`${user.role}Badge`]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.institution}</td>
                  <td>{user.contactInfo}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleViewUser(user)}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        title="View User"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>No users found. {!isConnected && 'Connect your wallet to view users.'}</p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>User Details</h2>
            <div className={styles.userInfo}>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Contact:</strong> {selectedUser.contactInfo}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Institution:</strong> {selectedUser.institution}</p>
            </div>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default UsersPage;