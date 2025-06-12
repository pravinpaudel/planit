// tests/unit/utils/validation.test.js
const { isValidEmail, validatePassword, hasMinLength } = require('../../../src/utils/validation');

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbersHere');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    });

    it('should handle null or undefined passwords', () => {
      expect(validatePassword(null).isValid).toBe(false);
      expect(validatePassword(undefined).isValid).toBe(false);
      expect(validatePassword('').isValid).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should return true if string has at least minimum length', () => {
      expect(hasMinLength('abc', 3)).toBe(true);
      expect(hasMinLength('abcdef', 3)).toBe(true);
    });

    it('should return false if string is shorter than minimum length', () => {
      expect(hasMinLength('ab', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
    });

    it('should handle null or undefined values', () => {
      expect(hasMinLength(null, 3)).toBe(false);
      expect(hasMinLength(undefined, 3)).toBe(false);
    });
  });
});
