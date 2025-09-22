# TajiriCircle Backend Testing Guide

## Testing Overview

This guide covers comprehensive testing for the TajiriCircle backend, including unit tests, integration tests, and frontend-backend connectivity testing.

##  Test Structure

```
backend/tests/
├── __init__.py
├── test_models.py          # Model tests
├── test_api.py            # API endpoint tests
├── test_services.py       # Service layer tests
├── test_integration.py    # Integration tests
└── fixtures/              # Test data fixtures
    ├── sample_users.json
    ├── sample_transactions.json
    └── sample_chamas.json
```

## Running Tests

### Prerequisites

1. **Install Dependencies**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

2. **Setup Environment**
```bash
cp env.example .env
# Edit .env configuration
```

3. **Setup Database**
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Running All Tests
```bash
python run_tests.py
```

### Running Specific Test Types
```bash
# Unit tests only
python run_tests.py unit

# Integration tests only
python run_tests.py integration

# Performance tests only
python run_tests.py performance
```

### Running Individual Test Files
```bash
# Run model tests
python manage.py test tests.test_models

# Run API tests
python manage.py test tests.test_api

# Run service tests
python manage.py test tests.test_services

# Run integration tests
python manage.py test tests.test_integration
```

## Test Categories

### 1. Unit Tests (`test_models.py`)

Tests individual model functionality:

- **User Model Tests**
  - User creation and validation
  - Trust score initialization
  - Profile creation

- **Transaction Model Tests**
  - Transaction creation
  - Transaction type validation
  - Amount validation

- **Fraud Alert Model Tests**
  - Alert creation
  - Risk level validation
  - Status updates

- **Chama Model Tests**
  - Chama group creation
  - Member management
  - Contribution tracking

### 2. API Tests (`test_api.py`)

Tests API endpoints and authentication:

- **Authentication Tests**
  - User registration
  - User login
  - JWT token validation
  - Protected endpoint access

- **Transaction API Tests**
  - Create transaction
  - List transactions
  - SMS parsing endpoint

- **Fraud Detection API Tests**
  - Fraud alert listing
  - Alert action handling
  - Report creation

- **Chama API Tests**
  - Create chama
  - List user chamas
  - Contribution management

- **Dashboard API Tests**
  - Dashboard data retrieval
  - Data aggregation

### 3. Service Tests (`test_services.py`)

Tests business logic services:

- **SMS Parser Tests**
  - M-Pesa SMS parsing
  - Amount extraction
  - Transaction type detection
  - Party name extraction

- **Fraud Detector Tests**
  - Scam detection
  - Safe message validation
  - Risk score calculation
  - Trusted sender validation

- **USSD Service Tests**
  - Menu navigation
  - Session management
  - Input validation
  - Response formatting

- **WhatsApp Service Tests**
  - Message processing
  - Response generation
  - Command handling

- **Blockchain Service Tests**
  - Contract creation
  - Contribution recording
  - Transaction verification
  - Analytics calculation

- **Trust Score Calculator Tests**
  - Score calculation
  - Factor weighting
  - Score updates
  - Breakdown generation

### 4. Integration Tests (`test_integration.py`)

Tests frontend-backend connectivity:

- **User Registration Flow**
  - Complete registration process
  - Login verification
  - Profile setup

- **Dashboard Data Flow**
  - Data retrieval
  - Real-time updates
  - Aggregation accuracy

- **SMS Processing Flow**
  - End-to-end SMS parsing
  - Fraud detection integration
  - Database storage

- **Chama Management Flow**
  - Creation to participation
  - Contribution tracking
  - Member management

- **Fraud Detection Workflow**
  - Scam detection
  - Alert creation
  - User response handling

- **Trust Score Workflow**
  - Score calculation
  - Factor updates
  - Score progression

## Frontend-Backend Integration Testing

### Setup for Integration Testing

1. **Start Backend Server**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

2. **Start Frontend Server**
```bash
cd ..  # Go to project root
npm run dev
```

3. **Run Integration Tests**
```bash
cd backend
python manage.py test tests.test_integration
```

### Testing Frontend-Backend Connectivity

#### 1. API Endpoint Testing

Test all API endpoints that the frontend uses:

```python
def test_dashboard_api():
    """Test dashboard API endpoint"""
    response = requests.get('http://localhost:8000/api/dashboard/', 
                           headers=auth_headers)
    assert response.status_code == 200
    assert 'transactions' in response.json()
    assert 'totalIncome' in response.json()
```

#### 2. Authentication Flow Testing

Test the complete authentication flow:

```python
def test_auth_flow():
    """Test complete authentication flow"""
    # Register user
    register_data = {
        'email': 'test@example.com',
        'password': 'testpass123',
        'phone_number': '+254700000000'
    }
    response = requests.post('http://localhost:8000/api/auth/register/', 
                            json=register_data)
    assert response.status_code == 201
    
    # Login user
    login_data = {
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    response = requests.post('http://localhost:8000/api/auth/login/', 
                            json=login_data)
    assert response.status_code == 200
    assert 'access' in response.json()
```

