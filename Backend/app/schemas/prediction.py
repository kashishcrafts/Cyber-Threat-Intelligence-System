from pydantic import BaseModel


class PredictionRequest(BaseModel):
    threat_type: str
    source: str