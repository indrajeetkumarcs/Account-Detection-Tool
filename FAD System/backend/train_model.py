import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib


# ==========================================
# FAKE ACCOUNT DETECTION - ML MODEL V2
# ==========================================


# ==========================================
# CREATE TRAINING DATA
# ==========================================

data = {

    "followers": [
        50, 100, 5000, 10000, 20,
        300, 15000, 80, 20000, 40,
        500, 1000, 25000, 30, 8000,
        150, 12000, 60, 3000, 90,
        70, 6000, 200, 18000, 35,
        9000, 120, 14000, 450, 50
    ],

    "following": [
        2000, 1500, 500, 800, 3000,
        400, 1000, 2500, 900, 5000,
        700, 600, 1200, 4000, 300,
        2200, 1500, 3500, 500, 1800,
        2500, 600, 1800, 700, 3000,
        500, 2200, 800, 450, 2500
    ],

    "posts": [
        2, 3, 200, 500, 1,
        100, 400, 4, 600, 2,
        50, 80, 1000, 1, 300,
        5, 250, 3, 120, 4,
        2, 300, 8, 700, 1,
        400, 6, 550, 100, 3
    ],

    "accountAge": [
        10, 20, 500, 1000, 5,
        300, 800, 15, 1500, 7,
        200, 400, 2000, 3, 700,
        25, 900, 12, 350, 18,
        8, 600, 20, 1200, 4,
        750, 15, 900, 250, 10
    ],

    "averageLikes": [
        4, 8, 500, 1000, 2,
        300, 1500, 5, 2000, 3,
        100, 200, 3000, 1, 800,
        6, 2500, 4, 400, 5,
        3, 700, 10, 2500, 2,
        1200, 5, 1800, 250, 4
    ],

    "averageComments": [
        1, 1, 50, 100, 0,
        30, 120, 1, 150, 1,
        15, 20, 200, 0, 70,
        1, 180, 1, 40, 1,
        0, 80, 2, 200, 0,
        100, 1, 150, 30, 1
    ],

    "engagement": [
        0.2, 0.5, 8.5, 10.2, 0.1,
        5.5, 7.8, 0.4, 12.0, 0.3,
        4.2, 6.1, 15.0, 0.2, 9.5,
        0.8, 8.0, 0.3, 5.0, 0.6,
        0.1, 9.2, 0.7, 11.5, 0.2,
        10.0, 0.5, 9.8, 6.5, 0.3
    ],

    "profilePicture": [
        0, 0, 1, 1, 0,
        1, 1, 0, 1, 0,
        1, 1, 1, 0, 1,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        1, 0, 1, 1, 0
    ],

    "bio": [
        0, 0, 1, 1, 0,
        1, 1, 0, 1, 0,
        1, 1, 1, 0, 1,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        1, 0, 1, 1, 0
    ],

    "verified": [
        0, 0, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 0, 1,
        0, 1, 0, 0, 0,
        0, 1, 0, 1, 0,
        1, 0, 1, 0, 0
    ],

    "fake": [
        1, 1, 0, 0, 1,
        0, 0, 1, 0, 1,
        0, 0, 0, 1, 0,
        1, 0, 1, 0, 1,
        1, 0, 1, 0, 1,
        0, 1, 0, 0, 1
    ]
}


# ==========================================
# CREATE DATAFRAME
# ==========================================

df = pd.DataFrame(data)


print("\n===================================")
print("FAKE ACCOUNT DETECTION - MODEL V2")
print("===================================\n")

print("Total training records:", len(df))


# ==========================================
# INPUT FEATURES
# ==========================================

features = [
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


X = df[features]

y = df["fake"]


# ==========================================
# SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)


print("Training records:", len(X_train))
print("Testing records :", len(X_test))


# ==========================================
# CREATE RANDOM FOREST MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# TRAIN MODEL
# ==========================================

print("\nTraining model...")

model.fit(X_train, y_train)


# ==========================================
# TEST MODEL
# ==========================================

predictions = model.predict(X_test)


# ==========================================
# MODEL ACCURACY
# ==========================================

accuracy = accuracy_score(
    y_test,
    predictions
)


print("\n===================================")
print("MODEL EVALUATION")
print("===================================")

print(
    "Accuracy:",
    round(accuracy * 100, 2),
    "%"
)


# ==========================================
# CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Genuine",
            "Fake"
        ],
        zero_division=0
    )
)


# ==========================================
# CONFUSION MATRIX
# ==========================================

print("Confusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ==========================================
# FEATURE IMPORTANCE
# ==========================================

print("\nFeature Importance:")

importance = pd.DataFrame({

    "Feature": features,

    "Importance": model.feature_importances_

}).sort_values(
    by="Importance",
    ascending=False
)


print(importance.to_string(index=False))


# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    "fake_account_model.pkl"
)


# ==========================================
# SUCCESS MESSAGE
# ==========================================

print("\n===================================")
print("MODEL V2 TRAINED SUCCESSFULLY!")
print("===================================")

print(
    "Model file created:"
)

print(
    "fake_account_model.pkl"
)

print("\nFeatures used by model:")

for feature in features:

    print(
        "-",
        feature
    )

print("\n===================================")