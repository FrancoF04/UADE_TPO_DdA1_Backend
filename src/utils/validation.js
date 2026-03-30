const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidOtp = (code) => /^\d{6}$/.test(code);
const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
const isValidPassword = (password) => typeof password === 'string' && password.length >= 6;

module.exports = { isValidEmail, isValidOtp, isValidUsername, isValidPassword };
