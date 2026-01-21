# GeoTiers Bot - Windows to VPS Deployment Script
# Run this from PowerShell on your Windows machine

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root"
)

Write-Host "🚀 GeoTiers Bot - VPS Deployment Tool" -ForegroundColor Cyan
Write-Host ""

$LocalPath = "C:\Users\shaka\OneDrive\Desktop\CODES\geotiers-bot"
$RemotePath = "/root/geotiers-bot"

# Check if local path exists
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Error: Bot directory not found at $LocalPath" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  Local Path:  $LocalPath"
Write-Host "  VPS IP:      $VpsIp"
Write-Host "  VPS User:    $VpsUser"
Write-Host "  Remote Path: $RemotePath"
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 Uploading files to VPS..." -ForegroundColor Cyan

# Files to exclude
$excludeFiles = @(
    "node_modules",
    ".env",
    "*.log",
    "logs",
    ".git",
    ".pm2",
    "*.backup",
    "*.tar.gz"
)

# Create exclude string for scp
$excludeString = $excludeFiles | ForEach-Object { "--exclude='$_'" } | Join-String -Separator " "

# Upload files using scp
try {
    # Create remote directory if it doesn't exist
    Write-Host "  Creating remote directory..." -ForegroundColor Gray
    ssh "${VpsUser}@${VpsIp}" "mkdir -p $RemotePath"
    
    # Upload files
    Write-Host "  Uploading files (this may take a moment)..." -ForegroundColor Gray
    scp -r "$LocalPath\*" "${VpsUser}@${VpsIp}:${RemotePath}/"
    
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error uploading files: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up bot on VPS..." -ForegroundColor Cyan

# SSH commands to run on VPS
$setupCommands = @"
cd $RemotePath && \
echo '📦 Installing dependencies...' && \
bun install && \
echo '✅ Dependencies installed' && \
echo '' && \
echo '🚀 Deploying commands...' && \
bun run deploy && \
echo '✅ Commands deployed' && \
echo '' && \
echo '🔄 Restarting bot...' && \
pm2 restart geotiers-bot || pm2 start ecosystem.config.js && \
echo '✅ Bot restarted' && \
echo '' && \
pm2 status
"@

try {
    ssh "${VpsUser}@${VpsIp}" $setupCommands
    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during setup: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check bot status: ssh ${VpsUser}@${VpsIp} 'pm2 status'"
Write-Host "  2. View logs: ssh ${VpsUser}@${VpsIp} 'pm2 logs geotiers-bot'"
Write-Host "  3. Monitor: ssh ${VpsUser}@${VpsIp} 'pm2 monit'"
Write-Host ""
Write-Host "🎉 Your bot is now running on VPS!" -ForegroundColor Green
