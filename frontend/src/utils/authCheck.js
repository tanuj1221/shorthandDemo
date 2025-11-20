import axios from 'axios';

/**
 * Check if the user has a valid session with the backend
 * @returns {Promise<{authenticated: boolean, isAdmin: boolean}>}
 */
export const checkAuthSession = async () => {
  try {
    // Try to fetch a protected endpoint to verify session
    const response = await axios.get('https://www.shorthandexam.in/check-session', {
      withCredentials: true,
      timeout: 5000 // 5 second timeout
    });
    return {
      authenticated: response.data.authenticated === true,
      isAdmin: response.data.isAdmin === true
    };
  } catch (error) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('[authCheck] Session check failed:', error.message);
    }
    return { authenticated: false, isAdmin: false };
  }
};

/**
 * Validate and sync authentication state
 * Checks if localStorage says authenticated, and verifies with backend
 * If session is invalid, clears localStorage
 */
export const validateAndSyncAuth = async () => {
  const localAuth = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!localAuth) {
    // Not authenticated in localStorage, nothing to validate
    return false;
  }
  
  // Check if backend session is valid
  const sessionData = await checkAuthSession();
  
  if (!sessionData.authenticated || sessionData.isAdmin) {
    // Session expired, invalid, or is admin (not institute)
    if (import.meta.env.DEV) {
      console.log('[authCheck] Institute session invalid, clearing localStorage');
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('instituteId');
    localStorage.removeItem('instituteName');
    return false;
  }
  
  return true;
};

/**
 * Validate and sync admin authentication state
 * Checks if localStorage says admin authenticated, and verifies with backend
 * If session is invalid, clears localStorage
 */
export const validateAndSyncAdminAuth = async () => {
  const localAdminAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
  
  if (!localAdminAuth) {
    // Not authenticated as admin in localStorage
    return false;
  }
  
  // Check if backend session is valid
  const sessionData = await checkAuthSession();
  
  if (!sessionData.authenticated || !sessionData.isAdmin) {
    // Session expired, invalid, or not admin
    if (import.meta.env.DEV) {
      console.log('[authCheck] Admin session invalid, clearing localStorage');
    }
    localStorage.removeItem('isAdminAuthenticated');
    return false;
  }
  
  return true;
};
