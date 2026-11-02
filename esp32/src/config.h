#ifndef SMARTTEMP_CONFIG_H
#define SMARTTEMP_CONFIG_H

// ==========================================
// 1. Wi-Fi Network Credentials
// ==========================================
// Enter your 2.4 GHz Wi-Fi network credentials:
#define WIFI_SSID "Abhinand"
#define WIFI_PASSWORD "22223333"

// ==========================================
// 2. Backend Server Endpoint
// ==========================================
// Your PC's detected local IP address on your Wi-Fi network:
#define SERVER_URL "http://192.168.117.7:5000/api/readings"

// ==========================================
// 3. Hardware & Sensor Settings
// ==========================================
#define DHT_PIN 4               // GPIO 4 -> DHT11 Data pin
#define DHT_TYPE DHT11          // Sensor type
#define DEVICE_ID "esp32_dht11_primary"
#define STATUS_LED_PIN 2        // Built-in blue LED on GPIO 2

// ==========================================
// 4. Transmission Interval
// ==========================================
#define SEND_INTERVAL_MS 2000   // 2 seconds (Real-time telemetry; DHT11 hardware limit)

#endif // SMARTTEMP_CONFIG_H
