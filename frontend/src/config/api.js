// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://www.shorthandexam.in';

export const API_ENDPOINTS = {
  // Auth
  LOGIN_INSTITUTE: `${API_URL}/login_institute`,
  LOGIN_ADMIN: `${API_URL}/admin_login`,
  LOGOUT_INSTITUTE: `${API_URL}/logoutinsti`,
  CHECK_SESSION: `${API_URL}/check-session`,
  
  // Notices
  NOTICES: `${API_URL}/api/notices`,
  ADMIN_NOTICES: `${API_URL}/api/admin/notices`,
  
  // Contacts
  CONTACT: `${API_URL}/api/contact`,
  ADMIN_CONTACTS: `${API_URL}/api/admin/contacts`,
  ADMIN_CONTACTS_STATS: `${API_URL}/api/admin/contacts/stats`,
};

export default API_URL;
