# Quick Start Guide

## 📦 Project Structure

```
diplomaVPN/
├── .github/
│   ├── workflows/deploy.yml    # Auto-deployment to VPS
│   └── SETUP.md                # GitHub Actions setup guide
├── backend/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # Database connection
│   │   ├── models/             # User, Session, AuthLog models
│   │   └── routes/             # API endpoints
│   ├── Dockerfile
│   └── package.json
├── freeradius/                  # RADIUS server config
│   ├── clients.conf.template   # Template for production
│   ├── clients.conf            # Production config (gitignored)
│   ├── radiusd.conf
│   └── mods-available/sql
├── mysql/
│   └── init.sql                # Database schema + sample data
├── docker-compose.yml          # Orchestration
├── DEPLOYMENT.md               # VPS deployment guide
└── README.md                   # Full documentation
```

## 🚀 Local Development

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker logs -f freeradius
docker logs -f radius_backend

# Test API
curl http://localhost:3000/api/users

# Stop services
docker-compose down
```

## 🌐 VPS Deployment

### Option 1: GitHub Actions (Recommended)

1. Set up GitHub secrets (see `.github/SETUP.md`)
2. Push to main branch
3. Automatic deployment!

### Option 2: Manual Deployment

```bash
# Copy to VPS
scp -r . root@94.231.178.180:/opt/diplomaVPN

# SSH to VPS
ssh root@94.231.178.180
cd /opt/diplomaVPN

# Configure secrets
cp freeradius/clients.conf.template freeradius/clients.conf
nano freeradius/clients.conf
# Update MikroTik IP: 94.231.178.181
# Update secret: RomVPN262006!

# Start
docker-compose up -d
```

## 🔧 MikroTik Configuration

In WinBox:

1. **RADIUS** → Add:
   - Address: `94.231.178.180` (VPS IP)
   - Secret: `RomVPN262006!`
   - Service: `ppp`

2. **PPP** → **AAA**:
   - Enable "Use RADIUS" ✅

3. **PPP** → **L2TP Server**:
   - Enable ✅
   - Use IPsec ✅
   - Set IPsec secret

## 🧪 Testing

```bash
# Test user: testuser / testpass

# List users
curl http://94.231.178.180:3000/api/users

# Create user
curl -X POST http://94.231.178.180:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'

# View auth logs
curl http://94.231.178.180:3000/api/auth/attempts

# Connect VPN from laptop/phone
# Server: 94.231.178.181 (MikroTik)
# Username: testuser
# Password: testpass
```

## 📝 Important Files

- **Production secrets**: `freeradius/clients.conf` (gitignored)
- **Template**: `freeradius/clients.conf.template` (committed)
- **Database init**: `mysql/init.sql`
- **API code**: `backend/src/`

## 🔐 Security Notes

- `clients.conf` is gitignored - configure manually on VPS
- Change default MySQL passwords in production
- Use strong RADIUS secrets
- Enable firewall on VPS (ports 1812/1813/3000)

## 📚 Documentation

- **Full docs**: `README.md`
- **Deployment**: `DEPLOYMENT.md`
- **GitHub Actions**: `.github/SETUP.md`

## 🆘 Troubleshooting

```bash
# Check all containers
docker-compose ps

# View logs
docker logs freeradius
docker logs radius_backend
docker logs radius_mysql

# Restart service
docker-compose restart freeradius

# Full reset
docker-compose down -v
docker-compose up -d
```

## 🎯 Next Steps

1. ✅ Deploy to VPS
2. ✅ Configure MikroTik
3. ✅ Test VPN connection
4. 🔜 Build frontend dashboard
5. 🔜 Add payment integration
