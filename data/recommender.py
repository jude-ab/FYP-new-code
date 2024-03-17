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


# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

# Configure MongoDB connection
client = MongoClient('mongodb+srv://FYPmongoDB:FYPmongoDB@clusterfyp.is4kewv.mongodb.net/yogahub')
db = client.yogahub
users_collection = db.users
feedback_collection = db.feedbacks
healthplans_collection = db.healthplans

# Load health plan data with clusters
health_plans = pd.read_csv('healthplans_with_clusters_with_id.csv')
df = pd.read_csv('healthplans_with_clusters.csv')

# Generate a unique ID for each row and create a new '_id' column
df['_id'] = [str(uuid.uuid4()) for _ in range(len(df))]
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
        
        # Fetch a health plan recommendation based on the user's most common mood
        # Note: The updated function call no longer passes 'health_plans' as an argument
        recommended_plan = recommend_health_plan(most_common_mood, mood_to_cluster_mapping)

        # Add the healthPlanId to the response
        return jsonify({
            "recommendedPlan": recommended_plan,
            "healthPlanId": recommended_plan.get('_id'),
            "mostCommonMood": most_common_mood 
        })

        if recommended_plan:
            return jsonify({"recommendedPlan": recommended_plan})
        else:
            error_msg = "No suitable health plan found based on the mood"
            logging.error(error_msg)  # Log error message
            return jsonify({"error": error_msg}), 404

    except Exception as e:
        logging.exception("An error occurred during health plan recommendation")  # Log exception
        # Here, we log the exception and return a more descriptive message
        return jsonify({"message": "Error fetching health plan recommendations", "exception": str(e)}), 500




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



   
if __name__ == '__main__':
    app.run(debug=True, port=5000)

