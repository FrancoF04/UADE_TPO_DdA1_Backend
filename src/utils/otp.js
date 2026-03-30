const crypto = require('crypto');

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const isOtpExpired = (otp) => new Date(otp.expiresAt) < new Date();

module.exports = { generateOtp, isOtpExpired };
