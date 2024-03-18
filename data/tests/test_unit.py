# tests/test_unit.py
import unittest
from recommender import preprocess_data, recommend_by_mood 
import pandas as pd
import numpy as np

class TestRecommenderSystems(unittest.TestCase):

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

        # Example assertion to check if the output is correctly structured
        # Here you need to define `expected_output_X` to match the expected shape and transformation of `input_X` after preprocessing
        expected_output_X = pd.DataFrame({
            'Duration': [30, 45],  # Assuming 'Duration' is converted from string to int and "mins" is removed
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



    def test_recommend_by_mood(self):
        mood = "sad"

        # Load the DataFrame (assuming you already have this step)
        file_path = 'updated_yogaposes.csv'
        df = pd.read_csv(file_path)

        # Add a 'ProcessedDescription' column by preprocessing an existing 'Description' column
        # This is just an example. Adapt it based on your actual data and preprocessing needs.
        # For instance, if your descriptions are in a column named 'DetailedDescription', use that instead.
        if 'Description' in df.columns:
            df['Description'] = df['Description'].apply(lambda x: str(x) if isinstance(x, str) else '')
        else:
            # If there's no 'Description' column, ensure 'ProcessedDescription' exists even as a placeholder
            df['ProcessedDescription'] = "Sit quietly and close the eyes. Rub the paln1s of the hands together vigorously until they become warm. Place the palms gently over the eyelids, without any undue pressure. Feel the warmth and energy being transmitted from the hands into the eyes and the eye muscles relaxing. The eyes are being bathed in a soothing darkness. Remain in this position until the heat from the hands has been absorbed by the eyes. Then lower the hands, keeping the eyes closed. Again rub the palms together until they become hot and place them over the closed eyes. (Make sure the palms and not the fingers cover the eyes.) Repeat this procedure at least 3 times."

        # Use the DataFrame with the new 'ProcessedDescription' column for recommendations
        poses = df  # Keeping your existing code structure

        expected_recommendations = [
            # Your expected recommendations
        ]

        recommendations = recommend_by_mood(mood, poses)

        self.assertEqual(sorted(recommendations), sorted(expected_recommendations))


if __name__ == '__main__':
    unittest.main()
