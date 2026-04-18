# RADIUS VPN Authentication System

Complete Docker-based RADIUS server setup for MikroTik VPN authentication with Express.js backend API.

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐
│  MikroTik   │────▶│  FreeRADIUS  │────▶│  MySQL  │
│  VPN Router │     │   (1812/1813)│     │  (3306) │
└─────────────┘     └──────────────┘     └─────────┘
                            │                   │
                            │                   │
                            ▼                   ▼
                    ┌──────────────┐    ┌─────────────┐
                    │  Express.js  │────│ phpMyAdmin  │
                    │  Backend API │    │   (8080)    │
                    │    (3000)    │    └─────────────┘
                    └──────────────┘
```

## 📦 What's Included

- **FreeRADIUS 3.x** - RADIUS authentication server
- **MySQL 8.0** - Database with RADIUS schema
- **Express.js Backend** - RESTful API for user management
- **phpMyAdmin** - Web interface for database inspection
- **Sample Data** - Test user and VPN group configuration

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- Basic understanding of RADIUS and VPN concepts

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:
- MySQL on port `3306`
- FreeRADIUS on ports `1812/1813` (UDP)
- Express.js backend on port `3000`
- phpMyAdmin on port `8080`

### 2. Verify Services

```bash
# Check all containers are running
docker-compose ps

# View FreeRADIUS logs
docker logs freeradius

# View backend logs
docker logs radius_backend
```

### 3. Test RADIUS Authentication

Install `radtest` (comes with FreeRADIUS client tools):

```bash
# On Mac
brew install freeradius-server

# Test with sample user (username: testuser, password: testpass)
radtest testuser testpass localhost 1812 testing123
```

Expected output:
```
Received Access-Accept
```

## 🔌 API Endpoints

Base URL: `http://localhost:3000`

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all VPN users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/:username` | Get user details |
| PUT | `/api/users/:username` | Update user password |
| DELETE | `/api/users/:username` | Delete user |
| GET | `/api/users/:username/groups` | Get user's groups |
| POST | `/api/users/:username/groups` | Add user to group |
| DELETE | `/api/users/:username/groups/:groupname` | Remove from group |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions/active` | Currently active VPN sessions |
| GET | `/api/sessions/stats` | Session statistics by user |
| GET | `/api/sessions/user/:username` | User's session history |
| GET | `/api/sessions/user/:username/stats` | User's statistics |

### Authentication Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/attempts` | Recent authentication attempts |
| GET | `/api/auth/attempts/:username` | User's auth attempts |
| GET | `/api/auth/failed` | Failed login attempts |

## 📝 API Usage Examples

### Create a New VPN User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "securepass123",
    "groupname": "vpn_users"
  }'
```

### List All Users

```bash
curl http://localhost:3000/api/users
```

### Update User Password

```bash
curl -X PUT http://localhost:3000/api/users/john \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword456"}'
```

### View Active VPN Sessions

```bash
curl http://localhost:3000/api/sessions/active
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/api/users/john
```

## 🗄️ Database Access

### phpMyAdmin
- URL: `http://localhost:8080`
- Username: `radius`
- Password: `radiuspassword`

### MySQL Direct Connection
```bash
mysql -h 127.0.0.1 -P 3306 -u radius -pradiuspassword radius
```

### Key RADIUS Tables

- `radcheck` - User credentials
- `radreply` - User-specific attributes
- `radgroupcheck` - Group authentication rules
- `radgroupreply` - Group reply attributes
- `radusergroup` - User-to-group mappings
- `radacct` - Session accounting logs
- `radpostauth` - Authentication attempt logs
- `nas` - Network Access Servers (MikroTik routers)

## 🔧 MikroTik Configuration

### Configure RADIUS on MikroTik Router

1. **Add RADIUS Server** (via WinBox or CLI):

```
/radius
add address=YOUR_SERVER_IP service=ppp secret=your-secret-here
```

2. **Enable RADIUS for PPP**:

```
/ppp aaa
set use-radius=yes
```

3. **Configure VPN Server** (example for L2TP):

```
/interface l2tp-server server
set enabled=yes use-ipsec=yes ipsec-secret=ipsec-secret-key authentication=mschap2
```

### Update NAS Configuration

Before connecting MikroTik, update the `nas` table with your router's IP:

```sql
UPDATE nas 
SET nasname = 'YOUR_MIKROTIK_IP', 
    secret = 'your-secret-here' 
WHERE shortname = 'mikrotik';
```

Or via API:

```bash
# Access MySQL container
docker exec -it radius_mysql mysql -u radius -pradiuspassword radius

# Then run UPDATE query
```

## 📁 Project Structure

