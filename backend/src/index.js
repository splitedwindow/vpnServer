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

app.get('/login', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DiplomaVPN — Вхід</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;background:#0d0d1a;display:flex;align-items:center;
         justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff}
    .card{width:360px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
          border-radius:20px;padding:36px 32px}
    .logo{font-size:26px;font-weight:800;text-align:center;margin-bottom:4px}
    .sub{font-size:13px;color:rgba(255,255,255,.4);text-align:center;margin-bottom:28px}
    label{display:block;font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px}
    input{width:100%;height:46px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
          border-radius:12px;padding:0 16px;color:#fff;font-size:14px;outline:none;margin-bottom:14px;
          transition:border-color .2s}
    input:focus{border-color:rgba(108,99,255,.6)}
    input::placeholder{color:rgba(255,255,255,.22)}
    button{width:100%;height:50px;background:linear-gradient(135deg,#6c63ff,#4f46e5);border:none;
           border-radius:14px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;
           margin-top:4px;transition:all .2s}
    button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(108,99,255,.4)}
    button:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .err{font-size:12px;color:#f87171;text-align:center;min-height:18px;margin-top:10px}
    .ok{display:none;text-align:center;padding:20px;background:rgba(16,185,129,.1);
        border:1px solid rgba(16,185,129,.3);border-radius:12px;margin-top:16px}
    .ok h3{color:#10b981;font-size:16px;margin-bottom:6px}
    .ok p{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:14px}
    .ok a{display:inline-block;padding:10px 24px;background:rgba(16,185,129,.15);
          border:1px solid rgba(16,185,129,.3);border-radius:10px;color:#10b981;
          font-size:13px;font-weight:600;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🛡️ DiplomaVPN</div>
    <div class="sub">Вхід через браузер</div>
    <div id="form">
      <label>Логін</label>
      <input type="text"     id="u" placeholder="Ваш логін"  autocomplete="username"/>
      <label>Пароль</label>
      <input type="password" id="p" placeholder="Ваш пароль" autocomplete="current-password"/>
      <button id="btn">Увійти та повернутися до застосунку</button>
      <div class="err" id="err"></div>
    </div>
    <div class="ok" id="ok">
      <h3>✓ Успішно!</h3>
      <p>Повертаємось до DiplomaVPN…</p>
      <a id="back" href="#">↩ Відкрити застосунок</a>
    </div>
  </div>
  <script>
    const btn=document.getElementById('btn'),err=document.getElementById('err');
    const okDiv=document.getElementById('ok'),formDiv=document.getElementById('form');
    btn.addEventListener('click',async()=>{
      const u=document.getElementById('u').value.trim();
      const p=document.getElementById('p').value;
      if(!u||!p){err.textContent='Введіть логін та пароль';return;}
      err.textContent='';btn.disabled=true;btn.textContent='Вхід...';
      try{
        const r=await fetch('/api/auth/login',{method:'POST',
          headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
        const d=await r.json();
        if(!d.success){err.textContent=d.error||'Невірний логін або пароль';
          btn.disabled=false;btn.textContent='Увійти та повернутися до застосунку';return;}
        const deep='diplomavpn://auth?user='+encodeURIComponent(u)
                  +'&pass='+encodeURIComponent(p)
                  +'&token='+encodeURIComponent(d.token);
        document.getElementById('back').href=deep;
        formDiv.style.display='none';okDiv.style.display='block';
        setTimeout(()=>{window.location.href=deep;},800);
      }catch(e){
        err.textContent='Помилка підключення до сервера';
        btn.disabled=false;btn.textContent='Увійти та повернутися до застосунку';
      }
    });
    document.getElementById('p').addEventListener('keydown',e=>{if(e.key==='Enter')btn.click();});
  </script>
</body>
</html>`);
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
