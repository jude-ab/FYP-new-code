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

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)

# Configure MongoDB connection
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users
feedback_collection = db.feedbacks
healthplans_collection = db.healthplans

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

# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters_with_id.csv')

# Load serialized models and encoders
def load_pickle(file_name):
    with open(file_name, 'rb') as file:
        return pickle.load(file)

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

# Save the DataFrame back to CSV
df.to_csv('healthplans_with_clusters_with_id.csv', index=False)

# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters_with_id.csv')
print(health_plans.head())

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

# def refine_recommendations(user_id):
#     feedbacks = list(feedback_collection.find({"userId": ObjectId(user_id)}))
#     bulk_operations = []

#     for feedback in feedbacks:
#         score_modifier = 1 if feedback['feedback'] == 'like' else -1
#         health_plan_id = feedback['healthPlanId']

#         # Check if health plan ID is a valid ObjectId or a string (UUID in your case)
#         try:
#             # If it's already a valid ObjectId string, it will pass
#             ObjectId(health_plan_id)
#             is_valid_id = True
#         except InvalidId:
#             # It's not a valid ObjectId, so it must be a UUID string
#             is_valid_id = False

#         if is_valid_id:
#             # ObjectId format is correct, proceed with the update
#             if healthplans_collection.find_one({'_id': ObjectId(health_plan_id)}):
#                 bulk_operations.append(
#                     UpdateOne(
#                         {'_id': ObjectId(health_plan_id)},
#                         {'$inc': {'score': score_modifier}}
#                     )
#                 )
#         else:
#             # Health plan ID is not a valid ObjectId, handle it as a UUID string
#             # If your MongoDB collection uses UUIDs as strings, you can query directly with the string
#             if healthplans_collection.find_one({'_id': health_plan_id}):
#                 bulk_operations.append(
#                     UpdateOne(
#                         {'_id': health_plan_id},
#                         {'$inc': {'score': score_modifier}}
#                     )
#                 )
#         # If it's neither an ObjectId nor a UUID, log a warning
#     else:
#         logging.warning(f"Invalid health plan ID: {health_plan_id}")

#     # Perform bulk update to MongoDB if there are operations to execute
#     if bulk_operations:
#         healthplans_collection.bulk_write(bulk_operations)

def refine_recommendations(user_id):
    feedbacks = list(feedback_collection.find({"userId": ObjectId(user_id)}))
    bulk_operations = []

    for feedback in feedbacks:
        score_modifier = 1 if feedback['feedback'] == 'like' else -1
        health_plan_id = feedback['healthPlanId']
        
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

    # Since the health_plan_id is a UUID string, no need to convert it to ObjectId
    health_plan = healthplans_collection.find_one({'_id': health_plan_id})
    if not health_plan_id or not health_plan or not user_id:
        return jsonify({"error": "Invalid userId or healthPlanId"}), 400

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


def recommend_health_plan(mood, health_plans_df, mood_to_cluster_mapping):
    cluster_label = mood_to_cluster_mapping.get(mood, None)
    if cluster_label is None:
        return {"error": "No recommendation available for this mood."}

    if 'cluster' not in health_plans_df.columns:
        return {"error": "Cluster information is missing in health plans data."}

    # Filter plans by the cluster label associated with the mood
    plans_in_cluster = health_plans_df[health_plans_df['cluster'] == cluster_label]
    if plans_in_cluster.empty:
        return {"error": "No health plans available for this cluster."}
    
    # Sort the filtered plans based on the score and select the best-scoring plan
    best_plan = plans_in_cluster.sort_values(by='score', ascending=False).iloc[0].to_dict()
    
    # Convert _id to string if it's not already in string format
    best_plan['_id'] = str(best_plan['_id'])
    
    return best_plan

@app.route('/health/recommend', methods=['POST'])
def get_health_plan_recommendation():
    try:
        data = request.json
        user_id = data.get('userId')
        week_number = data.get('weekNumber')

        if user_id is None or week_number is None:
            return jsonify({"error": "User ID or week number not specified"}), 400
        
        # Call the function to refine health plans based on user feedback
        refine_recommendations(user_id)

        # Calculate the week's start and end dates
        current_week_start = datetime.utcnow().replace(tzinfo=pytz.utc) - timedelta(days=datetime.utcnow().weekday() + (week_number * 7))
        current_week_end = current_week_start + timedelta(days=7)

        # Assume `get_most_common_mood_for_user` is a function that returns the most common mood
        most_common_mood = get_most_common_mood_for_user(user_id, current_week_start, current_week_end)

        # Use the MongoDB aggregation pipeline to find the best health plan for the most common mood
        cluster_label = mood_to_cluster_mapping.get(most_common_mood, None)
        if cluster_label is None:
            return jsonify({"error": "No recommendation available for this mood."}), 404

        best_health_plan = healthplans_collection.find_one(
            {'cluster': cluster_label},
            sort=[('score', DESCENDING)]
        )

        if not best_health_plan:
            return jsonify({"error": "No suitable health plan found"}), 404
        
        best_health_plan['_id'] = str(best_health_plan['_id'])  # Convert ObjectId to string
        return jsonify({"healthPlanId": best_health_plan['_id'], "recommendedPlan": best_health_plan})

    except Exception as e:
        logging.exception("An error occurred during recommendation")
        return jsonify({"error": str(e)}), 500

def get_most_common_mood_for_user(user_id, start, end):
    logging.basicConfig(level=logging.DEBUG)
    
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user_data or 'moods' not in user_data:
        return None
    
    moods_df = pd.DataFrame(user_data['moods'])
    
    # Ensure both start and end are timezone-naive or timezone-aware before comparison
    moods_df['date'] = pd.to_datetime(moods_df['date']).dt.tz_localize(None)
    start = start.replace(tzinfo=None)
    end = end.replace(tzinfo=None)
    
    logging.debug(f"Start date type: {type(start)}; Value: {start}")
    logging.debug(f"End date type: {type(end)}; Value: {end}")
    logging.debug(f"'date' column dtype: {moods_df['date'].dtype}")
    
    # Now compare
    weekly_moods = moods_df[(moods_df['date'] >= start) & (moods_df['date'] <= end)]
    
    if weekly_moods.empty:
        return None
    
    return weekly_moods['mood'].mode()[0]
   
if __name__ == '__main__':
    app.run(debug=True, port=5000)

