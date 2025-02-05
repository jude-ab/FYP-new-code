import unittest
from recommender import app, db, refine_recommendations, recommend_health_plan
from pymongo import MongoClient
import pickle

class TestIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Configure app for testing
        cls.client = app.test_client()
        app.config['TESTING'] = True

        # Create a MongoClient instance and access testdb
        cls.mongo_client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/')
        cls.db = cls.mongo_client['yogahub']


    def test_integration_new_feedback_updates_recommendations(self):
        # Insert a new user and get their ID
        user_result = self.db.users_collection.insert_one({"username": "Test User"})
        user_id = user_result.inserted_id

        # Insert a new health plan and get its ID
        health_plan_result = self.db.healthplans_collection.insert_one({"Exercise Type": "Cycling"})
        health_plan_id = health_plan_result.inserted_id

        # Insert new feedback
        feedback_data = {
            "userId": user_id,
            "healthPlanId": health_plan_id,
            "feedback": "like"
        }
        feedback_result = self.db.feedbacks_collection.insert_one(feedback_data)

        # Check that the feedback was inserted
        self.assertIsNotNone(feedback_result.inserted_id)

        # Call the function that refines recommendations based on feedback
        refine_recommendations(user_id)

        # Fetch the updated recommendations for the user's most common mood
        most_common_mood = 'happy' 
        # Make sure mood_to_cluster_mapping is loaded correctly
        mood_to_cluster_mapping = self.load_mood_to_cluster_mapping()
        updated_recommendation = recommend_health_plan(most_common_mood, mood_to_cluster_mapping)

        # Assert that the recommendations are updated accordingly
        # checking for a single plan 
        self.assertEqual('Cycling', updated_recommendation.get('Exercise Type'), "The updated recommendation does not contain 'Rowing'")

    def load_mood_to_cluster_mapping(self):
        with open('mood_to_cluster_mapping.pkl', 'rb') as file:
            return pickle.load(file)

if __name__ == '__main__':
    unittest.main()
