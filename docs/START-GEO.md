# 🚀 VPS-ზე Bot-ის გაშვება - სწრაფი გაიდი

## ⚡ 5 წუთში ონლაინში!

### 📋 რა გჭირდებათ:

1. ✅ VPS სერვერი (Ubuntu/Debian)
2. ✅ SSH წვდომა VPS-ზე
3. ✅ Discord Bot Token (ახალი!)

---

## 🎯 ნაბიჯები

### 1️⃣ VPS-ზე დაკავშირება

Windows PowerShell-ში:
```powershell
ssh root@YOUR_VPS_IP
```

შეიყვანეთ პაროლი.

---

### 2️⃣ VPS-ის მომზადება

VPS-ზე გაუშვით:

```bash
# სისტემის განახლება
sudo apt update && sudo apt upgrade -y

# Bun-ის დაინსტალება
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc

# Node.js და PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Firewall
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow 22/tcp
echo "y" | sudo ufw enable
```

---

### 3️⃣ Bot-ის ფაილების ატვირთვა

**ვარიანტი A: Windows PowerShell-დან**

ახალ PowerShell ფანჯარაში (არა VPS-ზე):
```powershell
scp -r C:\Users\shaka\OneDrive\Desktop\geotiers-bot root@YOUR_VPS_IP:/root/
```

**ვარიანტი B: ხელით (FileZilla/WinSCP)**

1. გახსენით FileZilla
2. დაუკავშირდით VPS-ს
3. ატვირთეთ `geotiers-bot` ფოლდერი `/root/` დირექტორიაში

---

### 4️⃣ Discord Token-ის შექმნა

⚠️ **მნიშვნელოვანი:** შექმენით **ახალი** token!

1. გადადით: https://discord.com/developers/applications
2. აირჩიეთ თქვენი Application
3. Bot → Reset Token
4. დააკოპირეთ ახალი token (დაიმახსოვრეთ!)

---

### 5️⃣ .env ფაილის შექმნა

VPS-ზე:
```bash
cd ~/geotiers-bot
nano .env
```

ჩასვით (თქვენი token-ით):
```env
DISCORD_TOKEN=YOUR_NEW_TOKEN_HERE
CLIENT_ID=1462383865372086366
GUILD_ID=1451267296428560455
```

**შენახვა:**
- დააჭირეთ `Ctrl + X`
- დააჭირეთ `Y`
- დააჭირეთ `Enter`

---

### 6️⃣ Bot-ის დაინსტალება

```bash
cd ~/geotiers-bot

# Dependencies
bun install

# Commands Deploy
bun run deploy
```

---

### 7️⃣ Bot-ის გაშვება PM2-ით

```bash
# გაშვება
pm2 start ecosystem.config.js

# Auto-start კონფიგურაცია
pm2 startup
# გაუშვით ბრძანება რომელსაც PM2 დაგიბეჭდავთ

pm2 save
```

---

### 8️⃣ შემოწმება

```bash
# სტატუსი
pm2 status

# ლოგები
pm2 logs geotiers-bot
```

თუ ყველაფერი კარგადაა, Discord-ში თქვენი bot უნდა იყოს **ონლაინში**! 🎉

---

## 🔧 სასარგებლო ბრძანებები

```bash
# სტატუსის ნახვა
pm2 status

# ლოგების ნახვა
pm2 logs geotiers-bot

# რესტარტი
pm2 restart geotiers-bot

# გაჩერება
pm2 stop geotiers-bot

# მონიტორინგი
pm2 monit
```

---

## 🔄 Bot-ის განახლება

როცა კოდს შეცვლით:

**Windows-დან:**
```powershell
.\deploy-to-vps.ps1 -VpsIp YOUR_VPS_IP
```

**ხელით:**
```bash
# Windows-დან ფაილების ატვირთვა
scp -r C:\Users\shaka\OneDrive\Desktop\geotiers-bot\src root@YOUR_VPS_IP:/root/geotiers-bot/

# VPS-ზე
ssh root@YOUR_VPS_IP
cd ~/geotiers-bot
bun install
bun run deploy  # თუ commands შეიცვალა
pm2 restart geotiers-bot
```

---

## ❗ პრობლემები?

### Bot არ ჩანს ონლაინში:

```bash
# ლოგების შემოწმება
pm2 logs geotiers-bot --lines 50

# რესტარტი
pm2 restart geotiers-bot
```

### "Module not found":

```bash
cd ~/geotiers-bot
rm -rf node_modules
bun install
pm2 restart geotiers-bot
```

### Token არასწორია:

```bash
nano ~/geotiers-bot/.env
# შეცვალეთ DISCORD_TOKEN
# Ctrl+X, Y, Enter

pm2 restart geotiers-bot
```

---

## 📚 დეტალური დოკუმენტაცია

- **სრული გაიდი:** [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md)
- **სწრაფი ბრძანებები:** [QUICK-START.md](QUICK-START.md)
- **უსაფრთხოება:** [SECURITY.md](SECURITY.md)
- **პრობლემები:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **ყველა დოკუმენტი:** [DEPLOYMENT-INDEX.md](DEPLOYMENT-INDEX.md)

---

## ✅ Checklist

- [ ] VPS-ზე დავუკავშირდი
- [ ] Bun, Node.js, PM2 დავაინსტალირე
- [ ] Bot-ის ფაილები ავტვირთე
- [ ] ახალი Discord Token შევქმენი
- [ ] .env ფაილი შევქმენი
- [ ] `bun install` გავუშვი
- [ ] `bun run deploy` გავუშვი
- [ ] PM2-ით bot გავუშვი
- [ ] `pm2 startup` და `pm2 save` გავაკეთე
- [ ] Bot Discord-ში ონლაინია! ✅

---

**🎉 გილოცავთ! თქვენი Bot ახლა 24/7 მუშაობს VPS-ზე!**

დამატებითი დახმარებისთვის იხილეთ [DEPLOYMENT-INDEX.md](DEPLOYMENT-INDEX.md)
