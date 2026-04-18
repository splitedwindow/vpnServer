const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/active', async (req, res) => {
  try {
    const sessions = await Session.getActiveSessions();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await Session.getAllSessionStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const sessions = await Session.getSessionsByUsername(req.params.username);
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:username/stats', async (req, res) => {
  try {
    const stats = await Session.getSessionStats(req.params.username);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
