import unittest
from recommender import app

class TestIntegration(unittest.TestCase):
    
    def setUp(self):
        # Create a test client
        self.app = app.test_client()
        self.app.testing = True
    
    def test_mood_recommendation_endpoint(self):
        # Test the POST request to your mood recommendation endpoint
        response = self.app.post('/recommend', json={'moods': 'anxious'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        print("Response data:", data)  # Add this line to print out the actual response for debugging
        self.assertIsInstance(data, list)  # Check if the response is a list
        # If the list should contain strings of pose names, you might add a check like this:
        if data:  # Check if list is not empty
            self.assertIsInstance(data[0], str)  # Check if the first item in the list is a string

    def test_health_plan_recommendation_endpoint(self):
        # Test the POST request to your health plan recommendation endpoint
        response = self.app.post('/health/recommend', json={'userId': '65d696793dc543141923796f'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('recommendedPlan', response.get_json())


if __name__ == '__main__':
    unittest.main()
