import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tajiri_circle.settings.development")

app = Celery("tajiri_circle")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
