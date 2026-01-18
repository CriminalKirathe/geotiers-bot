#!/bin/bash

# GeoTiers Bot - VPS Setup Script
# This script automates the VPS setup process

set -e  # Exit on error

echo "🚀 Starting GeoTiers Bot VPS Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_warning "This script should be run as root or with sudo"
    echo "Continuing anyway..."
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Install Git
echo "📥 Installing Git..."
apt install git -y
print_success "Git installed"

# Install Bun
echo "📥 Installing Bun runtime..."
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    
    # Add Bun to PATH
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    # Add to bashrc for persistence
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
    
    print_success "Bun installed"
else
    print_success "Bun already installed"
fi

# Install Node.js (for PM2)
echo "📥 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js already installed"
fi

# Install PM2
echo "📥 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Setup firewall
echo "🔒 Setting up firewall..."
if ! command -v ufw &> /dev/null; then
    apt install ufw -y
fi
ufw allow ssh
ufw allow 22/tcp
echo "y" | ufw enable
print_success "Firewall configured"

# Create bot directory
echo "📁 Setting up bot directory..."
BOT_DIR="$HOME/geotiers-bot"
if [ ! -d "$BOT_DIR" ]; then
    mkdir -p "$BOT_DIR"
    print_success "Bot directory created at $BOT_DIR"
else
    print_warning "Bot directory already exists"
fi

# Create logs directory
mkdir -p "$BOT_DIR/logs"
print_success "Logs directory created"

echo ""
echo "✅ VPS Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload your bot files to: $BOT_DIR"
echo "2. Create .env file with your Discord credentials"
echo "3. Run: cd $BOT_DIR && bun install"
echo "4. Run: bun run deploy"
echo "5. Run: pm2 start ecosystem.config.js"
echo "6. Run: pm2 startup && pm2 save"
echo ""
echo "📖 For detailed instructions, see VPS-DEPLOYMENT.md"
echo ""
