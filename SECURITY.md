# 🔒 უსაფრთხოების გაიდი - VPS Deployment

## ⚠️ კრიტიკული უსაფრთხოების საკითხები

### 1. Discord Token უსაფრთხოება

**❌ არასოდეს:**
- არ გაზიაროთ თქვენი Discord Token
- არ ატვირთოთ `.env` ფაილი Git-ში
- არ გამოიყენოთ იგივე token development და production-ში

**✅ ყოველთვის:**
- შექმენით ახალი token production-სთვის
- დაამატეთ `.env` `.gitignore`-ში
- რეგულარულად შეცვალეთ token

### თუ Token გამჟღავნდა:

1. **დაუყოვნებლივ** გადადით Discord Developer Portal-ზე
2. აირჩიეთ თქვენი Application → Bot
3. დააჭირეთ "Reset Token"
4. დააკოპირეთ ახალი token
5. განაახლეთ `.env` ფაილი VPS-ზე
6. გადატვირთეთ ბოტი: `pm2 restart geotiers-bot`

```bash
# VPS-ზე token-ის განახლება
ssh root@your_vps_ip
cd ~/geotiers-bot
nano .env  # შეცვალეთ DISCORD_TOKEN
pm2 restart geotiers-bot
```

---

## 🔐 VPS უსაფრთხოება

### SSH უსაფრთხოება

#### 1. შეცვალეთ SSH პორტი (რეკომენდებული)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change:
Port 22
# To (example):
Port 2222

# Restart SSH
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

#### 2. გამორთეთ Root Login

```bash
sudo nano /etc/ssh/sshd_config

# Change:
PermitRootLogin yes
# To:
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

#### 3. გამოიყენეთ SSH Keys (ძალიან რეკომენდებული)

**Windows-ზე (PowerShell):**

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to VPS
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@your_vps_ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**VPS-ზე:**

```bash
# Set correct permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Change:
PasswordAuthentication yes
# To:
PasswordAuthentication no

sudo systemctl restart sshd
```

### Firewall კონფიგურაცია

```bash
# Install UFW
sudo apt install ufw -y

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if changed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### Fail2Ban (Brute Force დაცვა)

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Find [sshd] section and ensure:
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status sshd
```

---

## 🛡️ Bot უსაფრთხოება

### Environment Variables დაცვა

```bash
# Set correct permissions on .env
chmod 600 ~/geotiers-bot/.env

# Verify
ls -la ~/geotiers-bot/.env
# Should show: -rw------- (only owner can read/write)
```

### Config Files Backup

```bash
# Create encrypted backup
cd ~
tar -czf geotiers-bot-backup.tar.gz geotiers-bot/
gpg -c geotiers-bot-backup.tar.gz
rm geotiers-bot-backup.tar.gz

# Restore
gpg -d geotiers-bot-backup.tar.gz.gpg > geotiers-bot-backup.tar.gz
tar -xzf geotiers-bot-backup.tar.gz
```

---

## 🔄 რეგულარული განახლებები

### სისტემის განახლება

```bash
# Weekly updates
sudo apt update && sudo apt upgrade -y

# Auto-updates (optional)
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Bot Dependencies განახლება

```bash
cd ~/geotiers-bot

# Check for updates
bun outdated

# Update dependencies
bun update

# Test
bun run start

# If OK, restart
pm2 restart geotiers-bot
```

---

## 📊 მონიტორინგი და Logging

### Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/geotiers-bot

# Add:
/root/geotiers-bot/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}

# Test
sudo logrotate -d /etc/logrotate.d/geotiers-bot
```

### PM2 Log Management

```bash
# Limit log size
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### რესურსების მონიტორინგი

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor CPU/RAM
htop

# Monitor disk I/O
sudo iotop

# Monitor network
sudo nethogs

# PM2 monitoring
pm2 monit
```

---

## 🚨 Incident Response

### თუ VPS დაჰაკეს

1. **დაუყოვნებლივ:**
   ```bash
   # Disconnect from network
   sudo ufw deny out
   
   # Stop all services
   pm2 stop all
   sudo systemctl stop ssh
   ```

2. **შეცვალეთ ყველა პაროლი და Token:**
   - Discord Bot Token
   - VPS Root პაროლი
   - SSH Keys
   - Database პაროლები (თუ გამოიყენება)

3. **შეამოწმეთ ლოგები:**
   ```bash
   # Auth logs
   sudo tail -100 /var/log/auth.log
   
   # System logs
   sudo journalctl -xe
   
   # Bot logs
   pm2 logs geotiers-bot --lines 200
   ```

4. **გადააინსტალირეთ სისტემა** (თუ საჭიროა)

### თუ Bot არასწორად მუშაობს

```bash
# Check bot status
pm2 status

# Check logs
pm2 logs geotiers-bot --lines 100

# Check system resources
htop
df -h

# Restart bot
pm2 restart geotiers-bot

# Full restart
pm2 kill
pm2 start ecosystem.config.js
```

---

## ✅ უსაფრთხოების Checklist

### საწყისი Setup
- [ ] SSH Keys კონფიგურირებული
- [ ] Root login გამორთული
- [ ] SSH პორტი შეცვლილი (optional)
- [ ] UFW Firewall გააქტიურებული
- [ ] Fail2Ban დაინსტალირებული
- [ ] `.env` ფაილის permissions სწორია (600)
- [ ] ახალი Discord Token production-სთვის
- [ ] `.env` დამატებულია `.gitignore`-ში

### რეგულარული მოვლა
- [ ] ყოველკვირეული სისტემის განახლება
- [ ] ყოველთვიური dependencies განახლება
- [ ] ყოველთვიური backup-ების შექმნა
- [ ] ლოგების რეგულარული შემოწმება
- [ ] რესურსების მონიტორინგი

### Emergency Contacts
- VPS Provider Support
- Discord Developer Support
- Backup Admin Contact

---

## 📚 დამატებითი რესურსები

- [Discord Bot Best Practices](https://discord.com/developers/docs/topics/community-resources)
- [Linux Security Guide](https://www.cyberciti.biz/tips/linux-security.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [UFW Guide](https://help.ubuntu.com/community/UFW)

---

**🔒 დაიმახსოვრეთ: უსაფრთხოება არის პროცესი, არა მოვლენა!**
