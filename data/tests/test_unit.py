import unittest
import pandas as pd
from recommender import  recommend_by_mood, preprocess_data

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

        # Define the expected output for the "Duration" column after preprocessing
        expected_output_X = pd.DataFrame({
            'Duration': [30, 45],  # Corrected values after preprocessing
            # Add columns for one-hot encoded features
            'Exercise Type_Cycling': [1, 0],
            'Exercise Type_Dancing': [0, 1],
            'Meal Plan_Standard': [1, 0],
            'Meal Plan_Gluten-Free': [0, 1],
            'Supplements_None': [1, 0],
            'Supplements_Vitamin D': [0, 1]
        })

        # Compare the actual output with the expected output
        pd.testing.assert_frame_equal(output_X, expected_output_X, check_dtype=False, check_like=True)


  




if __name__ == '__main__':
    unittest.main()
