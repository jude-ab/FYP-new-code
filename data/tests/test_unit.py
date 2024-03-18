import unittest
import pandas as pd
from recommender import  recommend_by_mood, preprocess_data
import numpy as np
from pandas.api.types import is_numeric_dtype

class TestRecommenderSystems(unittest.TestCase):

    def test_recommend_by_mood(self):

        mood = "sad"
        # Load the DataFrame with the "ProcessedDescription" column
        poses_processed = pd.read_csv("poses_processed.csv")
        # Call the recommend_by_mood function with the correct DataFrame
        recommendations = recommend_by_mood(mood, poses_processed)
        # Strip leading and trailing whitespace from each recommendation
        recommendations = [pose.strip() for pose in recommendations]
        # Define the expected recommendations
        expected_recommendations = ['BHASTRIKA PRANAYAMA', 'JALA NETI', 'MOOLA BANDHA', 'Mayurasana (peacock pose)', 'Palming (Eye Exercise)', 'Surya Bheda Pranayama (vitality stimulating breath)', 'TRIKONASANA']
        # Perform assertions to compare actual and expected recommendations
        self.assertEqual(sorted(recommendations), sorted(expected_recommendations))
        
    def test_preprocess_data(self):
        # Define a sample input data
        input_X = pd.DataFrame({
            'Duration': ["30 mins", "45 mins"],
            'Exercise Type': ["Cycling", "Dancing"],
            'Meal Plan': ["Standard", "Gluten-Free"],
            'Supplements': ["None", "Vitamin D"]
        })
        # Define dummy target labels for the input data
        input_y = pd.Series([1, 0])  # Assuming binary classification for simplicity
        # Call the preprocess_data function
        output_X, output_y, feature_names = preprocess_data(input_X, input_y)
        # Define expected columns after preprocessing
        expected_columns = [
            'Duration',
            'Exercise Type_Cycling',
            'Exercise Type_Dancing',
            'Meal Plan_Standard',
            'Meal Plan_Gluten-Free',
            'Supplements_None',
            'Supplements_Vitamin D'
        ]
        # Convert output_X back to DataFrame for comparison
        output_X_df = pd.DataFrame(output_X, columns=feature_names)
        # Check if all expected columns are present in the output
        for column in expected_columns:
            self.assertIn(column, output_X_df.columns)
        # Further checks can include the shape of the DataFrame and dtype of columns
        self.assertEqual(output_X_df.shape[1], len(expected_columns))
        self.assertTrue(all(is_numeric_dtype(output_X_df[col]) for col in output_X_df.columns if col != 'Duration'))


if __name__ == '__main__':
    unittest.main()
