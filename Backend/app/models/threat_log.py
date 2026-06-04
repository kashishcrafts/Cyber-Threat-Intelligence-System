from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base


class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, nullable=False)
    threat_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    source = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)