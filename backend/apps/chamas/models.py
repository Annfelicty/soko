import uuid
from django.db import models
from django.conf import settings

class ChamaGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    total_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monthly_target = models.DecimalField(max_digits=10, decimal_places=2)
    blockchain_address = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_chamas')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ChamaMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chama = models.ForeignKey(ChamaGroup, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chama_memberships')
    contribution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_admin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['chama', 'user']

    def __str__(self):
        return f"{self.user.email} - {self.chama.name}"

class ChamaContribution(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chama = models.ForeignKey(ChamaGroup, on_delete=models.CASCADE, related_name='contributions')
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    contribution_date = models.DateTimeField(auto_now_add=True)
    blockchain_tx_hash = models.CharField(max_length=100, blank=True)
    verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-contribution_date']

    def __str__(self):
        return f"{self.member.user.email} - {self.amount} - {self.chama.name}"
