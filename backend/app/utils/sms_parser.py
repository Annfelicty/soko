# app/utils/sms_parser.py
import re
from typing import Optional, Dict

# A few regexes to catch typical M-Pesa styles; expand as needed
AMOUNT_RE = re.compile(r"(?:Ksh|KES|KSh|KSH|KES)\s*([0-9,]+(?:\.[0-9]{1,2})?)", re.IGNORECASE)
RECEIVE_WORDS = ["received", "you have received", "paid you", "you received"]
SEND_WORDS = ["sent", "you have sent", "you paid"]

URL_RE = re.compile(r"https?://\S+|bit\.ly/\S+|tinyurl\.com/\S+", re.IGNORECASE)

def parse_mpesa_sms(text: str) -> Dict[str, Optional[str]]:
    """
    Returns dict: amount (float), tx_type (RECEIVE/SEND/UNKNOWN), source (M-PESA)
    """
    text_lower = text.lower()
    amount = None
    m = AMOUNT_RE.search(text)
    if m:
        raw = m.group(1).replace(",", "")
        try:
            amount = float(raw)
        except:
            amount = None

    tx_type = None
    if any(w in text_lower for w in RECEIVE_WORDS):
        tx_type = "RECEIVE"
    elif any(w in text_lower for w in SEND_WORDS):
        tx_type = "SEND"
    else:
        tx_type = "UNKNOWN"

    has_url = bool(URL_RE.search(text))

    parsed = {
        "amount": amount,
        "tx_type": tx_type,
        "source": "M-PESA",
        "has_url": has_url,
    }
    return parsed
