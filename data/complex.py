from pymongo import MongoClient
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib  # Used for saving models
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from keras.models import Sequential
from keras.layers import Dense
import numpy as np
from datetime import datetime
import json

# Define the connection string for MongoDB
MONGODB_CONNECTION = "mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub"

# Function to fetch data from MongoDB
def fetch_data():
    client = MongoClient(MONGODB_CONNECTION)
    db = client.yogahub
    feedback_collection = db.feedbacks.find()
    healthplans_collection = db.healthplans.find()

    # Convert collections to pandas DataFrames
    feedback_df = pd.DataFrame(list(feedback_collection))
    healthplans_df = pd.DataFrame(list(healthplans_collection))

    # Ensure the healthPlanId in feedback_df is a string
    feedback_df['healthPlanId'] = feedback_df['healthPlanId'].astype(str)

    # Ensure the _id in healthplans_df is a string
    healthplans_df['_id'] = healthplans_df['_id'].astype(str)

    # Log the success of data fetching
    if not feedback_df.empty and not healthplans_df.empty:
        print(f"Data successfully fetched: {len(feedback_df)} feedback records and {len(healthplans_df)} healthplan records.")
    else:
        print("Failed to fetch data from MongoDB.")

    # Join the DataFrames on the healthPlanId 
    combined_df = pd.merge(feedback_df, healthplans_df, left_on='healthPlanId', right_on='_id', how='inner')

    # Encoding categorical data and setting up features and target
    label_encoder = LabelEncoder()
    combined_df['feedback_encoded'] = label_encoder.fit_transform(combined_df['feedback'])

    # Drop non-feature columns and set the target
    columns_to_drop = ['_id_x', 'userId', 'healthPlanId', 'feedback', 'createdAt', 'updatedAt', '__v', '_id_y']
    X_new = combined_df.drop(columns=columns_to_drop)
    y_new = combined_df['feedback_encoded']

    return X_new, y_new

# Function to preprocess data
def preprocess_data(X, y):
    # Preprocess 'Duration' column by removing ' mins' and converting to int
    X['Duration'] = X['Duration'].str.replace(' mins', '').astype(int)
    
    # One-hot encode categorical columns
    categorical_columns = ['Exercise Type', 'Meal Plan', 'Supplements']  # Add all other categorical columns here
    X_processed = pd.get_dummies(X, columns=categorical_columns)

    # Save the columns (features) to a JSON file for later use in prediction
    model_columns = X_processed.columns.tolist()
    with open('model_columns.json', 'w') as f:
        json.dump(model_columns, f)

    # Initialize the StandardScaler
    scaler = StandardScaler()
    X_processed = scaler.fit_transform(X_processed)
    joblib.dump(scaler, 'scaler.pkl')  # Save the scaler

    # Encode the labels
    encoder = LabelEncoder()
    y_processed = encoder.fit_transform(y)

    return X_processed, y_processed


# Define a function to create and compile a Keras neural network model
def create_neural_network(input_dim):
    model = Sequential()
    model.add(Dense(64, input_dim=input_dim, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))  # For binary classification
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

# Initialize the models
def initialize_models(X_train_scaled_shape):
    nn_model = create_neural_network(X_train_scaled_shape)
    lr_model = LogisticRegression(max_iter=150)
    rf_model = RandomForestClassifier(n_estimators=100)
    gb_model = GradientBoostingClassifier(n_estimators=100)
    xgb_model = XGBClassifier()
    return nn_model, lr_model, rf_model, gb_model, xgb_model

# Fit the models
def fit_models(nn_model, lr_model, rf_model, gb_model, xgb_model, X_train_scaled, y_train):
    nn_model.fit(X_train_scaled, y_train, epochs=50, batch_size=10, verbose=1)
    lr_model.fit(X_train_scaled, y_train)
    rf_model.fit(X_train_scaled, y_train)
    gb_model.fit(X_train_scaled, y_train)
    xgb_model.fit(X_train_scaled, y_train)

