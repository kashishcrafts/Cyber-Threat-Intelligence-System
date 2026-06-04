from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.prediction import PredictionRequest
from app.database.session import get_db
from app.models.prediction_log import PredictionLog

from ml_models.predict import predict_severity

router = APIRouter()


@router.post("/")
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):

    threat_mapping = {
        "DDoS": 1,
        "Malware": 2,
        "Brute Force": 3
    }

    source_mapping = {
        "IDS": 1,
        "Firewall": 2,
        "WAF": 3
    }

    severity_mapping = {
        0: "Low",
        1: "Medium",
        2: "High"
    }

    threat_encoded = threat_mapping.get(
        request.threat_type,
        1
    )

    source_encoded = source_mapping.get(
        request.source,
        1
    )

    prediction = predict_severity(
        threat_encoded,
        source_encoded
    )

    predicted_severity = severity_mapping[prediction]

    prediction_log = PredictionLog(
        threat_type=request.threat_type,
        source=request.source,
        predicted_severity=predicted_severity
    )

    db.add(prediction_log)
    db.commit()

    return {
        "predicted_severity": predicted_severity
    }