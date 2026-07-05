const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { pollUntil } = require('../utils/longPoll');
const { getPendingNotificationsForUser } = require('../data/data');

const router = Router();

router.get('/poll', authenticate, (req, res) => {
  pollUntil(req, res, () => {
    const events = getPendingNotificationsForUser(req.user.id);
    return events.length > 0 ? { events } : null;
  });
});

module.exports = router;
