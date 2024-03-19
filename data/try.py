import joblib
import sklearn

# Adjust the path to where your model is stored
model_path = '/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data/rf_model.pkl'

try:
    # Attempt to load the model
    model = joblib.load(model_path)
    print("Model loaded successfully")
    print(model)  # Print the loaded model to confirm it's the expected model
except Exception as e:
    # If there is any error, print it out
    print("Failed to load the model:")
    print(e)

print("scikit-learn version:", sklearn.__version__)
print("joblib version:", joblib.__version__)
