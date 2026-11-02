# SmartTemp – Intelligent Temperature and Humidity Monitoring System

**SmartTemp** is a complete, full-stack Internet of Things (IoT) environmental monitoring system built as an MCA mini-project. It measures real-time ambient temperature and relative humidity using a DHT11 sensor connected to an ESP32 microcontroller, transmits telemetry over Wi-Fi to a Python Flask REST API, persists data in PostgreSQL, and presents dynamic analytics, time-series charts, and threshold alerts through a React web dashboard.

---

## 1. System Architecture

```text
  ┌─────────────────────────┐
  │   DHT11 Sensor Module   │
  │  (Temperature & Humid)  │
  └────────────┬────────────┘
               │ Digital Signal (GPIO 4)
               ▼
  ┌─────────────────────────┐
  │   ESP32 38-Pin Board    │
  │  (Wi-Fi Station Client) │
  └────────────┬────────────┘
               │ HTTP POST /api/readings (JSON, every 30s)
               ▼
  ┌─────────────────────────┐
  │   Python Flask Server   │ <─── CORS Protected
  │   (Factory & Blueprints)│
  └──────┬───────────┬──────┘
         │           │
         │ SQLAlchemy│ REST API
         ▼           ▼
┌─────────────────┐ ┌──────────────────────────────────────┐
│  PostgreSQL 18  │ │  React Dashboard (Vite + Tailwind)   │
│ (smarttemp_db)  │ │  - Real-time Cards & Trend Charts    │
│ - readings      │ │  - Threshold Alerts & Test Simulator │
│ - alerts        │ └──────────────────────────────────────┘
└─────────────────┘
```

---

## 2. Technology Stack

* **Containerization & Deployment**:
  * Docker & Docker Compose v2
  * PostgreSQL 16 Alpine container with healthchecks and persistent volumes
  * Gunicorn WSGI production server for Flask
  * Nginx 1.27 Alpine production reverse proxy with gzip and caching
* **Hardware & IoT**:
  * ESP32 38-Pin Wi-Fi / Bluetooth Development Board
  * DHT11 Temperature and Humidity Sensor
  * Arduino IDE with ESP32 Board Framework & Adafruit DHT Library
* **Backend API**:
  * Python 3.12.10
  * Flask 3.1.3 (Application Factory Pattern with Blueprints)
  * Flask-SQLAlchemy 3.1 & SQLAlchemy 2.0
  * Psycopg 3 (Modern PostgreSQL binary driver)
  * Flask-CORS 6.0
* **Database**:
  * PostgreSQL 16/18 (`smarttemp_db`)
  * Indexed timestamp and device columns, cascading foreign keys
* **Frontend Web Dashboard**:
  * React 18 & Vite
  * Tailwind CSS (Custom Dark Environmental Theme with Glassmorphism)
  * Recharts 2.15 (Dual-Axis & Gradient Area Time-Series Charts)
  * Axios & Lucide React Icons

---

## 3. Project Structure

```text
SmartTemp/
├── docker-compose.yml            # Complete stack orchestrator (DB + Backend + Frontend)
├── docker-compose.dev.yml        # Development override with hot-reloading
├── docker-start.bat              # 1-click startup script for Windows
├── docker-stop.bat               # 1-click stop script
├── docker-seed.bat               # 1-click demo data populator
├── .dockerignore                 # Root build exclusion rules
├── .env.docker.example           # Docker environment variables template
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Application Factory & Extension Init
│   │   ├── config.py             # Configuration & .env loading
│   │   ├── extensions.py         # SQLAlchemy and CORS singletons
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── reading.py        # Reading database schema
│   │   │   └── alert.py          # Alert database schema
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── general.py        # GET / & GET /api/status
│   │   │   └── readings.py       # REST API endpoints
│   │   ├── services/
│   │   │   └── alert_service.py  # Anomaly detection & deduplication
│   │   └── utils/
│   │       └── validators.py     # Input payload validation
│   ├── tests/
│   │   ├── test_basic.py         # Basic endpoint unit tests
│   │   ├── test_database.py      # PostgreSQL model tests
│   │   └── test_api.py           # API integration tests (11 tests)
│   ├── Dockerfile                # Production Python 3.12 + Gunicorn image
│   ├── entrypoint.sh             # Startup script: DB wait, schema init, gunicorn
│   ├── .dockerignore             # Backend build exclusion rules
│   ├── app.py                    # Backend server runner
│   ├── seed_data.py              # Sample data generator for testing
│   ├── SmartTemp_Postman_Collection.json
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation, polling & connectivity
│   │   │   ├── StatCard.jsx      # Temperature, humidity & device cards
│   │   │   ├── Charts.jsx        # Recharts time-series visualization
│   │   │   ├── AlertsPanel.jsx   # Anomaly log & severity badges
│   │   │   ├── ReadingsTable.jsx # Historical telemetry table
│   │   │   └── SimulateModal.jsx # Test sensor telemetry modal
│   │   ├── services/
│   │   │   └── api.js            # Axios client with proxy routing
│   │   ├── App.jsx               # Dashboard orchestrator
│   │   ├── index.css             # Tailwind & glassmorphism styling
│   │   └── main.jsx
│   ├── Dockerfile                # Multi-stage Vite build + Nginx runtime
│   ├── Dockerfile.dev            # Vite dev container with live HMR
│   ├── nginx.conf                # Nginx reverse proxy configuration
│   ├── .dockerignore             # Frontend build exclusion rules
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── esp32/
│   ├── smarttemp.ino             # ESP32 firmware sketch
│   ├── config.h.example          # Wi-Fi & server config template
│   ├── config.h                  # Local credentials (git-ignored)
│   └── README.md                 # Complete hardware wiring guide
├── .gitignore
└── README.md
```

