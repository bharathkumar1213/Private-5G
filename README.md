# DevOps Based Monitoring and Self-Healing for Private 5G Network
## Network Operations Center (NOC) Dashboard & Observability Platform

A production-quality Network Operations Center (NOC) dashboard and backend monitoring proxy built for a final-year engineering capstone project. Designed to monitor and observe a standalone 3GPP Release-16 Private 5G Core (**Open5GS**) and simulated Radio Access Network (**UERANSIM**) with automated closed-loop self-healing pipelines (**Prometheus**, **Alertmanager**, and **Restricted Python Recovery API**).

---

## 1. System Architecture & Component Mapping

```
                                      +---------------------------------------------+
                                      |          NOC WEB DASHBOARD (REACT)          |
                                      |  (Overview, Live Graphs, Alarms, Diagnostics)|
                                      +----------------------+----------------------+
                                                             ^
                                                             | HTTP (5s Polling)
                                                             v
                                      +---------------------------------------------+
                                      |         EXPRESS BACKEND PROXY (Node.js)     |
                                      |       Port 5001 (Configurable via PORT)      |
                                      +-------+--------------------+----------------+
                                              |                    |
                         Prometheus API v1    |                    | Alertmanager API v2
                 (http://172.17.0.1:19091)   |                    | (http://172.17.0.1:19093)
                                              v                    v
                                     +-----------------+  +-----------------+
                                     |   PROMETHEUS    |  |  ALERTMANAGER   |
                                     |  (TSDB Engine)  |  | (Alarm Router)  |
                                     +--------+--------+  +--------+--------+
                                              ^                    |
                                              | Scrapes Targets    | Webhook (Firing)
                                              |                    v
                   +--------------------------+----+    +----------------------------+
                   |                               |    | Alertmanager Recovery      |
                   |                               |    | Bridge (Python Webhook)    |
                   v                               v    +--------------+-------------+
        +---------------------+         +---------------------+        |
        |   OPEN5GS 5G CORE   |         |    UERANSIM (RAN)   |        v
        |  - AMF (SCTP:38412) |         |  - gNodeB (nr-gnb)  | +----------------------------+
        |  - SMF (PFCP:8805)  |         |  - UE (nr-ue)       | | Restricted Python          |
        |  - UPF (GTP-U:2152) |         |    (uesimtun0)      | | Recovery API               |
        +---------------------+         +---------------------+ | (systemctl lifecycle)      |
                                                                +--------------+-------------+
                                                                               |
                                                                               v
                                                                +----------------------------+
                                                                | Target Service Restart     |
                                                                | (e.g. open5gs-amfd.service)|
                                                                +----------------------------+
```

### Monitored Subsystems

| Component | Function | Monitored Interface / Protocol | Real Prometheus Target / Metric |
| :--- | :--- | :--- | :--- |
| **AMF** | Access & Mobility Management | N2 Interface / SCTP (Port 38412) | `open5gs_amf_registered_ue_total`, `up{job=~".*amf.*"}` |
| **SMF** | Session Management | N4 Interface / PFCP (Port 8805) | `open5gs_smf_pdu_sessions_total`, `up{job=~".*smf.*"}` |
| **UPF** | User Plane Function | N3 Interface / GTP-U (Port 2152, `ogstun`) | `rate(open5gs_upf_rx_bytes_total[1m])`, `rate(open5gs_upf_tx_bytes_total[1m])` |
| **gNB** | Next Generation Node B | Radio Simulation / NGAP to AMF | `ueransim_gnb_connected_ues`, `up{job=~".*gnb.*"}` |
| **UE** | User Equipment (SIM) | NAS 5GMM / `uesimtun0` | `ueransim_ue_pdu_session_active`, `up{job=~".*ue.*"}` |

---

## 2. Portability & Configuration

This project is built to run both on your **development laptop** (macOS, Windows, or Linux) and on the **Ubuntu 24.04 server** where the live 5G core network is deployed.

No IP addresses or ports are hardcoded. All service targets are controlled through `.env` files.

### Backend Environment (`backend/.env`)

```env
# Express Server Port (defaults to 5001 to prevent conflicts with macOS AirPlay on port 5000)
PORT=5001
NODE_ENV=development
CORS_ORIGIN=*

# Real Monitoring Service Endpoints on Ubuntu 24.04 Host
PROMETHEUS_URL=http://172.17.0.1:19091
ALERTMANAGER_URL=http://172.17.0.1:19093

# Timeout for telemetry queries in milliseconds
METRICS_TIMEOUT_MS=4000

# Optional Jenkins Integration (leave empty if integration is pending)
JENKINS_URL=
JENKINS_USER=
JENKINS_API_TOKEN=
JENKINS_JOB_NAME=5g-core-recovery

# Restricted Python Recovery API & Alertmanager Webhook Bridge
RECOVERY_API_URL=
RECOVERY_BRIDGE_URL=
RECOVERY_API_TOKEN=
```

### Frontend Environment (`frontend/.env`)

```env
# In development, Vite proxies /api to this backend address
VITE_BACKEND_URL=http://localhost:5001
VITE_API_BASE_URL=/api
```

---

## 3. Local Development on Laptop (macOS / Linux / Windows)

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation

```bash
# 1. Clone or extract the project archive
cd Private_5G

# 2. Install all dependencies for both frontend and backend
npm run install:all
```

### Running Locally

