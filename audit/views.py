from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from curriculum.permissions import IsAdminUser

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # Admins see all logs for their institution (filtered via middleware or manually)
        # For now, filtering logs where the user belongs to the same institution
        return AuditLog.objects.filter(
            user__institution=self.request.user.institution
        ).select_related('user')[:50] # Return last 50 logs
