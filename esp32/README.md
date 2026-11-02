# SmartTemp – ESP32 Firmware & Hardware Setup Guide

This guide walks you through connecting your **DHT11 temperature & humidity sensor** to an **ESP32 38-pin development board**, installing the required libraries in the **Arduino IDE**, and transmitting live environmental readings to your SmartTemp Flask backend.

---

## 1. Hardware Required

* **ESP32 Development Board** (38-pin, NodeMCU-32S / ESP-WROOM-32)
* **DHT11 Temperature & Humidity Sensor** (3-pin PCB module recommended)
* **Breadboard** and **3x Female-to-Male or Male-to-Male Jumper Wires**
* **Micro-USB to USB-A Cable** (Data cable, not power-only)

---

## 2. Wiring Connections

### Pinout Table

| DHT11 Pin | Description | ESP32 38-Pin Board Pin | Wire Color (Typical) |
| :--- | :--- | :--- | :--- |
| **VCC / +** | Power (3.3V – 5V) | **3V3** (or **VIN / 5V**) | Red |
| **GND / -** | Ground | **GND** | Black |
| **DATA / OUT / S** | Digital Signal | **GPIO 4** (Pin marked **D4** or **4**) | Yellow / Blue |

> [!TIP]
> **Module vs. Sensor:**
> * If you have a **3-pin DHT11 module** (mounted on a small blue/black PCB with pins labeled `S`, `+`, `-`), it already includes a built-in 10kΩ pull-up resistor. Simply wire `+` to 3V3, `-` to GND, and `S` to GPIO 4.
> * If you have a raw **4-pin blue sensor**, connect Pin 1 (VCC), Pin 2 (Data to GPIO 4 with a 10kΩ resistor between Pin 1 and Pin 2), Pin 3 (Not connected), and Pin 4 (GND).

---

## 3. Arduino IDE Setup

If you do not have the Arduino IDE installed, download it from [arduino.cc](https://www.arduino.cc/en/software).

### Step A: Install the ESP32 Board Package
1. Open **Arduino IDE**.
2. Go to **File > Preferences** (or `Ctrl + ,`).
3. In **Additional Boards Manager URLs**, paste:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**.
5. Go to **Tools > Board > Boards Manager...** (or click the board icon on the left).
6. Search for **`esp32`** by **Espressif Systems** and click **Install**.

### Step B: Install Required Sensor Libraries
1. In the Arduino IDE, go to **Sketch > Include Library > Manage Libraries...** (or `Ctrl + Shift + I`).
2. Search for **`DHT sensor library`** by **Adafruit**.
3. Click **Install**. When prompted to install dependencies (e.g., *Adafruit Unified Sensor*), click **Install All**.

---

## 4. Configuring Wi-Fi & Backend Server

Open `esp32/config.h` in Visual Studio Code or Arduino IDE.

```cpp
// 1. Enter your Wi-Fi credentials (must be a 2.4 GHz network):
#define WIFI_SSID "Your_WiFi_Name"
#define WIFI_PASSWORD "Your_WiFi_Password"

// 2. Server URL: Replace with your PC's IP address:
#define SERVER_URL "http://192.168.1.2:5000/api/readings"
```

### How to Find Your PC's Local IP Address:
1. Open PowerShell or Command Prompt on your computer.
2. Run:
   ```powershell
   ipconfig
   ```
3. Look for **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.2`).
4. Update `SERVER_URL` in `config.h` with that IP.

---

## 5. Windows Firewall Setting (Important!)

Windows Defender Firewall blocks incoming connections from other devices (like ESP32) to Python by default. Run this one command in PowerShell (As Administrator) to allow ESP32 requests through:

```powershell
New-NetFirewallRule -DisplayName "SmartTemp Flask API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 6. Uploading Code to the ESP32

1. Plug your ESP32 into your computer using the USB cable.
2. In Arduino IDE, select your board:
   * **Tools > Board > esp32 > ESP32 Dev Module**
3. Select your serial port:
   * **Tools > Port > COMx** (e.g., `COM3`, `COM4`, or `COM5`).
4. Open `esp32/smarttemp.ino`.
5. Click the **Upload** arrow button (top left).
   *(If the IDE gets stuck on `Connecting........_____`, press and hold the **BOOT** button on your ESP32 board for 2 seconds until uploading begins).*

---

## 7. Verifying Operation

1. Once uploaded, open the **Serial Monitor** in Arduino IDE (**Tools > Serial Monitor** or `Ctrl + Shift + M`).
2. Set the baud rate to **`115200`** in the bottom-right corner.
3. You will see:
   ```text
   =============================================
     SmartTemp - ESP32 IoT Monitoring Firmware  
   =============================================
   [INIT] Initializing DHT11 on GPIO 4
   [WIFI] Connecting to SSID: Your_WiFi_Name
   ......
   [WIFI] Connected successfully!
   [WIFI] ESP32 IP Address: 192.168.1.45
   ---------------------------------------------
   [TELEMETRY] Temperature: 25.4 °C  |  Humidity: 58.0 %
   [HTTP] Transmitting payload to: http://192.168.1.2:5000/api/readings
   [HTTP] Response Status Code: 201
   [SUCCESS] Reading recorded in PostgreSQL!
   ```
4. Check your React dashboard at **`http://localhost:5173/`** — the temperature card, humidity card, and charts will reflect the real physical DHT11 sensor readings!
