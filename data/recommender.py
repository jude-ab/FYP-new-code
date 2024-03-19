from flask import Flask, request, jsonify
import pandas as pd
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from pymongo import MongoClient, UpdateOne, DESCENDING
from bson import ObjectId
from datetime import datetime, timedelta
import pytz
import pickle
import uuid
import logging
from flask_cors import CORS
from bson.errors import InvalidId
from bson import ObjectId
import pytz
from flask_apscheduler import APScheduler
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from keras.models import Sequential, load_model
from keras.layers import Dense, Input
import numpy as np
import json
import os

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)

import sklearn
print(sklearn.__version__)

logging.basicConfig(level=logging.INFO)

base_model_dir = '/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data'
rf_model_path = os.path.join(base_model_dir, 'rf_model.pkl')
rf_model = joblib.load(rf_model_path)


# Define the connection string for MongoDB
MONGODB_CONNECTION = "mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub"

# Configure MongoDB connection
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users
feedback_collection = db.feedbacks
healthplans_collection = db.healthplans  

poses_processed = pd.read_csv("poses_processed.csv")       

# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters_with_id.csv')
df = pd.read_csv('healthplans_with_clusters.csv')

# Generate a unique ID for each row and create a new '_id' column
df['_id'] = [str(uuid.uuid4()) for _ in range(len(df))]

# Initialize and configure the scheduler
scheduler = APScheduler()
scheduler.init_app(app)
# Start the scheduler
scheduler.start()

# Initialize NLP resources
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Load serialized models and data
with open('yoga_pose.pkl', 'rb') as file:
    yoga_pose = pickle.load(file)
with open('similarity.pkl', 'rb') as file:
    similarity = pickle.load(file)
with open('yoga_mood.pkl', 'rb') as file:
    yoga_mood = pickle.load(file)
with open('kmeans_model.pkl', 'rb') as file:
    kmeans_model = pickle.load(file)
with open('onehot_encoder.pkl', 'rb') as file:
    onehot_encoder = pickle.load(file)
with open('mood_to_cluster_mapping.pkl', 'rb') as file:
    mood_to_cluster_mapping = pickle.load(file)

# Load serialized models and encoders
def load_pickle(file_name):
    with open(file_name, 'rb') as file:
        return pickle.load(file)
    
# Load the serialized models into memory using the load_model function
nn_model = load_model('nn_model.keras')
lr_model = joblib.load('lr_model.pkl')
gb_model = joblib.load('gb_model.pkl')
xgb_model = joblib.load('xgb_model.pkl')
rf_model = joblib.load('rf_model.pkl') 

# def test_job():
#     logging.info("The test job has been executed.")

# Create lemmatizer and stopwords list 
#function that tokenizes, lemmatizes, and removes stop words from text
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

kmeans_model = load_pickle('kmeans_model.pkl')
onehot_encoder = load_pickle('onehot_encoder.pkl')
mood_to_cluster_mapping = load_pickle('mood_to_cluster_mapping.pkl')

df = pd.read_csv('healthplans_with_clusters.csv')

# Generate a unique ID for each row and create a new '_id' column
df['_id'] = [str(uuid.uuid4()) for _ in range(len(df))]

def lemmatize_and_remove_stopwords(text):
    tokens = word_tokenize(text.lower())
    lemmatized = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words and token.isalpha()]
    return lemmatized

# Preprocess data
mood_keywords = {
    "frustrated": lemmatize_and_remove_stopwords(" menopausal fever tension"),
    "sad": lemmatize_and_remove_stopwords(" phsychological depression humour"),
    "anxious": lemmatize_and_remove_stopwords("nervous relaxtion imbalance"),
    "happy": lemmatize_and_remove_stopwords("spiritual stronger plexus")
}

# Adapted recommend function
def recommend_by_mood(mood, poses):
    recommended_poses = []
    keywords = mood_keywords.get(mood, [])
    for index, row in poses.iterrows():
        if any(keyword in row['ProcessedDescription'] for keyword in keywords):
            recommended_poses.append(row['AName'])
    return recommended_poses

