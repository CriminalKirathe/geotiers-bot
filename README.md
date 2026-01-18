# GeoTiers Discord Bot

Professional Discord bot for GeoTiers Minecraft Server with tier testing, tickets, giveaways, and more.

> **🚀 VPS-ზე გაშვება?** იხილეთ [START-GEO.md](START-GEO.md) სწრაფი ინსტრუქციებისთვის!

## Features

- 🎮 **Tier Testing System** - Automated tier role management
- 🎫 **Support Tickets** - Full ticket system with transcripts
- 🎉 **Giveaways** - Advanced giveaway system with boosted roles
- 📊 **Tester Leaderboard** - Track and reward active testers
- 🔧 **Moderation Tools** - Mute, timeout, and more
- 📈 **Server Stats** - Server info and member counts

## Installation

```bash
# Install dependencies
bun install

# Deploy commands
bun run deploy

# Start bot
bun run start
```

## Environment Variables

Create a `.env` file:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

## Configuration

Edit `src/config.json` to configure:
- Tester roles
- Result channels
- Gamemode roles
- Tier roles
- Ticket system
- Giveaway boosted roles

## Commands

### Testing
- `/result` - Submit testing results

### Tickets
- `/ticket-setup` - Setup ticket panel
- `/close` - Close ticket
- `/add` - Add user to ticket

### Giveaways
- `/giveaway` - Start giveaway
- `/gend` - End giveaway early

### Moderation
- `/mute` - Timeout user

### Utility
- `/serverinfo` - Server information
- `/membercount` - Member statistics
- `/leaderboard` - Tester leaderboard

### Admin
- `/reset-stats` - Reset monthly stats

## 🚀 VPS Deployment

To deploy this bot on a VPS for 24/7 uptime:

### Quick Start
1. **Read the deployment guide**: See [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md) for detailed instructions
2. **Quick reference**: See [QUICK-START.md](QUICK-START.md) for copy-paste commands
3. **Automated deployment**: Use `deploy-to-vps.ps1` script from Windows

### Deploy from Windows
```powershell
# Run this from PowerShell
.\deploy-to-vps.ps1 -VpsIp YOUR_VPS_IP
```

### Manual VPS Setup
```bash
# On your VPS
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/geotiers-bot/main/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

See [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md) for complete instructions.

## Tech Stack

- **Runtime**: Bun
- **Library**: Discord.js v14
- **Language**: JavaScript
- **Process Manager**: PM2 (for VPS deployment)

## Files

- `src/index.js` - Main bot file
- `src/config.json` - Bot configuration
- `src/deploy-commands.js` - Command deployment script
- `ecosystem.config.js` - PM2 configuration
- `vps-setup.sh` - VPS setup automation script
- `deploy-to-vps.ps1` - Windows deployment script

## License

ISC

