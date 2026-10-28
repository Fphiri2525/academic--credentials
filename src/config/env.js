// Environment configuration for browser compatibility
const getEnvVar = (key, defaultValue = '') => {
  // Try different ways to access environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

export const env = {
  // API Configuration
  API_URL: getEnvVar('VITE_API_URL') || getEnvVar('REACT_APP_API_URL') || 'http://localhost:5000',
  
  // Web3 Configuration
  INFURA_API_KEY: getEnvVar('VITE_INFURA_API_KEY') || getEnvVar('REACT_APP_INFURA_API_KEY') || '',
  
  // Email Configuration
  EMAIL_USER: getEnvVar('VITE_EMAIL_USER') || getEnvVar('REACT_APP_EMAIL_USER') || '',
  EMAIL_PASSWORD: getEnvVar('VITE_EMAIL_PASSWORD') || getEnvVar('REACT_APP_EMAIL_PASSWORD') || '',
  
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV') || 'development',
  IS_DEVELOPMENT: getEnvVar('NODE_ENV') !== 'production',
  IS_PRODUCTION: getEnvVar('NODE_ENV') === 'production'
};

export default env; 