@app.route('/recommend', methods=['POST'])
def get_recommendation_by_mood():
    try:
        data = request.json
        mood = data.get('moods')
        if mood:
            recommendations = recommend_by_mood(mood, yoga_mood)
            return jsonify(recommendations)
        else:
            return jsonify({"error": "Mood not specified"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/yoga/pose', methods=['GET'])
def get_pose_by_name():
    try:
        pose_name = request.args.get('name')  # Get the pose name from query parameters
        if not pose_name:
            return jsonify({"error": "Pose name is required"}), 400

        pose = db.yogaposes.find_one({"AName": pose_name})  # Replace 'yoga_poses' with your collection name
        if not pose:
            return jsonify({"error": "Pose not found"}), 404

        # Convert the ObjectId to a string so it can be JSON serialized
        pose['_id'] = str(pose['_id'])
        return jsonify(pose)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Function to convert MongoDB data to a pandas DataFrame
def mongodb_to_dataframe_with_score_init(collection):
    documents = list(collection.find())
    dataframe = pd.DataFrame(documents)
    
    # Initialize score column if it doesn't exist
    if 'score' not in dataframe.columns:
        dataframe['score'] = 0
    
    return dataframe

def refine_recommendations(user_id):
    feedbacks = list(feedback_collection.find({"userId": ObjectId(user_id)}))
    bulk_operations = []

    for feedback in feedbacks:
        score_modifier = 1 if feedback['feedback'] == 'like' else -1
        health_plan_id = feedback['healthPlanId']
        
        print("health_plan_id:", health_plan_id)
        print("Type of health_plan_id:", type(health_plan_id))

        # Directly use the health_plan_id string to find the document
        if healthplans_collection.find_one({'_id': health_plan_id}):
            bulk_operations.append(
                UpdateOne(
                    {'_id': health_plan_id},
                    {'$inc': {'score': score_modifier}}
                )
            )
        else:
            logging.warning(f"No match found for health plan ID: {health_plan_id}")
    
    # Perform bulk update to MongoDB if there are operations to execute
    if bulk_operations:
        healthplans_collection.bulk_write(bulk_operations)

@app.route('/api/health/feedback', methods=['POST'])
def collect_feedback():
    feedback_data = request.json
    user_id = feedback_data.get('userId')
    health_plan_id = feedback_data.get('healthPlanId')

    # Debug: Print out the health plan ID received to check
    print("Received health plan ID:", health_plan_id)

    # Since the health_plan_id is a UUID string, no need to convert it to ObjectId
    health_plan = healthplans_collection.find_one({'_id': health_plan_id})

    # Debug: Print whether a matching health plan was found
    if health_plan:
        print("Matching health plan found for ID:", health_plan_id)
    else:
        print("No matching health plan found for ID:", health_plan_id)
        return jsonify({"error": "Health plan ID is not available."}), 400

    # Insert feedback into MongoDB
    feedback_collection.insert_one(feedback_data)
    return jsonify({"message": "Feedback received"}), 201

# This function should be defined in your Flask app to update the scores based on feedback.
def update_scores_with_feedback(feedback_df, health_plans_df):
    for _, feedback in feedback_df.iterrows():
        plan_id = feedback['healthPlanId']
        user_feedback = feedback['feedback']
        
        # Check if the health plan ID from feedback exists in the DataFrame
        if plan_id in health_plans_df['_id'].values:
            # Update the score based on feedback
            if user_feedback == 'like':
                health_plans_df.loc[health_plans_df['_id'] == plan_id, 'score'] += 1
            elif user_feedback == 'dislike':
                health_plans_df.loc[health_plans_df['_id'] == plan_id, 'score'] -= 1
        else:
            # Log warning if health plan ID from feedback doesn't exist
            print(f"Warning: Health plan ID {plan_id} from feedback doesn't exist in health plans.")

def recommend_health_plan(mood, mood_to_cluster_mapping):
    cluster_label = mood_to_cluster_mapping.get(mood, None)
    if cluster_label is None:
        return {"error": "No recommendation available for this mood."}

    # Query health plans by cluster label and sort by score
    cursor = healthplans_collection.find({"cluster": cluster_label}).sort("score", DESCENDING)
    health_plans = list(cursor)
    
    if not health_plans:
        return {"error": "No health plans available for this cluster."}
    
    # Check if the first document has a "score" field and log the result
    if "score" in health_plans[0]:
        print("Score field found in the first document of the result set.")
    else:
        print("Score field not found in the first document of the result set.")
    
    # Select the best-scoring plan
    best_plan = health_plans[0]
    best_plan['_id'] = str(best_plan['_id'])  # Convert ObjectId to string for JSON serialization
    
    return best_plan

def prepare_prediction_input(input_data):
    # List of all expected feature names based on training
    expected_feature_names = [
        'Duration',  # Assuming 'Duration' was included as a numerical feature
        'Exercise Type_Cycling', 'Exercise Type_Dancing', 'Exercise Type_Hiking', 'Exercise Type_Strength Training',
        'Meal Plan_Gluten-Free Diet',  # Add all other categories and features
    ]
    # Initialize a DataFrame with zeros for all expected features
    prepared_input_data = pd.DataFrame(0, index=np.arange(len(input_data)), columns=expected_feature_names)
    # Fill in the actual values for the features present in input_data
    for feature in input_data.columns:
        if feature in prepared_input_data.columns:
            prepared_input_data[feature] = input_data[feature]
    # Ensure 'Duration' and any other continuous variables are processed as they were during training
    return prepared_input_data


@app.route('/health/recommend', methods=['POST'])
def get_health_plan_recommendation():
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "User ID not specified"}), 400
        
        # Call the function to update health plans based on user feedback before making a recommendation
        refine_recommendations(user_id)

        # Determine the user's most common mood for the last 7 days
        most_common_mood = get_most_common_mood_for_user(user_id)

        if not most_common_mood:
            error_msg = "Could not determine the user's most common mood for the last 7 days"
            logging.error(error_msg)  # Log error message
            return jsonify({"error": error_msg}), 404
        
        # Fetch the recommended health plan
        recommended_plan = recommend_health_plan(most_common_mood, mood_to_cluster_mapping)

        if not recommended_plan:
            return jsonify({"error": "No suitable health plan found"}), 404
        
       # Prepare for prediction
        recommended_plan_df = pd.DataFrame([recommended_plan])  # Convert dict to DataFrame
        prepared_data_for_prediction = prepare_prediction_input(recommended_plan_df)
        
        # Now, use the preprocessed data for scaling and making predictions
        processed_data_for_prediction = process_input_data_for_prediction(prepared_data_for_prediction)
        predictions = get_predictions_from_models(processed_data_for_prediction)
        
        # Handle prediction results
        # Your logic to interpret predictions and respond accordingly
        
        return jsonify({
            "recommendedPlan": recommended_plan,  # Adjust based on your data structure
            "healthPlanId": recommended_plan.get('_id'),
            "mostCommonMood": most_common_mood
        })
    except Exception as e:
        logging.exception("An error occurred during health plan recommendation")
        return jsonify({"error": str(e)}), 500

