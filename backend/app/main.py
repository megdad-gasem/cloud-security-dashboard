from typing import List

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, SessionLocal


app = FastAPI(title="Aegis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
models.Base.metadata.create_all(bind=engine)


# =========================
# Database dependency
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# Root
# =========================

@app.get("/")
def root():
    return {"message": "Aegis API is running"}


# =========================
# Database health
# =========================

@app.get("/api/health/db")
def database_health(db: Session = Depends(get_db)):
    db.execute(models.Instance.__table__.select().limit(1))

    return {
        "database": "connected"
    }


# =========================
# Security Events
# =========================

@app.get(
    "/api/events",
    response_model=List[schemas.SecurityEvent],
)
def get_security_events(
    db: Session = Depends(get_db),
):
    return db.query(models.SecurityEvent).all()


@app.post(
    "/api/events",
    response_model=schemas.SecurityEvent,
)
def create_security_event(
    event: schemas.SecurityEventCreate,
    db: Session = Depends(get_db),
):
    new_event = models.SecurityEvent(
        title=event.title,
        severity=event.severity,
        source=event.source,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


# =========================
# EC2 Instances
# =========================

@app.get(
    "/api/instances",
    response_model=List[schemas.Instance],
)
def get_instances(
    db: Session = Depends(get_db),
):
    return db.query(models.Instance).all()


@app.post(
    "/api/instances",
    response_model=schemas.Instance,
)
def create_instance(
    instance: schemas.InstanceCreate,
    db: Session = Depends(get_db),
):
    new_instance = models.Instance(
        name=instance.name,
        public_ip=str(instance.public_ip),
        status=instance.status,
    )

    db.add(new_instance)
    db.commit()
    db.refresh(new_instance)

    return new_instance


# =========================
# Compliance
# =========================

@app.get(
    "/api/compliance",
    response_model=List[schemas.ComplianceRule],
)
def get_compliance_rules(
    db: Session = Depends(get_db),
):
    return db.query(models.ComplianceRule).all()


@app.post(
    "/api/compliance",
    response_model=schemas.ComplianceRule,
)
def create_compliance_rule(
    rule: schemas.ComplianceRuleCreate,
    db: Session = Depends(get_db),
):
    new_rule = models.ComplianceRule(
        rule_name=rule.rule_name,
        status=rule.status,
    )

    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    return new_rule


# =========================
# Alerts
# =========================

@app.get(
    "/api/alerts",
    response_model=List[schemas.Alert],
)
def get_alerts(
    db: Session = Depends(get_db),
):
    return db.query(models.Alert).all()


@app.post(
    "/api/alerts",
    response_model=schemas.Alert,
)
def create_alert(
    alert: schemas.AlertCreate,
    db: Session = Depends(get_db),
):
    new_alert = models.Alert(
        title=alert.title,
        source=alert.source,
        severity=alert.severity,
        status=alert.status,
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert    

