# app/routers/savings_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from .. import crud
from ..schemas import SavingsContribute

router = APIRouter(prefix="/api/savings", tags=["savings"])

@router.post("/contribute")
def contribute(payload: SavingsContribute, session: Session = Depends(get_session)):
    # get user
    stmt = select(crud.models.User).where(crud.models.User.phone == payload.user_phone)
    user = session.exec(stmt).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    goal = crud.contribute_savings(session, user_id=user.id, amount=payload.amount, goal_id=payload.goal_id)
    return {"goal_id": goal.id, "current_amount": goal.current_amount, "target": goal.target_amount}
