const { success } = require('./response');

const POLL_TIMEOUT_MS = 25000;
const POLL_CHECK_INTERVAL_MS = 1000;

// Retiene la respuesta hasta que checkFn devuelva datos, o hasta ~25s (responde 204 sin body).
const pollUntil = (req, res, checkFn) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let closed = false;

  req.on('close', () => {
    closed = true;
  });

  const tick = () => {
    if (closed) return;

    const data = checkFn();
    if (data) {
      return success(res, data);
    }

    if (Date.now() >= deadline) {
      return res.status(204).end();
    }

    setTimeout(tick, POLL_CHECK_INTERVAL_MS);
  };

  tick();
};

module.exports = { pollUntil };
