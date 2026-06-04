from pydantic import BaseModel


class ThreatLogCreate(BaseModel):
    ip_address: str
    threat_type: str
    severity: str
    source: str