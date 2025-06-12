/**
 * Validation utility functions for input validation
 */

const MinimumLength = 8; // Minimum length for passwords

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password || password.length < MinimumLength) {
    result.isValid = false;
    result.errors.push(`Password must be at least ${MinimumLength} characters long`);
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    result.isValid = false;
    result.errors.push(`Password must contain at least one uppercase letter, one lowercase letter, and one number`);
  }

  return result;
}

/**
 * Validate if a string has at least a minimum length
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} True if valid, false otherwise
 */
function hasMinLength(str, minLength) {
   
  return Boolean(str) && str.length >= minLength;
}

module.exports = {
  isValidEmail,
  validatePassword,
  hasMinLength
};
