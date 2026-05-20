from django.urls import path
from .views import FileResourceListCreateView, FileResourceDetailView

urlpatterns = [
    path('resources/', FileResourceListCreateView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', FileResourceDetailView.as_view(), name='resource-detail'),
]
