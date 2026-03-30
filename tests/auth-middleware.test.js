const { authenticate } = require('../src/middleware/auth');
const { sessions } = require('../src/data/data');

describe('Auth middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    sessions.length = 0;
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 when no authorization header', () => {
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'Token de autenticacion requerido' }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header has wrong format', () => {
    mockReq.headers.authorization = 'Basic abc123';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token invalido o expirado' }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when session is expired', () => {
    sessions.push({
      token: 'expired-token',
      userId: 'u1',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    mockReq.headers.authorization = 'Bearer expired-token';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Sesion expirada' }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach user and call next for valid token', () => {
    sessions.push({
      token: 'valid-token',
      userId: 'u1',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
    mockReq.headers.authorization = 'Bearer valid-token';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.id).toBe('u1');
    expect(mockReq.session).toBeDefined();
  });

  it('should return 401 when user not found for session', () => {
    sessions.push({
      token: 'orphan-token',
      userId: 'nonexistent',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
    mockReq.headers.authorization = 'Bearer orphan-token';
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Usuario no encontrado' }),
    );
  });
});
