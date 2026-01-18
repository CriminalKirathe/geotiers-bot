# 🔧 Troubleshooting Guide - სწრაფი პრობლემების მოგვარება

## 🚨 ხშირი პრობლემები და მათი გადაჭრა

### 1. Bot არ ჩანს ონლაინში Discord-ში

#### შემოწმება:
```bash
# VPS-ზე შედით
ssh root@your_vps_ip

# შეამოწმეთ PM2 სტატუსი
pm2 status
```

#### თუ status არის "stopped" ან "errored":
```bash
# ლოგების ნახვა
pm2 logs geotiers-bot --lines 50

# Bot-ის რესტარტი
pm2 restart geotiers-bot

# თუ არ მუშაობს, სცადეთ ხელით
cd ~/geotiers-bot
bun run start
```

#### ყველაზე ხშირი მიზეზები:

**A. არასწორი Discord Token**
```bash
# შეამოწმეთ .env ფაილი
cat ~/geotiers-bot/.env

# თუ token არასწორია:
nano ~/geotiers-bot/.env
# შეცვალეთ DISCORD_TOKEN
# შენახვა: Ctrl+X, Y, Enter

pm2 restart geotiers-bot
```

**B. Dependencies არ არის დაინსტალირებული**
```bash
cd ~/geotiers-bot
bun install
pm2 restart geotiers-bot
```

**C. Node Modules დაზიანებული**
```bash
cd ~/geotiers-bot
rm -rf node_modules
bun install
pm2 restart geotiers-bot
```

---

### 2. "Module not found" შეცდომა

```bash
cd ~/geotiers-bot

# წაშალეთ node_modules
rm -rf node_modules

# წაშალეთ lock ფაილები
rm -f bun.lockb package-lock.json

# თავიდან დააინსტალირეთ
bun install

# რესტარტი
pm2 restart geotiers-bot
```

---

### 3. Commands არ მუშაობს Discord-ში

#### შემოწმება:
```bash
cd ~/geotiers-bot

# Commands-ის თავიდან deploy
bun run deploy

# Bot-ის რესტარტი
pm2 restart geotiers-bot
```

#### თუ კვლავ არ მუშაობს:

1. **შეამოწმეთ Bot Permissions Discord-ში:**
   - გადადით https://discord.com/developers/applications
   - აირჩიეთ თქვენი Application
   - Bot → Privileged Gateway Intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent

2. **შეამოწმეთ Bot Scope:**
   - OAuth2 → URL Generator
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: Administrator (ან საჭირო permissions)

3. **თავიდან დაამატეთ Bot Server-ზე:**
   - Generate ახალი invite URL
   - დაამატეთ bot თქვენს server-ზე

---

### 4. PM2 არ მუშაობს

```bash
# PM2-ის სრული რესტარტი
pm2 kill

# თავიდან გაშვება
cd ~/geotiers-bot
pm2 start ecosystem.config.js

# Auto-start კონფიგურაცია
pm2 startup
pm2 save

# სტატუსის შემოწმება
pm2 status
```

---

### 5. VPS-ზე დაკავშირება არ მუშაობს

#### "Connection refused":
```bash
# შეამოწმეთ VPS IP მისამართი
ping your_vps_ip

# სცადეთ სხვა SSH პორტი (თუ შეცვლილია)
ssh -p 2222 root@your_vps_ip
```

#### "Permission denied":
```bash
# თუ იყენებთ SSH key-ს
ssh -i path/to/your/key.pem root@your_vps_ip

# თუ password authentication გამორთულია
# დაუკავშირდით VPS provider-ის console-ს
```

---

### 6. Bot იყენებს ძალიან ბევრ RAM-ს

```bash
# რესურსების შემოწმება
pm2 monit

# ან
htop

# თუ RAM მეტისმეტად მაღალია:
pm2 restart geotiers-bot

# Memory limit-ის დაყენება
pm2 delete geotiers-bot
pm2 start ecosystem.config.js --max-memory-restart 300M
pm2 save
```

---

### 7. Bot რესტარტდება ავტომატურად

```bash
# ლოგების შემოწმება
pm2 logs geotiers-bot --lines 100

# ყველაზე ხშირი მიზეზები:
# - Memory leak (იხ. #6)
# - Unhandled errors (შეამოწმეთ ლოგები)
# - VPS რესურსების ნაკლებობა
```

---

### 8. Disk Space სავსეა

```bash
# შეამოწმეთ დისკის სივრცე
df -h

# გაასუფთავეთ PM2 ლოგები
pm2 flush

# წაშალეთ ძველი ლოგები
rm -rf ~/geotiers-bot/logs/*.log

# გაასუფთავეთ apt cache
sudo apt clean
sudo apt autoremove -y

# იპოვეთ დიდი ფაილები
du -h --max-depth=1 ~ | sort -hr | head -20
```

---

### 9. Bot არ პასუხობს ბრძანებებს

