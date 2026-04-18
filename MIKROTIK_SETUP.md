# MikroTik VPN Configuration Summary

## ✅ Configuration Completed

### Network Information
- **MikroTik IP**: `192.168.88.1`
- **RADIUS Server IP**: `192.168.88.15` (your computer)
- **Network Subnet**: `192.168.88.0/24`

### RADIUS Configuration
- **RADIUS Secret**: `your-secret-here`
- **Auth Port**: `1812`
- **Accounting Port**: `1813`

### VPN Settings (Configured in MikroTik)
- **VPN Type**: L2TP with IPsec
- **VPN Client IP Pool**: `10.10.10.2-10.10.10.254`
- **VPN Server IP**: `10.10.10.1`
- **Authentication**: MSCHAPv2
- **IPsec Secret**: (as configured in WinBox)

---

## 🧪 Testing the Connection

### Test User Credentials (Already in Database)
- **Username**: `testuser`
- **Password**: `testpass`

### Step 1: Test from Your Phone/Laptop

#### On Windows:
1. Settings → Network & Internet → VPN → Add VPN
2. Fill in:
   - **VPN Provider**: Windows (built-in)
   - **Connection Name**: MikroTik VPN
   - **Server**: `192.168.88.1`
   - **VPN Type**: L2TP/IPsec with pre-shared key
   - **Pre-shared key**: (your IPsec secret from WinBox)
   - **Username**: `testuser`
   - **Password**: `testpass`
3. Click Connect

#### On Mac:
1. System Preferences → Network → "+" → VPN
2. Fill in:
   - **VPN Type**: L2TP over IPsec
   - **Server Address**: `192.168.88.1`
   - **Account Name**: `testuser`
3. Click Authentication Settings:
   - **Password**: `testpass`
   - **Shared Secret**: (your IPsec secret)
4. Click Connect

#### On iPhone/Android:
1. Settings → VPN → Add VPN Configuration
2. Type: L2TP
3. Server: `192.168.88.1`
4. Account: `testuser`
5. Password: `testpass`
6. Secret: (your IPsec secret)

---

## 📊 Monitoring & Debugging

### Watch RADIUS Authentication in Real-Time
```bash
docker logs -f freeradius
```

### Check Active VPN Sessions
```bash
curl http://localhost:3000/api/sessions/active | jq
```

### View Authentication Attempts
```bash
curl http://localhost:3000/api/auth/attempts | jq
```

### Check Failed Logins
```bash
curl http://localhost:3000/api/auth/failed | jq
```

### View All Users in Database
```bash
curl http://localhost:3000/api/users | jq
```

---

## 🔍 Troubleshooting

### If VPN Connection Fails:

1. **Check FreeRADIUS logs**:
   ```bash
   docker logs -f freeradius
   ```
   Look for: `Access-Accept` (success) or `Access-Reject` (failure)

2. **Verify RADIUS is receiving requests**:
   - You should see authentication attempts in logs
   - If nothing appears, check MikroTik RADIUS configuration

3. **Check MikroTik RADIUS status** (in WinBox):
   - Go to RADIUS menu
   - Look for green checkmark or error messages

4. **Common Issues**:
   - **Wrong secret**: Must match exactly in both MikroTik and `clients.conf`
   - **Firewall blocking**: Check if Mac firewall blocks ports 1812/1813
   - **Wrong IP**: Verify RADIUS server IP is `192.168.88.15`

### Check Firewall (Mac)
```bash
# Allow RADIUS ports
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/docker
```

---

## 👥 Creating Additional VPN Users

### Via API:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "securepass123",
    "groupname": "vpn_users"
  }'
```

### Via MySQL (phpMyAdmin):
1. Open: http://localhost:8080
2. Login: `radius` / `radiuspassword`
3. Go to `radcheck` table
4. Insert new row:
   - username: `john`
   - attribute: `Cleartext-Password`
   - op: `:=`
   - value: `securepass123`

---

## 🚀 Moving to VPS Later

When deploying to VPS, you'll need to:

1. **Update MikroTik RADIUS settings**:
   - Change Address from `192.168.88.15` to `YOUR_VPS_IP`

2. **Update `clients.conf`**:
   - Change `ipaddr` to your public IP or `0.0.0.0/0` (less secure)

3. **Configure VPS firewall**:
   ```bash
   sudo ufw allow 1812/udp
   sudo ufw allow 1813/udp
   ```

4. **Use strong secrets**:
   - Generate random 32-character secrets
   - Update both MikroTik and RADIUS config

The code is already portable - just update IP addresses and secrets!

---

## 📝 Next Steps

1. ✅ Test VPN connection with `testuser`
2. ✅ Monitor logs to verify authentication
3. ✅ Create additional users via API
4. 🔜 Build frontend dashboard for user management
5. 🔜 Deploy to VPS
