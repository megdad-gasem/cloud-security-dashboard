from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from .database import Base


class Instance(Base):
    __tablename__ = "instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    public_ip = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Running")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    detected_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, nullable=False)
    status = Column(String, nullable=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Active")
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    resolved_at = Column(DateTime, nullable=True)