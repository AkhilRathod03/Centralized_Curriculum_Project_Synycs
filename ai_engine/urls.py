from django.urls import path
from . import views

urlpatterns = [
    path('suggest-objectives/', views.SuggestObjectivesView.as_view(), name='suggest_objectives'),
    path('modules/<int:module_id>/suggest-order/', views.SuggestTopicOrderView.as_view(), name='suggest_topic_order'),
    path('courses/<int:course_id>/suggest-modules/', views.SuggestModulesView.as_view(), name='suggest_modules'),
    path('topics/<int:topic_id>/generate-quiz/', views.GenerateQuizView.as_view(), name='generate_quiz'),
    path('courses/<int:course_id>/analyze-syllabus/', views.AnalyzeSyllabusView.as_view(), name='analyze_syllabus'),
    path('node-intelligence/', views.NodeIntelligenceView.as_view(), name='node_intelligence'),
    path('chat/', views.AIChatView.as_view(), name='ai_chat'),
]