---

## 4. Quick Start & Execution Guide

### Option A: Run with Docker (Recommended - Zero Setup)

Ensure **Docker Desktop** is running on your machine.

#### 1. Start the Complete Stack
Run from the project root:
```powershell
docker compose up -d --build
```
*Or double-click `docker-start.bat`.*

Containers will start in order:
1. `smarttemp-db`: PostgreSQL 16 on `localhost:5432` with healthcheck.
2. `smarttemp-backend`: Flask API + Gunicorn on `http://localhost:5000` (auto-creates tables).
3. `smarttemp-frontend`: React Dashboard + Nginx on `http://localhost:5173`.

#### 2. (Optional) Populate Demo Sensor Data
Generate 40 realistic sensor readings and threshold alerts:
```powershell
docker compose exec backend python seed_data.py
```
*Or double-click `docker-seed.bat`.*

#### 3. View Logs & Status
```powershell
docker compose ps
docker compose logs -f
```

#### 4. Stop the Stack
```powershell
docker compose down
```
*(Database data is safely persisted in the `postgres_data` Docker volume across restarts).*

---

### Option B: Local Manual Setup (Without Docker)

#### Prerequisites
* Windows 10/11 with Python 3.12, Node.js (v18+), and PostgreSQL.

#### Step 1: Start the Flask Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

#### Step 2: Start the React Dashboard
Open a new PowerShell tab:
```powershell
cd frontend
npm run dev
```
*Dashboard opens at `http://localhost:5173`.*

---

### Hardware Step: Flash the ESP32 Firmware
1. Open `esp32/smarttemp.ino` in Arduino IDE.
2. In `esp32/src/config.h`:
   * Set your Wi-Fi SSID and Password.
   * Point `SERVER_URL` to your PC's local Wi-Fi IP address:
     ```c
     #define SERVER_URL "http://<YOUR_PC_IP>:5000/api/readings"
     ```
3. Wire DHT11: **VCC &rarr; 3V3**, **GND &rarr; GND**, **DATA &rarr; GPIO 4**.
4. Select Board `ESP32 Dev Module`, select your COM port, and click **Upload**.
*(Because Docker maps host port `5000:5000`, the ESP32 communicates seamlessly with the containerized backend over Wi-Fi).*

---

## 5. REST API Documentation

| Method | Endpoint | Description | Sample Response Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | API status and root greeting | `200 OK` |
| **GET** | `/api/status` | Backend & PostgreSQL live health check | `200 OK` |
| **POST** | `/api/readings` | Receive telemetry from ESP32 | `201 Created` |
| **GET** | `/api/readings/latest` | Most recent recorded sensor reading | `200 OK` |
| **GET** | `/api/readings` | Paginated historical records (`page`, `limit`) | `200 OK` |
| **GET** | `/api/readings/today` | Today's readings in chronological order | `200 OK` |
| **GET** | `/api/stats` | Today's Min, Max, and Avg calculations | `200 OK` |
| **GET** | `/api/alerts` | Recent threshold alert log | `200 OK` |

---

## 6. Configurable Threshold Alert Logic

Alerts are automatically evaluated when a reading is saved:

* **High Temperature:** `> 35.0°C` (Warning/Critical)
* **Low Temperature:** `< 15.0°C` (Warning/Critical)
* **High Humidity:** `> 80.0%` (Warning)
* **Low Humidity:** `< 30.0%` (Warning)

**Key Features:**
* **Deduplication:** Avoids duplicate alert spam while an anomaly condition remains active.
* **Auto-Resolution:** Automatically marks active alerts as resolved once environmental readings return to safe baseline levels.

---

## 7. Testing & Verification

Run the automated backend test suite (11 tests):
```powershell
cd backend
python -m unittest discover tests
```
Output:
```text
Ran 11 tests in 1.828s
OK
```
