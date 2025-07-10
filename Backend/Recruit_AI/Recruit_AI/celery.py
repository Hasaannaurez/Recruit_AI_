# from __future__ import absolute_import, unicode_literals
# import os

# from celery import Celery
# from django.conf import settings

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Recruit_AI.settings')

# app = Celery('Recruit_AI')
# app.conf.enable_utc = False

# app.conf.update(timezone = 'Asia/Kolkata')

# app.config_from_object(settings, namespace='CELERY')

# app.autodiscover_tasks()

# @app.task(bind=True)
# def debug_task(self):
#     print(f'Request: {self.request!r}')



from __future__ import absolute_import, unicode_literals
import os

from celery import Celery

# 1. Tell Django where your settings live
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Recruit_AI.settings')

# 2. Instantiate Celery
app = Celery('Recruit_AI')

# 3. 
app.conf.enable_utc = False

# 4. All your Celery config in one place, using new names
app.conf.update(
    broker_url        = 'redis://localhost:6379',  # was CELERY_BROKER_URL
    result_backend    = 'django-db',               # was CELERY_RESULT_BACKEND
    accept_content    = ['application/json'],      # was CELERY_ACCEPT_CONTENT
    task_serializer   = 'json',                    # was CELERY_TASK_SERIALIZER
    result_serializer = 'json',                    # was CELERY_RESULT_SERIALIZER
    timezone          = 'Asia/Kolkata',            # was CELERY_TIMEZONE
)


# app.config_from_object('django.conf:settings', namespace='CELERY')

# 6. Auto-discover task modules in your INSTALLED_APPS
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
