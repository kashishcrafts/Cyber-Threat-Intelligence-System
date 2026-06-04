import pandas as pd

from app.database.session import SessionLocal
from app.models.threat_log import ThreatLog


def generate_dataset():

    db = SessionLocal()

    threats = db.query(ThreatLog).all()

    data = []

    for threat in threats:
        data.append({
            "ip_address": threat.ip_address,
            "threat_type": threat.threat_type,
            "severity": threat.severity,
            "source": threat.source,
            "timestamp": threat.timestamp
        })

    df = pd.DataFrame(data)

    df.to_csv("threat_dataset.csv", index=False)

    db.close()

    return {
        "records": len(df),
        "file": "threat_dataset.csv"
    }