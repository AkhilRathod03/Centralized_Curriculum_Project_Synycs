from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/curriculum/', include('curriculum.urls')),
    path('api/files/', include('files.urls')),
    path('api/ai/', include('ai_engine.urls')),
    path('api/audit/', include('audit.urls')),
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)