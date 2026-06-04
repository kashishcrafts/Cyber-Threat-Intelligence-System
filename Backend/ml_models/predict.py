import joblib
import pandas as pd


def predict_severity(
    threat_type_encoded,
    source_encoded
):

    model = joblib.load(
        "threat_model.pkl"
    )

    data = pd.DataFrame(
        [{
            "threat_type_encoded": threat_type_encoded,
            "source_encoded": source_encoded
        }]
    )

    prediction = model.predict(data)

    return int(prediction[0])