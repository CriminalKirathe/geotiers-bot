# 📚 GeoTiers Bot - VPS Deployment სახელმძღვანელოები

ეს დირექტორია შეიცავს ყველა საჭირო დოკუმენტაციას და ინსტრუმენტს თქვენი Discord Bot-ის VPS-ზე განსათავსებლად.

## 📖 დოკუმენტაცია

### 🚀 [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md)
**სრული განთავსების გაიდი**
- ნაბიჯ-ნაბიჯ ინსტრუქციები VPS-ზე bot-ის განსათავსებლად
- Bun, PM2, და სხვა dependencies-ის დაინსტალება
- Bot-ის კონფიგურაცია და გაშვება
- პრობლემების მოგვარება
- **იდეალურია:** პირველი განთავსებისთვის

### ⚡ [QUICK-START.md](QUICK-START.md)
**სწრაფი სახელმძღვანელო**
- Copy-paste ready ბრძანებები
- სწრაფი განთავსება
- ყოველდღიური PM2 ბრძანებები
- პრობლემების სწრაფი მოგვარება
- **იდეალურია:** გამოცდილი მომხმარებლებისთვის

### 🔒 [SECURITY.md](SECURITY.md)
**უსაფრთხოების გაიდი**
- Discord Token დაცვა
- VPS უსაფრთხოება (SSH, Firewall, Fail2Ban)
- Environment variables დაცვა
- მონიტორინგი და logging
- Incident response
- **იდეალურია:** production deployment-ისთვის

### 📋 [.env.example](.env.example)
**Environment ფაილის ნიმუში**
- Template თქვენი `.env` ფაილისთვის
- საჭირო ცვლადების ჩამონათვალი
- **გამოიყენეთ:** VPS-ზე `.env` ფაილის შესაქმნელად

## 🛠️ ავტომატიზაციის სკრიპტები

### 🐧 [vps-setup.sh](vps-setup.sh)
**Linux Setup Script**
- ავტომატურად აინსტალირებს ყველა dependency-ს
- აკონფიგურირებს firewall-ს
- ქმნის საჭირო დირექტორიებს
- **გამოიყენეთ VPS-ზე:**
  ```bash
  chmod +x vps-setup.sh
  sudo ./vps-setup.sh
  ```

### 💻 [deploy-to-vps.ps1](deploy-to-vps.ps1)
**Windows Deployment Script**
- ავტომატურად ატვირთავს ფაილებს VPS-ზე
- აინსტალირებს dependencies-ს
- რესტარტავს bot-ს
- **გამოიყენეთ Windows-დან:**
  ```powershell
  .\deploy-to-vps.ps1 -VpsIp YOUR_VPS_IP
  ```

### ⚙️ [ecosystem.config.js](ecosystem.config.js)
**PM2 Configuration**
- PM2 process manager-ის კონფიგურაცია
- Auto-restart და logging settings
- **გამოიყენეთ:**
  ```bash
  pm2 start ecosystem.config.js
  ```

## 🎯 სწრაფი დაწყება

### თუ პირველად ათავსებთ VPS-ზე:

1. **წაიკითხეთ:** [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md)
2. **გამოიყენეთ:** `vps-setup.sh` VPS-ზე
3. **შექმენით:** `.env` ფაილი (იხ. `.env.example`)
4. **გაუშვით:** bot PM2-ით
5. **წაიკითხეთ:** [SECURITY.md](SECURITY.md) უსაფრთხოებისთვის

### თუ უკვე გაქვთ VPS setup:

1. **გამოიყენეთ:** [QUICK-START.md](QUICK-START.md)
2. **ან გაუშვით:** `deploy-to-vps.ps1` Windows-დან

## 📊 ფაილების სტრუქტურა

