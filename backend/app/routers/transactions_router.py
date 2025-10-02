# app/routers/transactions_router.py
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from ..database import get_session
from ..models import Transaction, User
from typing import List
from ..schemas import TransactionOut

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/by-phone/{phone}", response_model=List[TransactionOut])
def get_transactions_by_phone(phone: str, session: Session = Depends(get_session), limit: int = Query(50)):
    stmt = select(User).where(User.phone == phone)
    user = session.exec(stmt).first()
    if not user:
        return []
    stmt2 = select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.timestamp.desc()).limit(limit)
    rows = session.exec(stmt2).all()
    return rows
