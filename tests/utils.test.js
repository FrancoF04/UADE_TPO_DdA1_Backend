const {
  isValidEmail,
  isValidOtp,
  isValidUsername,
  isValidPassword,
  isValidPhoneNumber,
} = require('../src/utils/validation');
const { generateOtp, isOtpExpired } = require('../src/utils/otp');
const { success, error } = require('../src/utils/response');
const { Buffer } = require('node:buffer');
const { generateToken } = require('../src/utils/token');

describe('Validation utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('has spaces@test.com')).toBe(false);
    });
  });

  describe('isValidOtp', () => {
    it('should return true for 6-digit codes', () => {
      expect(isValidOtp('123456')).toBe(true);
      expect(isValidOtp('000000')).toBe(true);
    });

    it('should return false for invalid OTP codes', () => {
      expect(isValidOtp('12345')).toBe(false);
      expect(isValidOtp('1234567')).toBe(false);
      expect(isValidOtp('abcdef')).toBe(false);
      expect(isValidOtp('')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should return true for valid usernames', () => {
      expect(isValidUsername('abc')).toBe(true);
      expect(isValidUsername('user_123')).toBe(true);
      expect(isValidUsername('A'.repeat(20))).toBe(true);
    });

    it('should return false for invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('A'.repeat(21))).toBe(false);
      expect(isValidUsername('has space')).toBe(false);
      expect(isValidUsername('special!')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('longpassword')).toBe(true);
    });

    it('should return false for short or non-string passwords', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword(123456)).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhoneNumber('+5491112345678')).toBe(true);
      expect(isValidPhoneNumber('5491112345678')).toBe(true);
      expect(isValidPhoneNumber('12345678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('1234567')).toBe(false);
      expect(isValidPhoneNumber('abc123456')).toBe(false);
      expect(isValidPhoneNumber('11 1234 5678')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });
});

describe('OTP utils', () => {
  describe('generateOtp', () => {
    it('should return a 6-digit string', () => {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different codes', () => {
      const codes = new Set(Array.from({ length: 10 }, () => generateOtp()));
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe('isOtpExpired', () => {
    it('should return true for expired OTP', () => {
      const otp = { expiresAt: new Date(Date.now() - 1000).toISOString() };
      expect(isOtpExpired(otp)).toBe(true);
    });

    it('should return false for valid OTP', () => {
      const otp = { expiresAt: new Date(Date.now() + 60000).toISOString() };
      expect(isOtpExpired(otp)).toBe(false);
    });
  });
});

describe('Response utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    it('should format success response with default status', () => {
      success(mockRes, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    });

    it('should include meta when provided', () => {
      success(mockRes, [], { total: 10, page: 1, limit: 5 });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        meta: { total: 10, page: 1, limit: 5 },
      });
    });

    it('should use custom status code', () => {
      success(mockRes, {}, null, 201);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('error', () => {
    it('should format error response', () => {
      error(mockRes, 'Not found', 404);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Not found' });
    });

    it('should default to 400 status', () => {
      error(mockRes, 'Bad request');
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Token utils', () => {
  describe('generateToken', () => {
    it('should include user identity in the token payload', () => {
      const token = generateToken({ userId: 'u1', fullName: 'Juan Perez' });
      const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

      expect(payload.userId).toBe('u1');
      expect(payload.fullName).toBe('Juan Perez');
      expect(payload.jti).toBeDefined();
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken({ userId: 'u1', fullName: 'Juan Perez' });
      const token2 = generateToken({ userId: 'u1', fullName: 'Juan Perez' });
      expect(token1).not.toBe(token2);
    });
  });
});
