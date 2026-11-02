import math
from typing import Tuple, Optional, Dict, Any

def validate_sensor_reading(data: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validate incoming sensor payload from ESP32 or client.
    
    Expected format:
    {
        "temperature": 25.4,
        "humidity": 60.2,
        "device_id": "esp32_dht11_primary"  (optional)
    }
    """
    if not isinstance(data, dict):
        return False, "Payload must be a valid JSON object.", None

    if "temperature" not in data or "humidity" not in data:
        return False, "Both 'temperature' and 'humidity' fields are required.", None

    raw_temp = data.get("temperature")
    raw_hum = data.get("humidity")

    # Reject non-numeric types (strings, booleans, None, lists)
    if isinstance(raw_temp, bool) or not isinstance(raw_temp, (int, float)):
        return False, "'temperature' must be a numeric value.", None
    if isinstance(raw_hum, bool) or not isinstance(raw_hum, (int, float)):
        return False, "'humidity' must be a numeric value.", None

    temp = float(raw_temp)
    hum = float(raw_hum)

    # Reject non-finite values (NaN, Infinity, -Infinity)
    if not math.isfinite(temp):
        return False, "'temperature' must be a finite number.", None
    if not math.isfinite(hum):
        return False, "'humidity' must be a finite number.", None

    # Realistic physical bounds for DHT11 environmental readings
    # Temperature: -20°C to 80°C (DHT11 nominal 0°C - 50°C)
    if temp < -20.0 or temp > 80.0:
        return False, f"Temperature {temp}°C is outside valid range (-20°C to 80°C).", None

    # Relative humidity: 0% to 100%
    if hum < 0.0 or hum > 100.0:
        return False, f"Humidity {hum}% is outside valid range (0% to 100%).", None

    # Device ID sanitization
    device_id = str(data.get("device_id", "esp32_dht11_primary")).strip()
    if not device_id:
        device_id = "esp32_dht11_primary"
    elif len(device_id) > 64:
        device_id = device_id[:64]

    validated_data = {
        "temperature": round(temp, 2),
        "humidity": round(hum, 2),
        "device_id": device_id
    }

    return True, None, validated_data
