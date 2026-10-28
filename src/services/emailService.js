import { env } from '../config/env.js';

// Backend API configuration
const API_BASE_URL = env.API_URL;



// Email service functions
export const emailService = {
  // Send welcome email to new user
  async sendWelcomeEmail(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          institution: userData.institution,
          password: userData.password
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send welcome email');
      }

      console.log('✅ Welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  },

  // Test email service connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-email-connection`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Email service connection failed');
      }

      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  },

  // Get email configuration status
  async getConfigStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email-config-status`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get email config status');
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to get email config status:', error);
      return {
        isConfigured: false,
        hasUser: false,
        hasPassword: false,
        error: error.message
      };
    }
  }
};

export default emailService; 