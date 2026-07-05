const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success } = require('../utils/response');
const { getPendingNotificationsForUser } = require('../data/data');

const router = Router();

const POLL_TIMEOUT_MS = 25000;
const POLL_CHECK_INTERVAL_MS = 1000;

router.get('/poll', authenticate, (req, res) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let closed = false;

  req.on('close', () => {
    closed = true;
  });

  const check = () => {
    if (closed) return;

    const events = getPendingNotificationsForUser(req.user.id);
    if (events.length > 0) {
      return success(res, { events });
    }

    if (Date.now() >= deadline) {
      return res.status(204).end();
    }

    setTimeout(check, POLL_CHECK_INTERVAL_MS);
  };

  check();
});

module.exports = router;
