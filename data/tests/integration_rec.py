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
        # Insert a new feedback document
        user_feedback = self.db.users_collection.insert_one({"username": "Test User"})
        user_id = user_feedback.inserted_id

       # Insert a new health plan document
        health_plan = self.db.healthplans_collection.insert_one({"Exercise Type": "Cycling"})
        health_plan_id = health_plan.inserted_id

        # Insert a new feedback document
        feedback_input = {
            "userId": user_id,
            "healthPlanId": health_plan_id,
            "feedback": "like"
        }
        feedback_result = self.db.feedbacks_collection.insert_one(feedback_input)

        # Check if the feedback document was inserted successfully
        self.assertIsNotNone(feedback_result.inserted_id)


        refine_recommendations(user_id)


        most_common_mood = 'happy'  

        # Load the mood to cluster mapping and call the recommend_health_plan function
        mood_to_cluster_mapping = self.load_mood_to_cluster_mapping()
        updated_recommendation = recommend_health_plan(most_common_mood, mood_to_cluster_mapping)

        # Check if the updated recommendation contains the updated health plan       
        self.assertEqual('Cycling', updated_recommendation.get('Exercise Type'), "Cycling does not match the updated recommendation")

    def load_mood_to_cluster_mapping(self):
        with open('mood_to_cluster_mapping.pkl', 'rb') as file:
            return pickle.load(file)

if __name__ == '__main__':
    unittest.main()
