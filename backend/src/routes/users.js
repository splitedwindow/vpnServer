const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const user = await User.getByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, groupname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const user = await User.create(username, password, groupname);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:username', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const updated = await User.update(req.params.username, password);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:username', async (req, res) => {
  try {
    await User.delete(req.params.username);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:username/groups', async (req, res) => {
  try {
    const groups = await User.getUserGroups(req.params.username);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:username/groups', async (req, res) => {
  try {
    const { groupname, priority } = req.body;
    
    if (!groupname) {
      return res.status(400).json({ success: false, error: 'Group name is required' });
    }

    await User.addToGroup(req.params.username, groupname, priority);
    res.status(201).json({ success: true, message: 'User added to group' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:username/groups/:groupname', async (req, res) => {
  try {
    await User.removeFromGroup(req.params.username, req.params.groupname);
    res.json({ success: true, message: 'User removed from group' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
