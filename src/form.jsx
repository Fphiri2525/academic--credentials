import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './form.module.css';
import { web3, getContract } from './web3service';
import { useActivityTracker } from './hooks/useActivityTracker';
import { ArrowRight, CheckCircle } from 'lucide-react';

function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    password: '',
    worker: '',
    institution: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isRegistering = location.pathname === '/register';

  const contract = getContract('userManagement');
  const { trackAuth, trackError, updateCurrentUser } = useActivityTracker();

  // Check if content is scrollable and show indicator
  useEffect(() => {
    const checkScrollable = () => {
      const formElement = document.querySelector(`.${styles.formPageContainer}`);
      if (formElement) {
        const isScrollable = formElement.scrollHeight > formElement.clientHeight;
        setShowScrollIndicator(isScrollable);
      }
    };

    // Check after a short delay to ensure DOM is rendered
    setTimeout(checkScrollable, 100);
    
    // Also check on window resize
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  // Check certificate secure system connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (web3 && contract) {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length === 0) {
            setError('Please connect your MetaMask wallet to continue.');
          }
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setError('Certificate secure system connection failed. Please check your wallet connection.');
      }
    };

    checkConnection();
  }, []);

  // Track page access
  useEffect(() => {
    trackAuth('Page Access', `User accessed ${isRegistering ? 'registration' : 'login'} page`);
  }, [isRegistering, trackAuth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleBasedNavigation = (role) => {
    const normalizedRole = role.trim().toLowerCase();
    console.log('🚀 Starting navigation for role:', normalizedRole);

    let targetPath = '';
    switch (normalizedRole) {
      case 'student':
        targetPath = '/student';
        break;
      case 'university':
        targetPath = '/university';
        break;
      case 'nche':
        targetPath = '/homepage';
        break;
      case 'employer':
        targetPath = '/employer';
        break;
      case 'maneb':
        targetPath = '/maneb/dashboard';
        break;
      default:
        console.warn('⚠️ Unknown role, redirecting to dashboard:', normalizedRole);
        targetPath = '/dashboard';
    }

    console.log('🎯 Navigating to:', targetPath);
    window.location.href = targetPath;
    console.log('✅ Navigation initiated via window.location');
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Starting certificate secure system authentication...');

      if (!web3) {
        throw new Error('Web3 not initialized. Please refresh the page and try again.');
      }

      if (!contract) {
        throw new Error('Smart contract not available. Please check your connection.');
      }

      const accounts = await web3.eth.getAccounts();

      if (accounts.length === 0) {
        throw new Error('No MetaMask account connected. Please connect your wallet.');
      }

      console.log('📧 Authenticating user:', email);
      console.log('🔗 Using account:', accounts[0]);

      const role = await contract.methods.signIn(email, password).call({
        from: accounts[0],
      });

      console.log('✅ Smart contract returned role:', role);

      if (!role || role.trim() === '') {
        throw new Error('Invalid credentials or user not found.');
      }

      return role;
    } catch (error) {
      console.error('❌ Smart contract signIn error:', error);

      if (error.message.includes('revert')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('MetaMask')) {
        throw new Error('MetaMask connection issue. Please check your wallet.');
      } else {
        throw new Error(error.message || 'Authentication failed. Please try again.');
      }
    }
  };

  const handleRegister = async () => {
    try {
      if (!formData.name || !formData.email || !formData.contactInfo ||
          !formData.password || !formData.worker || !formData.institution) {
        setError('Please fill in all required fields.');
        return;
      }

      trackAuth('Registration Started', `User started registration process for email: ${formData.email}`);

      const accounts = await web3.eth.getAccounts();

      console.log('🔐 Registration parameters:', {
        name: formData.name,
        email: formData.email,
        contactInfo: formData.contactInfo,
        password: '***hidden***',
        role: formData.worker,
        institution: formData.institution || 'General'
      });

      console.log('🚀 Sending registration transaction...');

      let gasLimit = 500000;

      try {
        const gasEstimate = await contract.methods
          .registerUser(
            formData.name,
            formData.email,
            formData.contactInfo,
            formData.password,
            formData.worker,
            formData.institution || 'General'
          )
          .estimateGas({ from: accounts[0] });

        console.log('⛽ Estimated gas:', gasEstimate);
        gasLimit = Math.floor(gasEstimate * 1.3);
        console.log('⛽ Using estimated gas limit:', gasLimit);
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, using default gas limit:', gasLimit);
        console.warn('Gas estimation error:', gasError);
      }

      let result;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          console.log(`🔄 Transaction attempt ${retryCount + 1}/${maxRetries + 1}`);

          result = await contract.methods
            .registerUser(
              formData.name,
              formData.email,
              formData.contactInfo,
              formData.password,
              formData.worker,
              formData.institution || 'General'
            )
            .send({
              from: accounts[0],
              gas: gasLimit + (retryCount * 50000),
              gasPrice: '25000000000'
            });

          console.log('✅ Transaction successful!');
          break;

        } catch (txError) {
          retryCount++;
          console.error(`❌ Transaction attempt ${retryCount} failed:`, txError);

          if (retryCount > maxRetries) {
            throw txError;
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('🔄 Retrying transaction...');
        }
      }

      trackAuth('Registration Success', `User successfully registered with email: ${formData.email}`, {
        transactionHash: result.transactionHash,
        name: formData.name,
        role: formData.worker
      });

      setSuccessMessage('Registration successful! Redirecting to login...');
      setError('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = 'Registration failed. Please try again.';

      if (err.message.includes('out of gas')) {
        errorMessage = 'Transaction failed due to insufficient gas. Please try again with a higher gas limit.';
      } else if (err.message.includes('gas required exceeds allowance')) {
        errorMessage = 'Gas limit exceeded. Please try again or contact support.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas. Please add more ETH to your wallet.';
      } else if (err.message.includes('User denied transaction')) {
        errorMessage = 'Transaction was cancelled. Please try again.';
      } else if (err.message.includes('nonce too low')) {
        errorMessage = 'Transaction nonce error. Please reset your MetaMask account or try again.';
      }

      setError(errorMessage);

      trackError(err, 'Registration Process', {
        email: formData.email,
        name: formData.name
      });
      setError('Registration failed. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleLogin = async () => {
    try {
      trackAuth('Login Attempt', `User attempting login with email: ${formData.email}`);

      const role = await signIn(formData.email, formData.password);
      console.log('User role after login:', role);

      const userInfo = {
        email: formData.email,
        role
      };

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('isLoggedIn', 'true');

      console.log('💾 Stored in localStorage:', {
        user: userInfo,
        isLoggedIn: 'true'
      });

      updateCurrentUser(userInfo);

      trackAuth('Login Success', `User successfully logged in with role: ${role}`, {
        email: formData.email,
        role: role,
        loginTime: new Date().toISOString()
      });

      // Show success message with green tick
      setShowLoginSuccess(true);
      setError('');

      // Automatically redirect after 2 seconds
      setTimeout(() => {
        console.log('🎉 Login successful! Setting up navigation for role:', role);
        handleRoleBasedNavigation(role);
      }, 2000);

    } catch (err) {
      console.error('Login error:', err);
      trackAuth('Login Failed', `Login failed for email: ${formData.email}`, {
        error: err.message,
        email: formData.email
      });
      setError('Invalid email or password');
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.formPageContainer}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.logo}>
            <div className={styles.logoContainer}>
              <div className={styles.malawiFlag}>
                <div className={styles.flagStripe} style={{ backgroundColor: '#000000' }}></div>
                <div className={styles.flagStripe} style={{ backgroundColor: '#CE1126' }}></div>
                <div className={styles.flagStripe} style={{ backgroundColor: '#00A651' }}></div>
              </div>
              <h2 className={styles.logoText}>Malawi CertSecure</h2>
            </div>
          </div>
          
          {/* Back to Home Button */}
          <button 
            className={styles.backButton}
            onClick={handleBackToHome}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Scroll indicator - only show when content is scrollable */}
      {showScrollIndicator && (
        <div className={styles.scrollIndicator}>
          <span>Scroll to see all options ↕</span>
        </div>
      )}

      {/* Login Success Modal */}
      {showLoginSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <CheckCircle className={styles.successIcon} />
            <h3>Login Successful!</h3>
            <p>You have successfully logged in to Malawi CertSecure.</p>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      {/* Main Form Content */}
      <div className={styles.formPageContent}>
        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.authHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <div className={styles.compactFlag}>
                <div className={styles.compactFlagStripe} style={{ backgroundColor: '#000000' }}></div>
                <div className={styles.compactFlagStripe} style={{ backgroundColor: '#CE1126' }}></div>
                <div className={styles.compactFlagStripe} style={{ backgroundColor: '#00A651' }}></div>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e40af' }}>Malawi CertSecure</span>
            </div>
            <h2>{isRegistering ? 'Create Your Account' : 'Welcome Back'}</h2>
            <p>{isRegistering ? 'Join CertSecure Malawi today' : 'Sign in to your account'}</p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            {isRegistering && (
              <>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contact Info</label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    required
                    placeholder="+265 123 456 789"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    name="worker"
                    value={formData.worker}
                    onChange={handleChange}
                    required
                    className={styles.formSelect}
                  >
                    <option value="">Select Your Role</option>
                    <option value="employer">Employer</option>
                    <option value="student">Student</option>
                    <option value="university">University</option>
                    <option value="nche">NCHE</option>
                    <option value="maneb">MANEB</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Institution/Company</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                    placeholder="Your company or institution name"
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} ${styles.formPageSubmitButton}`}
            >
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : isRegistering ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            {isRegistering ? (
              <p>
                Already have an account? <span onClick={() => navigate('/login')} className={styles.authLink}>Sign In</span>
              </p>
            ) : (
              <p>
                Don't have an account? <span onClick={() => navigate('/register')} className={styles.authLink}>Register Now</span>
              </p>
            )}
          </div>

          {/* Scroll to top button */}
          <button
            type="button"
            className={styles.scrollToTopBtn}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            title="Scroll to top"
          >
            ↑ Top
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormPage;