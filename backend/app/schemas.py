# app/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SMSIn(BaseModel):
    phone: str
    text: str

class TransactionCreate(BaseModel):
    user_phone: str
    amount: float
    currency: Optional[str] = "KES"
    tx_type: Optional[str] = None
    source: Optional[str] = None
    raw_sms: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    amount: float
    currency: str
    tx_type: Optional[str]
    source: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True

class SavingsContribute(BaseModel):
    user_phone: str
    amount: float
    goal_id: Optional[int] = None
