from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
import mysql.connector

# ==========================================
# MYSQL DATABASE CONFIGURATION
# ==========================================

DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "Indrajeet@123",
    "database": "fad_system",
    "port": 3306
}

# ==========================================
# MYSQL CONNECTION FUNCTION
# ==========================================

def get_db_connection():

    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"],
        port=DB_CONFIG["port"]
    )

# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)

CORS(app)


# ==========================================
# LOAD MACHINE LEARNING MODEL
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "fake_account_model.pkl"
)


try:

    model = joblib.load(MODEL_PATH)

    print("===================================")
    print("ML MODEL LOADED SUCCESSFULLY!")
    print("===================================")

except Exception as error:

    print("===================================")
    print("ERROR LOADING ML MODEL")
    print("===================================")

    print(error)

    model = None


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

# ==========================================
# SAVE DETECTION RESULT TO MYSQL
# ==========================================

db = None
cursor = None

try:

    db = get_db_connection()

    cursor = db.cursor()

    insert_query = """
        INSERT INTO detection_history (
            username,
            followers,
            following,
            posts,
            accountAge,
            averageLikes,
            averageComments,
            engagement,
            profilePicture,
            bio,
            verified,
            prediction,
            result,
            riskLevel,
            fakeProbability,
            genuineProbability
        )
        VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
    """

    values = (
        data.get("username", "Unknown"),
        int(followers),
        int(following),
        int(posts),
        int(account_age),
        int(average_likes),
        int(average_comments),
        float(engagement),
        data["profilePicture"],
        data["bio"],
        data["verified"],
        int(prediction),
        result,
        risk_level,
        round(fake_probability, 2),
        round(genuine_probability, 2)
    )

    cursor.execute(
        insert_query,
        values
    )

    db.commit()

    print("DATABASE: Detection saved successfully!")

except Exception as db_error:

    print(
        "DATABASE ERROR:",
        db_error
    )

finally:

    if cursor:
        cursor.close()

    if db:
        db.close()

    return jsonify({

        "success": True,

        "message":
        "Fake Account Detection API is running successfully!"

    })


# ==========================================
# HELPER FUNCTION
# ==========================================

def convert_to_binary(value):

    """
    Convert Yes/No values received from
    frontend into 1/0 for ML model.
    """

    if isinstance(value, bool):

        return 1 if value else 0

    value = str(value).strip().lower()

    if value in ["yes", "true", "1"]:

        return 1

    return 0


# ==========================================
# PREDICTION API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # ==========================================
        # CHECK MODEL
        # ==========================================

        if model is None:

            return jsonify({

                "success": False,

                "error":
                "Machine learning model could not be loaded."

            }), 500


        # ==========================================
        # GET JSON DATA
        # ==========================================

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                "No account data received."

            }), 400


        # ==========================================
        # REQUIRED FEATURES
        # ==========================================

        required_fields = [

            "followers",
            "following",
            "posts",
            "accountAge",
            "averageLikes",
            "averageComments",
            "engagement",
            "profilePicture",
            "bio",
            "verified"

        ]


        # ==========================================
        # CHECK MISSING FIELDS
        # ==========================================

        missing_fields = [

            field

            for field in required_fields

            if field not in data
            or data[field] is None
            or data[field] == ""

        ]


        if missing_fields:

            return jsonify({

                "success": False,

                "error":
                "Missing required fields.",

                "missingFields":
                missing_fields

            }), 400


        # ==========================================
        # CONVERT INPUT VALUES
        # ==========================================

        followers = float(
            data["followers"]
        )

        following = float(
            data["following"]
        )

        posts = float(
            data["posts"]
        )

        account_age = float(
            data["accountAge"]
        )

        average_likes = float(
            data["averageLikes"]
        )

        average_comments = float(
            data["averageComments"]
        )

        engagement = float(
            data["engagement"]
        )


        profile_picture = convert_to_binary(
            data["profilePicture"]
        )

        bio = convert_to_binary(
            data["bio"]
        )

        verified = convert_to_binary(
            data["verified"]
        )


        # ==========================================
        # BASIC VALUE VALIDATION
        # ==========================================

        numeric_values = {

            "followers": followers,

            "following": following,

            "posts": posts,

            "accountAge": account_age,

            "averageLikes": average_likes,

            "averageComments": average_comments,

            "engagement": engagement

        }


        for field, value in numeric_values.items():

            if value < 0:

                return jsonify({

                    "success": False,

                    "error":
                    f"{field} cannot be negative."

                }), 400


        # ==========================================
        # CREATE ML INPUT
        # EXACT SAME FEATURES AS TRAINING
        # ==========================================

        features = pd.DataFrame([{

            "followers":
            followers,

            "following":
            following,

            "posts":
            posts,

            "accountAge":
            account_age,

            "averageLikes":
            average_likes,

            "averageComments":
            average_comments,

            "engagement":
            engagement,

            "profilePicture":
            profile_picture,

            "bio":
            bio,

            "verified":
            verified

        }])


        # ==========================================
        # MAKE PREDICTION
        # ==========================================

        prediction = model.predict(
            features
        )[0]


        # ==========================================
        # GET PROBABILITIES
        # ==========================================

        probabilities = model.predict_proba(
            features
        )[0]


        # ==========================================
        # GET FAKE PROBABILITY SAFELY
        # ==========================================

        fake_probability = 0.0

        genuine_probability = 0.0


        for class_value, probability in zip(
            model.classes_,
            probabilities
        ):

            if int(class_value) == 1:

                fake_probability = (
                    float(probability) * 100
                )

            elif int(class_value) == 0:

                genuine_probability = (
                    float(probability) * 100
                )


        # ==========================================
        # DETERMINE RESULT
        # ==========================================

        if int(prediction) == 1:

            result = (
                "⚠️ Fake / Suspicious Account"
            )

        else:

            result = (
                "✅ Likely Genuine Account"
            )


        # ==========================================
        # DETERMINE RISK LEVEL
        # ==========================================

        if fake_probability >= 70:

            risk_level = "🔴 HIGH RISK"

        elif fake_probability >= 40:

            risk_level = "🟠 MEDIUM RISK"

        else:

            risk_level = "🟢 LOW RISK"


        # ==========================================
        # RETURN RESULT
        # ==========================================

        return jsonify({

            "success": True,

            "prediction":
            int(prediction),

            "result":
            result,

            "riskLevel":
            risk_level,

            "confidence":
            round(
                fake_probability,
                2
            ),

            "fakeProbability":
            round(
                fake_probability,
                2
            ),

            "genuineProbability":
            round(
                genuine_probability,
                2
            )

        })


    # ==========================================
    # HANDLE INVALID INPUT
    # ==========================================

    except ValueError as error:

        return jsonify({

            "success": False,

            "error":
            "Invalid numeric value provided.",

            "details":
            str(error)

        }), 400


    # ==========================================
    # HANDLE OTHER ERRORS
    # ==========================================

    except Exception as error:

        return jsonify({

            "success": False,

            "error":
            "Prediction failed.",

            "details":
            str(error)

        }), 500


# ==========================================
# RUN FLASK SERVER
# ==========================================

if __name__ == "__main__":

    print()
    print("===================================")
    print("FAKE ACCOUNT DETECTION API")
    print("===================================")
    print("Server starting...")
    print("URL: http://127.0.0.1:5000")
    print("===================================")
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )