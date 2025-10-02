# app/routers/sms_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..database import get_session
from ..schemas import SMSIn, TransactionOut
from .. import crud, utils
from ..utils.sms_parser import parse_mpesa_sms
from ..utils.fraud_detector import score_sms_for_fraud, is_flagged
from ..utils.receipt_generator import generate_receipt_pdf
from fastapi.responses import StreamingResponse, JSONResponse
from io import BytesIO

router = APIRouter(prefix="/api/sms", tags=["sms"])

@router.post("/parse", response_model=dict)
def parse_sms(payload: SMSIn, session: Session = Depends(get_session)):
    """
    Accepts { phone, text } — parses M-Pesa SMS, logs a transaction, creates receipt and fraud alert.
    Returns transaction info + suggested save amount + fraud info.
    """
    parsed = parse_mpesa_sms(payload.text)
    amount = parsed.get("amount")
    if amount is None:
        raise HTTPException(status_code=400, detail="Could not parse amount from SMS.")

    # get or create user
    user = crud.get_or_create_user(session, phone=payload.phone)

    # create transaction
    tx = crud.create_transaction(session, user_id=user.id, amount=amount,
                                 currency="KES", tx_type=parsed.get("tx_type"),
                                 source=parsed.get("source"), raw_sms=payload.text)

    # create receipt record
    receipt = crud.create_receipt(session, transaction_id=tx.id)

    # run fraud detection
    score = score_sms_for_fraud(payload.text)
    flagged = is_flagged(score)
    fa = crud.create_fraud_alert(session, user_id=user.id, sms_text=payload.text, score=score, flagged=flagged)

    # generate saving nudge (simple heuristic)
    suggested_pct = 0.1 if amount >= 500 else 0.05
    suggested_save = round(amount * suggested_pct, 2)

    res = {
        "transaction": {
            "id": tx.id,
            "amount": tx.amount,
            "currency": tx.currency,
            "tx_type": tx.tx_type,
            "source": tx.source,
            "timestamp": str(tx.timestamp),
        },
        "receipt_id": receipt.id,
        "fraud": {
            "score": score,
            "flagged": flagged,
            "alert_id": fa.id
        },
        "suggested_save": suggested_save
    }
    return res

@router.get("/receipt/{receipt_id}/pdf")
def get_receipt_pdf(receipt_id: int, session: Session = Depends(get_session)):
    # fetch receipt & transaction & user
    rec = session.get(crud.models.Receipt, receipt_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Receipt not found.")
    tx = session.get(crud.models.Transaction, rec.transaction_id)
    user = session.get(crud.models.User, tx.user_id)
    pdf_bytes = generate_receipt_pdf(tx, user)
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=receipt_{receipt_id}.pdf"})
