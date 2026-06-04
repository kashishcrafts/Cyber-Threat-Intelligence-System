from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional
from collections import Counter

from app.schemas.threat_log import ThreatLogCreate
from app.database.session import get_db
from app.models.threat_log import ThreatLog
from app.services.csv_processor import (
    read_csv_file,
    import_csv_to_db
)

router = APIRouter()


@router.get("/")
def test_route():
    return {
        "message": "Threat Logs API Working"
    }


@router.post("/")
def create_threat_log(
    threat: ThreatLogCreate,
    db: Session = Depends(get_db)
):
    new_threat = ThreatLog(
        ip_address=threat.ip_address,
        threat_type=threat.threat_type,
        severity=threat.severity,
        source=threat.source
    )

    db.add(new_threat)
    db.commit()
    db.refresh(new_threat)

    return {
        "message": "Threat saved successfully",
        "id": new_threat.id
    }


@router.get("/all")
def get_all_threats(db: Session = Depends(get_db)):
    return db.query(ThreatLog).all()


@router.get("/stats")
def get_threat_stats(db: Session = Depends(get_db)):
    total_threats = db.query(ThreatLog).count()

    high_severity = db.query(ThreatLog).filter(
        ThreatLog.severity == "High"
    ).count()

    medium_severity = db.query(ThreatLog).filter(
        ThreatLog.severity == "Medium"
    ).count()

    low_severity = db.query(ThreatLog).filter(
        ThreatLog.severity == "Low"
    ).count()

    return {
        "total_threats": total_threats,
        "high_severity": high_severity,
        "medium_severity": medium_severity,
        "low_severity": low_severity,
        "critical_percentage": round(
            (high_severity / total_threats) * 100, 2
        ) if total_threats > 0 else 0
    }


@router.get("/threat-types")
def get_threat_types(db: Session = Depends(get_db)):
    threats = db.query(ThreatLog).all()

    threat_counts = {}

    for threat in threats:
        threat_type = threat.threat_type

        if threat_type not in threat_counts:
            threat_counts[threat_type] = 0

        threat_counts[threat_type] += 1

    return threat_counts


@router.get("/severity-distribution")
def severity_distribution(db: Session = Depends(get_db)):
    threats = db.query(ThreatLog).all()

    severity_counts = {}

    for threat in threats:
        severity = threat.severity

        if severity not in severity_counts:
            severity_counts[severity] = 0

        severity_counts[severity] += 1

    return severity_counts


@router.get("/recent")
def recent_threats(db: Session = Depends(get_db)):
    return (
        db.query(ThreatLog)
        .order_by(ThreatLog.timestamp.desc())
        .limit(10)
        .all()
    )


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    result = import_csv_to_db(file_path, db)

    return {
        "message": "CSV imported successfully",
        "details": result
    }


@router.get("/search")
def search_threats(
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ThreatLog)

    if severity:
        query = query.filter(ThreatLog.severity == severity)

    if threat_type:
        query = query.filter(ThreatLog.threat_type == threat_type)

    if source:
        query = query.filter(ThreatLog.source == source)

    return query.all()


@router.get("/trends")
def threat_trends(db: Session = Depends(get_db)):
    results = (
        db.query(
            cast(ThreatLog.timestamp, Date).label("date"),
            func.count(ThreatLog.id).label("count")
        )
        .group_by(cast(ThreatLog.timestamp, Date))
        .order_by(cast(ThreatLog.timestamp, Date))
        .all()
    )

    return {
        str(row.date): row.count
        for row in results
    }


@router.get("/dashboard-summary")
def dashboard_summary(db: Session = Depends(get_db)):
    threats = db.query(ThreatLog).all()

    total_threats = len(threats)

    high_risk_count = len(
        [t for t in threats if t.severity == "High"]
    )

    threat_types = [t.threat_type for t in threats]
    sources = [t.source for t in threats]

    top_threat = (
        Counter(threat_types).most_common(1)[0][0]
        if threat_types else None
    )

    top_source = (
        Counter(sources).most_common(1)[0][0]
        if sources else None
    )

    return {
        "total_threats": total_threats,
        "high_risk_count": high_risk_count,
        "top_threat": top_threat,
        "top_source": top_source
    }


@router.get("/top-sources")
def top_sources(db: Session = Depends(get_db)):
    threats = db.query(ThreatLog).all()

    source_counts = {}

    for threat in threats:
        source = threat.source

        if source not in source_counts:
            source_counts[source] = 0

        source_counts[source] += 1

    return source_counts

@router.get("/top-threats")
def top_threats(db: Session = Depends(get_db)):

    threats = db.query(ThreatLog).all()

    threat_counts = {}

    for threat in threats:
        threat_type = threat.threat_type

        if threat_type not in threat_counts:
            threat_counts[threat_type] = 0

        threat_counts[threat_type] += 1

    return threat_counts