Open two terminal windows:

**Terminal 1 (Backend Proxy):**
```bash
npm run dev:backend
```
The backend starts on `http://localhost:5001`.
*Note: If `http://172.17.0.1:19091` is unreachable on your laptop, the dashboard cleanly displays `DISCONNECTED` and marks component metrics as `Unavailable` without crashing or inventing fake mock data.*

**Terminal 2 (Frontend React App):**
```bash
npm run dev:frontend
```
Open your browser at `http://localhost:3000`.

---

## 4. Production Deployment on Ubuntu 24.04 Target Host

On the Ubuntu 24.04 machine running Open5GS, UERANSIM, Prometheus (`http://172.17.0.1:19091`), and Alertmanager (`http://172.17.0.1:19093`):

### Option A: Automated One-Step Setup Script

```bash
# Extract the project ZIP to the Ubuntu server
unzip Private_5G.zip -d /var/www/private-5g-noc
cd /var/www/private-5g-noc

# Run the automated setup script with sudo
sudo chmod +x deploy/setup-ubuntu.sh
sudo ./deploy/setup-ubuntu.sh
```

### Option B: Manual Step-by-Step Setup

#### Step 1: Install Node.js 22 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
```

#### Step 2: Install Backend Dependencies & Start Proxy
```bash
cd /var/www/private-5g-noc/backend
npm install --omit=dev
cp .env.example .env

# Verify connectivity to Prometheus and Alertmanager
curl -I http://172.17.0.1:19091/-/healthy
curl -I http://172.17.0.1:19093/-/healthy
```

#### Step 3: Configure Systemd Service for Express Proxy
```bash
sudo cp /var/www/private-5g-noc/deploy/5g-backend.service /etc/systemd/system/5g-backend.service
sudo systemctl daemon-reload
sudo systemctl enable 5g-backend
sudo systemctl start 5g-backend

# Verify backend status
sudo systemctl status 5g-backend
```

#### Step 4: Build Frontend Production Assets
```bash
cd /var/www/private-5g-noc/frontend
npm install
npm run build
```
Static production files will be built to `/var/www/private-5g-noc/frontend/dist`.

#### Step 5: Configure Nginx Reverse Proxy
```bash
sudo cp /var/www/private-5g-noc/deploy/nginx.conf /etc/nginx/sites-available/5g-noc.conf
sudo ln -sf /etc/nginx/sites-available/5g-noc.conf /etc/nginx/sites-enabled/5g-noc.conf
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Custom Domain & SSL Setup Guide

When connecting a custom domain (e.g., `noc.private5g.net`):

1. **DNS A Record:**
   Point `noc.private5g.net` to your Ubuntu server's public IP address in your DNS registrar (e.g., Cloudflare, Route53, Namecheap).

2. **Update Nginx Server Name:**
   In `/etc/nginx/sites-available/5g-noc.conf`:
   ```nginx
   server_name noc.private5g.net;
   ```

3. **Install Free Let's Encrypt SSL via Certbot:**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d noc.private5g.net
   ```
   Certbot will automatically obtain certificates, configure HTTPS on port 443, and set up auto-renewal.

---

## 6. Self-Healing Verification Transparency Notice

In accordance with academic and engineering project integrity requirements:

- **Verified & Demonstrated:**
  - **AMF (Access and Mobility Management Function):** Automated recovery has been verified via controlled fault injection testing (`systemctl stop open5gs-amfd`). Prometheus detects scrape failure -> Alertmanager fires `AMFServiceDown` -> Webhook Bridge triggers Restricted Python Recovery API -> Service is restarted and SCTP port 38412 socket binding is verified -> UE re-attaches.
- **Awaiting Independent Verification:**
  - **SMF, UPF, gNodeB, and UE** recovery pipelines are architecturally designed but labeled strictly as **Awaiting Independent Verification**.
  - **No Artificial Metrics:** Synthetic uptime percentages, fake incident counters, and simulated recovery histories are strictly prohibited and excluded from the interface.

---

## 7. Security Architecture

1. **Zero Frontend Secret Exposure:**
   Neither passwords, API tokens, nor webhook keys are bundled in client-side React code.
2. **Read-Only Dashboard:**
   The web dashboard functions strictly as an operational observer. Remediations are managed strictly on the backend host by the dedicated recovery daemon.
3. **Internal Network Isolation:**
   Prometheus (`http://172.17.0.1:19091`) and Alertmanager (`http://172.17.0.1:19093`) remain bound to internal host/docker interfaces and are accessed only through the secured Express proxy.

---

## 8. Verification Checklist

- [x] React + Vite + Tailwind CSS + Recharts + Express Proxy architecture established.
- [x] Technical NOC styling (dark navy/charcoal, cyan accents, no generic gradients or emojis).
- [x] All 5 components (AMF, SMF, UPF, gNB, UE) displayed with actual status and "Unavailable" fallbacks.
- [x] Real-time 5-second polling interval.
- [x] Alertmanager active and resolved alert filtering.
- [x] Verified AMF recovery separated transparently from unverified capabilities.
- [x] Jenkins CI/CD integration status securely handled ("Integration pending" when unconfigured).
- [x] Privacy Policy and Terms and Conditions pages implemented.
- [x] Proper telecom SVG favicon added.
- [x] Systemd service and Nginx production configuration provided.
- [x] Zero client-side credential exposure verified.

