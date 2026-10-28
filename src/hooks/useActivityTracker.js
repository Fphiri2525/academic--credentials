import { useState, useEffect, useCallback } from 'react';
import activityTracker from '../services/ActivityTracker';

/**
 * React Hook for Activity Tracking
 * Provides easy access to activity tracking functionality
 */import React from 'react';

export const useActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to activity updates
  useEffect(() => {
    const unsubscribe = activityTracker.subscribe((newActivity) => {
      setActivities(prev => [newActivity, ...prev.slice(0, 999)]);
    });

    // Load initial activities
    setActivities(activityTracker.getActivities());

    return unsubscribe;
  }, []);

  // Tracking methods
  const trackAuth = useCallback((action, description, metadata) => {
    activityTracker.trackAuth(action, description, metadata);
  }, []);

  const trackNavigation = useCallback((page, description, metadata) => {
    activityTracker.trackNavigation(page, description, metadata);
  }, []);

  const trackUserAction = useCallback((action, description, metadata) => {
    activityTracker.trackUserAction(action, description, metadata);
  }, []);

  const trackCertificate = useCallback((action, description, metadata) => {
    activityTracker.trackCertificate(action, description, metadata);
  }, []);

  const trackUniversity = useCallback((action, description, metadata) => {
    activityTracker.trackUniversity(action, description, metadata);
  }, []);

  const trackStudent = useCallback((action, description, metadata) => {
    activityTracker.trackStudent(action, description, metadata);
  }, []);

  const trackEmployer = useCallback((action, description, metadata) => {
    activityTracker.trackEmployer(action, description, metadata);
  }, []);

  const trackManeb = useCallback((action, description, metadata) => {
    activityTracker.trackManeb(action, description, metadata);
  }, []);

  const trackSystem = useCallback((action, description, metadata) => {
    activityTracker.trackSystem(action, description, metadata);
  }, []);

  const trackError = useCallback((error, context, metadata) => {
    activityTracker.trackError(error, context, metadata);
  }, []);

  const trackBlockchain = useCallback((action, description, metadata) => {
    activityTracker.trackBlockchain(action, description, metadata);
  }, []);

  const trackCustom = useCallback((category, action, description, metadata) => {
    activityTracker.trackActivity(category, action, description, metadata);
  }, []);

  // Utility methods
  const getFilteredActivities = useCallback((filters) => {
    return activityTracker.getActivities(filters);
  }, []);

  const clearActivities = useCallback(() => {
    activityTracker.clearActivities();
    setActivities([]);
  }, []);

  const exportActivities = useCallback((format = 'json') => {
    return activityTracker.exportActivities(format);
  }, []);

  const updateCurrentUser = useCallback((userInfo) => {
    activityTracker.updateCurrentUser(userInfo);
  }, []);

  return {
    // State
    activities,
    isLoading,
    
    // Tracking methods
    trackAuth,
    trackNavigation,
    trackUserAction,
    trackCertificate,
    trackUniversity,
    trackStudent,
    trackEmployer,
    trackManeb,
    trackSystem,
    trackError,
    trackBlockchain,
    trackCustom,
    
    // Utility methods
    getFilteredActivities,
    clearActivities,
    exportActivities,
    updateCurrentUser
  };
};

/**
 * Higher-Order Component for automatic activity tracking
 */
export const withActivityTracking = (WrappedComponent, componentName) => {
  return function ActivityTrackedComponent(props) {
    const { trackNavigation } = useActivityTracker();

    useEffect(() => {
      trackNavigation(componentName, `User accessed ${componentName} page`);
    }, [trackNavigation]);
return React.createElement(WrappedComponent, props);

  };
};

/**
 * Hook for automatic page tracking
 */
export const usePageTracking = (pageName, description) => {
  const { trackNavigation } = useActivityTracker();

  useEffect(() => {
    trackNavigation(pageName, description || `User accessed ${pageName} page`);
  }, [pageName, description, trackNavigation]);
};

/**
 * Hook for form tracking
 */
export const useFormTracking = (formName) => {
  const { trackUserAction } = useActivityTracker();

  const trackFormStart = useCallback(() => {
    trackUserAction('Form Started', `User started filling ${formName} form`);
  }, [formName, trackUserAction]);

  const trackFormSubmit = useCallback((success = true, data = {}) => {
    trackUserAction(
      success ? 'Form Submitted' : 'Form Submit Failed',
      `User ${success ? 'successfully submitted' : 'failed to submit'} ${formName} form`,
      { formName, success, ...data }
    );
  }, [formName, trackUserAction]);

  const trackFormError = useCallback((error, field) => {
    trackUserAction(
      'Form Error',
      `Error in ${formName} form: ${error}`,
      { formName, error, field }
    );
  }, [formName, trackUserAction]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError
  };
};

/**
 * Hook for button click tracking
 */
export const useButtonTracking = () => {
  const { trackUserAction } = useActivityTracker();

  const trackButtonClick = useCallback((buttonName, context, metadata = {}) => {
    trackUserAction(
      'Button Clicked',
      `User clicked ${buttonName} button`,
      { buttonName, context, ...metadata }
    );
  }, [trackUserAction]);

  return { trackButtonClick };
};

export default useActivityTracker;
