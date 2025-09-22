import uuid
from django.db import models
from django.conf import settings

class FraudAlert(models.Model):
    RISK_LEVELS = [
        ('safe', 'Safe'),
        ('suspicious', 'Suspicious'),
        ('scam', 'Scam'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('blocked', 'Blocked'),
        ('false_positive', 'False Positive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fraud_alerts')
    sender = models.CharField(max_length=100)
    message = models.TextField()
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    ai_confidence = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user_action = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Fraud Alert - {self.user.email} - {self.risk_level}"

class ScamPattern(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pattern_name = models.CharField(max_length=100)
    regex_pattern = models.TextField()
    risk_weight = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.pattern_name

class FraudReport(models.Model):
    REPORT_TYPES = [
        ('sms', 'SMS Scam'),
        ('call', 'Phone Call Scam'),
        ('email', 'Email Scam'),
        ('website', 'Website Scam'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fraud_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    details = models.TextField()
    reported_number = models.CharField(max_length=20, blank=True)
    reported_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Fraud Report - {self.user.email} - {self.report_type}"
