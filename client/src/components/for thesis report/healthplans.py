from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import pytz
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

# Connect to MongoDB
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users

# Define the current week's start and end dates
current_week_start = datetime.now(pytz.utc) - timedelta(days=datetime.now(pytz.utc).weekday())  # Start of the current week
current_week_end = current_week_start + timedelta(days=7)  # End of the current week

# Function to get the most common mood for a user during the current week
def get_most_common_mood_for_user(user_id, start, end):
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    mood_data = user_data['moods']
    moods_df = pd.DataFrame(mood_data)
    moods_df['date'] = pd.to_datetime(moods_df['date'])
    
    # Filter moods for the current week
    weekly_moods = moods_df[(moods_df['date'] >= start) & (moods_df['date'] < end)]
    
    if weekly_moods.empty:
        return None  # No moods for the current week
    
    # Find the most common mood
    most_common_mood = weekly_moods['mood'].mode()[0]
    return most_common_mood

# Load health plan data
health_plans = pd.read_csv('healthplans.csv')

# Convert 'Duration' to minutes
health_plans['Duration_mins'] = health_plans['Duration'].str.extract('(\d+)').astype(int)

# Define columns that you want to one-hot encode
categorical_cols = ['Exercise Type', 'Meal Plan', 'Supplements']

# Initializing OneHotEncoder
ohe = OneHotEncoder()

# Applying OneHotEncoder to categorical columns
ohe_result = ohe.fit_transform(health_plans[categorical_cols]).toarray()

# Fetching new column names for one-hot encoded features
ohe_feature_names = ohe.get_feature_names_out(categorical_cols)

# Creating a DataFrame with the one-hot encoded features
transformed_df = pd.DataFrame(ohe_result, columns=ohe_feature_names)

# Adding the 'Duration_mins' column to the transformed DataFrame
transformed_df['Duration_mins'] = health_plans['Duration_mins'].values

n_clusters = 4
# Perform K-Means clustering
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
health_plans['cluster'] = kmeans.fit_predict(transformed_df)

# Check the distribution of health plans across clusters
print(health_plans['cluster'].value_counts())

# This is a simplistic mapping and should be refined based on your application's needs
mood_to_cluster = {
    'happy': 0,
    'sad': 1,
    'anxious': 2,
    'frustrated': 3
}

# Function to fetch the most common mood for a user
def get_most_common_mood_for_user(user_id, start, end, users_collection):
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user_data or 'moods' not in user_data:
        return None
    moods_df = pd.DataFrame(user_data['moods'])
    moods_df['date'] = pd.to_datetime(moods_df['date']).dt.tz_localize(None)  # Convert dates to tz-naive
    
    # Ensure the start and end are also tz-naive for consistent comparison
    start = start.replace(tzinfo=None)
    end = end.replace(tzinfo=None)
    
    weekly_moods = moods_df[(moods_df['date'] >= start) & (moods_df['date'] < end)]
    if weekly_moods.empty:
        return None
    return weekly_moods['mood'].mode()[0]


# Function to recommend a health plan based on the most common mood
def recommend_health_plan(mood, health_plans_df, mood_to_cluster_mapping):
    cluster_label = mood_to_cluster_mapping.get(mood, None)
    if cluster_label is None:
        return "No recommendation available for this mood."
    plans_in_cluster = health_plans_df[health_plans_df['cluster'] == cluster_label]
    if plans_in_cluster.empty:
        return "No health plans available for this cluster."
    return plans_in_cluster.sample(n=1).iloc[0]

# Example: Recommend a health plan for a specific user
user_id = '65b8040aed41a4731d3a6564'  # Use an actual ObjectId from your users collection
most_common_mood = get_most_common_mood_for_user(user_id, current_week_start, current_week_end, users_collection)
if most_common_mood:
    recommended_plan = recommend_health_plan(most_common_mood, health_plans, mood_to_cluster)
    print(f"Recommended Health Plan for mood '{most_common_mood}':\n{recommended_plan}")
else:
    print("No common mood found for the user in the current week.")
