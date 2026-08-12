import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaRobot, FaTimes, FaMagic, FaBook, FaListUl, FaQuestionCircle, 
    FaChevronRight, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
    FaLightbulb, FaBrain, FaRegFileAlt, FaClock, FaUsers, FaDatabase, FaSave
} from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

const AIArchitectModal = ({ show, handleClose }) => {
    const { darkMode } = useContext(ThemeContext);
    const [view, setView] = useState('menu'); // menu, syllabus, lesson, quiz, export
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [input, setInput] = useState('');
    const [userCourses, setUserCourses] = useState([]);
    const [selectedTargetCourse, setSelectedTargetCourse] = useState(null);

    useEffect(() => {
        if (!show) {
            setView('menu');
            setResult(null);
            setInput('');
            setSelectedTargetCourse(null);
        } else {
            fetchUserCourses();
        }
    }, [show]);

    const fetchUserCourses = async () => {
        try {
            const res = await axiosInstance.get('curriculum/courses/');
            setUserCourses(res.data.results || res.data);
        } catch (err) {
            console.error("Course fetch failed:", err);
        }
    };

    if (!show) return null;

    const tools = [
        {
            id: 'syllabus',
            title: 'Syllabus Architect',
            desc: 'Generate a structured 5-unit curriculum for any course.',
            icon: <FaBook size={24} />,
            color: '#000000',
            placeholder: 'e.g. Advanced Machine Learning, Ancient Indian History'
        },
        {
            id: 'lesson',
            title: 'Lesson Planner',
            desc: 'Create detailed teaching plans with objectives and activities.',
            icon: <FaListUl size={24} />,
            color: '#1a1a1a',
            placeholder: 'e.g. Introduction to Quantum Computing, Photosynthesis'
        },
        {
            id: 'quiz',
            title: 'Quiz Generator',
            desc: 'Instant 5-question MCQ sets for student assessments.',
            icon: <FaQuestionCircle size={24} />,
            color: '#10b981',
            placeholder: 'e.g. React Fundamentals, Cell Biology'
        }
    ];

    const handleToolSelect = (tool) => {
        setView(tool.id);
        setResult(null);
    };

    const handleAction = async () => {
        if (!input.trim()) {
            toast.error("Please provide a topic or course name.");
            return;
        }

        setLoading(true);
        // Simulated AI Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (view === 'syllabus') {
            setResult({
                type: 'syllabus',
                title: input,
                units: [
                    { name: 'Unit I: Foundational Principles', topics: ['Introduction & History', 'Core Concepts', 'Terminology'] },
                    { name: 'Unit II: Technical Frameworks', topics: ['Primary Architectures', 'Operational Logic', 'Systems Integration'] },
                    { name: 'Unit III: Applied Methodologies', topics: ['Case Study Analysis', 'Hands-on Implementation', 'Standard Protocols'] },
                    { name: 'Unit IV: Advanced Analytics', topics: ['Optimization Strategies', 'Performance Benchmarking', 'Predictive Modeling'] },
                    { name: 'Unit V: Future Horizons', topics: ['Emerging Trends', 'Ethical Implications', 'Industry Applications'] }
                ]
            });
        } else if (view === 'lesson') {
            setResult({
                type: 'lesson',
                topic: input,
                duration: '60 Minutes',
                objective: 'Students will understand the primary mechanics and real-world applications of ' + input + '.',
                steps: [
                    { time: '0-10m', task: 'Introduction & Brainstorming', activity: 'Quick poll on prior knowledge.' },
                    { time: '10-30m', task: 'Core Concept Delivery', activity: 'Slide presentation and visual modeling.' },
                    { time: '30-45m', task: 'Collaborative Workshop', activity: 'Group discussion or breakout sessions.' },
                    { time: '45-60m', task: 'Summary & Assessment', activity: 'Brief Q&A and 3-question exit ticket.' }
                ]
            });
        } else if (view === 'quiz') {
            const topic = input;
            const mockBank = {
                'python': [
                    { q: "What is the primary advantage of Python's list comprehension?", a: "More concise and readable code (Correct)", b: "Faster execution than C++", c: "Automatic memory encryption", d: "Compatibility with assembly language" },
                    { q: "Which keyword is used for exception handling in Python?", a: "catch", b: "try (Correct)", c: "error", d: "throw" },
                    { q: "What does the 'self' parameter represent in a class method?", a: "The parent class", b: "The global scope", c: "The instance of the class (Correct)", d: "A private variable" },
                    { q: "Which data type is immutable in Python?", a: "List", b: "Dictionary", c: "Tuple (Correct)", d: "Set" },
                    { q: "What is the output of '2 ** 3'?", a: "5", b: "6", c: "8 (Correct)", d: "9" }
                ],
                'data structure': [
                    { q: "What is the time complexity of searching in a Binary Search Tree (Best Case)?", a: "O(n)", b: "O(log n) (Correct)", c: "O(1)", d: "O(n log n)" },
                    { q: "Which data structure follows the LIFO principle?", a: "Queue", b: "Linked List", c: "Stack (Correct)", d: "Graph" },
                    { q: "What is the primary disadvantage of a Singly Linked List?", a: "High memory usage", b: "No random access (Correct)", c: "Fixed size", d: "Slow insertion at head" },
                    { q: "Which algorithm is used to find the shortest path in a weighted graph?", a: "BFS", b: "DFS", c: "Dijkstra's (Correct)", d: "Kruskal's" },
                    { q: "What is a 'Collision' in a Hash Table?", a: "Database crash", b: "Two keys mapping to the same index (Correct)", c: "Memory overflow", d: "Infinite loop" }
                ],
                'react': [
                    { q: "What is the purpose of the 'useEffect' hook?", a: "To manage global state", b: "To handle side effects (Correct)", c: "To style components", d: "To speed up rendering" },
                    { q: "What is the 'Virtual DOM'?", a: "A physical copy of the HTML", b: "A lightweight representation of the UI (Correct)", c: "A new browser engine", d: "A security layer" },
                    { q: "How do you pass data from parent to child in React?", a: "States", b: "Props (Correct)", c: "Context", d: "Redux" },
                    { q: "Which command is used to create a new React app?", a: "npm start", b: "npx create-react-app (Correct)", c: "npm install react", d: "react-new app" },
                    { q: "What is 'JSX'?", a: "A CSS preprocessor", b: "A syntax extension for JavaScript (Correct)", c: "A backend framework", d: "A testing library" }
                ]
            };

            const lowerTopic = topic.toLowerCase();
            let questions = [];

            if (lowerTopic.includes('python')) questions = mockBank.python;
            else if (lowerTopic.includes('data') || lowerTopic.includes('algorithm')) questions = mockBank['data structure'];
            else if (lowerTopic.includes('react') || lowerTopic.includes('web')) questions = mockBank.react;
            else {
                // Fallback for any other topic
                questions = Array.from({ length: 5 }).map((_, i) => ({
                    q: `Which concept is most critical to understanding ${topic}?`,
                    a: `The fundamental architecture of ${topic} (Correct)`,
                    b: `Legacy implementations of ${topic}`,
                    c: `Alternative theories to ${topic}`,
                    d: `External dependencies of ${topic}`
                }));
            }

            setResult({
                type: 'quiz',
                topic: topic,
                questions: questions
            });
        }
        setLoading(false);
        toast.success("AI Generation Complete!");
    };

    const handleExport = async () => {
        if (!selectedTargetCourse) {
            toast.warning("Please select a target course.");
            return;
        }

        setExportLoading(true);
        try {
            if (result.type === 'syllabus') {
                for (let i = 0; i < result.units.length; i++) {
                    const unit = result.units[i];
                    const modRes = await axiosInstance.post(`curriculum/courses/${selectedTargetCourse}/modules/`, {
                        name: unit.name,
                        order: i
                    });
                    const moduleId = modRes.data.id;
                    for (let j = 0; j < unit.topics.length; j++) {
                        await axiosInstance.post(`curriculum/modules/${moduleId}/topics/`, {
                            name: unit.topics[j],
                            order: j,
                            duration_hours: 2
                        });
                    }
                }
                toast.success("Full Syllabus synchronized to " + userCourses.find(c => c.id === selectedTargetCourse)?.name);
            } else if (result.type === 'quiz') {
                const modRes = await axiosInstance.post(`curriculum/courses/${selectedTargetCourse}/modules/`, {
                    name: `Neural Assessment: ${result.topic}`,
                    order: 99
                });
                const moduleId = modRes.data.id;
                for (let j = 0; j < result.questions.length; j++) {
                    const q = result.questions[j];
                    await axiosInstance.post(`curriculum/modules/${moduleId}/topics/`, {
                        name: `Q${j+1}: ${q.q}`,
                        order: j,
                        duration_hours: 1
                    });
                }
                toast.success("Quiz Data archived to " + userCourses.find(c => c.id === selectedTargetCourse)?.name);
            } else if (result.type === 'lesson') {
                const modRes = await axiosInstance.post(`curriculum/courses/${selectedTargetCourse}/modules/`, {
                    name: `Lesson Plan: ${result.topic}`,
                    order: 98
                });
                const moduleId = modRes.data.id;
                await axiosInstance.post(`curriculum/modules/${moduleId}/topics/`, {
                    name: `Objective: ${result.objective.substring(0, 50)}...`,
                    order: 0,
                    duration_hours: 1
                });
                toast.success("Lesson Strategy exported to " + userCourses.find(c => c.id === selectedTargetCourse)?.name);
            }
            
            setExportLoading(false);
            handleClose();
        } catch (err) {
            console.error("Export error:", err);
            toast.error("Data synchronization failed.");
            setExportLoading(false);
        }
    };

    const currentTool = tools.find(t => t.id === view);

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', zIndex: 3000 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className={`modal-content border-0 rounded-5 overflow-hidden shadow-2xl ${darkMode ? 'bg-dark text-white border border-secondary border-opacity-30' : 'bg-white'}`}
                >
                    {/* Header */}
                    <div className="modal-header border-0 p-4 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-ai-gradient p-3 rounded-4 text-white shadow-ai-glow">
                                <FaRobot size={24} />
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0 letter-spacing-tight">AI Architect Studio</h4>
                                <p className="text-muted small mb-0">Powered by Neural Academic Engine v2.0</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className={`btn-close ${darkMode ? 'btn-close-white' : ''} shadow-none`}></button>
                    </div>

                    <div className="modal-body p-4 pt-0">
                        {/* VIEW: MENU */}
                        {view === 'menu' && (
                            <div className="row g-4 py-3">
                                {tools.map((tool) => (
                                    <div key={tool.id} className="col-md-4">
                                        <div 
                                            className={`card-modern h-100 p-4 border-0 glass shadow-sm hover-lift cursor-pointer text-center ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}
                                            onClick={() => handleToolSelect(tool)}
                                        >
                                            <div className="p-3 rounded-circle d-inline-flex mb-3 shadow-sm" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                                                {tool.icon}
                                            </div>
                                            <h6 className="fw-bold mb-2">{tool.title}</h6>
                                            <p className="text-muted smaller mb-0 opacity-80">{tool.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VIEW: EXPORT SELECTION */}
                        {view === 'export' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <button className={`btn btn-icon-sm rounded-circle ${darkMode ? 'btn-dark' : 'btn-light'}`} onClick={() => setView(result.type)}>
                                        <FaArrowLeft size={10} />
                                    </button>
                                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2">
                                        Institutional Synchronization
                                    </span>
                                </div>

                                <div className="py-2">
                                    <h5 className="fw-bold mb-4">Select Target Course</h5>
                                    <div className="row g-3">
                                        {userCourses.map(course => (
                                            <div key={course.id} className="col-md-6">
                                                <div 
                                                    className={`p-3 rounded-4 border cursor-pointer transition-all ${selectedTargetCourse === course.id ? 'bg-primary text-white border-primary shadow-primary-glow' : darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'}`}
                                                    onClick={() => setSelectedTargetCourse(course.id)}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className={`p-2 rounded-3 ${selectedTargetCourse === course.id ? 'bg-white bg-opacity-20' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                            <FaBook size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold small">{course.name}</div>
                                                            <div className={`smaller opacity-70 ${selectedTargetCourse === course.id ? 'text-white' : 'text-muted'}`}>{course.code}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-5 d-flex gap-3">
                                        <button className="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" onClick={() => setView(result.type)}>Back to Preview</button>
                                        <button 
                                            className="btn btn-primary rounded-pill px-4 fw-bold text-white flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleExport}
                                            disabled={exportLoading}
                                        >
                                            {exportLoading ? <span className="spinner-border spinner-border-sm"></span> : <><FaSave /> Commit to DB</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* VIEW: TOOL INTERFACE */}
                        {(view !== 'menu' && view !== 'export') && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <button className={`btn btn-icon-sm rounded-circle ${darkMode ? 'btn-dark' : 'btn-light'}`} onClick={() => setView('menu')}>
                                        <FaArrowLeft size={10} />
                                    </button>
                                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2">
                                        {currentTool?.title}
                                    </span>
                                </div>

                                {!result ? (
                                    <div className="py-4">
                                        <h5 className="fw-bold mb-3">What are we building today?</h5>
                                        <div className="input-group input-group-lg border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                                            <span className={`input-group-text border-0 ${darkMode ? 'bg-secondary bg-opacity-20 text-muted' : 'bg-white'}`}>
                                                <FaBrain className="text-primary" />
                                            </span>
                                            <input 
                                                type="text" 
                                                className={`form-control border-0 shadow-none fs-6 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-white'}`} 
                                                placeholder={currentTool?.placeholder}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                            />
                                            <button 
                                                className="btn btn-primary px-4 fw-bold text-white d-flex align-items-center gap-2"
                                                onClick={handleAction}
                                                disabled={loading}
                                            >
                                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <FaMagic />}
                                                Generate
                                            </button>
                                        </div>
                                        <div className={`p-4 rounded-4 ${darkMode ? 'bg-dark bg-opacity-40 border border-secondary border-opacity-30' : 'bg-light border'}`}>
                                            <h6 className="fw-bold small text-muted uppercase mb-3 letter-spacing-1">Capabilities</h6>
                                            <ul className="list-unstyled mb-0 space-y-3">
                                                <li className="d-flex align-items-start gap-3">
                                                    <div className="bg-success bg-opacity-10 text-success p-1 rounded"><FaCheckCircle size={12} /></div>
                                                    <span className="small opacity-80">Context-aware generation based on institutional standards.</span>
                                                </li>
                                                <li className="d-flex align-items-start gap-3">
                                                    <div className="bg-success bg-opacity-10 text-success p-1 rounded"><FaCheckCircle size={12} /></div>
                                                    <span className="small opacity-80">Exportable formats for curriculum and assessment nodes.</span>
                                                </li>
                                                <li className="d-flex align-items-start gap-3">
                                                    <div className="bg-success bg-opacity-10 text-success p-1 rounded"><FaCheckCircle size={12} /></div>
                                                    <span className="small opacity-80">AI-optimized logical flow for student engagement.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 custom-scrollbar" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {/* SYLLABUS RESULT */}
                                        {view === 'syllabus' && (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h5 className="fw-bold mb-0 text-primary">{result.title} Syllabus</h5>
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => setView('export')}>Sync to Course</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {result.units.map((unit, i) => (
                                                        <div key={i} className={`p-3 rounded-4 border ${darkMode ? 'bg-dark bg-opacity-40 border-secondary' : 'bg-white'}`}>
                                                            <h6 className="fw-bold mb-2">{unit.name}</h6>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {unit.topics.map((t, ti) => (
                                                                    <span key={ti} className="badge bg-light text-muted border fw-medium">{t}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* LESSON PLAN RESULT */}
                                        {view === 'lesson' && (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h5 className="fw-bold mb-0 text-primary">Lesson: {result.topic}</h5>
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold"><FaClock className="me-1" /> {result.duration}</span>
                                                </div>
                                                <div className={`p-4 rounded-4 mb-4 ${darkMode ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20' : 'bg-light border'}`}>
                                                    <h6 className="fw-bold text-primary small uppercase mb-2">Learning Objective</h6>
                                                    <p className="mb-0 small">{result.objective}</p>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className={`table table-borderless align-middle ${darkMode ? 'table-dark' : ''}`}>
                                                        <thead>
                                                            <tr className="text-muted smaller fw-bold uppercase letter-spacing-1 opacity-50">
                                                                <th>Phase</th>
                                                                <th>Activity</th>
                                                                <th className="text-end">Duration</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {result.steps.map((step, i) => (
                                                                <tr key={i} className="border-bottom border-light border-opacity-10">
                                                                    <td className="py-3">
                                                                        <div className="fw-bold small">{step.task}</div>
                                                                    </td>
                                                                    <td className="py-3">
                                                                        <div className="text-muted small">{step.activity}</div>
                                                                    </td>
                                                                    <td className="py-3 text-end">
                                                                        <span className="badge bg-light text-muted fw-bold">{step.time}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* QUIZ RESULT */}
                                        {view === 'quiz' && (
                                            <div>
                                                <h5 className="fw-bold mb-4 text-primary">{result.topic} Quiz Set</h5>
                                                <div className="space-y-4">
                                                    {result.questions.map((q, i) => (
                                                        <div key={i} className={`p-4 rounded-4 border ${darkMode ? 'bg-dark bg-opacity-40 border-secondary' : 'bg-white'}`}>
                                                            <div className="d-flex gap-3 mb-3">
                                                                <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>{i + 1}</span>
                                                                <h6 className="fw-bold mb-0">{q.q}</h6>
                                                            </div>
                                                            <div className="row g-2">
                                                                {['a', 'b', 'c', 'd'].map(opt => (
                                                                    <div key={opt} className="col-md-6">
                                                                        <div className={`p-2 px-3 rounded-pill border small transition-all ${q[opt].includes('(Correct)') ? 'bg-success bg-opacity-10 border-success text-success fw-bold' : 'opacity-70'}`}>
                                                                            {opt.toUpperCase()}. {q[opt]}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 d-flex gap-3">
                                            <button className="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" onClick={() => setResult(null)}>Try Another Topic</button>
                                            <button className="btn btn-primary rounded-pill px-4 fw-bold text-white flex-grow-1" onClick={() => setView('export')}>Export to Course</button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer - Only in Menu */}
                    {view === 'menu' && (
                        <div className={`modal-footer border-0 p-4 pt-0 d-flex justify-content-between`}>
                            <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                                <FaLightbulb className="text-warning" /> Pro Tip: More specific topics yield higher quality neural maps.
                            </p>
                            <button className="btn btn-light rounded-pill px-4 fw-bold small" onClick={handleClose}>Close Architect</button>
                        </div>
                    )}
                </motion.div>
            </div>
            <style>{`
                .letter-spacing-tight { letter-spacing: -0.5px; }
                .shadow-ai-glow { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
                .space-y-3 > * + * { margin-top: 0.75rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .pulse-green { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
};

export default AIArchitectModal;

