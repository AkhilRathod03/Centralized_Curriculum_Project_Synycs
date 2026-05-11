from django.db import models
from users.models import User

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)       # CREATE, UPDATE, DELETE
    model_name = models.CharField(max_length=100)  # e.g. "Topic"
    object_id = models.PositiveIntegerField()
    changes = models.JSONField(default=dict)        # what changed
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)

    class Meta:
        ordering = ['-timestamp']