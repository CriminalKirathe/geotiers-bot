# 📊 VPS Deployment - ვიზუალური გაიდი

## 🗺️ Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Deployment Process                    │
└─────────────────────────────────────────────────────────────┘

1️⃣ VPS Setup
   ┌──────────────┐
   │ VPS Provider │ → შეიძინეთ VPS (DigitalOcean, Vultr, etc.)
   └──────────────┘
          ↓
   ┌──────────────┐
   │  SSH Access  │ → ssh root@your_vps_ip
   └──────────────┘
          ↓
   ┌──────────────┐
   │ Install Deps │ → Bun, Node.js, PM2
   └──────────────┘

2️⃣ Bot Preparation
   ┌──────────────┐
   │ Discord Dev  │ → შექმენით ახალი Token
   └──────────────┘
          ↓
   ┌──────────────┐
   │ Upload Files │ → SCP ან Git
   └──────────────┘
          ↓
   ┌──────────────┐
   │  Create .env │ → Token, Client ID, Guild ID
   └──────────────┘

3️⃣ Bot Deployment
   ┌──────────────┐
   │ bun install  │ → Dependencies
   └──────────────┘
          ↓
   ┌──────────────┐
   │  bun deploy  │ → Discord Commands
   └──────────────┘
          ↓
   ┌──────────────┐
   │  PM2 Start   │ → 24/7 Running
   └──────────────┘
          ↓
   ┌──────────────┐
   │ Bot Online! 🎉│
   └──────────────┘
```

---

## 📁 ფაილების სტრუქტურა

```
geotiers-bot/
│
├── 📚 Documentation (წაიკითხეთ ეს!)
│   ├── START-GEO.md          ⭐ დაიწყეთ აქედან! (ქართული)
│   ├── VPS-DEPLOYMENT.md     📖 სრული გაიდი
│   ├── QUICK-START.md        ⚡ სწრაფი ბრძანებები
│   ├── SECURITY.md           🔒 უსაფრთხოება
│   ├── TROUBLESHOOTING.md    🔧 პრობლემების მოგვარება
│   ├── DEPLOYMENT-INDEX.md   📋 ყველა დოკუმენტი
│   └── VISUAL-GUIDE.md       📊 ეს ფაილი
│
├── 🛠️ Scripts & Config
│   ├── vps-setup.sh          🐧 VPS Setup (Linux)
│   ├── deploy-to-vps.ps1     💻 Deploy (Windows)
│   ├── ecosystem.config.js   ⚙️ PM2 Config
│   └── .env.example          📝 Environment Template
│
├── 📦 Bot Files
│   ├── package.json          Dependencies
│   ├── .env                  🔒 Your Secrets (gitignored)
│   └── src/
│       ├── index.js          Main Bot File
│       ├── config.json       Bot Configuration
│       ├── deploy-commands.js
│       ├── giveaways.json
│       └── tester-stats.json
│
└── 🔧 Other
    ├── .gitignore
    ├── README.md
    └── node_modules/
```

---

## 🎯 რომელი ფაილი რისთვის?

### 🚀 თუ პირველად ათავსებთ:
```
START-GEO.md (ქართული, 5 წუთი) → VPS-DEPLOYMENT.md (დეტალური)
```

### ⚡ თუ სწრაფად გინდათ:
```
QUICK-START.md → Copy-Paste Commands
```

### 🔒 Production-ისთვის:
```
VPS-DEPLOYMENT.md → SECURITY.md → TROUBLESHOOTING.md
```

### 💻 Windows-დან Deploy:
```
deploy-to-vps.ps1 -VpsIp YOUR_IP
```

### 🐧 VPS Setup:
```
vps-setup.sh (ავტომატური ინსტალაცია)
```

---

## 🔄 Deployment Workflow

### პირველი Deployment:

```bash
# 1. VPS-ზე
ssh root@your_vps_ip
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/geotiers-bot/main/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh

# 2. ფაილების ატვირთვა (Windows-დან)
scp -r C:\Users\shaka\OneDrive\Desktop\geotiers-bot root@YOUR_VPS_IP:/root/

# 3. VPS-ზე
cd ~/geotiers-bot
nano .env  # შექმენით .env ფაილი
bun install
bun run deploy
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### განახლება:

```bash
# Windows-დან
.\deploy-to-vps.ps1 -VpsIp YOUR_VPS_IP

# ან ხელით
scp -r ./src root@YOUR_VPS_IP:/root/geotiers-bot/
ssh root@YOUR_VPS_IP "cd ~/geotiers-bot && bun install && pm2 restart geotiers-bot"
```