```
diplomaVPN/
├── docker-compose.yml           # Main orchestration file
├── mysql/
│   └── init.sql                 # Database schema & sample data
├── freeradius/
│   ├── radiusd.conf            # Main RADIUS config
│   ├── clients.conf            # Allowed RADIUS clients
│   ├── mods-available/
│   │   └── sql                 # MySQL module config
│   └── sites-available/
│       └── default             # Virtual server config
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js            # Express app entry point
        ├── config/
        │   └── database.js     # MySQL connection pool
        ├── models/
        │   ├── User.js         # User management
        │   ├── Session.js      # Session tracking
        │   └── AuthLog.js      # Auth logging
        └── routes/
            ├── users.js        # User endpoints
            ├── sessions.js     # Session endpoints
            └── auth.js         # Auth log endpoints
```

## 🔒 Security Notes

**⚠️ IMPORTANT: This is a development setup!**

Before deploying to production:

1. **Change all default passwords**:
   - MySQL root password
   - MySQL radius user password
   - RADIUS client secrets
   - MikroTik IPsec secrets

2. **Use encrypted passwords**:
   - Replace `Cleartext-Password` with `Crypt-Password` or `MD5-Password`
   - Consider using `bcrypt` in backend

3. **Enable TLS**:
   - Configure RadSec (RADIUS over TLS)
   - Use HTTPS for backend API

4. **Firewall rules**:
   - Restrict RADIUS ports (1812/1813) to MikroTik IP only
   - Don't expose MySQL port publicly
   - Use VPN or SSH tunnel for remote access

5. **Update `clients.conf`**:
   - Remove `docker_network` client in production
   - Use strong secrets (minimum 16 characters)

## 🛠️ Development Workflow

### Making Changes to Backend

The backend uses `nodemon` for hot-reload:

```bash
# Edit files in ./backend/src/
# Changes auto-reload - check logs:
docker logs -f radius_backend
```

### Modifying RADIUS Configuration

```bash
# Edit FreeRADIUS configs
vim freeradius/clients.conf

# Restart FreeRADIUS
docker-compose restart freeradius

# Debug mode (verbose logging)
docker logs -f freeradius
```

### Database Migrations

```bash
# Access MySQL
docker exec -it radius_mysql mysql -u radius -pradiuspassword radius

# Run SQL commands or import files
```

## 🧪 Testing

### Test RADIUS Authentication

```bash
# Success case
radtest testuser testpass localhost 1812 testing123

# Failure case (wrong password)
radtest testuser wrongpass localhost 1812 testing123
```

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'
```

## 📊 Monitoring

### View Real-time Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f freeradius
docker logs -f radius_backend
docker logs -f radius_mysql
```

### Check Active Sessions

```bash
curl http://localhost:3000/api/sessions/active | jq
```

### Monitor Failed Logins

```bash
curl http://localhost:3000/api/auth/failed | jq
```

## 🚢 Deploying to Ubuntu Server

1. **Copy project to server**:
```bash
scp -r diplomaVPN/ user@your-server:/opt/
```

2. **Install Docker** (if not installed):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Update configuration**:
   - Change passwords in `docker-compose.yml`
   - Update MikroTik IP in `freeradius/clients.conf`
   - Update NAS table with production IPs

4. **Start services**:
```bash
cd /opt/diplomaVPN
docker-compose up -d
```

5. **Configure firewall**:
```bash
sudo ufw allow 1812/udp  # RADIUS auth
sudo ufw allow 1813/udp  # RADIUS accounting
sudo ufw allow 3000/tcp  # Backend API (or use reverse proxy)
```

## 🐛 Troubleshooting

### FreeRADIUS won't start

```bash
# Check logs
docker logs freeradius

# Common issues:
# - MySQL not ready: wait 30s and restart
# - Config syntax error: check radiusd.conf
```

### Backend can't connect to MySQL

```bash
# Verify MySQL is healthy
docker-compose ps

# Check connection
docker exec radius_backend ping mysql
```

### RADIUS authentication fails

```bash
# Enable debug mode
docker-compose down
docker-compose up freeradius

# Check:
# 1. User exists in radcheck table
# 2. Client secret matches in clients.conf
# 3. NAS IP is allowed
```

### Can't access phpMyAdmin

```bash
# Verify port 8080 is not in use
lsof -i :8080

# Restart service
docker-compose restart phpmyadmin
```

## 📚 Additional Resources

- [FreeRADIUS Documentation](https://freeradius.org/documentation/)
- [MikroTik RADIUS Setup](https://wiki.mikrotik.com/wiki/Manual:RADIUS_Client)
- [RADIUS Protocol RFC 2865](https://tools.ietf.org/html/rfc2865)

## 📄 License

This is a diploma/educational project. Use at your own risk.

## 🤝 Contributing

This is a learning project. Feel free to experiment and modify as needed for your diploma requirements.

---

**Next Steps:**
1. ✅ Start the stack: `docker-compose up -d`
2. ✅ Test RADIUS: `radtest testuser testpass localhost 1812 testing123`
3. ✅ Explore API: `curl http://localhost:3000/api/users`
4. ✅ View database: Open `http://localhost:8080` in browser
5. 🔜 Configure your MikroTik router
6. 🔜 Build your frontend dashboard
