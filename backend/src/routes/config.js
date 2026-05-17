const express = require('express');
const router  = express.Router();

router.get('/vpn', (req, res) => {
  res.json({
    success: true,
    data: {
      server: process.env.VPN_SERVER || '94.231.178.181',
      name:   process.env.VPN_NAME   || 'DiplomaVPN',
    },
  });
});

module.exports = router;
