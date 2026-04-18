# VPS Deployment Guide

Quick guide for deploying to production VPS.

## Prerequisites

- Ubuntu 20.04+ VPS
- Docker and Docker Compose installed
- Root or sudo access
- Ports 1812/1813 (UDP), 3000 (TCP) open

## Deployment Steps

### 1. Install Docker (if not installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Clone/Upload Project

```bash
# Option A: Git clone (recommended)
cd /opt
git clone YOUR_REPO_URL diplomaVPN
cd diplomaVPN

# Option B: SCP from local
# scp -r /path/to/diplomaVPN root@YOUR_VPS_IP:/opt/
```

### 3. Configure Production Settings

```bash
# Update MikroTik IP and secret
nano freeradius/clients.conf
```

Change:
```
client mikrotik_production {
    ipaddr = 94.231.178.181    # Your MikroTik IP
    secret = RomVPN262006!      # Your RADIUS secret
    shortname = mikrotik
    nas_type = mikrotik
}
```

### 4. Update Database NAS Table

After starting services, run:
```bash
docker exec -i radius_mysql mysql -u radius -pradiuspassword radius -e \
  "UPDATE nas SET nasname = '94.231.178.181', secret = 'RomVPN262006!' WHERE shortname = 'mikrotik';"
```

### 5. Start Services

```bash
docker-compose up -d
```

### 6. Verify Services

```bash
docker-compose ps
docker logs freeradius
docker logs radius_backend
```

### 7. Configure Firewall

```bash
sudo ufw allow 1812/udp  # RADIUS auth
sudo ufw allow 1813/udp  # RADIUS accounting
sudo ufw allow 3000/tcp  # Backend API
sudo ufw enable
```

## MikroTik Configuration

In WinBox:

1. **RADIUS** → Add new:
   - Service: `ppp`
   - Address: `94.231.178.180` (VPS IP)
   - Secret: `RomVPN262006!`
   - Auth Port: `1812`
   - Accounting Port: `1813`

2. **PPP** → **AAA**:
   - Check "Use RADIUS" ✅

## Testing

```bash
# Check auth logs
curl http://94.231.178.180:3000/api/auth/attempts

# List users
curl http://94.231.178.180:3000/api/users

# Watch RADIUS logs
docker logs -f freeradius
```

## GitHub Actions Deployment (Optional)

Create `.github/workflows/deploy.yml` for automatic deployment on push.

## Troubleshooting

### RADIUS not receiving requests
- Check firewall: `sudo ufw status`
- Verify MikroTik RADIUS config
- Check logs: `docker logs freeradius`

### Backend API not responding
- Check if running: `docker ps`
- Check logs: `docker logs radius_backend`
- Verify port 3000 is open

### Database connection issues
- Wait 30 seconds after startup
- Check MySQL health: `docker-compose ps`
- Restart: `docker-compose restart backend`

## Security Checklist

- [ ] Changed default MySQL passwords
- [ ] Strong RADIUS secret configured
- [ ] Firewall rules applied
- [ ] Only necessary ports exposed
- [ ] Regular backups configured
- [ ] SSL/TLS for API (use nginx reverse proxy)

## Backup

```bash
# Backup database
docker exec radius_mysql mysqldump -u radius -pradiuspassword radius > backup.sql

# Restore
docker exec -i radius_mysql mysql -u radius -pradiuspassword radius < backup.sql
```
