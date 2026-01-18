# GeoTiers Bot - Quick Start Commands

## 🚀 VPS-ზე სწრაფი გაშვება (Copy-Paste Ready)

### 1️⃣ VPS-ზე დაკავშირება
```bash
ssh root@YOUR_VPS_IP
```

### 2️⃣ Setup Script-ის ჩამოტვირთვა და გაშვება
```bash
cd ~
curl -O https://raw.githubusercontent.com/CriminalKirathe/geotiers-bot/main/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh
```

ან ხელით:

```bash
# System update
sudo apt update && sudo apt upgrade -y

# Install Bun
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Setup firewall
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3️⃣ ბოტის ფაილების ატვირთვა

**ვარიანტი A: Git-ით (რეკომენდებული)**
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/geotiers-bot.git
cd geotiers-bot
```

**ვარიანტი B: SCP-ით (Windows PowerShell-დან)**
```powershell
scp -r C:\Users\shaka\OneDrive\Desktop\geotiers-bot root@YOUR_VPS_IP:/root/
```

### 4️⃣ Environment ფაილის შექმნა
```bash
cd ~/geotiers-bot
nano .env
```

ჩასვით:
```env
DISCORD_TOKEN=YOUR_NEW_TOKEN_HERE
CLIENT_ID=1462383865372086366
GUILD_ID=1451267296428560455
```

შენახვა: `Ctrl+X`, შემდეგ `Y`, შემდეგ `Enter`

⚠️ **მნიშვნელოვანი:** შექმენით ახალი Discord Token!
1. https://discord.com/developers/applications
2. აირჩიეთ თქვენი Bot
3. Bot → Reset Token → Copy

### 5️⃣ ბოტის დაინსტალება და გაშვება
```bash
cd ~/geotiers-bot

# Install dependencies
bun install

# Deploy commands
bun run deploy

# Test bot manually (Ctrl+C to stop)
bun run start

# Start with PM2 (production)
pm2 start ecosystem.config.js

# Enable auto-start on reboot
pm2 startup
pm2 save
```

### 6️⃣ სტატუსის შემოწმება
```bash
pm2 status
pm2 logs geotiers-bot
```

---

## 🔧 ყოველდღიური ბრძანებები

### PM2 Management
```bash
pm2 status                    # სტატუსის ნახვა
pm2 logs geotiers-bot        # ლოგების ნახვა
pm2 logs geotiers-bot --lines 100  # ბოლო 100 ხაზი
pm2 restart geotiers-bot     # რესტარტი
pm2 stop geotiers-bot        # გაჩერება
pm2 start geotiers-bot       # გაშვება
pm2 monit                    # რესურსების მონიტორინგი
```

### ბოტის განახლება
```bash
cd ~/geotiers-bot
git pull                     # ახალი კოდის ჩამოტვირთვა
bun install                  # dependencies განახლება
bun run deploy              # commands განახლება
pm2 restart geotiers-bot    # ბოტის რესტარტი
```

### ლოგების ნახვა
```bash
pm2 logs geotiers-bot --lines 50    # ბოლო 50 ხაზი
pm2 logs geotiers-bot --err         # მხოლოდ errors
pm2 flush                           # ლოგების გასუფთავება
```

### სისტემის მონიტორინგი
```bash
htop                        # CPU/RAM მონიტორინგი
df -h                       # დისკის სივრცე
free -h                     # RAM გამოყენება
pm2 monit                   # PM2 მონიტორინგი
```

---

## 🆘 პრობლემების მოგვარება

### ბოტი არ ეშვება
```bash
cd ~/geotiers-bot
pm2 logs geotiers-bot --lines 100
bun run start  # ხელით გაშვება შეცდომების სანახავად
```

### Module not found
```bash
cd ~/geotiers-bot
rm -rf node_modules
bun install
pm2 restart geotiers-bot
```

### Token არასწორია
```bash
nano .env  # შეცვალეთ token
pm2 restart geotiers-bot
```

### PM2 არ მუშაობს
```bash
pm2 kill
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

---

## 📊 სასარგებლო ინფორმაცია

### ფაილების მდებარეობა
- Bot files: `~/geotiers-bot/`
- PM2 logs: `~/.pm2/logs/`
- Environment: `~/geotiers-bot/.env`
- Config: `~/geotiers-bot/src/config.json`

### პორტები
- SSH: 22
- Bot არ საჭიროებს პორტის გახსნას (Discord WebSocket)

### რესურსები
- მინიმალური RAM: 512MB
- რეკომენდებული RAM: 1GB+
- დისკის სივრცე: ~500MB

---

## ✅ Checklist

- [ ] VPS-ზე დაკავშირება
- [ ] Bun დაინსტალირებული
- [ ] Node.js და PM2 დაინსტალირებული
- [ ] ბოტის ფაილები ატვირთული
- [ ] `.env` ფაილი შექმნილი ახალი token-ით
- [ ] `bun install` გაშვებული
- [ ] `bun run deploy` გაშვებული
- [ ] PM2-ით ბოტი გაშვებული
- [ ] `pm2 startup` და `pm2 save` გაკეთებული
- [ ] ბოტი Discord-ში ონლაინია ✅

---

**🎉 თქვენი ბოტი ახლა 24/7 მუშაობს!**
