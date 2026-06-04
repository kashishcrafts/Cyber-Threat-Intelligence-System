import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


def train_model():

    df = pd.read_csv("ml_ready_dataset.csv")

    X = df[
        [
            "threat_type_encoded",
            "source_encoded"
        ]
    ]

    y = df["severity_encoded"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)

    joblib.dump(
        model,
        "threat_model.pkl"
    )

    return {
        "accuracy": round(accuracy, 2),
        "model_file": "threat_model.pkl"
    }