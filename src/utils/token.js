const crypto = require('crypto');

const generateToken = (payload = {}) => {
	const tokenPayload = {
		userId: payload.userId || null,
		fullName: payload.fullName || null,
		jti: crypto.randomUUID(),
	};

	return Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
};

module.exports = { generateToken };