```bash
# შეამოწმეთ bot-ის სტატუსი
pm2 status

# ლოგების ნახვა
pm2 logs geotiers-bot --lines 50

# შეამოწმეთ Discord API status
# https://discordstatus.com/

# Bot-ის რესტარტი
pm2 restart geotiers-bot
```

---

### 10. "Error: Cannot find module" after update

```bash
cd ~/geotiers-bot

# Dependencies-ის თავიდან ინსტალაცია
rm -rf node_modules
bun install

# თუ კვლავ არ მუშაობს
rm -f bun.lockb
bun install

pm2 restart geotiers-bot
```

---

## 🔍 დიაგნოსტიკის ბრძანებები

### Bot სტატუსი
```bash
# PM2 სტატუსი
pm2 status

# დეტალური ინფორმაცია
pm2 show geotiers-bot

# რეალურ დროში მონიტორინგი
pm2 monit
```

### ლოგების ნახვა
```bash
# ბოლო 50 ხაზი
pm2 logs geotiers-bot --lines 50

# მხოლოდ errors
pm2 logs geotiers-bot --err

# რეალურ დროში
pm2 logs geotiers-bot

# ლოგების გასუფთავება
pm2 flush
```

### სისტემის რესურსები
```bash
# CPU და RAM
htop

# დისკის სივრცე
df -h

# მეხსიერება
free -h

# Network
netstat -tuln
```

### Bot ფაილების შემოწმება
```bash
# .env ფაილი
cat ~/geotiers-bot/.env

# config.json
cat ~/geotiers-bot/src/config.json

# package.json
cat ~/geotiers-bot/package.json

# ფაილების permissions
ls -la ~/geotiers-bot/
```

---

## 🆘 Emergency Commands

### სრული რესტარტი
```bash
# PM2-ის სრული რესტარტი
pm2 kill
cd ~/geotiers-bot
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Bot-ის სრული თავიდან დაყენება
```bash
cd ~/geotiers-bot

# Backup .env
cp .env .env.backup

# Dependencies-ის წაშლა
rm -rf node_modules
rm -f bun.lockb

# თავიდან ინსტალაცია
bun install

# Commands deploy
bun run deploy

# .env-ის აღდგენა
cp .env.backup .env

# Bot-ის გაშვება
pm2 restart geotiers-bot
```

### VPS-ის რესტარტი (ბოლო საშუალება)
```bash
# Auto-start-ის დარწმუნება
pm2 startup
pm2 save

# რესტარტი
sudo reboot

# 2-3 წუთის შემდეგ დაუკავშირდით
ssh root@your_vps_ip

# შეამოწმეთ bot
pm2 status
```

---

## 📋 Troubleshooting Checklist

როცა რაიმე არ მუშაობს, გაიარეთ ეს ნაბიჯები:

1. **შეამოწმეთ PM2 სტატუსი:**
   ```bash
   pm2 status
   ```

2. **ნახეთ ლოგები:**
   ```bash
   pm2 logs geotiers-bot --lines 50
   ```

3. **შეამოწმეთ .env ფაილი:**
   ```bash
   cat ~/geotiers-bot/.env
   ```

4. **შეამოწმეთ რესურსები:**
   ```bash
   htop
   df -h
   ```

5. **სცადეთ რესტარტი:**
   ```bash
   pm2 restart geotiers-bot
   ```

6. **თუ არ მუშაობს, dependencies:**
   ```bash
   cd ~/geotiers-bot
   rm -rf node_modules
   bun install
   pm2 restart geotiers-bot
   ```

7. **ბოლო საშუალება - სრული რესტარტი:**
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

---

## 🔗 სასარგებლო ბმულები

- **Discord Status:** https://discordstatus.com/
- **Discord Developer Portal:** https://discord.com/developers/applications
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **Bun Docs:** https://bun.sh/docs

---

## 💡 რჩევები

1. **ყოველთვის შეინახეთ ლოგები პრობლემის დროს:**
   ```bash
   pm2 logs geotiers-bot --lines 200 > ~/bot-error.log
   ```

2. **რეგულარულად შექმენით backup:**
   ```bash
   cd ~
   tar -czf geotiers-bot-backup-$(date +%Y%m%d).tar.gz geotiers-bot/
   ```

3. **მონიტორინგი რეგულარულად:**
   ```bash
   pm2 monit
   ```

4. **განახლებები ფრთხილად:**
   - ჯერ შექმენით backup
   - შემდეგ განაახლეთ
   - შეამოწმეთ ლოგები

---

**თუ პრობლემა კვლავ არსებობს:**
1. შეინახეთ ლოგები
2. შეამოწმეთ Discord Developer Portal
3. გადაამოწმეთ VPS რესურსები
4. სცადეთ bot-ის ხელით გაშვება: `bun run start`

**🎯 90% პრობლემებისა იხსნება PM2 რესტარტით ან dependencies-ის თავიდან ინსტალაციით!**