```
geotiers-bot/
├── 📄 README.md                 # მთავარი README
├── 📄 VPS-DEPLOYMENT.md         # სრული deployment გაიდი
├── 📄 QUICK-START.md            # სწრაფი სახელმძღვანელო
├── 📄 SECURITY.md               # უსაფრთხოების გაიდი
├── 📄 DEPLOYMENT-INDEX.md       # ეს ფაილი
├── 📄 .env.example              # Environment template
├── 🔧 ecosystem.config.js       # PM2 config
├── 🐧 vps-setup.sh             # Linux setup script
├── 💻 deploy-to-vps.ps1        # Windows deploy script
├── 📦 package.json             # Dependencies
├── 🔒 .env                     # Your secrets (gitignored)
└── 📁 src/                     # Bot source code
    ├── index.js
    ├── config.json
    ├── deploy-commands.js
    ├── giveaways.json
    └── tester-stats.json
```

## ❓ რომელი დოკუმენტი მჭირდება?

| თქვენი სიტუაცია | დოკუმენტი |
|----------------|-----------|
| პირველად ვათავსებ VPS-ზე | [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md) |
| მჭირდება სწრაფი ბრძანებები | [QUICK-START.md](QUICK-START.md) |
| უსაფრთხოება მაინტერესებს | [SECURITY.md](SECURITY.md) |
| Windows-დან ვათავსებ | [deploy-to-vps.ps1](deploy-to-vps.ps1) |
| VPS-ს ვაყენებ | [vps-setup.sh](vps-setup.sh) |
| .env-ს ვქმნი | [.env.example](.env.example) |

## 🆘 დახმარება

### პრობლემების მოგვარება

1. **Bot არ ეშვება:**
   - შეამოწმეთ: `pm2 logs geotiers-bot`
   - იხ. [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md) - "პრობლემების მოგვარება" სექცია

2. **VPS-ზე დაკავშირება არ მუშაობს:**
   - შეამოწმეთ SSH credentials
   - იხ. [SECURITY.md](SECURITY.md) - "SSH უსაფრთხოება" სექცია

3. **Token არასწორია:**
   - შექმენით ახალი token Discord Developer Portal-ზე
   - იხ. [SECURITY.md](SECURITY.md) - "Discord Token უსაფრთხოება"

### სასარგებლო ბრძანებები

```bash
# Bot სტატუსი
pm2 status

# ლოგების ნახვა
pm2 logs geotiers-bot

# Bot რესტარტი
pm2 restart geotiers-bot

# რესურსების მონიტორინგი
pm2 monit
```

## 🔄 განახლების პროცესი

1. შეცვალეთ კოდი ლოკალურად
2. ატვირთეთ VPS-ზე:
   - **Windows:** `.\deploy-to-vps.ps1 -VpsIp YOUR_IP`
   - **Manual:** `scp -r ./src root@YOUR_IP:/root/geotiers-bot/`
3. VPS-ზე:
   ```bash
   cd ~/geotiers-bot
   bun install
   bun run deploy  # თუ commands შეიცვალა
   pm2 restart geotiers-bot
   ```

## 📞 მხარდაჭერა

- **Discord Developer Portal:** https://discord.com/developers/applications
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **Bun Docs:** https://bun.sh/docs

## ✅ Deployment Checklist

- [ ] VPS შეძენილი და მიღებული
- [ ] SSH წვდომა მუშაობს
- [ ] წაკითხული VPS-DEPLOYMENT.md
- [ ] vps-setup.sh გაშვებული
- [ ] Bot ფაილები ატვირთული
- [ ] .env ფაილი შექმნილი ახალი token-ით
- [ ] bun install გაშვებული
- [ ] bun run deploy გაშვებული
- [ ] PM2-ით bot გაშვებული
- [ ] pm2 startup და pm2 save გაკეთებული
- [ ] Bot Discord-ში ონლაინია
- [ ] წაკითხული SECURITY.md
- [ ] SSH keys კონფიგურირებული
- [ ] Firewall გააქტიურებული

---

**🎉 წარმატებული deployment-ის შემდეგ თქვენი bot 24/7 მუშაობს!**

დამატებითი კითხვების შემთხვევაში, იხილეთ შესაბამისი დოკუმენტაცია ზემოთ.
