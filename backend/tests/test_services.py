import unittest
from unittest.mock import patch, MagicMock
from apps.ai_services.sms_parser import SMSParser
from apps.ai_services.fraud_detector import FraudDetector
from apps.external_apis.ussd_service import USSDService
from apps.external_apis.whatsapp_service import WhatsAppService
from apps.blockchain_service import BlockchainService
from apps.trust_score_calculator import TrustScoreCalculator

class SMSParserTest(unittest.TestCase):
    def setUp(self):
        self.parser = SMSParser()

    def test_parse_mpesa_received_sms(self):
        sms = "Confirmed. You have received KSh 1,000 from John Doe. New M-Pesa balance is KSh 5,000."
        result = self.parser.parse_transaction(sms)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['amount'], 1000.0)
        self.assertEqual(result['type'], 'credit')
        self.assertEqual(result['party'], 'John Doe')

    def test_parse_mpesa_sent_sms(self):
        sms = "Confirmed. KSh 500 sent to Jane Smith. New M-Pesa balance is KSh 4,500."
        result = self.parser.parse_transaction(sms)
        
        self.assertIsNotNone(result)
        self.assertEqual(result['amount'], 500.0)
        self.assertEqual(result['type'], 'debit')
        self.assertEqual(result['party'], 'Jane Smith')

    def test_parse_invalid_sms(self):
        sms = "This is not a valid M-Pesa SMS"
        result = self.parser.parse_transaction(sms)
        
        self.assertIsNone(result)

    def test_extract_amount(self):
        sms = "You have received KSh 2,500 from ABC Company"
        amount = self.parser._extract_amount(sms)
        self.assertEqual(amount, 2500.0)

    def test_determine_transaction_type(self):
        credit_sms = "You have received KSh 1,000 from John"
        debit_sms = "You have sent KSh 500 to Jane"
        
        credit_type = self.parser._determine_type(credit_sms)
        debit_type = self.parser._determine_type(debit_sms)
        
        self.assertEqual(credit_type, 'credit')
        self.assertEqual(debit_type, 'debit')

class FraudDetectorTest(unittest.TestCase):
    def setUp(self):
        self.detector = FraudDetector()

    def test_detect_scam_sms(self):
        scam_sms = "Congratulations! You have won KSh 100,000! Click here to claim your prize!"
        result = self.detector.analyze_sms(scam_sms, "Unknown")
        
        self.assertEqual(result['risk_level'], 'scam')
        self.assertGreater(result['confidence'], 80)

    def test_detect_safe_sms(self):
        safe_sms = "Confirmed. You have received KSh 1,000 from John Doe. New M-Pesa balance is KSh 5,000."
        result = self.detector.analyze_sms(safe_sms, "MPESA")
        
        self.assertEqual(result['risk_level'], 'safe')
        self.assertGreater(result['confidence'], 90)

    def test_detect_suspicious_sms(self):
        suspicious_sms = "Urgent! Your account will be closed. Verify immediately by clicking this link."
        result = self.detector.analyze_sms(suspicious_sms, "Unknown")
        
        self.assertEqual(result['risk_level'], 'suspicious')
        self.assertGreater(result['confidence'], 50)

    def test_calculate_scam_score(self):
        scam_sms = "Congratulations! You have won KSh 100,000! Click here to claim your prize!"
        score = self.detector._calculate_risk_score(scam_sms)
        
        self.assertGreater(score, 80)

    def test_is_trusted_sender(self):
        self.assertTrue(self.detector._is_trusted_sender("MPESA"))
        self.assertTrue(self.detector._is_trusted_sender("SAFARICOM"))
        self.assertFalse(self.detector._is_trusted_sender("Unknown"))

class USSDServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = USSDService()

    def test_initial_ussd_request(self):
        response = self.service.handle_ussd_request("", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Welcome to TajiriCircle", response)

    def test_log_sales_menu(self):
        response = self.service.handle_ussd_request("1", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Log Sales", response)

    def test_check_balance_menu(self):
        response = self.service.handle_ussd_request("2", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Your Balance", response)

    def test_fraud_alerts_menu(self):
        response = self.service.handle_ussd_request("4", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Fraud Protection", response)

    def test_help_menu(self):
        response = self.service.handle_ussd_request("6", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("TajiriCircle Help", response)

    def test_quick_sale_logging(self):
        response = self.service.handle_ussd_request("1*1", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Sale of KSh 100 logged successfully", response)

    def test_custom_amount_input(self):
        response = self.service.handle_ussd_request("1*2", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Enter sale amount", response)

    def test_custom_amount_processing(self):
        response = self.service.handle_ussd_request("1*2*500", "+254700000000")
        self.assertTrue(response.startswith("CON"))
        self.assertIn("Sale of KSh 500 logged successfully", response)

class WhatsAppServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = WhatsAppService()

    def test_process_balance_message(self):
        response = self.service.process_message("What's my balance?", "+254700000000")
        self.assertIn("balance", response.lower())

    def test_process_fraud_message(self):
        response = self.service.process_message("I received a suspicious message", "+254700000000")
        self.assertIn("fraud", response.lower())

    def test_process_savings_message(self):
        response = self.service.process_message("Help me save money", "+254700000000")
        self.assertIn("save", response.lower())

    def test_process_tax_message(self):
        response = self.service.process_message("Generate my tax records", "+254700000000")
        self.assertIn("tax", response.lower())

    def test_process_general_message(self):
        response = self.service.process_message("Hello", "+254700000000")
        self.assertIn("help", response.lower())

class BlockchainServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = BlockchainService()

    def test_create_chama_contract(self):
        with patch('web3.Web3') as mock_web3:
            mock_web3.return_value.eth.contract.return_value.functions.createChama.return_value.transact.return_value = "0x123"
            
            result = self.service.create_chama_contract("Test Chama")
            self.assertIsNotNone(result)
            self.assertTrue(result.startswith("0x"))

    def test_record_contribution(self):
        chama_address = "0x1234567890abcdef"
        result = self.service.record_contribution(chama_address, "user123", 1000)
        
        self.assertTrue(result['success'])
        self.assertIn('transactionHash', result)

    def test_get_contribution_history(self):
        chama_address = "0x1234567890abcdef"
        # First create a chama and add some contributions
        self.service.create_chama_contract("Test Chama")
        self.service.record_contribution(chama_address, "user123", 1000)
        
        history = self.service.get_contribution_history(chama_address)
        self.assertIn('chamaName', history)
        self.assertIn('totalContributions', history)
        self.assertIn('transactions', history)

    def test_verify_transaction(self):
        tx_hash = "0xabcdef1234567890"
        result = self.service.verify_transaction(tx_hash)
        
        self.assertIn('verified', result)

class TrustScoreCalculatorTest(unittest.TestCase):
    def setUp(self):
        self.calculator = TrustScoreCalculator()

    def test_calculate_consistency_score(self):
        transactions = [
            {'amount': 1000, 'created_at': '2024-01-01'},
            {'amount': 1200, 'created_at': '2024-01-15'},
            {'amount': 1100, 'created_at': '2024-02-01'},
            {'amount': 1300, 'created_at': '2024-02-15'},
        ]
        
        score = self.calculator._calculate_consistency_score(transactions)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 1)

    def test_calculate_fraud_avoidance_score(self):
        fraud_alerts = [
            {'risk_level': 'scam', 'status': 'blocked', 'created_at': '2024-01-01'},
            {'risk_level': 'suspicious', 'status': 'reviewed', 'created_at': '2024-01-15'},
        ]
        
        score = self.calculator._calculate_fraud_avoidance_score(fraud_alerts)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 1)

    def test_calculate_savings_score(self):
        savings_data = {
            'totalSaved': 10000,
            'savingsGoals': [{'achieved': True}, {'achieved': False}],
            'monthlyContributions': [
                {'amount': 1000}, {'amount': 1200}, {'amount': 800}
            ]
        }
        
        score = self.calculator._calculate_savings_score(savings_data)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 1)

    def test_calculate_community_score(self):
        chama_activity = {
            'chamasJoined': 2,
            'totalContributions': 5000,
            'leadershipRoles': 1,
            'helpedMembers': 3
        }
        
        score = self.calculator._calculate_community_score(chama_activity)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 1)

    def test_calculate_account_age_score(self):
        # Test with 6 months account age
        age_in_ms = 6 * 30 * 24 * 60 * 60 * 1000
        score = self.calculator._calculate_account_age_score(age_in_ms)
        self.assertEqual(score, 0.5)  # 6 months / 12 months = 0.5

    def test_calculate_verification_score(self):
        verifications = {
            'phoneVerified': True,
            'emailVerified': True,
            'idVerified': False,
            'businessVerified': False
        }
        
        score = self.calculator._calculate_verification_score(verifications)
        self.assertEqual(score, 0.5)  # 0.3 + 0.2 = 0.5

    def test_calculate_trust_score(self):
        user_data = {
            'transactions': [
                {'amount': 1000, 'created_at': '2024-01-01'},
                {'amount': 1200, 'created_at': '2024-01-15'},
            ],
            'fraudAlerts': [
                {'risk_level': 'scam', 'status': 'blocked', 'created_at': '2024-01-01'},
            ],
            'savings': {
                'totalSaved': 5000,
                'savingsGoals': [{'achieved': True}],
                'monthlyContributions': [{'amount': 1000}]
            },
            'chamaActivity': {
                'chamasJoined': 1,
                'totalContributions': 2000,
                'leadershipRoles': 0,
                'helpedMembers': 1
            },
            'accountAge': 3 * 30 * 24 * 60 * 60 * 1000,  # 3 months
            'verifications': {
                'phoneVerified': True,
                'emailVerified': True,
                'idVerified': False,
                'businessVerified': False
            }
        }
        
        score = self.calculator.calculate_trust_score("user123", user_data)
        self.assertGreaterEqual(score, 300)
        self.assertLessEqual(score, 850)

if __name__ == '__main__':
    unittest.main()
