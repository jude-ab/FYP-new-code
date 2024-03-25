import unittest
import pandas as pd
from recommender import  recommend_by_mood, preprocess_data
import numpy as np
from pandas.api.types import is_numeric_dtype

class TestRecommenderSystems(unittest.TestCase):

    def test_recommend_by_mood(self):

        mood = "sad"
        processed_poses = pd.read_csv("poses_processed.csv")
        recommendations = recommend_by_mood(mood, processed_poses)
        recommendations = [pose.strip() for pose in recommendations]
        expected_recommendation = ['BHASTRIKA PRANAYAMA', 'JALA NETI', 'MOOLA BANDHA', 'Mayurasana (peacock pose)', 'Palming (Eye Exercise)', 'Surya Bheda Pranayama (vitality stimulating breath)', 'TRIKONASANA']
        self.assertEqual(sorted(recommendations), sorted(expected_recommendation))

    #test for the preprocess_data function   
    def test_preprocess_data(self):
        # Create a sample input dataframe
        input_X = pd.DataFrame({
            'Duration': ["30 mins", "45 mins"],
            'Exercise Type': ["Cycling", "Dancing"],
            'Meal Plan': ["Standard", "Gluten-Free"],
            'Supplements': ["None", "Vitamin D"]
        })

        # Create a sample output dataframe
        input_y = pd.Series([1, 0])  
       
       # Call the preprocess_data function
        output_X, feature_names = preprocess_data(input_X, input_y)

        # Check if the output is a numpy array
        expected_columns = [
            'Duration',
            'Exercise Type_Cycling',
            'Exercise Type_Dancing',
            'Meal Plan_Standard',
            'Meal Plan_Gluten-Free',
            'Supplements_None',
            'Supplements_Vitamin D'
        ]
        # Convert the output to a dataframe
        output_df = pd.DataFrame(output_X, columns=feature_names)

        # Check if the output dataframe has the expected columns
        for column in expected_columns:
            self.assertIn(column, output_df.columns)

        # Check if the output dataframe has the expected number of columns
        self.assertEqual(output_df.shape[1], len(expected_columns))
        self.assertTrue(all(is_numeric_dtype(output_df[col]) for col in output_df.columns if col != 'Duration'))


if __name__ == '__main__':
    unittest.main()
