/**
 * Centralized Activity Tracking Service
 * Tracks all user activities across the entire application
 */

class ActivityTracker {
  constructor() {
    this.activities = [];
    this.listeners = [];
    this.maxActivities = 1000; // Keep last 1000 activities
    this.isEnabled = true;
    
    // Initialize with current user info
    this.currentUser = this.getCurrentUser();
    
    // Start session tracking
    this.trackActivity('SYSTEM', 'Session Started', 'User session initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { email: 'anonymous', role: 'guest' };
    } catch (error) {
      return { email: 'anonymous', role: 'guest' };
    }
  }

  updateCurrentUser(userInfo) {
    this.currentUser = userInfo;
  }

  trackActivity(category, action, description, metadata = {}) {
    if (!this.isEnabled) return;

    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category: category.toUpperCase(),
      action,
      description,
      user: {
        email: this.currentUser?.email || 'anonymous',
        role: this.currentUser?.role || 'guest'
      },
      metadata: {
        url: window.location.href,
        pathname: window.location.pathname,
        userAgent: navigator.userAgent.substring(0, 100),
        ...metadata
      },
      severity: this.getSeverity(category, action),
      icon: this.getIcon(category, action),
      color: this.getColor(category, action)
    };

    // Add to activities array
    this.activities.unshift(activity);

    // Keep only the last maxActivities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }

    // Store in localStorage for persistence
    this.saveToStorage();

    // Notify all listeners
    this.notifyListeners(activity);

    console.log(`🔍 Activity Tracked: [${category}] ${action} - ${description}`);
  }

  getSeverity(category, action) {
    const highSeverityActions = ['LOGIN_FAILED', 'LOGOUT', 'DELETE', 'ERROR', 'SECURITY'];
    const mediumSeverityActions = ['LOGIN', 'UPDATE', 'CREATE', 'UPLOAD'];
    
    if (highSeverityActions.some(keyword => action.toUpperCase().includes(keyword))) {
      return 'HIGH';
    } else if (mediumSeverityActions.some(keyword => action.toUpperCase().includes(keyword))) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  getIcon(category, action) {
    const iconMap = {
      'AUTH': action.includes('LOGIN') ? '🔐' : action.includes('LOGOUT') ? '🚪' : '👤',
      'NAVIGATION': '🧭',
      'USER_MANAGEMENT': '👥',
      'CERTIFICATE': '📜',
      'UNIVERSITY': '🏫',
      'STUDENT': '🎓',
      'EMPLOYER': '💼',
      'MANEB': '📋',
      'SYSTEM': '⚙️',
      'ERROR': '❌',
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'BLOCKCHAIN': '⛓️',
      'UPLOAD': '📤',
      'DOWNLOAD': '📥',
      'SEARCH': '🔍',
      'SETTINGS': '⚙️',
      'REPORT': '📊'
    };
    
    return iconMap[category] || iconMap[action.split('_')[0]] || '📝';
  }

  getColor(category, action) {
    const colorMap = {
      'AUTH': '#3b82f6',
      'NAVIGATION': '#6b7280',
      'USER_MANAGEMENT': '#8b5cf6',
      'CERTIFICATE': '#10b981',
      'UNIVERSITY': '#f59e0b',
      'STUDENT': '#06b6d4',
      'EMPLOYER': '#84cc16',
      'MANEB': '#ef4444',
      'SYSTEM': '#6b7280',
      'ERROR': '#ef4444',
      'SUCCESS': '#10b981',
      'WARNING': '#f59e0b',
      'BLOCKCHAIN': '#8b5cf6'
    };
    
    if (action.includes('ERROR') || action.includes('FAILED')) return '#ef4444';
    if (action.includes('SUCCESS') || action.includes('COMPLETED')) return '#10b981';
    if (action.includes('WARNING')) return '#f59e0b';
    
    return colorMap[category] || '#6b7280';
  }

  // Specific tracking methods for different types of activities
  trackAuth(action, description, metadata = {}) {
    this.trackActivity('AUTH', action, description, metadata);
  }

  trackNavigation(page, description, metadata = {}) {
    this.trackActivity('NAVIGATION', `Navigate to ${page}`, description, metadata);
  }

  trackUserAction(action, description, metadata = {}) {
    this.trackActivity('USER_MANAGEMENT', action, description, metadata);
  }

  trackCertificate(action, description, metadata = {}) {
    this.trackActivity('CERTIFICATE', action, description, metadata);
  }

  trackUniversity(action, description, metadata = {}) {
    this.trackActivity('UNIVERSITY', action, description, metadata);
  }

  trackStudent(action, description, metadata = {}) {
    this.trackActivity('STUDENT', action, description, metadata);
  }

  trackEmployer(action, description, metadata = {}) {
    this.trackActivity('EMPLOYER', action, description, metadata);
  }

  trackManeb(action, description, metadata = {}) {
    this.trackActivity('MANEB', action, description, metadata);
  }

  trackSystem(action, description, metadata = {}) {
    this.trackActivity('SYSTEM', action, description, metadata);
  }

  trackError(error, context, metadata = {}) {
    this.trackActivity('ERROR', 'Error Occurred', `${error.message || error}`, {
      error: error.toString(),
      stack: error.stack,
      context,
      ...metadata
    });
  }

  trackBlockchain(action, description, metadata = {}) {
    this.trackActivity('BLOCKCHAIN', action, description, metadata);
  }

  // Get activities with filtering
  getActivities(filters = {}) {
    let filtered = [...this.activities];

    if (filters.category) {
      filtered = filtered.filter(activity => 
        activity.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.user) {
      filtered = filtered.filter(activity => 
        activity.user.email.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(search) ||
        activity.description.toLowerCase().includes(search) ||
        activity.category.toLowerCase().includes(search)
      );
    }

    if (filters.severity) {
      filtered = filtered.filter(activity => activity.severity === filters.severity);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }

  // Subscribe to activity updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(activity) {
    this.listeners.forEach(callback => {
      try {
        callback(activity);
      } catch (error) {
        console.error('Error in activity listener:', error);
      }
    });
  }

  // Storage methods
  saveToStorage() {
    try {
      const recentActivities = this.activities.slice(0, 500); // Save only recent 500
      localStorage.setItem('activityTracker', JSON.stringify(recentActivities));
    } catch (error) {
      console.warn('Failed to save activities to storage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('activityTracker');
      if (stored) {
        const activities = JSON.parse(stored);
        this.activities = Array.isArray(activities) ? activities : [];
      }
    } catch (error) {
      console.warn('Failed to load activities from storage:', error);
      this.activities = [];
    }
  }

  // Clear all activities
  clearActivities() {
    this.activities = [];
    this.saveToStorage();
    this.trackSystem('Clear Activities', 'All activity logs cleared by user');
  }

  // Export activities
  exportActivities(format = 'json') {
    const data = {
      exportDate: new Date().toISOString(),
      totalActivities: this.activities.length,
      activities: this.activities
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'Category', 'Action', 'Description', 'User', 'Role', 'URL', 'Severity'];
      const rows = this.activities.map(activity => [
        activity.timestamp,
        activity.category,
        activity.action,
        activity.description,
        activity.user.email,
        activity.user.role,
        activity.metadata.url,
        activity.severity
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return data;
  }

  // Enable/disable tracking
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.trackSystem(
      enabled ? 'Tracking Enabled' : 'Tracking Disabled',
      `Activity tracking ${enabled ? 'enabled' : 'disabled'} by user`
    );
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

// Load existing activities from storage
activityTracker.loadFromStorage();

export default activityTracker;
