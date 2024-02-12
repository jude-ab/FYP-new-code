from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import pytz
import pickle
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder
import logging

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users

# Load serialized models and encoders
def load_pickle(file_name):
    with open(file_name, 'rb') as file:
        return pickle.load(file)

kmeans_model = load_pickle('kmeans_model.pkl')
onehot_encoder = load_pickle('onehot_encoder.pkl')
mood_to_cluster_mapping = load_pickle('mood_to_cluster_mapping.pkl')
# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters.csv')

@app.route('/health/recommend', methods=['POST'])
def get_health_plan_recommendation():
    try:
        data = request.json
        user_id = data.get('userId')
        week_number = data.get('weekNumber')

        if user_id is None or week_number is None:
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

    return plans_in_cluster.sample(n=1).iloc[0].to_dict()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
