const express = require('express');
const router = express.Router();
const AuthLog = require('../models/AuthLog');

router.get('/attempts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const attempts = await AuthLog.getRecentAttempts(limit);
    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/attempts/:username', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const attempts = await AuthLog.getAttemptsByUsername(req.params.username, limit);
    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/failed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const failed = await AuthLog.getFailedAttempts(limit);
    res.json({ success: true, data: failed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
