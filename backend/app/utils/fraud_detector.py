# app/utils/fraud_detector.py
from typing import Dict
import re

PHISHING_KEYWORDS = [
    "loan", "loan offer", "click", "link", "verify", "login", "update", "account suspended",
    "confirm", "pay now", "pay immediately", "urgent"
]

SHORT_URL_RE = re.compile(r"https?://\S+|bit\.ly/\S+|tinyurl\.com/\S+", re.IGNORECASE)

def score_sms_for_fraud(text: str) -> float:
    """
    Returns a 0.0 - 1.0 score. Higher means more suspicious.
    This is a simple rule-based heuristic—replace with ML later.
    """
    score = 0.0
    t = text.lower()

    # URL presence is suspicious by default
    if SHORT_URL_RE.search(t):
        score += 0.5

    # Keywords
    for kw in PHISHING_KEYWORDS:
        if kw in t:
            score += 0.2

    # Too many numbers (maybe an OTP or weird message)
    digits = sum(c.isdigit() for c in t)
    if digits > 15:
        score += 0.2

    # clamp
    return min(score, 1.0)

def is_flagged(score: float, threshold: float = 0.6) -> bool:
    return score >= threshold
