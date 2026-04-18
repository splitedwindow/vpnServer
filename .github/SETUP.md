# GitHub Actions Setup

## Required GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### 1. `VPS_HOST`
Your VPS IP address
```
94.231.178.180
```

### 2. `VPS_USERNAME`
SSH username (usually `root` or your user)
```
root
```

### 3. `VPS_SSH_KEY`
Your private SSH key for VPS access

Generate if you don't have one:
```bash
ssh-keygen -t ed25519 -C "github-actions"
```

Copy the private key:
```bash
cat ~/.ssh/id_ed25519
```

Add the public key to VPS:
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@94.231.178.180
```

## Initial VPS Setup

Before the first deployment, manually set up the VPS:

```bash
# SSH into VPS
ssh root@94.231.178.180

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
cd /opt
git clone YOUR_REPO_URL diplomaVPN
cd diplomaVPN

# Configure production secrets
cp freeradius/clients.conf.template freeradius/clients.conf
nano freeradius/clients.conf
# Update with real MikroTik IP and secret

# Start services
docker-compose up -d
```

## How It Works

1. Push code to `main` branch
2. GitHub Actions connects to VPS via SSH
3. Pulls latest code
4. Restarts Docker containers
5. Verifies deployment

## Manual Deployment

If you prefer manual deployment:

```bash
# On your local machine
git push origin main

# SSH to VPS
ssh root@94.231.178.180
cd /opt/diplomaVPN
git pull
docker-compose up -d --build
```

## Troubleshooting

### SSH Connection Failed
- Verify VPS_HOST is correct
- Check SSH key is added to VPS: `cat ~/.ssh/authorized_keys`
- Test manually: `ssh -i ~/.ssh/id_ed25519 root@94.231.178.180`

### Deployment Failed
- Check GitHub Actions logs
- SSH to VPS and check: `docker-compose ps`
- View logs: `docker logs freeradius` and `docker logs radius_backend`

### Secrets Not Deployed
- `clients.conf` is gitignored - must be configured manually on VPS
- After first deployment, manually create production `clients.conf`
