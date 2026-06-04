from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)

    threat_type = Column(String, nullable=False)

    source = Column(String, nullable=False)

    predicted_severity = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )