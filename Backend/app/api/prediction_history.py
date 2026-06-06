from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.prediction_log import PredictionLog

router = APIRouter()


@router.get("/")
def get_prediction_history(
    db: Session = Depends(get_db)
):

    predictions = (
        db.query(PredictionLog)
        .order_by(PredictionLog.id.desc())
        .all()
    )

    return predictions

@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(PredictionLog)
        .filter(
            PredictionLog.id == prediction_id
        )
        .first()
    )

    if prediction:
        db.delete(prediction)
        db.commit()

    return {
        "message": "Prediction Deleted"
    }