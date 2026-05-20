import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBrain, FaMagic, FaCheckCircle, FaRobot, FaDownload, 
    FaChevronRight, FaRegCopy, FaPlay, FaQuestionCircle,
    FaCode, FaListOl, FaTerminal, FaSave, FaFileAlt
} from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const AIQuizGenerator = () => {
    const { darkMode } = useContext(ThemeContext);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        count: 5,
        type: 'MCQ',
        difficulty: 'Intermediate'
    });

    const handleGenerate = () => {
        if (!formData.topic) return toast.warning("Please specify a topic");
        setIsGenerating(true);
        setQuizData(null);

        // Simulate AI synthesis
        setTimeout(() => {
            const mockQuestions = Array.from({ length: formData.count }).map((_, i) => ({
                id: i + 1,
                question: `What is the primary role of ${formData.topic} in modern architecture?`,
                options: ["Performance optimization", "Security enhancement", "Data persistence", "Visual styling"],
                answer: 0,
                explanation: `${formData.topic} facilitates highly optimized computation paths...`
            }));

            setQuizData({
                topic: formData.topic,
                type: formData.type,
                difficulty: formData.difficulty,
                questions: mockQuestions
            });
            setIsGenerating(false);
            toast.success("Futuristic assessment ready!");
        }, 2500);
    };

    return (
        <div className={`container-fluid py-5 min-vh-100 ${darkMode ? 'ai-grid-bg' : 'bg-light'}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-lg-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                    <div>
                        <h6 className="text-primary fw-bold text-uppercase letter-spacing-2 mb-2">Generative AI Suite</h6>
                        <h1 className={`display-6 fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>Neural Assessment Gen</h1>
                    </div>
                    <div className={`ai-status-pulse d-flex align-items-center rounded-pill px-4 py-2 border ${darkMode ? 'bg-dark border-primary border-opacity-25' : 'bg-white border-primary border-opacity-10 shadow-sm'}`}>
                        <div className="pulse-dot me-3"></div>
                        <span className="small text-primary fw-bold">SYNTHESIS ENGINE READY</span>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left: Control Panel */}
                    <div className="col-lg-4">
                        <div className={`card-modern border-0 p-4 shadow-2xl h-100 ${darkMode ? 'glass-ai' : 'bg-white'}`}>
                            <h5 className={`fw-bold mb-4 d-flex align-items-center ${darkMode ? 'text-white' : 'text-primary'}`}>
                                <FaTerminal className="text-primary me-2" /> Parameters
                            </h5>

                            <div className="mb-4">
                                <label className="form-label smaller fw-bold text-muted uppercase mb-2">Target Topic</label>
                                <input 
                                    type="text" 
                                    className={`form-control py-3 rounded-4 ${darkMode ? 'glass border-white border-opacity-10 text-white' : 'bg-light border-light text-dark'}`} 
                                    placeholder="e.g. Distributed Systems"
                                    value={formData.topic}
                                    onChange={e => setFormData({...formData, topic: e.target.value})}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label smaller fw-bold text-muted uppercase mb-2">Question Type</label>
                                <div className="d-grid gap-2">
                                    {[
                                        { id: 'MCQ', icon: <FaListOl />, label: 'Multiple Choice' },
                                        { id: 'CODE', icon: <FaCode />, label: 'Coding Challenge' },
                                        { id: 'DESC', icon: <FaFileAlt />, label: 'Descriptive' }
                                    ].map(t => (
                                        <button 
                                            key={t.id}
                                            className={`btn btn-sm text-start py-3 px-4 rounded-4 transition-all d-flex align-items-center ${formData.type === t.id ? 'btn-primary shadow-lg' : darkMode ? 'btn-outline-light border-opacity-10' : 'btn-outline-secondary border-opacity-25'}`}
                                            onClick={() => setFormData({...formData, type: t.id})}
                                        >
                                            <span className="me-3">{t.icon}</span> {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label smaller fw-bold text-muted uppercase mb-2">Count</label>
                                    <input 
                                        type="number" 
                                        className={`form-control rounded-4 ${darkMode ? 'glass border-white border-opacity-10 text-white' : 'bg-light border-light text-dark'}`} 
                                        value={formData.count}
                                        onChange={e => setFormData({...formData, count: e.target.value})}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label smaller fw-bold text-muted uppercase mb-2">Difficulty</label>
                                    <select 
                                        className={`form-select rounded-4 ${darkMode ? 'glass border-white border-opacity-10 text-white' : 'bg-light border-light text-dark'}`}
                                        value={formData.difficulty}
                                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary w-100 rounded-pill py-3 fw-bold mt-auto shadow-lg d-flex align-items-center justify-content-center"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Synthesizing...' : <><FaMagic className="me-2" /> Initialize Generation</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview Panel */}
                    <div className="col-lg-8">
                        <div className={`card-modern border-0 p-0 shadow-2xl h-100 overflow-hidden position-relative min-vh-60 border ${darkMode ? 'glass-ai border-white border-opacity-10' : 'bg-white border-light'}`}>
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="d-flex align-items-center justify-content-center h-100 flex-column p-5"
                                    >
                                        <div className="ai-loader-container mb-4">
                                            <div className="ai-loader-ring"></div>
                                            <FaBrain className="ai-loader-icon" />
                                        </div>
                                        <h3 className={`${darkMode ? 'text-white' : 'text-dark'} fw-bold mb-2`}>Analyzing Knowledge Base...</h3>
                                        <p className="text-muted smaller letter-spacing-1">EXTRACTING SEMANTIC CONTEXT • GENERATING DISTRACTORS</p>
                                    </motion.div>
                                ) : quizData ? (
                                    <motion.div 
                                        key="quiz"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        className="p-5 h-100 overflow-auto custom-scrollbar"
                                    >
                                        <div className={`d-flex justify-content-between align-items-center mb-5 border-bottom pb-4 ${darkMode ? 'border-white border-opacity-10' : 'border-light'}`}>
                                            <div>
                                                <h4 className={`${darkMode ? 'text-white' : 'text-dark'} fw-bold mb-1`}>Generated Assessment</h4>
                                                <p className="text-muted small mb-0">Topic: {quizData.topic} • {quizData.questions.length} Items • {quizData.difficulty}</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className={`btn btn-sm rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center ${darkMode ? 'btn-light' : 'btn-outline-secondary bg-light'}`}>
                                                    <FaSave className="me-2" /> Save to Course
                                                </button>
                                                <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center">
                                                    <FaDownload className="me-2" /> Export PDF
                                                </button>
                                            </div>
                                        </div>

                                        {quizData.questions.map((q, idx) => (
                                            <div key={q.id} className={`mb-5 p-4 rounded-4 border ${darkMode ? 'bg-white bg-opacity-5 border-white border-opacity-10' : 'bg-light bg-opacity-30 border-light'}`}>
                                                <div className="d-flex mb-3">
                                                    <span className="badge bg-primary rounded-pill me-3 h-100 py-2">Q{idx + 1}</span>
                                                    <h5 className={`${darkMode ? 'text-white' : 'text-dark'} fw-bold mb-0`}>{q.question}</h5>
                                                </div>
                                                <div className="row g-3 ps-lg-5">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="col-md-6">
                                                            <div className={`p-3 rounded-4 border transition-all cursor-pointer h-100 ${oIdx === q.answer ? 'bg-primary bg-opacity-10 border-primary text-primary' : darkMode ? 'bg-dark border-white border-opacity-10 text-white-50' : 'bg-white border-light text-muted'}`}>
                                                                <span className="fw-bold me-3">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 ps-lg-5">
                                                    <div className={`p-3 rounded-4 border border-dashed border-opacity-20 ${darkMode ? 'bg-light bg-opacity-5 border-white' : 'bg-white border-primary'}`}>
                                                        <span className="smaller fw-bold text-success text-uppercase">AI Explanation:</span>
                                                        <p className={`smaller mb-0 mt-1 ${darkMode ? 'text-muted' : 'text-dark-50'}`}>{q.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 flex-column text-center p-5">
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }} 
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className={`p-5 rounded-circle mb-4 border shadow-2xl ${darkMode ? 'bg-primary bg-opacity-10 border-primary border-opacity-10' : 'bg-light border-light'}`}
                                        >
                                            <FaQuestionCircle size={80} className="text-primary opacity-50" />
                                        </motion.div>
                                        <h4 className="text-muted fw-bold">Assessment Engine Ready</h4>
                                        <p className="text-muted w-75 small">Define your quiz parameters to initialize high-fidelity question generation based on your curriculum data.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .pulse-dot { width: 10px; height: 10px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 0 rgba(37, 99, 235, 0.4); animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }
                .ai-loader-container { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
                .ai-loader-ring { position: absolute; width: 100%; height: 100%; border: 4px solid rgba(37, 99, 235, 0.1); border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
                .ai-loader-icon { font-size: 40px; color: #2563eb; animation: heartbeat 1.5s ease-in-out infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AIQuizGenerator;
