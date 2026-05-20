from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import GeminiService
from curriculum.models import Topic, Module
from curriculum.permissions import IsAdminOrTeacher

class SuggestObjectivesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        topic_name = request.data.get('name')
        topic_description = request.data.get('description', '')

        if not topic_name:
            return Response({'error': 'Topic name is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = GeminiService()
        objectives = service.generate_objectives(topic_name, topic_description)
        
        return Response({'objectives': objectives})

class SuggestTopicOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, module_id):
        try:
            module = Module.objects.get(id=module_id)
            topics = module.topics.all()
            
            topics_data = [
                {'id': t.id, 'name': t.name, 'description': t.description}
                for t in topics
            ]
            
            if not topics_data:
                return Response({'error': 'No topics found in this module'}, status=status.HTTP_400_BAD_REQUEST)

            service = GeminiService()
            suggestions = service.suggest_topic_order(topics_data)
            
            return Response({'suggestions': suggestions})
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)

from PyPDF2 import PdfReader
import io

class GenerateQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, topic_id):
        try:
            topic = Topic.objects.get(id=topic_id)
            num_questions = int(request.data.get('num_questions', 25))
            
            pdf_content = ""
            # Check for uploaded PDF file in request
            if 'pdf_file' in request.FILES:
                pdf_file = request.FILES['pdf_file']
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    pdf_content += page.extract_text()
            
            # Or use existing study materials if they are PDFs
            elif not pdf_content:
                materials = topic.materials.filter(material_type='pdf')
                for mat in materials:
                    if mat.file:
                        try:
                            reader = PdfReader(mat.file.path)
                            for page in reader.pages:
                                pdf_content += page.extract_text()
                        except:
                            pass # Skip if file not found locally

            service = GeminiService()
            quiz = service.generate_quiz(
                topic_name=topic.name,
                topic_notes=topic.description,
                pdf_content=pdf_content[:15000], # Truncate for token limits
                num_questions=num_questions
            )
            
            return Response({'quiz': quiz})
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SuggestModulesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, course_id):
        try:
            from curriculum.models import Course
            course = Course.objects.get(id=course_id)
            
            service = GeminiService()
            modules = service.generate_modules(course.name, course.description)
            
            return Response({'modules': modules})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AnalyzeSyllabusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, course_id):
        try:
            from curriculum.models import Course
            course = Course.objects.get(id=course_id)
            
            # Build current structure
            structure = []
            modules = course.modules.all().order_by('order')
            for m in modules:
                m_data = {
                    "id": m.id,
                    "name": m.name,
                    "order": m.order,
                    "topics": [
                        {"id": t.id, "name": t.name, "order": t.order} 
                        for t in m.topics.all().order_by('order')
                    ]
                }
                structure.append(m_data)

            service = GeminiService()
            analysis = service.analyze_syllabus_structure(course.name, structure)
            
            return Response(analysis)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')

        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = GeminiService()
            response = service.chat(prompt, context)
            return Response({'response': response})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NodeIntelligenceView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        try:
            node_type = request.data.get('type')
            node_name = request.data.get('name')
            context_name = request.data.get('context_name', '')
            
            if not node_type or not node_name:
                return Response({'error': 'type and name are required'}, status=400)

            service = GeminiService()
            intelligence = service.generate_node_intelligence(node_type, node_name, context_name)
            
            return Response(intelligence)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
