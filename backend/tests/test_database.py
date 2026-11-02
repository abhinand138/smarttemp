import unittest
from datetime import datetime, timezone
from app import create_app
from app.extensions import db
from app.models import Reading, Alert

class DatabaseModelsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Clean up any test records created
        db.session.rollback()
        Reading.query.filter(Reading.device_id == "test_device_unit").delete()
        db.session.commit()
        db.session.remove()
        self.app_context.pop()

    def test_create_reading(self):
        reading = Reading(
            device_id="test_device_unit",
            temperature=24.5,
            humidity=55.0,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(reading)
        db.session.commit()

        self.assertIsNotNone(reading.id)
        # Use SQLAlchemy 2.0 style db.session.get()
        saved = db.session.get(Reading, reading.id)
        self.assertIsNotNone(saved)
        self.assertEqual(saved.temperature, 24.5)
        self.assertEqual(saved.humidity, 55.0)

        data = saved.to_dict()
        self.assertEqual(data["device_id"], "test_device_unit")
        self.assertEqual(data["temperature"], 24.5)
        self.assertEqual(data["humidity"], 55.0)
        self.assertIn("timestamp", data)

    def test_create_alert_with_reading(self):
        reading = Reading(
            device_id="test_device_unit",
            temperature=38.2,
            humidity=85.0
        )
        db.session.add(reading)
        db.session.commit()

        alert = Alert(
            reading_id=reading.id,
            device_id=reading.device_id,
            alert_type="HIGH_TEMP",
            severity="critical",
            message="Temperature 38.2°C exceeded threshold 35.0°C",
            threshold_value=35.0,
            actual_value=38.2
        )
        db.session.add(alert)
        db.session.commit()

        self.assertIsNotNone(alert.id)
        saved_alert = db.session.get(Alert, alert.id)
        self.assertEqual(saved_alert.alert_type, "HIGH_TEMP")
        self.assertEqual(saved_alert.actual_value, 38.2)
        self.assertEqual(saved_alert.reading_id, reading.id)

if __name__ == "__main__":
    unittest.main()
