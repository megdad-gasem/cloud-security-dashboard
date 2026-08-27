from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress


# =========================
# Security Events
# =========================

class SecurityEventBase(BaseModel):
    title: str
    severity: Literal["High", "Medium", "Low", "Critical"]
    source: str


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEvent(SecurityEventBase):
    id: int
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================
# Instances
# =========================

class InstanceBase(BaseModel):
    name: str
    public_ip: str
    status: Literal["Running", "Stopped", "Isolated", "Disabled"]


class InstanceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    public_ip: IPvAnyAddress
    status: Literal["Running", "Stopped", "Isolated", "Disabled"]


class Instance(InstanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# Compliance Rules
# =========================

class ComplianceRuleBase(BaseModel):
    rule_name: str
    status: Literal["Passed", "Failed", "Warning"]


class ComplianceRuleCreate(ComplianceRuleBase):
    pass


class ComplianceRule(ComplianceRuleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# Alerts
# =========================

class AlertBase(BaseModel):
    title: str
    severity: Literal["High", "Medium", "Low", "Critical"]
    source: str
    status: Literal["Active", "Resolved"]


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    created_at: datetime
    resolved_at: datetime | None = None
    
    model_config = ConfigDict(from_attributes=True)