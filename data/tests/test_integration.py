import unittest
from recommender import app

class TestIntegration(unittest.TestCase):
    
    def setUp(self):
        # Create a test client
        self.app = app.test_client()
        self.app.testing = True
    
    def test_mood_recommendation_endpoint(self):
        # Test the POST request to your mood recommendation endpoint
        response = self.app.post('/recommend', json={'moods': 'happy'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('recommendedPoses', response.get_json())  # Assuming your response has this key

    def test_health_plan_recommendation_endpoint(self):
        # Test the POST request to your health plan recommendation endpoint
        response = self.app.post('/health/recommend', json={'userId': '65d696793dc543141923796f'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('recommendedPlan', response.get_json())


if __name__ == '__main__':
    unittest.main()
