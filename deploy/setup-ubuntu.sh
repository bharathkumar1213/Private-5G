#!/usr/bin/env bash
# ==============================================================================
# Private 5G NOC Dashboard - Ubuntu 24.04 Automated Setup Script
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo " Starting Private 5G NOC Deployment on Ubuntu 24.04"
echo "=========================================================="

# 1. Check root or sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run as root or with sudo: sudo ./deploy/setup-ubuntu.sh"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="/var/www/private-5g-noc"

echo "[+] Project source directory: ${PROJECT_DIR}"

# 2. Update packages and verify Node.js (Node 20+ or 22+)
echo "[+] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
  echo "[+] Installing Node.js LTS via NodeSource..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  NODE_MAJOR=22
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs nginx
fi

echo "[+] Node version: $(node -v)"
echo "[+] NPM version: $(npm -v)"

# 3. Create target deployment directory
echo "[+] Syncing files to ${TARGET_DIR}..."
mkdir -p "${TARGET_DIR}"
rsync -av --exclude 'node_modules' --exclude '.git' --exclude 'dist' "${PROJECT_DIR}/" "${TARGET_DIR}/"

# 4. Install backend dependencies and create production .env
echo "[+] Installing backend dependencies..."
cd "${TARGET_DIR}/backend"
npm install --omit=dev

if [ ! -f .env ]; then
  echo "[+] Creating backend production .env..."
  cat <<EOF > .env
PORT=5001
NODE_ENV=production
CORS_ORIGIN=*
PROMETHEUS_URL=http://172.17.0.1:19091
ALERTMANAGER_URL=http://172.17.0.1:19093
METRICS_TIMEOUT_MS=4000
JENKINS_URL=
JENKINS_USER=
JENKINS_API_TOKEN=
JENKINS_JOB_NAME=5g-core-recovery
EOF
fi

# 5. Install frontend dependencies and build production static bundle
echo "[+] Building frontend bundle..."
cd "${TARGET_DIR}/frontend"
npm install
npm run build

# 6. Install Systemd Service for Backend Proxy
echo "[+] Configuring Systemd service (5g-backend.service)..."
sed -i "s|/var/www/private-5g-noc|${TARGET_DIR}|g" "${TARGET_DIR}/deploy/5g-backend.service"
# Detect non-root user if ubuntu exists
if id "ubuntu" &>/dev/null; then
  CURRENT_USER="ubuntu"
else
  CURRENT_USER="root"
fi
sed -i "s|User=ubuntu|User=${CURRENT_USER}|g" "${TARGET_DIR}/deploy/5g-backend.service"

cp "${TARGET_DIR}/deploy/5g-backend.service" /etc/systemd/system/5g-backend.service
systemctl daemon-reload
systemctl enable 5g-backend
systemctl restart 5g-backend

# 7. Configure Nginx Reverse Proxy
echo "[+] Configuring Nginx..."
cp "${TARGET_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/5g-noc.conf
ln -sf /etc/nginx/sites-available/5g-noc.conf /etc/nginx/sites-enabled/5g-noc.conf
# Remove default nginx site if active
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "=========================================================="
echo " Deployment Complete!"
echo " - Backend Service:  systemctl status 5g-backend"
echo " - Frontend Dist:     ${TARGET_DIR}/frontend/dist"
echo " - Nginx Access:      http://<SERVER_IP> or configured domain"
echo "=========================================================="

