# Testing Guide

Quick reference for testing your RADIUS VPN setup.

## 🚀 Initial Setup Test

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Verify All Containers Running
```bash
docker-compose ps
```

Expected output:
```
NAME              STATUS    PORTS
freeradius        Up        1812-1813/udp
radius_mysql      Up        3306/tcp
radius_backend    Up        3000/tcp
phpmyadmin        Up        8080/tcp
```

### 3. Wait for MySQL Initialization
```bash
# Watch MySQL logs until you see "ready for connections"
docker logs -f radius_mysql
```

## 🧪 RADIUS Server Tests

### Test 1: Basic Authentication (Success)
```bash
radtest testuser testpass localhost 1812 testing123
```

**Expected:** `Received Access-Accept`

### Test 2: Wrong Password (Failure)
```bash
radtest testuser wrongpass localhost 1812 testing123
```

**Expected:** `Received Access-Reject`

### Test 3: Non-existent User
```bash
radtest fakeuser anypass localhost 1812 testing123
```

**Expected:** `Received Access-Reject`

## 🔌 Backend API Tests

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2026-02-16T..."}
```

### Test 2: List Users
```bash
curl http://localhost:3000/api/users
```

**Expected:**
```json
{
  "success": true,
  "data": [
    {
      "username": "testuser",
      "password": "testpass",
      "groups": "vpn_users"
    }
  ]
}
```

### Test 3: Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "alice123",
    "groupname": "vpn_users"
  }'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "username": "alice",
    "groupname": "vpn_users"
  }
}
```

### Test 4: Verify New User with RADIUS
```bash
radtest alice alice123 localhost 1812 testing123
```

**Expected:** `Received Access-Accept`

### Test 5: Update Password
```bash
curl -X PUT http://localhost:3000/api/users/alice \
  -H "Content-Type: application/json" \
  -d '{"password": "newpass456"}'
```

### Test 6: Test Updated Password
```bash
# Old password should fail
radtest alice alice123 localhost 1812 testing123

# New password should work
radtest alice newpass456 localhost 1812 testing123
```

### Test 7: Get User Groups
```bash
curl http://localhost:3000/api/users/alice/groups
```

### Test 8: View Auth Logs
```bash
curl http://localhost:3000/api/auth/attempts
```

### Test 9: Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/alice
```

### Test 10: Verify Deletion
```bash
radtest alice newpass456 localhost 1812 testing123
```

**Expected:** `Received Access-Reject`

## 🗄️ Database Tests

### Access phpMyAdmin
1. Open browser: `http://localhost:8080`
2. Login:
   - Username: `radius`
   - Password: `radiuspassword`
3. Select `radius` database
4. Browse tables: `radcheck`, `radacct`, `radpostauth`

### Direct MySQL Access
```bash
docker exec -it radius_mysql mysql -u radius -pradiuspassword radius
```

```sql
-- View all users
SELECT * FROM radcheck WHERE attribute = 'Cleartext-Password';

-- View user groups
SELECT u.username, u.groupname, u.priority 
FROM radusergroup u 
ORDER BY username, priority;

-- View recent auth attempts
SELECT username, reply, authdate 
FROM radpostauth 
ORDER BY authdate DESC 
LIMIT 10;

-- View NAS configuration
SELECT * FROM nas;
```

## 🔍 Debugging Tests

### Check FreeRADIUS Debug Output
```bash
docker logs -f freeradius
```

### Check Backend Logs
```bash
docker logs -f radius_backend
```

### Test Database Connection from Backend
```bash
docker exec -it radius_backend node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'mysql',
  user: 'radius',
  password: 'radiuspassword',
  database: 'radius'
}).then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e.message));
"
```

## 📊 Load Testing (Optional)

### Create Multiple Users
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\",\"password\":\"pass$i\"}"
done
```

### Test Multiple Authentications
```bash
for i in {1..10}; do
  radtest user$i pass$i localhost 1812 testing123
done
```

## 🧹 Cleanup After Testing

### Remove Test Users
```bash
for i in {1..10}; do
  curl -X DELETE http://localhost:3000/api/users/user$i
done
```

### Reset Database (Nuclear Option)
```bash
docker-compose down -v
docker-compose up -d
```

This will:
- Stop all containers
- Delete MySQL data volume
- Recreate everything with fresh sample data

## ✅ Pre-Production Checklist

Before deploying to Ubuntu server:

- [ ] All RADIUS tests pass
- [ ] All API endpoints work
- [ ] Can create/update/delete users
- [ ] Authentication logs are recorded
- [ ] phpMyAdmin accessible
- [ ] Changed all default passwords
- [ ] Updated `clients.conf` with production IPs
- [ ] Updated `nas` table with MikroTik IP
- [ ] Tested with actual MikroTik router (if available)
- [ ] Firewall rules documented
- [ ] Backup strategy planned

## 🚨 Common Issues

### Issue: "Access-Reject" for valid user
**Check:**
- User exists in `radcheck` table
- Password matches exactly
- Client secret is `testing123`
- FreeRADIUS logs for details

### Issue: Backend can't connect to MySQL
**Check:**
- MySQL container is healthy: `docker-compose ps`
- Wait 30 seconds after startup
- Check logs: `docker logs radius_backend`

### Issue: "Connection refused" on API calls
**Check:**
- Backend container running: `docker ps`
- Port 3000 not blocked by firewall
- Correct URL: `http://localhost:3000`

### Issue: FreeRADIUS container exits immediately
**Check:**
- Configuration syntax: `docker logs freeradius`
- MySQL is running and healthy
- Restart: `docker-compose restart freeradius`
