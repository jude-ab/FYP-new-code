from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
import pandas as pd  # Import pandas
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import pytz
import pickle
import logging

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users

# Load data and models using pickle
with open('yoga_pose.pkl', 'rb') as file:
    new_df = pickle.load(file)

with open('similarity.pkl', 'rb') as file:
    similarity = pickle.load(file)

with open('yoga_mood.pkl', 'rb') as file:
    yoga_mood = pickle.load(file)

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
# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters.csv')

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

 
@app.route('/health/recommend', methods=['POST'])
def get_health_plan_recommendation():
    try:
        data = request.json
        user_id = data.get('userId')
        week_number = data.get('weekNumber')
        print(f"Received user_id: {user_id}, week_number: {week_number}")

        # Before fetching user data
        print("Fetching user data...")
        # Before calculating the most common mood
        print("Calculating most common mood...")
        # Before recommending health plan
        print("Recommending health plan...")

        if user_id is None or week_number is None:
            print("Missing user_id or week_number")  # Debug print
            return jsonify({"error": "User ID or week number not specified"}), 400

        # Calculate the start and end date for the given week number
        current_week_start = datetime.now(pytz.utc) - timedelta(days=datetime.now(pytz.utc).weekday() + week_number * 7)
        current_week_end = current_week_start + timedelta(days=7)

        # Ensure the dates are timezone-naive for comparison
        current_week_start = current_week_start.replace(tzinfo=None)
        current_week_end = current_week_end.replace(tzinfo=None)

        most_common_mood = get_most_common_mood_for_user(user_id, current_week_start, current_week_end)

        recommended_plan = recommend_health_plan(most_common_mood, health_plans, mood_to_cluster_mapping)
        if "error" in recommended_plan:
            return jsonify(recommended_plan), 400
        return jsonify(recommended_plan)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

def get_most_common_mood_for_user(user_id, start, end):
    logging.basicConfig(level=logging.DEBUG)
    
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user_data or 'moods' not in user_data:
        return None
    
    moods_df = pd.DataFrame(user_data['moods'])
    moods_df['date'] = pd.to_datetime(moods_df['date']).dt.tz_localize(None)

    logging.debug(f"Start date type: {type(start)}; Value: {start}")
    logging.debug(f"End date type: {type(end)}; Value: {end}")
    logging.debug(f"'date' column dtype: {moods_df['date'].dtype}")

    weekly_moods = moods_df[(moods_df['date'] >= start) & (moods_df['date'] <= end)]
    if weekly_moods.empty:
        return None
    return weekly_moods['mood'].mode()[0]

def recommend_health_plan(mood, health_plans_df, mood_to_cluster_mapping):
    cluster_label = mood_to_cluster_mapping.get(mood, None)
    if cluster_label is None:
        return {"error": "No recommendation available for this mood."}

    if 'cluster' not in health_plans_df.columns:
        return {"error": "Cluster information is missing in health plans data."}

    plans_in_cluster = health_plans_df[health_plans_df['cluster'] == cluster_label]
    if plans_in_cluster.empty:
        return {"error": "No health plans available for this cluster."}

    return plans_in_cluster.sort_values(by='Exercise Type').iloc[0].to_dict()
   
if __name__ == '__main__':
    app.run(debug=True, port=5000)

