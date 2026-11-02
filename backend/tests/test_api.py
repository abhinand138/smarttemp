import unittest
import json
from app import create_app
from app.extensions import db
from app.models import Reading, Alert

class ApiEndpointsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Clean database for isolated tests
        Alert.query.filter(Alert.device_id.like("test_api%")).delete()
        Reading.query.filter(Reading.device_id.like("test_api%")).delete()
        db.session.commit()

    def tearDown(self):
        db.session.rollback()
        Alert.query.filter(Alert.device_id.like("test_api%")).delete()
        Reading.query.filter(Reading.device_id.like("test_api%")).delete()
        db.session.commit()
        db.session.remove()
        self.app_context.pop()

    def test_post_valid_reading(self):
        payload = {
            "temperature": 26.5,
            "humidity": 58.0,
            "device_id": "test_api_device"
        }
        response = self.client.post("/api/readings", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["reading"]["temperature"], 26.5)
        self.assertEqual(data["reading"]["humidity"], 58.0)
        self.assertEqual(data["reading"]["device_id"], "test_api_device")
        self.assertEqual(len(data["alerts_triggered"]), 0)

    def test_post_reading_validation_errors(self):
        # 1. Missing fields
        res1 = self.client.post("/api/readings", json={"temperature": 25.0})
        self.assertEqual(res1.status_code, 400)
        self.assertIn("required", res1.get_json()["error"])

        # 2. String/non-numeric values
        res2 = self.client.post("/api/readings", json={"temperature": "hot", "humidity": 50})
        self.assertEqual(res2.status_code, 400)
        self.assertIn("numeric", res2.get_json()["error"])

        # 3. Out of range values
        res3 = self.client.post("/api/readings", json={"temperature": 150.0, "humidity": 50})
        self.assertEqual(res3.status_code, 400)
        self.assertIn("outside valid range", res3.get_json()["error"])

        # 4. Non-JSON request
        res4 = self.client.post("/api/readings", data="plain text")
        self.assertEqual(res4.status_code, 400)

    def test_alert_generation_and_deduplication(self):
        device_id = "test_api_alert_dev"
        # 1. Post a high temperature reading (38°C > default 35°C threshold)
        res1 = self.client.post("/api/readings", json={
            "temperature": 38.0,
            "humidity": 50.0,
            "device_id": device_id
        })
        self.assertEqual(res1.status_code, 201)
        data1 = res1.get_json()
        self.assertEqual(len(data1["alerts_triggered"]), 1)
        self.assertEqual(data1["alerts_triggered"][0]["alert_type"], "HIGH_TEMP")

        # 2. Post ANOTHER high temperature reading - should NOT create duplicate active alert
        res2 = self.client.post("/api/readings", json={
            "temperature": 39.0,
            "humidity": 52.0,
            "device_id": device_id
        })
        self.assertEqual(res2.status_code, 201)
        data2 = res2.get_json()
        self.assertEqual(len(data2["alerts_triggered"]), 0)  # No duplicate alert created

        # 3. Verify exactly 1 active alert exists
        active_alerts = Alert.query.filter_by(device_id=device_id, is_active=True).all()
        self.assertEqual(len(active_alerts), 1)

        # 4. Post normalized reading (26°C) - should auto-resolve the active alert
        res3 = self.client.post("/api/readings", json={
            "temperature": 26.0,
            "humidity": 50.0,
            "device_id": device_id
        })
        self.assertEqual(res3.status_code, 201)
        active_alerts_after = Alert.query.filter_by(device_id=device_id, is_active=True).all()
        self.assertEqual(len(active_alerts_after), 0)

    def test_get_latest_reading(self):
        self.client.post("/api/readings", json={"temperature": 22.0, "humidity": 45.0, "device_id": "test_api_dev"})
        self.client.post("/api/readings", json={"temperature": 28.5, "humidity": 65.0, "device_id": "test_api_dev"})

        response = self.client.get("/api/readings/latest")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["reading"]["temperature"], 28.5)
        self.assertEqual(data["reading"]["humidity"], 65.0)

    def test_get_readings_pagination(self):
        for i in range(5):
            self.client.post("/api/readings", json={"temperature": 20.0 + i, "humidity": 50.0, "device_id": "test_api_dev"})

        response = self.client.get("/api/readings?limit=2&page=1")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["limit"], 2)
        self.assertEqual(data["page"], 1)
        self.assertEqual(len(data["readings"]), 2)

    def test_get_today_and_stats(self):
        self.client.post("/api/readings", json={"temperature": 20.0, "humidity": 40.0, "device_id": "test_api_dev"})
        self.client.post("/api/readings", json={"temperature": 30.0, "humidity": 60.0, "device_id": "test_api_dev"})

        # Test today's readings
        res_today = self.client.get("/api/readings/today")
        self.assertEqual(res_today.status_code, 200)
        data_today = res_today.get_json()
        self.assertGreaterEqual(data_today["count"], 2)

        # Test statistics calculation
        res_stats = self.client.get("/api/stats")
        self.assertEqual(res_stats.status_code, 200)
        stats = res_stats.get_json()
        self.assertTrue(stats["success"])
        self.assertIsNotNone(stats["temperature"]["min"])
        self.assertIsNotNone(stats["temperature"]["max"])
        self.assertIsNotNone(stats["temperature"]["avg"])

    def test_get_alerts_endpoint(self):
        # Trigger an alert
        self.client.post("/api/readings", json={"temperature": 40.0, "humidity": 85.0, "device_id": "test_api_dev"})

        response = self.client.get("/api/alerts")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["alerts"]), 1)

if __name__ == "__main__":
    unittest.main()
