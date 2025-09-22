import requests
import json
import time
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class FrontendBackendIntegrationTest(APITestCase):
    """
    Integration tests to verify frontend-backend connectivity
    """
    
    def setUp(self):
        self.base_url = "http://localhost:8000/api"
        self.user = User.objects.create_user(
            email='integration@test.com',
            password='testpass123',
            phone_number='+254700000000'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

    def test_user_registration_flow(self):
        """Test complete user registration flow"""
        url = f"{self.base_url}/auth/register/"
        data = {
            'email': 'newuser@test.com',
            'password': 'newpass123',
            'phone_number': '+254700000001'
        }
        
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 201)
        
        # Verify user can login
        login_url = f"{self.base_url}/auth/login/"
        login_data = {
            'email': 'newuser@test.com',
            'password': 'newpass123'
        }
        
        login_response = requests.post(login_url, json=login_data)
        self.assertEqual(login_response.status_code, 200)
        self.assertIn('access', login_response.json())

    def test_dashboard_data_flow(self):
        """Test dashboard data retrieval"""
        # Create sample transactions
        from apps.transactions.models import Transaction
        Transaction.objects.create(
            user=self.user,
            amount=1000.00,
            transaction_type='credit',
            description='Test income',
            source='M-Pesa'
        )
        Transaction.objects.create(
            user=self.user,
            amount=200.00,
            transaction_type='debit',
            description='Test expense',
            source='M-Pesa'
        )
        
        url = f"{self.base_url}/dashboard/"
        response = requests.get(url, headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify dashboard data structure
        required_fields = ['transactions', 'totalIncome', 'totalExpenses', 'balance', 'trustScore']
        for field in required_fields:
            self.assertIn(field, data)
        
        self.assertEqual(data['totalIncome'], 1000.00)
        self.assertEqual(data['totalExpenses'], 200.00)
        self.assertEqual(data['balance'], 800.00)

    def test_sms_parsing_flow(self):
        """Test SMS parsing and fraud detection flow"""
        url = f"{self.base_url}/sms/parse/"
        data = {
            'sms_content': 'Confirmed. You have received KSh 1,000 from John Doe. New M-Pesa balance is KSh 5,000.',
            'sender': 'MPESA',
            'user_phone': '+254700000000'
        }
        
        response = requests.post(url, json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        result = response.json()
        self.assertIn('transaction', result)
        self.assertIn('fraud', result)
        
        # Verify transaction was created
        if result['transaction']:
            self.assertEqual(result['transaction']['amount'], 1000.0)
            self.assertEqual(result['transaction']['type'], 'credit')

    def test_fraud_detection_flow(self):
        """Test fraud detection and alert creation"""
        # Test scam SMS
        scam_url = f"{self.base_url}/sms/parse/"
        scam_data = {
            'sms_content': 'Congratulations! You have won KSh 100,000! Click here to claim your prize!',
            'sender': 'Unknown',
            'user_phone': '+254700000000'
        }
        
        response = requests.post(scam_url, json=scam_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        result = response.json()
        self.assertEqual(result['fraud']['risk_level'], 'scam')
        self.assertGreater(result['fraud']['confidence'], 80)

    def test_chama_creation_flow(self):
        """Test chama creation and management"""
        # Create chama
        chama_url = f"{self.base_url}/chamas/"
        chama_data = {
            'name': 'Integration Test Chama',
            'description': 'A test chama for integration testing',
            'monthly_target': 5000.00
        }
        
        response = requests.post(chama_url, json=chama_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        
        chama_result = response.json()
        self.assertIn('id', chama_result)
        
        # Get user's chamas
        user_chamas_url = f"{self.base_url}/chamas/user/"
        response = requests.get(user_chamas_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        chamas = response.json()
        self.assertGreater(len(chamas), 0)

    def test_ussd_integration(self):
        """Test USSD service integration"""
        url = f"{self.base_url}/ussd/"
        data = {
            'sessionId': 'test_session_123',
            'serviceCode': '*384#',
            'phoneNumber': '+254700000000',
            'text': ''
        }
        
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 200)
        
        # Verify USSD response format
        response_text = response.text
        self.assertTrue(response_text.startswith('CON') or response_text.startswith('END'))

    def test_whatsapp_integration(self):
        """Test WhatsApp bot integration"""
        url = f"{self.base_url}/whatsapp/webhook/"
        data = {
            'Body': 'What is my balance?',
            'From': 'whatsapp:+254700000000',
            'To': 'whatsapp:+14155238886'
        }
        
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 200)

    def test_trust_score_calculation(self):
        """Test trust score calculation and updates"""
        # Create user activity
        from apps.transactions.models import Transaction
        from apps.fraud_detection.models import FraudAlert
        
        # Add transactions
        for i in range(5):
            Transaction.objects.create(
                user=self.user,
                amount=1000.00 + (i * 100),
                transaction_type='credit',
                description=f'Income {i+1}',
                source='M-Pesa'
            )
        
        # Add fraud alert (avoided)
        FraudAlert.objects.create(
            user=self.user,
            sender='Unknown',
            message='Scam message',
            risk_level='scam',
            ai_confidence=95.0,
            status='blocked'
        )
        
        # Get trust score
        url = f"{self.base_url}/trust-score/"
        response = requests.get(url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('score', data)
        self.assertIn('breakdown', data)
        self.assertGreaterEqual(data['score'], 300)
        self.assertLessEqual(data['score'], 850)

    def test_tax_records_generation(self):
        """Test tax records generation"""
        # Create transactions for tax period
        from apps.transactions.models import Transaction
        from datetime import datetime, timedelta
        
        # Create transactions from last 3 months
        base_date = datetime.now() - timedelta(days=90)
        for i in range(10):
            Transaction.objects.create(
                user=self.user,
                amount=1000.00 + (i * 100),
                transaction_type='credit',
                description=f'Business income {i+1}',
                source='M-Pesa',
                created_at=base_date + timedelta(days=i*3)
            )
        
        url = f"{self.base_url}/tax-records/"
        response = requests.get(url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('totalIncome', data)
        self.assertIn('totalExpenses', data)
        self.assertIn('netIncome', data)
        self.assertIn('transactions', data)

    def test_error_handling(self):
        """Test error handling and edge cases"""
        # Test invalid SMS
        url = f"{self.base_url}/sms/parse/"
        data = {
            'sms_content': 'Invalid SMS content',
            'sender': 'Unknown',
            'user_phone': '+254700000000'
        }
        
        response = requests.post(url, json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        result = response.json()
        self.assertIsNone(result['transaction'])
        self.assertEqual(result['fraud']['risk_level'], 'safe')
        
        # Test unauthorized access
        unauthorized_headers = {'Content-Type': 'application/json'}
        url = f"{self.base_url}/dashboard/"
        response = requests.get(url, headers=unauthorized_headers)
        self.assertEqual(response.status_code, 401)

    def test_performance_benchmarks(self):
        """Test API performance benchmarks"""
        import time
        
        # Test dashboard response time
        start_time = time.time()
        url = f"{self.base_url}/dashboard/"
        response = requests.get(url, headers=self.headers)
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 2.0)  # Should respond within 2 seconds
        
        # Test SMS parsing response time
        start_time = time.time()
        url = f"{self.base_url}/sms/parse/"
        data = {
            'sms_content': 'Confirmed. You have received KSh 1,000 from John Doe.',
            'sender': 'MPESA',
            'user_phone': '+254700000000'
        }
        response = requests.post(url, json=data, headers=self.headers)
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 1.0)  # Should respond within 1 second

class EndToEndWorkflowTest(APITestCase):
    """
    End-to-end workflow tests simulating real user journeys
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='e2e@test.com',
            password='testpass123',
            phone_number='+254700000000'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

    def test_complete_user_journey(self):
        """Test complete user journey from registration to chama participation"""
        
        # 1. User registers and logs in
        # (Already done in setUp)
        
        # 2. User receives M-Pesa SMS and it gets parsed
        sms_url = f"{self.base_url}/sms/parse/"
        sms_data = {
            'sms_content': 'Confirmed. You have received KSh 2,000 from Customer ABC. New M-Pesa balance is KSh 5,000.',
            'sender': 'MPESA',
            'user_phone': '+254700000000'
        }
        
        response = requests.post(sms_url, json=sms_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # 3. User checks dashboard
        dashboard_url = f"{self.base_url}/dashboard/"
        response = requests.get(dashboard_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        dashboard_data = response.json()
        self.assertGreater(dashboard_data['totalIncome'], 0)
        
        # 4. User creates a chama
        chama_url = f"{self.base_url}/chamas/"
        chama_data = {
            'name': 'E2E Test Chama',
            'description': 'End-to-end test chama',
            'monthly_target': 3000.00
        }
        
        response = requests.post(chama_url, json=chama_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        
        # 5. User contributes to chama
        chama_id = response.json()['id']
        contribution_url = f"{self.base_url}/chamas/{chama_id}/contribute/"
        contribution_data = {
            'amount': 500.00
        }
        
        response = requests.post(contribution_url, json=contribution_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        
        # 6. User checks fraud alerts
        fraud_url = f"{self.base_url}/fraud-alerts/"
        response = requests.get(fraud_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # 7. User generates tax records
        tax_url = f"{self.base_url}/tax-records/"
        response = requests.get(tax_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # 8. User checks trust score
        trust_url = f"{self.base_url}/trust-score/"
        response = requests.get(trust_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        trust_data = response.json()
        self.assertGreaterEqual(trust_data['score'], 300)

    def test_fraud_detection_workflow(self):
        """Test complete fraud detection workflow"""
        
        # 1. User receives scam SMS
        scam_url = f"{self.base_url}/sms/parse/"
        scam_data = {
            'sms_content': 'URGENT! Your bank account will be closed. Click here to verify: bit.ly/fake-link',
            'sender': 'Unknown',
            'user_phone': '+254700000000'
        }
        
        response = requests.post(scam_url, json=scam_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        result = response.json()
        self.assertEqual(result['fraud']['risk_level'], 'scam')
        
        # 2. User checks fraud alerts
        alerts_url = f"{self.base_url}/fraud-alerts/"
        response = requests.get(alerts_url, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        alerts = response.json()
        self.assertGreater(len(alerts), 0)
        
        # 3. User marks alert as blocked
        alert_id = alerts[0]['id']
        action_url = f"{self.base_url}/fraud-alerts/{alert_id}/action/"
        action_data = {'action': 'block'}
        
        response = requests.post(action_url, json=action_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # 4. User reports additional fraud
        report_url = f"{self.base_url}/fraud-reports/"
        report_data = {
            'report_type': 'sms',
            'details': 'Received another scam SMS',
            'reported_number': '+254700123456'
        }
        
        response = requests.post(report_url, json=report_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)

if __name__ == '__main__':
    import unittest
    unittest.main()
