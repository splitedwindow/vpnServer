const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AuthLog = require('../models/AuthLog');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_set_JWT_SECRET_in_env';

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Логін та пароль обовʼязкові' });
  }
  try {
    await User.create(username, password);
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, username });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Користувач вже існує' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Логін та пароль обовʼязкові' });
  }
  try {
    const user = await User.getByUsername(username);
    if (!user || user.value !== password) {
      return res.status(401).json({ success: false, error: 'Невірний логін або пароль' });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, username });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.getByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: { username: user.username, password: user.value } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
