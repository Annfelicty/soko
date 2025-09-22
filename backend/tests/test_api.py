from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.transactions.models import Transaction
from apps.fraud_detection.models import FraudAlert
from apps.chamas.models import ChamaGroup, ChamaMember

User = get_user_model()

class AuthenticationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            phone_number='+254700000000'
        )

    def test_user_registration(self):
        url = reverse('user-register')
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'phone_number': '+254700000001'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_user_login(self):
        url = reverse('token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_protected_endpoint_without_auth(self):
        url = reverse('transaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_auth(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('transaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class TransactionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_create_transaction(self):
        url = reverse('transaction-list')
        data = {
            'amount': 1000.00,
            'transaction_type': 'credit',
            'description': 'Test transaction',
            'source': 'M-Pesa'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Transaction.objects.filter(user=self.user).exists())

    def test_list_transactions(self):
        Transaction.objects.create(
            user=self.user,
            amount=1000.00,
            transaction_type='credit',
            description='Test transaction'
        )
        
        url = reverse('transaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_sms_parsing(self):
        url = reverse('sms-parse')
        data = {
            'sms_content': 'Confirmed. You have received KSh 1,000 from John Doe. New M-Pesa balance is KSh 5,000.',
            'sender': 'MPESA',
            'user_phone': '+254700000000'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('transaction', response.data)
        self.assertIn('fraud', response.data)

class FraudDetectionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_fraud_alert_list(self):
        FraudAlert.objects.create(
            user=self.user,
            sender='Unknown',
            message='You have won KSh 100,000!',
            risk_level='scam',
            ai_confidence=95.5
        )
        
        url = reverse('fraud-alert-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_fraud_alert_action(self):
        alert = FraudAlert.objects.create(
            user=self.user,
            sender='Unknown',
            message='You have won KSh 100,000!',
            risk_level='scam',
            ai_confidence=95.5
        )
        
        url = reverse('fraud-alert-action', kwargs={'pk': alert.id})
        data = {'action': 'block'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        alert.refresh_from_db()
        self.assertEqual(alert.status, 'blocked')

class ChamaAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_create_chama(self):
        url = reverse('chama-list')
        data = {
            'name': 'Test Chama',
            'description': 'A test chama group',
            'monthly_target': 5000.00
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ChamaGroup.objects.filter(name='Test Chama').exists())

    def test_list_user_chamas(self):
        chama = ChamaGroup.objects.create(
            name='Test Chama',
            description='A test chama group',
            monthly_target=5000.00,
            created_by=self.user
        )
        ChamaMember.objects.create(chama=chama, user=self.user)
        
        url = reverse('user-chamas')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class DashboardAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_dashboard_data(self):
        # Create some transactions
        Transaction.objects.create(
            user=self.user,
            amount=1000.00,
            transaction_type='credit',
            description='Income'
        )
        Transaction.objects.create(
            user=self.user,
            amount=200.00,
            transaction_type='debit',
            description='Expense'
        )
        
        url = reverse('dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('transactions', response.data)
        self.assertIn('totalIncome', response.data)
        self.assertIn('totalExpenses', response.data)
        self.assertIn('balance', response.data)
        self.assertIn('trustScore', response.data)