---

## 📊 PM2 Process Flow

```
┌─────────────────────────────────────────────────┐
│              PM2 Process Manager                 │
└─────────────────────────────────────────────────┘

pm2 start ecosystem.config.js
         ↓
   ┌─────────────┐
   │ Bot Process │ ← PM2 monitors
   └─────────────┘
         ↓
   ┌─────────────┐
   │   Running   │ ← Auto-restart on crash
   └─────────────┘
         ↓
   ┌─────────────┐
   │   Logging   │ → ~/.pm2/logs/
   └─────────────┘
         ↓
   ┌─────────────┐
   │ Monitoring  │ → pm2 monit
   └─────────────┘

Commands:
  pm2 status          → Check status
  pm2 logs            → View logs
  pm2 restart         → Restart bot
  pm2 stop            → Stop bot
  pm2 monit           → Real-time monitoring
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────┐
│              Security Stack                      │
└─────────────────────────────────────────────────┘

Layer 1: Network
  ├── UFW Firewall      → Block unwanted ports
  └── Fail2Ban          → Brute force protection

Layer 2: SSH
  ├── SSH Keys          → No password login
  ├── Custom Port       → Not default 22
  └── Root Disabled     → Use sudo user

Layer 3: Application
  ├── .env Protected    → chmod 600
  ├── New Token         → Not dev token
  └── .gitignore        → No secrets in Git

Layer 4: Monitoring
  ├── PM2 Logs          → Track activity
  ├── System Logs       → /var/log/auth.log
  └── Resource Monitor  → htop, pm2 monit
```

---

## 📈 Resource Usage

### Minimum Requirements:
```
CPU:  1 Core
RAM:  512 MB
Disk: 10 GB
```

### Recommended:
```
CPU:  2 Cores
RAM:  1 GB
Disk: 20 GB
```

### Bot Resource Usage:
```
┌─────────────────────────────────┐
│ Typical Bot Usage               │
├─────────────────────────────────┤
│ RAM:    50-150 MB               │
│ CPU:    1-5%                    │
│ Disk:   ~500 MB (with deps)     │
└─────────────────────────────────┘
```

---

## 🎯 Quick Reference

### Essential Commands:

```bash
# Status
pm2 status

# Logs
pm2 logs geotiers-bot

# Restart
pm2 restart geotiers-bot

# Monitor
pm2 monit

# System Resources
htop
df -h
```

### Emergency:

```bash
# Full Restart
pm2 kill
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Reinstall Dependencies
cd ~/geotiers-bot
rm -rf node_modules
bun install
pm2 restart geotiers-bot
```

---

## 🗺️ დოკუმენტაციის რუკა

```
START-GEO.md (დაიწყეთ აქ!)
    ↓
    ├─→ VPS-DEPLOYMENT.md (სრული გაიდი)
    │       ↓
    │       ├─→ SECURITY.md (უსაფრთხოება)
    │       └─→ TROUBLESHOOTING.md (პრობლემები)
    │
    ├─→ QUICK-START.md (სწრაფი ბრძანებები)
    │
    └─→ DEPLOYMENT-INDEX.md (ყველა დოკუმენტი)
```

---

## ✅ Success Checklist

```
□ VPS შეძენილი
□ SSH წვდომა მუშაობს
□ START-GEO.md წაკითხული
□ vps-setup.sh გაშვებული
□ ახალი Discord Token შექმნილი
□ Bot ფაილები ატვირთული
□ .env ფაილი შექმნილი
□ bun install გაშვებული
□ bun run deploy გაშვებული
□ PM2-ით bot გაშვებული
□ pm2 startup & save გაკეთებული
□ Bot Discord-ში ონლაინია ✅
□ SECURITY.md წაკითხული
□ Firewall კონფიგურირებული
□ Backup გაკეთებული
```

---

## 🎓 Learning Path

### დამწყები:
1. START-GEO.md
2. VPS-DEPLOYMENT.md
3. TROUBLESHOOTING.md

### გამოცდილი:
1. QUICK-START.md
2. deploy-to-vps.ps1
3. SECURITY.md

### Expert:
1. ecosystem.config.js customization
2. Advanced PM2 features
3. Custom monitoring setup

---

## 📞 დახმარება

თუ რაიმე გაუგებარია:

1. **იხილეთ:** [DEPLOYMENT-INDEX.md](DEPLOYMENT-INDEX.md)
2. **შეამოწმეთ:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. **წაიკითხეთ:** [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md)

---

**🎉 წარმატებები VPS Deployment-ში!**
