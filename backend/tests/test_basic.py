import unittest
from app import create_app

class BasicEndpointsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_home_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["project"], "SmartTemp")
        self.assertEqual(data["status"], "online")

    def test_status_endpoint(self):
        response = self.client.get("/api/status")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["application"], "SmartTemp")
        self.assertEqual(data["status"], "online")
        self.assertIn("timestamp", data)

if __name__ == "__main__":
    unittest.main()
