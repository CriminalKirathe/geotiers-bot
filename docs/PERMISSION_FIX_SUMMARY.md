# /result Command Permission Fix - Summary

## Problem (პრობლემა)
Vanilla testers და სხვა gamemode testers ვერ ხედავდნენ `/result` command-ს Discord-ში, მიუხედავად იმისა, რომ მათ ჰქონდათ შესაბამისი როლები (მაგ. "Vanilla Tester").

## Root Cause (მიზეზი)
`deploy-commands.js` ფაილში, `/result` command-ს ჰქონდა შემდეგი permission requirement:
```javascript
.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
```

ეს ნიშნავს, რომ Discord ავტომატურად მალავს ამ command-ს ყველა იმ მომხმარებლისგან, ვისაც არ აქვს "Manage Roles" permission. Vanilla testers-ს და სხვა gamemode testers-ს არ აქვთ ეს permission, ამიტომ command საერთოდ არ უჩანდათ.

## Solution (გადაწყვეტა)
✅ **წაშლილია** `.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)` ხაზი `/result` command-დან.

ახლა command ყველას ეჩვენება, მაგრამ `index.js` ფაილში არსებული custom permission logic (ხაზები 390-421) განსაზღვრავს თუ ვინ შეძლებს მის გამოყენებას:

1. **Administrators** - შეუძლიათ ყველა gamemode-ისთვის
2. **Gamemode-specific testers** - მხოლოდ იმ gamemode-ებისთვის, რომელზეც აქვთ როლი
   - Vanilla Tester → მხოლოდ `vanilla` gamemode
   - UHC Tester → მხოლოდ `uhc` gamemode
   - და ა.შ.

## Changes Made (ცვლილებები)
### File: `src/deploy-commands.js`
- **Line 8 removed**: `.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)`

## Next Steps (შემდეგი ნაბიჯები)
🔴 **IMPORTANT**: Commands-ების განახლება საჭიროა Discord-ში!

### Option 1: Deploy Locally (თუ გაქვს bot token)
```bash
node src/deploy-commands.js
```

### Option 2: Deploy on VPS (თუ bot VPS-ზე მუშაობს)
1. Upload ახალი `deploy-commands.js` ფაილი VPS-ზე
2. SSH-ით დაუკავშირდი VPS-ს
3. გადი bot-ის directory-ში
4. გაუშვი: `node src/deploy-commands.js`

### Option 3: Restart Bot (თუ bot ავტომატურად რეგისტრირებს commands-ებს)
თუ bot-ი startup-ზე რეგისტრირებს commands-ებს, უბრალოდ გადატვირთე:
```bash
pm2 restart geotiers-bot
# ან
npm start
```

## Verification (შემოწმება)
Commands-ების deploy-ის შემდეგ:
1. Discord-ში დაწერე `/result` 
2. Vanilla Tester როლის მქონე მომხმარებელმა უნდა დაინახოს command
3. Gamemode option-ში მხოლოდ `VANILLA` უნდა გამოჩნდეს (autocomplete)
4. სხვა gamemode-ების testers-მა უნდა დაინახონ მხოლოდ მათი gamemode-ები

## Technical Details (ტექნიკური დეტალები)
### Permission Flow:
1. **Discord Level**: Command ყველას ჩანს (no default permissions)
2. **Bot Level** (`index.js` lines 390-421):
   - შემოწმება: არის თუ არა მომხმარებელი admin ან აქვს რომელიმე tester role
   - თუ არა → "თქვენ არ გაქვთ ამ ქომანდის გამოყენების უფლება"
3. **Gamemode Level** (`index.js` lines 409-421):
   - შემოწმება: აქვს თუ არა მომხმარებელს უფლება კონკრეტული gamemode-ისთვის
   - თუ არა → "თქვენ არ გაქვთ უფლება გამოიყენოთ X გეიმმოუდი"
4. **Autocomplete** (`index.js` lines 20-42):
   - Gamemode dropdown-ში მხოლოდ ის gamemode-ები ჩანს, რომელზეც მომხმარებელს აქვს როლი

### Config Structure:
```json
{
  "testerRoleIds": ["1436429621875965982"],  // General tester role
  "gamemodeRoles": {
    "vanilla": ["1436431038057418842"],      // Vanilla Tester role
    "uhc": ["1436431321575718932"],          // UHC Tester role
    // ... etc
  }
}
```

## Error Encountered (წარმოქმნილი შეცდომა)
Deploy-ის დროს მივიღეთ `401: Unauthorized` error, რადგან `.env` ფაილში `DISCORD_TOKEN` არის placeholder ("here....").

**Fix**: განაახლე `.env` ფაილი რეალური bot token-ით ან deploy გააკეთე VPS-ზე სადაც სწორი token არის.
