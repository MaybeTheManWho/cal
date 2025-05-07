/**
 * Authentication service
 * This is a simple mock service for demo purposes
 * In a real app, you would implement proper authentication with a backend
 */

// Demo credentials
const DEMO_PASSWORD = 'password123';

/**
 * Attempt to login with a password
 * @param {string} password - The password to validate
 * @returns {Promise<{success: boolean, token: string|null, error: string|null}>}
 */
export const login = (password) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      if (password === DEMO_PASSWORD) {
        // Generate a mock token
        const token = `demo_${Math.random().toString(36).substring(2, 15)}`;
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        resolve({
          success: true,
          token,
          error: null
        });
      } else {
        reject({
          success: false,
          token: null,
          error: 'Invalid password'
        });
      }
    }, 800);
  });
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const timestamp = localStorage.getItem('auth_timestamp');
  
  if (!token || !timestamp) {
    return false;
  }
  
  // For demo purposes, tokens expire after 24 hours
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();
  const tokenAge = now - parseInt(timestamp, 10);
  
  return tokenAge < expirationTime;
};

/**
 * Logout the user
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_timestamp');
};

export default {
  login,
  isAuthenticated,
  logout
};