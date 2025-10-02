# app/crud.py
from sqlmodel import Session, select
from . import models
from datetime import datetime

def get_or_create_user(session: Session, phone: str, name: str = None):
    stmt = select(models.User).where(models.User.phone == phone)
    user = session.exec(stmt).first()
    if user:
        return user
    user = models.User(phone=phone, name=name)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def create_transaction(session: Session, user_id: int, amount: float, currency: str = "KES", tx_type: str = None, source: str = None, raw_sms: str = None):
    tx = models.Transaction(user_id=user_id, amount=amount, currency=currency, tx_type=tx_type, source=source, raw_sms=raw_sms, timestamp=datetime.utcnow())
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx

def create_receipt(session: Session, transaction_id: int):
    r = models.Receipt(transaction_id=transaction_id)
    session.add(r)
    session.commit()
    session.refresh(r)
    return r

def create_or_get_savings_goal(session: Session, user_id: int):
    stmt = select(models.SavingsGoal).where(models.SavingsGoal.user_id == user_id)
    g = session.exec(stmt).first()
    if g:
        return g
    g = models.SavingsGoal(user_id=user_id, target_amount=5000.0, current_amount=0.0, name="Default Goal")
    session.add(g)
    session.commit()
    session.refresh(g)
    return g

def contribute_savings(session: Session, user_id: int, amount: float, goal_id: int = None):
    if goal_id:
        goal = session.get(models.SavingsGoal, goal_id)
    else:
        goal = create_or_get_savings_goal(session, user_id)
    goal.current_amount = (goal.current_amount or 0) + amount
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

def create_fraud_alert(session: Session, user_id: int, sms_text: str, score: float, flagged: bool):
    fa = models.FraudAlert(user_id=user_id, sms_text=sms_text, score=score, flagged=flagged)
    session.add(fa)
    session.commit()
    session.refresh(fa)
    return fa
