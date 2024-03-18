import unittest
from pymongo import MongoClient
from bson.objectid import ObjectId

class TestDatabaseOperations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Connect to the MongoDB database
        cls.client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/')
        cls.db = cls.client['testdb']  # Use a test database

        # Collections for the tests
        cls.users_collection = cls.db['users']
        cls.feedbacks_collection = cls.db['feedbacks']
        cls.healthplans_collection = cls.db['healthplans']

    def test_insert_user(self):
        user = {"username": "Test User", "email": "test@gmail.com"}
        result = self.users_collection.insert_one(user)
        self.assertIsNotNone(result.inserted_id)

    def test_fetch_user(self):
        user = self.users_collection.find_one({"email": "test@gmail.com"})
        self.assertIsNotNone(user)
        self.assertEqual(user["email"], "test@gmail.com")

    def test_update_feedback(self):
        feedback = {"userId": ObjectId(), "healthPlanId": ObjectId(), "feedback": "like"}
        insert_result = self.feedbacks_collection.insert_one(feedback)
        self.assertIsNotNone(insert_result.inserted_id)

        updated_feedback = {"feedback": "dislike"}
        update_result = self.feedbacks_collection.update_one({"_id": insert_result.inserted_id}, {"$set": updated_feedback})
        self.assertEqual(update_result.modified_count, 1)

        updated_feedback = self.feedbacks_collection.find_one({"_id": insert_result.inserted_id})
        self.assertEqual(updated_feedback["feedback"], "dislike")

    def test_refine_recommendations(self):
        # This test assumes you have a method to refine recommendations based on feedback
        # For simplicity, let's assume refine_recommendations method updates health plan scores
        health_plan = {"Exercise Type": "Rowing", "Duration": "40 mins", "score": 0}  # Adjust fields based on your collection schema
        plan_result = self.healthplans_collection.insert_one(health_plan)
        self.assertIsNotNone(plan_result.inserted_id)

        # Simulate refining recommendations
        self.healthplans_collection.update_one({"_id": plan_result.inserted_id}, {"$inc": {"score": 1}})
        updated_plan = self.healthplans_collection.find_one({"_id": plan_result.inserted_id})
        self.assertEqual(updated_plan["score"], 1)

if __name__ == '__main__':
    unittest.main()
