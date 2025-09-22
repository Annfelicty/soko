#!/usr/bin/env python
"""
Test runner script for TajiriCircle backend
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def setup_django():
    """Setup Django environment for testing"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tajiri_circle.settings.development')
    django.setup()

def run_tests():
    """Run all tests"""
    setup_django()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests([
        'tests.test_models',
        'tests.test_api',
        'tests.test_services',
        'tests.test_integration',
    ])
    
    if failures:
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")

def run_unit_tests():
    """Run unit tests only"""
    setup_django()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests([
        'tests.test_models',
        'tests.test_api',
        'tests.test_services',
    ])
    
    if failures:
        sys.exit(1)
    else:
        print("\n✅ Unit tests passed!")

def run_integration_tests():
    """Run integration tests only"""
    setup_django()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_integration'])
    
    if failures:
        sys.exit(1)
    else:
        print("\n✅ Integration tests passed!")

def run_performance_tests():
    """Run performance tests"""
    setup_django()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_performance'])
    
    if failures:
        sys.exit(1)
    else:
        print("\n✅ Performance tests passed!")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
        if test_type == 'unit':
            run_unit_tests()
        elif test_type == 'integration':
            run_integration_tests()
        elif test_type == 'performance':
            run_performance_tests()
        else:
            print("Usage: python run_tests.py [unit|integration|performance]")
            sys.exit(1)
    else:
        run_tests()