def get_most_common_mood_for_user(user_id):
    # Get today's date in UTC and calculate the date 7 days ago
    utc_zone = pytz.utc
    end_date = datetime.utcnow().replace(tzinfo=utc_zone)
    start_date = end_date - timedelta(days=6)

    # Print or log the values of start_date and end_date
    logging.info(f"Calculating most common mood from {start_date} to {end_date}")
    
    pipeline = [
        {"$match": {"_id": ObjectId(user_id)}},
        {"$unwind": "$moods"},
        {"$match": {"moods.date": {"$gte": start_date, "$lte": end_date}}},
        {"$group": {
            "_id": "$moods.mood",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    
    # Print or log the pipeline variable
    logging.info(f"Aggregation pipeline for mood calculation: {pipeline}")
    
    result = users_collection.aggregate(pipeline)
    most_common_mood = list(result)
    if most_common_mood:
        mood, count = most_common_mood[0]['_id'], most_common_mood[0]['count']
        logging.info(f"Most common mood for the last 7 days: {mood} (Count: {count})")
        return mood
    else:
        logging.info("No moods found in the last 7 days.")
        return None
    
# Global variable for the scaler
scaler = None

def load_scaler():
    global scaler
    scaler = joblib.load('scaler.pkl')

load_scaler()
    
# Define the function to load or reload the models into memory
def load_models():
    global nn_model, lr_model, rf_model, gb_model, xgb_model

    try:
        nn_model_path = os.path.join(base_model_dir, 'nn_model.keras')
        lr_model_path = os.path.join(base_model_dir, 'lr_model.pkl')
        gb_model_path = os.path.join(base_model_dir, 'gb_model.pkl')
        xgb_model_path = os.path.join(base_model_dir, 'xgb_model.pkl')
        rf_model_path = os.path.join(base_model_dir, 'rf_model.pkl')

        nn_model = load_model(nn_model_path)
        lr_model = joblib.load(lr_model_path)
        gb_model = joblib.load(gb_model_path)
        xgb_model = joblib.load(xgb_model_path)
        rf_model = joblib.load(rf_model_path)
        logging.info("All models loaded successfully.")
    except Exception as e:
        logging.error("Failed to load models: {}".format(e))
        raise e

@scheduler.task('interval', id='fetch_data_job', seconds=200, misfire_grace_time=900)
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

def preprocess_data(input_X, input_y):
    # Initialize X_processed
    X_processed = pd.DataFrame(input_X)
    
    # Preprocess 'Duration' column by removing ' mins' and converting to int
    X_processed['Duration'] = X_processed['Duration'].str.replace(' mins', '').astype(int)
    
    # One-hot encode categorical columns
    X_processed = pd.get_dummies(X_processed, columns=['Exercise Type', 'Meal Plan', 'Supplements'])
    
    # After preprocessing but before scaling, save feature names
    feature_names = X_processed.columns.tolist()
    with open('feature_names.pkl', 'wb') as f:
        pickle.dump(feature_names, f)

    # Initialize the StandardScaler
    scaler = StandardScaler()
    X_processed = scaler.fit_transform(X_processed)

    # Convert X_processed back to DataFrame with expected feature names
    X_processed = pd.DataFrame(X_processed, columns=feature_names)

    # Encode the labels
    encoder = LabelEncoder()
    y_processed = encoder.fit_transform(input_y)

    # Assuming X_train_processed is your processed training data
    columns_after_preprocessing = X_processed.columns.tolist()   

    with open('/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data/model_columns.json', 'w') as file:
        json.dump(columns_after_preprocessing, file) 

    return X_processed, y_processed, feature_names

# Define a function to create and compile a Keras neural network model
def create_neural_network(input_dim):
    model = Sequential()
    model.add(Input(shape=(input_dim,))) 
    model.add(Dense(64, activation='relu'))
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

    # log_path = "/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data/log.txt"
    
    #  # Log when the cron job runs
    # with open(log_path, "a") as log_file:
    #     log_file.write(f"Cron job started at {datetime.now()}\n")
        
    X_new, y_new = fetch_data()
    X_processed, y_processed, feature_names = preprocess_data(X_new, y_new)
    X_train, X_val, y_train, y_val = train_test_split(X_processed, y_processed, test_size=0.2, random_state=42)
    
    # Scale your data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    joblib.dump(scaler, 'scaler.pkl')

    # Initialize models
    nn_model, lr_model, rf_model, gb_model, xgb_model = initialize_models(X_train_scaled.shape[1])
    
    # Fit models
    fit_models(nn_model, lr_model, rf_model, gb_model, xgb_model, X_train_scaled, y_train)
    
    # Evaluate models and create hybrid model
    ensemble_accuracy = evaluate_and_create_hybrid(X_val_scaled, y_val, nn_model, lr_model, rf_model, gb_model, xgb_model)  
    
    model_path = 'nn_model.keras'
    os.chmod(model_path, 0o644) 

    # If ensemble model is satisfactory, save the models
    if ensemble_accuracy > 0.85:  # Threshold accuracy for your use case
        nn_model = load_model(model_path)
        save_model(lr_model, 'lr_model.pkl')
        try:
            logging.info(f"Loading model from {rf_model_path}")
            rf_model = joblib.load(rf_model_path)
            logging.info("Model loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load model: {e}")
        save_model(gb_model, 'gb_model.pkl')
        save_model(xgb_model, 'xgb_model.pkl')

         # After saving the models, reload them into memory
        load_models()
        
    #      # Log after all tasks are completed
    # with open(log_path, "a") as log_file:
    #     log_file.write(f"Cron job finished at {datetime.now()}\n")


# Setup a scheduled job to train models periodically
@scheduler.task('interval', id='train_models_job', seconds=200, misfire_grace_time=900)
def scheduled_model_training():
    full_update_pipeline()
    logging.info("The job has been executed.")
    

def process_input_data_for_prediction(input_data):
    scaler_file = 'scaler.pkl'
    if not os.path.exists(scaler_file):
        raise FileNotFoundError(f"{scaler_file} not found. Ensure the scaler is properly saved during the training phase.")

    # Directly load the scaler here
    scaler = joblib.load(scaler_file)
    
    # The rest of your function...
    expected_columns = load_expected_columns()
    
    # Preprocessing 'Duration' to numeric if it's a feature in your model
    if 'Duration' in input_data:
        input_data['Duration'] = input_data['Duration'].astype(str).str.replace(' mins', '').astype(int)


    # Apply one-hot encoding to the categorical variables present in the input data
    input_data_processed = pd.get_dummies(input_data)

    # Add missing columns with 0s based on the expected columns saved during training
    missing_cols = set(expected_columns) - set(input_data_processed.columns)
    for c in missing_cols:
        input_data_processed[c] = 0
    
    # Ensure the order of columns matches the training data
    input_data_processed = input_data_processed[expected_columns]

    # Scale the data
    input_data_scaled = scaler.transform(input_data_processed)

    return input_data_scaled

def load_expected_columns():
    with open('/Users/judeabouhajar/My Drive/College/4th year /FYP/Final-Year-Project-master 2/data/model_columns.json', 'r') as file:
        columns = json.load(file)
    return columns

def get_predictions_from_models(X_to_predict):
    # Get predictions from each model
    nn_predictions = nn_model.predict(X_to_predict).reshape(-1)
    lr_predictions = lr_model.predict_proba(X_to_predict)[:, 1]
    rf_predictions = rf_model.predict_proba(X_to_predict)[:, 1]
    gb_predictions = gb_model.predict_proba(X_to_predict)[:, 1]
    xgb_predictions = xgb_model.predict_proba(X_to_predict)[:, 1]

    # Combine predictions - here we take a simple average
    ensemble_predictions = np.mean([
        nn_predictions,
        lr_predictions,
        rf_predictions,
        gb_predictions,
        xgb_predictions
    ], axis=0)
    
    return ensemble_predictions

# Initialize and configure the scheduler
scheduler = APScheduler()
scheduler.init_app(app)

# Schedule the test job
# scheduler.add_job(func=test_job, trigger="interval", seconds=200, id="test_job")
scheduler.add_job(func=scheduled_model_training, trigger="interval", seconds=200, id="scheduled_model_training")
scheduler.add_job(func=fetch_data, trigger="interval", seconds=200, id="fetch_data")
scheduler.add_job(func=full_update_pipeline, trigger="interval", seconds=200, id="full_update_pipeline")

# Start the scheduler
scheduler.start()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