#### 3. Real-time Data Testing

Test real-time data updates:

```python
def test_realtime_updates():
    """Test real-time data updates"""
    # Create transaction
    transaction_data = {
        'amount': 1000.00,
        'transaction_type': 'credit',
        'description': 'Test transaction'
    }
    response = requests.post('http://localhost:8000/api/transactions/', 
                           json=transaction_data, headers=auth_headers)
    assert response.status_code == 201
    
    # Check dashboard updates
    response = requests.get('http://localhost:8000/api/dashboard/', 
                           headers=auth_headers)
    assert response.status_code == 200
    dashboard_data = response.json()
    assert dashboard_data['totalIncome'] >= 1000.00
```

## 🔍 Debugging Tests

### Common Issues and Solutions

1. **Database Connection Issues**
   ```bash
   # Check database settings
   python manage.py dbshell
   
   # Reset database
   python manage.py flush
   python manage.py migrate
   ```

2. **Authentication Issues**
   ```bash
   # Check JWT settings
   python manage.py shell
   >>> from rest_framework_simplejwt.tokens import RefreshToken
   >>> token = RefreshToken.for_user(user)
   >>> print(token.access_token)
   ```

3. **External API Issues**
   ```bash
   # Test external APIs
   python manage.py shell
   >>> from apps.external_apis.ussd_service import USSDService
   >>> service = USSDService()
   >>> response = service.handle_ussd_request("", "+254700000000")
   >>> print(response)
   ```

### Test Data Management

1. **Create Test Fixtures**
```bash
python manage.py dumpdata apps.users.User --indent 2 > tests/fixtures/users.json
python manage.py dumpdata apps.transactions.Transaction --indent 2 > tests/fixtures/transactions.json
```

2. **Load Test Fixtures**
```bash
python manage.py loaddata tests/fixtures/users.json
python manage.py loaddata tests/fixtures/transactions.json
```

## 📊 Performance Testing

### Benchmark Tests

1. **API Response Time Tests**
   - Dashboard API: < 2 seconds
   - SMS Parsing: < 1 second
   - Fraud Detection: < 500ms

2. **Database Query Tests**
   - Transaction queries: < 100ms
   - User lookups: < 50ms
   - Aggregation queries: < 200ms

3. **External API Tests**
   - USSD responses: < 1 second
   - WhatsApp responses: < 2 seconds
   - Blockchain operations: < 5 seconds

### Load Testing

```python
def test_concurrent_users():
    """Test concurrent user access"""
    import threading
    import time
    
    def make_request():
        response = requests.get('http://localhost:8000/api/dashboard/', 
                               headers=auth_headers)
        return response.status_code == 200
    
    threads = []
    for i in range(10):  # 10 concurrent users
        thread = threading.Thread(target=make_request)
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
```

## 🚨 Error Handling Tests

### Test Error Scenarios

1. **Invalid Data Tests**
   - Invalid email formats
   - Negative amounts
   - Missing required fields

2. **Authentication Error Tests**
   - Expired tokens
   - Invalid credentials
   - Unauthorized access

3. **External Service Error Tests**
   - Network timeouts
   - API rate limits
   - Service unavailability

## 📈 Test Coverage

### Coverage Requirements

- **Models**: 100% coverage
- **API Views**: 95% coverage
- **Services**: 90% coverage
- **Integration**: 80% coverage

### Generate Coverage Report

```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

## 🔄 Continuous Integration

### GitHub Actions Setup

```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.8
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    - name: Run tests
      run: |
        cd backend
        python manage.py test
```

## 📝 Test Documentation

### Writing Test Cases

1. **Follow AAA Pattern**
   - Arrange: Set up test data
   - Act: Execute the function/endpoint
   - Assert: Verify the results

2. **Use Descriptive Names**
   ```python
   def test_user_can_create_transaction_with_valid_data():
       """Test that user can create transaction with valid data"""
   ```

3. **Test Edge Cases**
   - Boundary values
   - Error conditions
   - Empty inputs
   - Large inputs

4. **Mock External Dependencies**
   ```python
   @patch('apps.external_apis.twilio_service.send_sms')
   def test_sms_sending(self, mock_send_sms):
       # Test SMS sending without actually sending
   ```

## 🎉 Success Criteria

Tests are considered successful when:

1. ✅ All unit tests pass
2. ✅ All API tests pass
3. ✅ All integration tests pass
4. ✅ Performance benchmarks are met
5. ✅ Error handling works correctly
6. ✅ Frontend-backend connectivity is verified
7. ✅ Test coverage meets requirements

## 🆘 Troubleshooting

### Common Test Failures

1. **Database Issues**
   - Solution: Reset test database
   - Command: `python manage.py flush`

2. **Authentication Issues**
   - Solution: Check JWT configuration
   - Command: `python manage.py shell`

3. **External API Issues**
   - Solution: Mock external services
   - Use: `@patch` decorator

4. **Import Issues**
   - Solution: Check Python path
   - Command: `export PYTHONPATH=$PYTHONPATH:.`

For more help, check the Django testing documentation or contact the development team.
