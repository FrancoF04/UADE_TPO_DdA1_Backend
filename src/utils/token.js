const crypto = require('crypto');

const generateToken = (payload = {}) => {
	const tokenPayload = {
		userId: payload.userId || null,
		fullName: payload.fullName || null,
		jti: crypto.randomUUID(),
	};

	return Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
};

const decodeToken = (token) => {
	if (!token || typeof token !== 'string') {
		return null;
	}

	try {
		const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
		if (!payload || typeof payload !== 'object') {
			return null;
		}

		return payload;
	} catch (_error) {
		return null;
	}
};

module.exports = { generateToken, decodeToken };
