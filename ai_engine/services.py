import google.generativeai as genai
from django.conf import settings
import json

class GeminiService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.is_mock = True
        self.available_models = []
        self.current_model_index = 0
        
        if self.api_key and self.api_key.strip() != '' and self.api_key != 'your-gemini-api-key-here':
            try:
                genai.configure(api_key=self.api_key)
                
                # Auto-detect available models
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        self.available_models.append(m.name.replace('models/', ''))
                
                # Priority: 8B is ultra-fast, Lite is next
                priorities = [
                    'gemini-1.5-flash-8b-latest',
                    'gemini-1.5-flash-8b',
                    'gemini-2.0-flash-lite-preview-02-05',
                    'gemini-2.0-flash-lite',
                    'gemini-1.5-flash-latest', 
                    'gemini-1.5-flash', 
                    'gemini-pro'
                ]
                
                sorted_models = []
                for p in priorities:
                    if p in self.available_models:
                        sorted_models.append(p)
                
                for m in self.available_models:
                    if m not in sorted_models:
                        sorted_models.append(m)
                
                self.available_models = sorted_models
                
                if self.available_models:
                    # Config for speed
                    generation_config = {
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "top_k": 40,
                        "max_output_tokens": 1024, # Keep responses concise for speed
                    }
                    self.model = genai.GenerativeModel(
                        model_name=self.available_models[0],
                        generation_config=generation_config
                    )
                    self.is_mock = False
                    print(f"AI Turbo Engine active: {self.available_models[0]}")
            except Exception as e:
                print(f"Gemini Initialization Error: {e}")
                self.is_mock = True

    def rotate_model(self):
        """Switches to the next available model if current one fails."""
        if not self.available_models:
            return False
        
        self.current_model_index = (self.current_model_index + 1) % len(self.available_models)
        next_model_name = self.available_models[self.current_model_index]
        self.model = genai.GenerativeModel(next_model_name)
        print(f"⚡ Turbo-Switching Core: {next_model_name}")
        return True

    def chat(self, prompt, context=None):
        """
        Handles general-purpose AI prompts for any user doubt or query.
        """
        if self.is_mock:
            return "Mock response: Configure GEMINI_API_KEY in .env for real AI."

        # Condensed system instruction to save tokens/time
        sys_instr = "You are 'CCMS AI', a helpful Academic Assistant. Be accurate, concise, and use Markdown."

        full_prompt = f"{sys_instr}\n\n"
        if context:
            full_prompt += f"CONTEXT: {context}\n\n"
        full_prompt += f"QUERY: {prompt}"

        for attempt in range(3):
            try:
                response = self.model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                error_str = str(e)
                if ("429" in error_str or "quota" in error_str.lower()) and attempt < 2:
                    print(f"⚠️ Model {self.available_models[self.current_model_index]} quota hit. Rotating...")
                    if not self.rotate_model():
                        break
                    continue # Retry with new model
                
                print(f"Gemini Chat Error: {e}")
                return f"Neural Core Error: {error_str}. Please try again in 30 seconds."
        
        return "All available Neural Cores are currently at maximum capacity. Please wait a few moments for the link to stabilize."

    def generate_node_intelligence(self, node_type, node_name, context_name=""):
        """
        Generates deep intelligence for a specific node (Module or Topic).
        For Modules: Suggests topics.
        For Topics: Generates objectives and summary.
        """
        if self.is_mock:
            if node_type == 'module':
                return {
                    "suggestions": [f"Advanced {node_name} Concepts", "Case Studies in " + node_name, "Standard Implementation"],
                    "type": "topics"
                }
            else:
                return {
                    "objectives": ["Identify core principles", "Apply concepts to problems"],
                    "summary": f"This topic covers the fundamental aspects of {node_name} within the {context_name} framework.",
                    "type": "content"
                }

        prompt = f"""
        You are a Subject Matter Expert. 
        TASK: Provide educational content for the {node_type} named "{node_name}" 
        in the context of the course/module "{context_name}".

        INSTRUCTIONS:
        1. If this is a MODULE, suggest 3-5 standard academic topics that belong inside it.
        2. If this is a TOPIC, generate 3 clear Learning Objectives (Bloom's) and a 3-sentence conceptual summary.

        Return a JSON object:
        For Module: {{ "type": "topics", "suggestions": ["topic1", "topic2", ...] }}
        For Topic: {{ "type": "content", "objectives": ["...", "..."], "summary": "..." }}

        Return ONLY the JSON.
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": str(e)}

    def generate_objectives(self, topic_name, topic_description):
        """
        Generates 3-5 learning objectives for a given topic.
        """
        if self.is_mock:
            return [
                f"Understand the core principles of {topic_name}",
                f"Apply {topic_name} concepts to real-world scenarios",
                f"Analyze the impact of {topic_name} on the field",
                f"Evaluate different approaches to {topic_name}"
            ]

        prompt = f"""
        You are an expert curriculum designer.
        Based on the topic name "{topic_name}" and its description "{topic_description}",
        generate 3 to 5 clear, measurable learning objectives using Bloom's Taxonomy.
        Format the output as a JSON list of strings.
        Example: ["Student can identify core concepts", "Student can apply formulas to problems"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Clean response text in case it has markdown code blocks
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []

    def generate_quiz(self, topic_name, topic_notes=None, pdf_content=None, num_questions=25):
        """
        Generates a quiz with multiple choice questions based on topic notes and/or PDF content.
        """
        if self.is_mock:
            return [
                {
                    "question": f"What is a primary concept in {topic_name}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A",
                    "explanation": "This is a dummy explanation for the mock quiz."
                }
                for i in range(min(num_questions, 5))  # Mock only gives 5
            ]

        context = ""
        if topic_notes:
            context += f"\nTopic Notes: {topic_notes}"
        if pdf_content:
            context += f"\nPDF Document Content: {pdf_content}"

        prompt = f"""
        You are an expert examiner. Generate EXACTLY {num_questions} Multiple Choice Questions (MCQs) for the topic: "{topic_name}".
        
        {f"Use the following context to create high-quality, relevant questions: {context}" if context else "Create general academic questions for this topic."}
        
        For each question, provide:
        1. The question text.
        2. Exactly 4 options (A, B, C, D).
        3. The correct answer (the full text of the correct option).
        4. A brief explanation of why that answer is correct.

        Format the output as a JSON list of objects ONLY.
        Example: [{{ "question": "...", "options": ["...", "..."], "answer": "...", "explanation": "..." }}]
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()

            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []

    def suggest_topic_order(self, topics_data):
        """
        Given a list of topics (id, name, description), suggests a logical order.
        Returns a mapping of id to order.
        """
        if self.is_mock:
            # Just return the existing order for mock
            return {str(t['id']): i for i, t in enumerate(topics_data)}

        prompt = f"""
        You are an expert educator. I have a list of topics for a module.
        Please arrange them in a logical learning sequence (from basic to advanced).

        Topics:
        {json.dumps(topics_data, indent=2)}

        Return a JSON object mapping the topic 'id' to its suggested 'order' (starting from 0).
        Example: {{"12": 0, "15": 1, "10": 2}}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()

            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return {}

    def analyze_syllabus_structure(self, course_name, structure_data):
        """
        Analyzes and standardizes the syllabus to exactly 5 modules.
        Focus: Standard Academic Curriculum (Commonly taught in colleges).
        Prevention: Strictly avoids duplicating existing topics.
        """
        if self.is_mock:
            # DYNAMIC MOCK: Detects how many units are missing and fills them
            current_count = len(structure_data)
            all_mock_units = [
                {"name": "Unit 1: Fundamentals & Introduction", "topics": ["Basic Concepts", "Scope & Significance"]},
                {"name": "Unit 2: Core Principles & Theory", "topics": ["Theoretical Models", "Primary Methodologies"]},
                {"name": "Unit 3: Intermediate Architecture", "topics": ["System Design", "Logic Synthesis"]},
                {"name": "Unit 4: Advanced Implementation", "topics": ["Performance Optimization", "Advanced Tools"]},
                {"name": "Unit 5: Labs & Case Studies", "topics": ["Practical Exercises", "Real-world Applications"]}
            ]
            
            missing_units = all_mock_units[current_count:] if current_count < 5 else []
            
            return {
                "reorders": [],
                "missing_topics": [],
                "new_modules": missing_units,
                "reasoning": f"Mock: Generating {len(missing_units)} units to reach the standard 5-module academic requirement."
            }

        prompt = f"""
        You are an Academic Dean specializing in Standard College Curricula. 
        TASK: Architect a complete, standardized syllabus for "{course_name}".
        
        GOAL: The syllabus MUST have exactly 5 logical units (Modules).
        CONTENT STYLE: Focus on standard academic foundations commonly taught in universities. 
        
        CURRENT STATE (Count modules carefully):
        {json.dumps(structure_data, indent=2)}
        
        INSTRUCTIONS:
        1. If modules count is 0, suggest 5 new modules (Unit 1 to Unit 5).
        2. If modules count is > 0 but < 5, suggest the EXACT number of new modules needed to reach a total of 5.
        3. For each suggested module, provide 3-5 key academic topics.
        4. CRITICAL: Avoid any topics that already exist in the CURRENT STATE.
        5. If existing modules are out of order, suggest a new sequence.

        Return a JSON object with:
        - "new_modules": List of {{"name": "Unit X: Title", "topics": ["topic1", "topic2", ...]}}
        - "reorders": List of {{"id": node_id, "suggested_order": int, "type": "module"}}
        - "reasoning": Explanation.

        Return ONLY the JSON.
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()

            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return {"error": str(e)}

    def generate_modules(self, course_name, course_description):
        """
        Suggests EXACTLY 5 modules for a new course.
        Focus: Academic curriculum (College/University style).
        """
        if self.is_mock:
            name_lower = course_name.lower()
            if 'python' in name_lower:
                return [
                    {"name": "Programming Logic & Basics", "description": "Fundamentals of algorithms and Python syntax.", "topics": ["Algorithm & Flowcharts", "Data Types & Operators", "Input/Output Statements", "Comments and Documentation"]},
                    {"name": "Control Structures & Loops", "description": "Decision making and iterative statements.", "topics": ["Conditional Branching (if-elif-else)", "Looping Constructs (while, for)", "Break, Continue & Pass Statements"]},
                    {"name": "Functions & Modular Programming", "description": "Modular programming and reusable code.", "topics": ["Function Definition & Scope", "Parameter Passing Mechanisms", "Recursion", "Standard Library Modules"]},
                    {"name": "Data Structures & String Handling", "description": "Managing data collections.", "topics": ["Lists, Tuples & Dictionaries", "Set Operations", "String Manipulation & Regular Expressions"]},
                    {"name": "File Handling & Exception Management", "description": "Persistent storage and error handling.", "topics": ["File I/O Operations", "Handling Exceptions (try-except)", "Custom Exceptions"]}
                ]
            elif 'react' in name_lower:
                return [
                    {"name": "Web Fundamentals & ES6+", "description": "Review of HTML/JS for React.", "topics": ["DOM vs Virtual DOM", "Arrow Functions & Destructuring", "Spread/Rest Operators", "Promises and Async/Await"]},
                    {"name": "React Core Architecture", "description": "Introduction to library structure.", "topics": ["JSX Syntax", "Functional vs Class Components", "Component Lifecycle", "Rendering Elements"]},
                    {"name": "Props & State Management", "description": "Data handling in academic projects.", "topics": ["Uni-directional Data Flow", "State Hook (useState)", "Prop Types & Validation", "Lifting State Up"]},
                    {"name": "Hooks & Event Handling", "description": "Advanced React features.", "topics": ["useEffect & Side Effects", "useContext for Global State", "Controlled vs Uncontrolled Components", "Event Handling Patterns"]},
                    {"name": "Routing & API Interaction", "description": "Multi-page apps and data fetching.", "topics": ["React Router Basics", "Navigation Hooks", "Fetching Data with Axios", "Loading & Error States"]}
                ]
            else:
                return [
                    {"name": "Foundations of " + course_name, "description": "Theoretical background.", "topics": ["Definition & Scope", "Historical Context"]},
                    {"name": "Core Principles", "description": "Primary study area.", "topics": ["Key Methodologies", "Standard Models", "Analytical Tools"]},
                    {"name": "Intermediate Theory", "description": "Main concepts.", "topics": ["Key Features", "Methods", "Implementation", "Case Studies"]},
                    {"name": "Advanced Concepts", "description": "Complex analysis.", "topics": ["Performance", "Security", "Comparative Analysis"]},
                    {"name": "Review & Exam Preparation", "description": "Final summary.", "topics": ["Previous Year Questions", "Important Diagrams", "Final Summary"]}
                ]

        prompt = f"""
        You are an expert Academic Curriculum Designer for a University. 
        TASK: Design a semester-based course structure for: "{course_name}".
        DESCRIPTION: "{course_description}"
        
        CRITICAL ACADEMIC INSTRUCTIONS:
        1. Design EXACTLY 5 MODULES.
        2. Focus on THEORETICAL FOUNDATIONS and CORE PRINCIPLES.
        3. DO NOT use prefixes like "Unit 1:" or "Module 1:". Just give the Name of the topic/subject.
        4. For each Module, provide a 'name', 'description', and a list of 'topics'.
        5. The number of topics per module should be natural (between 2 to 5).
        
        Format the output as a JSON list of objects ONLY.
        Example: [{{ "name": "Introduction to Logic", "description": "...", "topics": ["Theory 1", "Concept 2"] }}]
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()

            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []

    def generate_quiz(self, topic_name, topic_notes=None, pdf_content=None, num_questions=25):
        """
        Generates a quiz with multiple choice questions based on topic notes and/or PDF content.
        """
        if self.is_mock:
            return [
                {
                    "question": f"What is a primary concept in {topic_name}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A",
                    "explanation": "This is a dummy explanation for the mock quiz."
                }
                for i in range(min(num_questions, 5))  # Mock only gives 5
            ]

        context = ""
        if topic_notes:
            context += f"\nTopic Notes: {topic_notes}"
        if pdf_content:
            context += f"\nPDF Document Content: {pdf_content}"

        prompt = f"""
        You are an expert examiner. Generate EXACTLY {num_questions} Multiple Choice Questions (MCQs) for the topic: "{topic_name}".
        
        {f"Use the following context to create high-quality, relevant questions: {context}" if context else "Create general academic questions for this topic."}
        
        For each question, provide:
        1. The question text.
        2. Exactly 4 options (A, B, C, D).
        3. The correct answer (the full text of the correct option).
        4. A brief explanation of why that answer is correct.

        Format the output as a JSON list of objects ONLY.
        Example: [{{ "question": "...", "options": ["...", "..."], "answer": "...", "explanation": "..." }}]
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()

            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []
