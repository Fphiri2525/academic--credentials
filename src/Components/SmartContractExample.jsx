import React, { useState, useEffect } from 'react';
import { 
  useUserManagement, 
  useAccreditationManagement, 
  useCertificateManagement,
  useConnectionStatus 
} from '../hooks/useSmartContract';
import styles from './user.module.css'; // Reusing existing styles

const SmartContractExample = () => {
  // Connection status
  const { isConnected, networkInfo, contractStatus } = useConnectionStatus();
  
  // User management
  const { 
    registerUser, 
    getAllUsers, 
    getUserDetails,
    loading: userLoading, 
    error: userError 
  } = useUserManagement();
  
  // Accreditation management
  const { 
    getAllAccreditedUniversities,
    addAccreditedUniversity,
    loading: accreditLoading, 
    error: accreditError 
  } = useAccreditationManagement();
  
  // Certificate management
  const { 
    getAllCertificates,
    getCertificate,
    loading: certLoading, 
    error: certError 
  } = useCertificateManagement();

  // Local state
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    password: '',
    role: 'student',
    institution: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    if (isConnected) {
      fetchAllData();
    }
  }, [isConnected]);

  const fetchAllData = async () => {
    try {
      // Fetch all data in parallel
      const [usersData, universitiesData, certificatesData] = await Promise.all([
        getAllUsers(),
        getAllAccreditedUniversities(),
        getAllCertificates()
      ]);

      setUsers(usersData);
      setUniversities(universitiesData);
      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    
    try {
      await registerUser(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        contactInfo: '',
        password: '',
        role: 'student',
        institution: ''
      });
      
      // Refresh users list
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      alert('User registered successfully!');
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  const handleAddUniversity = async () => {
    try {
      await addAccreditedUniversity({
        institutionName: 'Example University',
        category: 'Public University',
        contactInfo: 'contact@example.edu'
      });
      
      // Refresh universities list
      const updatedUniversities = await getAllAccreditedUniversities();
      setUniversities(updatedUniversities);
      
      alert('University added successfully!');
    } catch (error) {
      alert(`Failed to add university: ${error.message}`);
    }
  };

  const handleViewCertificate = async (certificateId) => {
    try {
      const certificate = await getCertificate(certificateId);
      setSelectedCertificate(certificate);
    } catch (error) {
      alert(`Failed to get certificate: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h1>Smart Contract Example</h1>
          </div>
          <div className={styles.errorState}>
            <h2>⚠️ Not Connected to Blockchain</h2>
            <p>Please connect your wallet or ensure Ganache is running.</p>
            <div className={styles.networkInfo}>
              <h3>Network Information:</h3>
              <pre>{JSON.stringify(networkInfo, null, 2)}</pre>
            </div>
            <div className={styles.contractStatus}>
              <h3>Contract Status:</h3>
              <pre>{JSON.stringify(contractStatus, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1>Smart Contract Integration Example</h1>
          <p>Demonstrating improved smart contract functionality</p>
        </div>

        {/* Network Status */}
        <div className={styles.statusSection}>
          <h2>Network Status</h2>
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <h3>Connection</h3>
              <p className={styles.statusText}>✅ Connected</p>
            </div>
            <div className={styles.statusCard}>
              <h3>Chain ID</h3>
              <p className={styles.statusText}>{networkInfo?.chainId || 'Unknown'}</p>
            </div>
            <div className={styles.statusCard}>
              <h3>Accounts</h3>
              <p className={styles.statusText}>{networkInfo?.accountCount || 0} available</p>
            </div>
          </div>
        </div>

        {/* User Registration Form */}
        <div className={styles.section}>
          <h2>Register New User</h2>
          <form onSubmit={handleRegisterUser} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="John Doe"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                placeholder="john@example.com"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleFormChange}
                required
                placeholder="+1234567890"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                required
                placeholder="••••••••"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleFormChange}>
                <option value="student">Student</option>
                <option value="university">University</option>
                <option value="employer">Employer</option>
                <option value="nche">NCHE</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Institution</label>
              <select
                name="institution"
                value={formData.institution}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Institution</option>
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
            
            <button type="submit" disabled={userLoading} className={styles.submitButton}>
              {userLoading ? 'Registering...' : 'Register User'}
            </button>
          </form>
          
          {userError && (
            <div className={styles.errorMessage}>
              ❌ {userError}
            </div>
          )}
        </div>

        {/* Data Display */}
        <div className={styles.dataSection}>
          <div className={styles.dataGrid}>
            {/* Users */}
            <div className={styles.dataCard}>
              <h3>Users ({users.length})</h3>
              {userLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className={styles.list}>
                  {users.slice(0, 5).map((user, index) => (
                    <div key={index} className={styles.listItem}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className={styles.badge}>{user.role}</span>
                    </div>
                  ))}
                  {users.length > 5 && (
                    <p>... and {users.length - 5} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Universities */}
            <div className={styles.dataCard}>
              <h3>Universities ({universities.length})</h3>
              <button 
                onClick={handleAddUniversity} 
                disabled={accreditLoading}
                className={styles.addButton}
              >
                {accreditLoading ? 'Adding...' : 'Add Example University'}
              </button>
              {accreditLoading ? (
                <p>Loading universities...</p>
              ) : (
                <div className={styles.list}>
                  {universities.slice(0, 5).map((university, index) => (
                    <div key={index} className={styles.listItem}>
                      <strong>{university.name}</strong>
                      <span>{university.category}</span>
                    </div>
                  ))}
                  {universities.length > 5 && (
                    <p>... and {universities.length - 5} more</p>
                  )}
                </div>
              )}
              {accreditError && (
                <div className={styles.errorMessage}>
                  ❌ {accreditError}
                </div>
              )}
            </div>

            {/* Certificates */}
            <div className={styles.dataCard}>
              <h3>Certificates ({certificates.length})</h3>
              {certLoading ? (
                <p>Loading certificates...</p>
              ) : (
                <div className={styles.list}>
                  {certificates.slice(0, 5).map((cert, index) => (
                    <div key={index} className={styles.listItem}>
                      <strong>{cert.id}</strong>
                      <span>{cert.studentName}</span>
                      <button 
                        onClick={() => handleViewCertificate(cert.id)}
                        className={styles.viewButton}
                      >
                        View
                      </button>
                    </div>
                  ))}
                  {certificates.length > 5 && (
                    <p>... and {certificates.length - 5} more</p>
                  )}
                </div>
              )}
              {certError && (
                <div className={styles.errorMessage}>
                  ❌ {certError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Details Modal */}
        {selectedCertificate && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Certificate Details</h3>
              <div className={styles.certificateDetails}>
                <p><strong>Student:</strong> {selectedCertificate.studentName}</p>
                <p><strong>Institution:</strong> {selectedCertificate.institutionName}</p>
                <p><strong>Program:</strong> {selectedCertificate.programName}</p>
                <p><strong>Issue Date:</strong> {selectedCertificate.issueDate}</p>
                <p><strong>Expiry Date:</strong> {selectedCertificate.expiryDate}</p>
                <p><strong>Valid:</strong> {selectedCertificate.isValid ? '✅ Yes' : '❌ No'}</p>
              </div>
              <button 
                onClick={() => setSelectedCertificate(null)}
                className={styles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Contract Status */}
        <div className={styles.section}>
          <h2>Contract Status</h2>
          <div className={styles.contractGrid}>
            {Object.entries(contractStatus).map(([contract, exists]) => (
              <div key={contract} className={styles.contractCard}>
                <h3>{contract}</h3>
                <p className={exists ? styles.statusSuccess : styles.statusError}>
                  {exists ? '✅ Deployed' : '❌ Not Found'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractExample; 