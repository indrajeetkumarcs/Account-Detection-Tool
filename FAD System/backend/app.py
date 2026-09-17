from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
import mysql.connector


# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)

CORS(app)


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
# LOAD MACHINE LEARNING MODEL
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

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
# TEST MYSQL CONNECTION
# ==========================================

try:

    test_db = get_db_connection()

    test_db.close()

    print("===================================")
    print("MYSQL DATABASE CONNECTED!")
    print("DATABASE: fad_system")
    print("===================================")

except Exception as error:

    print("===================================")
    print("MYSQL CONNECTION FAILED")
    print("===================================")

    print(error)



# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

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

    if value in [
        "yes",
        "true",
        "1"
    ]:

        return 1

    return 0

# ==========================================
# DASHBOARD STATISTICS API
# ==========================================

@app.route("/dashboard-stats", methods=["GET"])
def dashboard_stats():

    db = None
    cursor = None

    try:

        db = get_db_connection()

        cursor = db.cursor(dictionary=True)

        # ==========================================
        # TOTAL ACCOUNTS
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM detection_history
        """)

        total = cursor.fetchone()["total"]


        # ==========================================
        # FAKE ACCOUNTS
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS fake
            FROM detection_history
            WHERE prediction = 1
        """)

        fake_accounts = cursor.fetchone()["fake"]


        # ==========================================
        # GENUINE ACCOUNTS
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS genuine
            FROM detection_history
            WHERE prediction = 0
        """)

        genuine_accounts = cursor.fetchone()["genuine"]


        # ==========================================
        # HIGH RISK
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS high
            FROM detection_history
            WHERE fakeProbability >= 70
        """)

        high_risk = cursor.fetchone()["high"]


        # ==========================================
        # MEDIUM RISK
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS medium
            FROM detection_history
            WHERE fakeProbability >= 40
            AND fakeProbability < 70
        """)

        medium_risk = cursor.fetchone()["medium"]


        # ==========================================
        # LOW RISK
        # ==========================================

        cursor.execute("""
            SELECT COUNT(*) AS low
            FROM detection_history
            WHERE fakeProbability < 40
        """)

        low_risk = cursor.fetchone()["low"]


        # ==========================================
        # SEND DATA TO DASHBOARD
        # ==========================================

        return jsonify({

            "success": True,

            "total": total,

            "fakeAccounts": fake_accounts,

            "genuineAccounts": genuine_accounts,

            "highRisk": high_risk,

            "mediumRisk": medium_risk,

            "lowRisk": low_risk

        })


    except Exception as error:

        print("===================================")
        print("DASHBOARD DATABASE ERROR")
        print("===================================")
        print(error)
        print("===================================")

        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


    finally:

        if cursor is not None:
            cursor.close()

        if db is not None:
            db.close()

# ==========================================
# DASHBOARD HISTORY API
# ==========================================

@app.route("/dashboard-history", methods=["GET"])
def dashboard_history():

    db = None
    cursor = None

    try:

        db = get_db_connection()

        cursor = db.cursor(dictionary=True)

        # Get latest detection records
        cursor.execute("""
            SELECT
                username,
                fakeProbability,
                genuineProbability,
                riskLevel,
                created_at
            FROM detection_history
            ORDER BY created_at DESC
            LIMIT 20
        """)

        history = cursor.fetchall()

        return jsonify({

            "success": True,

            "history": history

        })


    except Exception as error:

        print("===================================")
        print("DASHBOARD HISTORY DATABASE ERROR")
        print("===================================")
        print(error)
        print("===================================")

        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


    finally:

        if cursor is not None:
            cursor.close()

        if db is not None:
            db.close()



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


        # ==========================================
        # CONVERT BOOLEAN VALUES
        # ==========================================

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
            engagement

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
        # GET FAKE / GENUINE PROBABILITY
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
        # SAVE DETECTION TO MYSQL
        # ==========================================

        database_saved = False

        database_error = None

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

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s,

                    %s

                )

            """


            values = (

                data.get(
                    "username",
                    "Unknown"
                ),

                int(followers),

                int(following),

                int(posts),

                int(account_age),

                int(average_likes),

                int(average_comments),

                float(engagement),

                str(
                    data["profilePicture"]
                ),

                str(
                    data["bio"]
                ),

                str(
                    data["verified"]
                ),

                int(prediction),

                result,

                risk_level,

                round(
                    fake_probability,
                    2
                ),

                round(
                    genuine_probability,
                    2
                )

            )


            cursor.execute(
                insert_query,
                values
            )


            db.commit()


            database_saved = True


            print()
            print("===================================")
            print("DATABASE: RECORD SAVED SUCCESSFULLY!")
            print("USERNAME:",
                  data.get(
                      "username",
                      "Unknown"
                  ))
            print("===================================")
            print()


        except Exception as db_error:

            database_error = str(
                db_error
            )


            print()
            print("===================================")
            print("DATABASE ERROR")
            print("===================================")
            print(db_error)
            print()


        finally:

            if cursor is not None:

                cursor.close()


            if db is not None:

                db.close()


        # ==========================================
        # RETURN RESULT
        # ==========================================

        response = {

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
            ),

            "databaseSaved":
            database_saved

        }


        # ==========================================
        # INCLUDE DATABASE ERROR IF ANY
        # ==========================================

        if database_error:

            response["databaseError"] = (
                database_error
            )


        return jsonify(response)


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