# Evaluate the models and create a hybrid model
def evaluate_and_create_hybrid(X_val_scaled, y_val, nn_model, lr_model, rf_model, gb_model, xgb_model):
    # Evaluate each model
    nn_val_accuracy = nn_model.evaluate(X_val_scaled, y_val)[1]
    lr_val_accuracy = accuracy_score(y_val, lr_model.predict(X_val_scaled))
    rf_val_accuracy = accuracy_score(y_val, rf_model.predict(X_val_scaled))
    gb_val_accuracy = accuracy_score(y_val, gb_model.predict(X_val_scaled))
    xgb_val_accuracy = accuracy_score(y_val, xgb_model.predict(X_val_scaled))
    
    # Print model accuracies
    print(f"Neural Network Validation Accuracy: {nn_val_accuracy}")
    print(f"Logistic Regression Validation Accuracy: {lr_val_accuracy}")
    print(f"Random Forest Validation Accuracy: {rf_val_accuracy}")
    print(f"Gradient Boosting Validation Accuracy: {gb_val_accuracy}")
    print(f"XGBoost Validation Accuracy: {xgb_val_accuracy}")
    
    # Get predictions for the ensemble
    nn_val_predictions = nn_model.predict(X_val_scaled).reshape(-1)
    lr_val_predictions = lr_model.predict_proba(X_val_scaled)[:, 1]
    rf_val_predictions = rf_model.predict_proba(X_val_scaled)[:, 1]
    gb_val_predictions = gb_model.predict_proba(X_val_scaled)[:, 1]
    xgb_val_predictions = xgb_model.predict_proba(X_val_scaled)[:, 1]
    
    # Create an ensemble prediction by averaging
    ensemble_predictions = np.mean([
        nn_val_predictions,
        lr_val_predictions,
        rf_val_predictions,
        gb_val_predictions,
        xgb_val_predictions
    ], axis=0)
    ensemble_binary_predictions = np.round(ensemble_predictions)
    
    # Calculate and print ensemble accuracy
    ensemble_accuracy = accuracy_score(y_val, ensemble_binary_predictions)
    print(f"Hybrid Ensemble Model Validation Accuracy: {ensemble_accuracy}")

    return ensemble_accuracy 

def save_model(model, filename):
    joblib.dump(model, filename)

# Full update pipeline integrating all models
def full_update_pipeline():

    log_path = "/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data/log.txt"
    
     # Log when the cron job runs
    with open(log_path, "a") as log_file:
        log_file.write(f"Cron job started at {datetime.now()}\n")
        
    X_new, y_new = fetch_data()
    X_processed, y_processed = preprocess_data(X_new, y_new)
    X_train, X_val, y_train, y_val = train_test_split(X_processed, y_processed, test_size=0.2, random_state=42)
    
    # Scale your data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    # Initialize models
    nn_model, lr_model, rf_model, gb_model, xgb_model = initialize_models(X_train_scaled.shape[1])
    
    # Fit models
    fit_models(nn_model, lr_model, rf_model, gb_model, xgb_model, X_train_scaled, y_train)
    
    # Evaluate models and create hybrid model
    ensemble_accuracy = evaluate_and_create_hybrid(X_val_scaled, y_val, nn_model, lr_model, rf_model, gb_model, xgb_model)  
    
    # If ensemble model is satisfactory, save the models
    if ensemble_accuracy > 0.85:  # Threshold accuracy for your use case
        nn_model.save('nn_model.h5')
        save_model(lr_model, 'lr_model.pkl')
        save_model(rf_model, 'rf_model.pkl')
        save_model(gb_model, 'gb_model.pkl')
        save_model(xgb_model, 'xgb_model.pkl')
        
         # Log after all tasks are completed
    with open(log_path, "a") as log_file:
        log_file.write(f"Cron job finished at {datetime.now()}\n")
        
# Run the update pipeline
if __name__ == '__main__':
    full_update_pipeline()