from app.database.database import engine
from app.database.base import Base

from app.models.user import User
from app.models.threat_log import ThreatLog
from app.models.prediction_log import PredictionLog
from fastapi import FastAPI
from app.api.prediction_history import router as prediction_history_router
from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Cyber Threat Intelligence Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Cyber Threat Intelligence Platform Running"
    }

from app.api.threat_logs import router as threat_router
from app.api.prediction import router as prediction_router

app.include_router(
    threat_router,
    prefix="/threats",
    tags=["Threat Logs"]
)

app.include_router(
    prediction_router,
    prefix="/predict",
    tags=["AI Prediction"]
)

app.include_router(
    prediction_history_router,
    prefix="/predictions",
    tags=["Prediction History"]
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)