import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaRobot, FaTimes, FaMagic, FaBook, FaListUl, FaQuestionCircle, 
    FaChevronRight, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
    FaLightbulb, FaBrain, FaRegFileAlt, FaClock, FaUsers
} from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const AIArchitectModal = ({ show, handleClose }) => {
    const { darkMode } = useContext(ThemeContext);
    const [view, setView] = useState('menu'); // menu, syllabus, lesson, quiz
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!show) {
            setView('menu');
            setResult(null);
            setInput('');
        }
    }, [show]);

    if (!show) return null;

    const tools = [
        {
            id: 'syllabus',
            title: 'Syllabus Architect',
            desc: 'Generate a structured 5-unit curriculum for any course.',
            icon: <FaBook size={24} />,
            color: '#2563eb',
            placeholder: 'e.g. Advanced Machine Learning, Ancient Indian History'
        },
        {
            id: 'lesson',
            title: 'Lesson Planner',
            desc: 'Create detailed teaching plans with objectives and activities.',
            icon: <FaListUl size={24} />,
            color: '#7c3aed',
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
            setResult([
                { q: `What is the primary function of ${input}?`, a: 'Option A (Correct)', b: 'Option B', c: 'Option C', d: 'Option D' },
                { q: `Which of the following best describes the core principle of ${input}?`, a: 'Option A', b: 'Option B (Correct)', c: 'Option C', d: 'Option D' },
                { q: `Who is considered a pioneer in the field of ${input}?`, a: 'Option A', b: 'Option B', c: 'Option C (Correct)', d: 'Option D' },
                { q: `In a modern ecosystem, where is ${input} most commonly applied?`, a: 'Option A (Correct)', b: 'Option B', c: 'Option C', d: 'Option D' },
                { q: `What is a common challenge faced when implementing ${input}?`, a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D (Correct)' }
            ]);
        }
        setLoading(false);
        toast.success("AI Generation Complete!");
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

                        {/* VIEW: TOOL INTERFACE */}
                        {view !== 'menu' && (
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
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">Apply to Course</button>
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
                                                <h5 className="fw-bold mb-4 text-primary">{input} Quiz Set</h5>
                                                <div className="space-y-4">
                                                    {result.map((q, i) => (
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
                                            <button className="btn btn-primary rounded-pill px-4 fw-bold text-white flex-grow-1">Export to Course</button>
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
