def log_action(user, action, model_name, object_id, changes, request=None):
    """
    Call this whenever something important changes.
    Like a security camera — records who did what.
    """
    from .models import AuditLog
    ip = None
    if request:
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        changes=changes,
        ip_address=ip
    )