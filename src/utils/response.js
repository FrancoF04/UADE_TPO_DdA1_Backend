const success = (res, data, meta = null, statusCode = 200) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = 400, code = null) => {
  const payload = {
    success: false,
    error: message,
  };

  if (code !== null && code !== undefined) {
    payload.code = code;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
