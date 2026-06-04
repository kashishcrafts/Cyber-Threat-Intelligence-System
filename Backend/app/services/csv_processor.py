import pandas as pd

from app.models.threat_log import ThreatLog


def read_csv_file(file_path: str):
    df = pd.read_csv(file_path)

    return {
        "rows": len(df),
        "columns": list(df.columns)
    }


def import_csv_to_db(file_path: str, db):
    df = pd.read_csv(file_path)

    imported_count = 0

    for _, row in df.iterrows():

        threat = ThreatLog(
            ip_address=row["ip_address"],
            threat_type=row["threat_type"],
            severity=row["severity"],
            source=row["source"]
        )

        db.add(threat)
        imported_count += 1

    db.commit()

    return {
        "imported_records": imported_count
    }