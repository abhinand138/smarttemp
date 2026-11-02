/**
 * SmartTemp - Intelligent Temperature & Humidity Monitoring System
 * Firmware for ESP32 Development Board (38-pin) & DHT11 Sensor
 * 
 * Hardware Connections:
 *   DHT11 VCC   -> ESP32 3.3V (or 5V for module boards)
 *   DHT11 GND   -> ESP32 GND
 *   DHT11 DATA  -> ESP32 GPIO 4
 *   Built-in LED-> ESP32 GPIO 2
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "config.h"

// Initialize DHT sensor instance
DHT dht(DHT_PIN, DHT_TYPE);

// Non-blocking timer tracking
unsigned long lastSendTime = 0;

// Maximum consecutive Wi-Fi connection attempts before pause
const int MAX_WIFI_RETRIES = 20;

/**
 * Connect or reconnect to the Wi-Fi network
 */
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println();
  Serial.print(F("[WIFI] Connecting to SSID: "));
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < MAX_WIFI_RETRIES) {
    delay(500);
    Serial.print(F("."));
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println(F("[WIFI] Connected successfully!"));
    Serial.print(F("[WIFI] ESP32 IP Address: "));
    Serial.println(WiFi.localIP());
    Serial.print(F("[WIFI] Signal Strength (RSSI): "));
    Serial.print(WiFi.RSSI());
    Serial.println(F(" dBm"));
  } else {
    Serial.println();
    Serial.println(F("[WIFI] Connection failed. Will retry during next cycle."));
  }
}

/**
 * Read DHT11 sensor and transmit telemetry to Flask REST API
 */
void sendSensorReading() {
  // 1. Read environmental data from DHT11
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Default is Celsius

  // 2. Validate sensor readings (check if any read failed)
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println(F("[SENSOR ERROR] Failed to read from DHT11 sensor! Check wiring."));
    return;
  }

  // 3. Validate physical boundaries for DHT11 (0°C to 50°C, 20% to 90% RH)
  if (temperature < -10.0 || temperature > 70.0 || humidity < 0.0 || humidity > 100.0) {
    Serial.println(F("[SENSOR WARNING] Out-of-bounds reading detected. Skipping payload."));
    return;
  }

  // Log local reading to Serial Monitor
  Serial.println(F("---------------------------------------------"));
  Serial.print(F("[TELEMETRY] Temperature: "));
  Serial.print(temperature, 1);
  Serial.print(F(" °C  |  Humidity: "));
  Serial.print(humidity, 1);
  Serial.println(F(" %"));

  // 4. Ensure Wi-Fi connection is active
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[HTTP ERROR] Wi-Fi not connected. Attempting reconnection..."));
    connectToWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println(F("[HTTP ERROR] Skipping transmission due to lack of network."));
      return;
    }
  }

  // 5. Construct JSON payload string
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  jsonPayload += "\"temperature\":" + String(temperature, 2) + ",";
  jsonPayload += "\"humidity\":" + String(humidity, 2);
  jsonPayload += "}";

  // 6. Send HTTP/HTTPS POST request to Flask Backend
  HTTPClient http;
  WiFiClient client;
  WiFiClientSecure secureClient;

  Serial.print(F("[HTTP] Transmitting payload to: "));
  Serial.println(SERVER_URL);
  Serial.print(F("[HTTP] Payload: "));
  Serial.println(jsonPayload);

  if (String(SERVER_URL).startsWith("https://")) {
    secureClient.setInsecure(); // Accept cloud SSL certificates
    http.begin(secureClient, SERVER_URL);
  } else {
    http.begin(client, SERVER_URL);
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout for cloud requests

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print(F("[HTTP] Response Status Code: "));
    Serial.println(httpResponseCode);

    String responseBody = http.getString();
    Serial.print(F("[HTTP] Server Response: "));
    Serial.println(responseBody);

    // Visual feedback: blink built-in status LED on success
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      digitalWrite(STATUS_LED_PIN, HIGH);
      delay(150);
      digitalWrite(STATUS_LED_PIN, LOW);
      Serial.println(F("[SUCCESS] Reading recorded in PostgreSQL!"));
    }
  } else {
    Serial.print(F("[HTTP ERROR] POST failed, error code: "));
    Serial.println(http.errorToString(httpResponseCode).c_str());
    Serial.println(F("[HINT] Make sure Flask backend is running and Windows Firewall allows port 5000."));
  }

  http.end(); // Clean up HTTP client connection
}

void setup() {
  // Initialize Serial communication for debugging
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println(F("============================================="));
  Serial.println(F("  SmartTemp - ESP32 IoT Monitoring Firmware  "));
  Serial.println(F("============================================="));

  // Initialize status LED
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  // Initialize DHT11 sensor
  Serial.print(F("[INIT] Initializing DHT11 on GPIO "));
  Serial.println(DHT_PIN);
  dht.begin();

  // Connect to Wi-Fi network
  connectToWiFi();

  // Perform initial immediate reading
  sendSensorReading();
  lastSendTime = millis();
}

void loop() {
  unsigned long currentMillis = millis();

  // Non-blocking transmission timer
  if (currentMillis - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = currentMillis;
    sendSensorReading();
  }

  // Small delay to yield processor time and prevent watchdog reset
  delay(100);
}
