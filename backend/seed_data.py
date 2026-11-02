"""
Seed script to populate PostgreSQL database with realistic demo readings.
Clearly labeled as demo/sample data for testing and development.
"""
from datetime import datetime, timezone, timedelta
import random
from app import create_app
from app.extensions import db
from app.models import Reading
from app.services.alert_service import AlertService

def seed_demo_data(num_readings=40):
    app = create_app()
    with app.app_context():
        print(f"[*] Seeding {num_readings} demo sensor readings for testing...")
        base_time = datetime.now(timezone.utc) - timedelta(hours=8)
        
        # Base realistic values: 24°C, 55% humidity
        temp = 24.0
        hum = 55.0

        for i in range(num_readings):
            time_point = base_time + timedelta(minutes=12 * i)
            # Add slight realistic drift
            temp += round(random.uniform(-0.8, 0.9), 2)
            temp = max(18.0, min(36.5, temp))
            hum += round(random.uniform(-1.5, 1.5), 2)
            hum = max(35.0, min(82.0, hum))

            reading = Reading(
                device_id="esp32_dht11_demo",
                temperature=round(temp, 2),
                humidity=round(hum, 2),
                timestamp=time_point
            )
            db.session.add(reading)
            db.session.flush()

            # Evaluate alerts for demo values
            AlertService.evaluate_reading(reading)

        db.session.commit()
        print(f"[+] Successfully seeded {num_readings} demo readings into smarttemp_db!")

if __name__ == "__main__":
    seed_demo_data()
