const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.getAll();
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/expired', async (req, res) => {
  try {
    const expired = await Subscription.getExpired();
    res.json({ success: true, data: expired });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const subscriptions = await Subscription.getByUsername(req.params.username);
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:username/active', async (req, res) => {
  try {
    const subscription = await Subscription.getActive(req.params.username);
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, plan, duration_days } = req.body;
  if (!username || !plan) {
    return res.status(400).json({ success: false, error: 'username та plan обовʼязкові' });
  }
  try {
    const subscription = await Subscription.create(username, plan, duration_days || 30);
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cancelled = await Subscription.cancel(req.params.id);
    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Підписку не знайдено' });
    }
    res.json({ success: true, message: 'Підписку скасовано' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
