from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.transactions.models import Transaction
from apps.fraud_detection.models import FraudAlert
from apps.chamas.models import ChamaGroup, ChamaMember
from apps.users.models import UserProfile, SavingsGoal

User = get_user_model()

class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            phone_number='+254700000000'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.phone_number, '+254700000000')
        self.assertEqual(self.user.trust_score, 300)
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)

    def test_user_str(self):
        self.assertEqual(str(self.user), 'test@example.com')

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_transaction_creation(self):
        transaction = Transaction.objects.create(
            user=self.user,
            amount=1000.00,
            transaction_type='credit',
            description='Test transaction',
            source='M-Pesa'
        )
        
        self.assertEqual(transaction.user, self.user)
        self.assertEqual(transaction.amount, 1000.00)
        self.assertEqual(transaction.transaction_type, 'credit')
        self.assertFalse(transaction.parsed)

    def test_transaction_str(self):
        transaction = Transaction.objects.create(
            user=self.user,
            amount=1000.00,
            transaction_type='credit',
            description='Test transaction'
        )
        
        expected_str = f"{self.user.email} - 1000.00 - credit"
        self.assertEqual(str(transaction), expected_str)

class FraudAlertModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_fraud_alert_creation(self):
        alert = FraudAlert.objects.create(
            user=self.user,
            sender='Unknown',
            message='You have won KSh 100,000!',
            risk_level='scam',
            ai_confidence=95.5
        )
        
        self.assertEqual(alert.user, self.user)
        self.assertEqual(alert.risk_level, 'scam')
        self.assertEqual(alert.ai_confidence, 95.5)
        self.assertEqual(alert.status, 'pending')

class ChamaModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_chama_creation(self):
        chama = ChamaGroup.objects.create(
            name='Test Chama',
            description='A test chama group',
            monthly_target=5000.00,
            created_by=self.user
        )
        
        self.assertEqual(chama.name, 'Test Chama')
        self.assertEqual(chama.created_by, self.user)
        self.assertTrue(chama.is_active)

    def test_chama_member_creation(self):
        chama = ChamaGroup.objects.create(
            name='Test Chama',
            description='A test chama group',
            monthly_target=5000.00,
            created_by=self.user
        )
        
        member = ChamaMember.objects.create(
            chama=chama,
            user=self.user,
            is_admin=True
        )
        
        self.assertEqual(member.chama, chama)
        self.assertEqual(member.user, self.user)
        self.assertTrue(member.is_admin)

class SavingsGoalModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_savings_goal_creation(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            name='Emergency Fund',
            target_amount=10000.00,
            target_date='2024-12-31'
        )
        
        self.assertEqual(goal.user, self.user)
        self.assertEqual(goal.name, 'Emergency Fund')
        self.assertEqual(goal.target_amount, 10000.00)
        self.assertFalse(goal.is_achieved)
