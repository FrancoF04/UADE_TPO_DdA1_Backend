const success = (res, data, meta = null, statusCode = 200) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};

module.exports = { success, error };
