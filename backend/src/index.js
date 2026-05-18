require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const usersRoutes = require('./routes/users');
const sessionsRoutes = require('./routes/sessions');
const authRoutes = require('./routes/auth');
const subscriptionsRoutes = require('./routes/subscriptions');
const configRoutes        = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/config',        configRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const startServer = async () => {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log('Waiting for database connection...');
    setTimeout(startServer, 5000);
    return;
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 RADIUS VPN Backend Server`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   GET    /api/users              - List all users`);
    console.log(`   POST   /api/users              - Create new user`);
    console.log(`   GET    /api/users/:username    - Get user details`);
    console.log(`   PUT    /api/users/:username    - Update user password`);
    console.log(`   DELETE /api/users/:username    - Delete user`);
    console.log(`   GET    /api/sessions/active    - Active VPN sessions`);
    console.log(`   GET    /api/sessions/stats     - Session statistics`);
    console.log(`   GET    /api/auth/attempts      - Authentication logs`);
    console.log(`   GET    /api/auth/failed        - Failed login attempts\n`);
  });
};

startServer();
