from app.database.database import engine
from app.database.base import Base

from app.models.threat_log import ThreatLog
from app.models.prediction_log import PredictionLog
from app.models.user import User

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")