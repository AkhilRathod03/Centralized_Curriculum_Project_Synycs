import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBrain, FaMagic, FaRocket, FaClock, FaSignal, 
    FaFileAlt, FaCheckCircle, FaRobot, FaDownload, 
    FaChevronRight, FaRegCopy, FaPlay
} from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const AILessonPlanner = () => {
    const { darkMode } = useContext(ThemeContext);
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        topic: '',
        duration: '60 mins',
        difficulty: 'Intermediate',
        objectives: ['Analyze core concepts', 'Practical implementation'],
    });

    const [generatedPlan, setGeneratedPlan] = useState(null);

    const handleGenerate = () => {
        if (!formData.topic) return toast.warning("Please specify a topic");
        setIsGenerating(true);
        setGeneratedPlan(null);

        // Simulate AI generation
        setTimeout(() => {
            setGeneratedPlan({
                title: formData.topic,
                summary: `A comprehensive ${formData.duration} lesson on ${formData.topic} designed for ${formData.difficulty} level students.`,
                learning_outcomes: [
                    "Understand the fundamental architecture of " + formData.topic,
                    "Identify key industry use cases and best practices",
                    "Develop a working prototype using standard libraries"
                ],
                timeline: [
                    { time: "0-10m", title: "Introduction & Context", desc: "Setting the stage and exploring real-world relevance." },
                    { time: "10-30m", title: "Core Theoretical Framework", desc: "Deep dive into the underlying logic and patterns." },
                    { time: "30-50m", title: "Interactive Workshop", desc: "Hands-on implementation and problem-solving session." },
                    { time: "50-60m", title: "Q&A and Synthesis", desc: "Reviewing key takeaways and mapping future learning paths." }
                ],
                suggested_materials: ["Architecture Diagram PDF", "Sample Code Repository", "Assessment MCQ Sheet"]
            });
            setIsGenerating(false);
            setStep(2);
            toast.success("AI Lesson Plan generated successfully!");
        }, 3000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className={`container-fluid py-4 min-vh-100 ${darkMode ? 'ai-grid-bg' : 'bg-light'}`}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <h6 className="text-primary fw-bold text-uppercase letter-spacing-2 mb-2">Generative AI Suite</h6>
                        <h1 className={`display-6 fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>Neural Lesson Planner</h1>
                    </div>
                    <div className="badge bg-ai-gradient px-4 py-2 rounded-pill shadow-lg d-flex align-items-center">
                        <FaRobot className="me-2" /> <span className="small fw-bold">AI ACTIVE</span>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left: Input Panel */}
                    <div className="col-lg-4">
                        <div className={`card-modern border-0 p-4 h-100 shadow-2xl ${darkMode ? 'glass-ai' : 'bg-white'}`}>
                            <h5 className={`fw-bold mb-4 d-flex align-items-center ${darkMode ? 'text-white' : 'text-primary'}`}>
                                <FaMagic className="text-primary me-2" /> Configuration
                            </h5>
                            
                            <div className="mb-4">
                                <label className="form-label smaller fw-bold text-muted uppercase mb-2">Subject/Topic</label>
                                <div className={`input-group rounded-4 overflow-hidden border ${darkMode ? 'glass border-white border-opacity-10' : 'bg-light border-light'}`}>
                                    <span className="input-group-text bg-transparent border-0 text-primary"><FaBrain /></span>
                                    <input 
                                        type="text" 
                                        className={`form-control bg-transparent border-0 shadow-none py-3 ${darkMode ? 'text-white' : 'text-dark'}`} 
                                        placeholder="e.g. Quantum Computing Basics"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label smaller fw-bold text-muted uppercase mb-2">Duration</label>
                                    <select 
                                        className={`form-select border-0 rounded-4 py-2 shadow-none ${darkMode ? 'glass bg-dark text-white' : 'bg-light text-dark'}`}
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    >
                                        <option>30 mins</option>
                                        <option>60 mins</option>
                                        <option>90 mins</option>
                                        <option>2 hours</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label smaller fw-bold text-muted uppercase mb-2">Difficulty</label>
                                    <select 
                                        className={`form-select border-0 rounded-4 py-2 shadow-none ${darkMode ? 'glass bg-dark text-white' : 'bg-light text-dark'}`}
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                        <option>Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label smaller fw-bold text-muted uppercase mb-2">Teaching Methodology</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {['Inquiry Based', 'Direct Instruction', 'Flipped Classroom', 'Gamified'].map(m => (
                                        <button key={m} className={`btn btn-sm rounded-pill px-3 border-opacity-25 py-1 text-xs ${darkMode ? 'btn-outline-primary' : 'btn-outline-secondary'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                className={`btn btn-primary w-100 rounded-pill py-3 fw-bold mt-auto shadow-lg d-flex align-items-center justify-content-center ${isGenerating ? 'disabled' : ''}`}
                                onClick={handleGenerate}
                            >
                                {isGenerating ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="me-2">
                                            <FaBrain />
                                        </motion.div>
                                        Analyzing Context...
                                    </>
                                ) : (
                                    <><FaMagic className="me-2" /> Generate Smart Plan</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Output Panel */}
                    <div className="col-lg-8">
                        <div className={`card-modern border-0 p-0 h-100 shadow-2xl overflow-hidden min-vh-60 position-relative ${darkMode ? 'glass-ai' : 'bg-white'}`}>
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div 
                                        key="generating"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="d-flex align-items-center justify-content-center h-100 flex-column text-center p-5"
                                    >
                                        <div className="ai-glow-orb mb-4"></div>
                                        <h3 className={`${darkMode ? 'text-white' : 'text-dark'} fw-bold mb-3`}>Synthesizing Neural Path...</h3>
                                        <div className={`w-50 progress rounded-pill ${darkMode ? 'bg-white bg-opacity-10' : 'bg-light'}`} style={{ height: '4px' }}>
                                            <motion.div 
                                                className="progress-bar bg-ai-gradient"
                                                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }}
                                            ></motion.div>
                                        </div>
                                        <p className="mt-4 text-muted small letter-spacing-1">MAPPING CURRICULUM NODES • GENERATING LEARNING OUTCOMES</p>
                                    </motion.div>
                                ) : generatedPlan ? (
                                    <motion.div 
                                        key="result"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        className="p-5 overflow-auto custom-scrollbar h-100"
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 mb-2">GENERATED PLAN</span>
                                                <h2 className={`${darkMode ? 'text-white' : 'text-dark'} fw-bold`}>{generatedPlan.title}</h2>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button className={`btn btn-sm border-0 rounded-circle p-2 shadow-sm ${darkMode ? 'btn-light' : 'btn-outline-secondary bg-light'}`} title="Copy"><FaRegCopy /></button>
                                                <button className={`btn btn-sm border-0 rounded-circle p-2 shadow-sm ${darkMode ? 'btn-light' : 'btn-outline-secondary bg-light'}`} title="Download"><FaDownload /></button>
                                            </div>
                                        </div>

                                        <p className="text-muted mb-5 lead opacity-75">{generatedPlan.summary}</p>

                                        <div className="row g-4 mb-5">
                                            <div className="col-md-6">
                                                <h6 className="text-primary fw-bold text-uppercase smaller mb-3">Target Outcomes</h6>
                                                <div className="space-y-2">
                                                    {generatedPlan.learning_outcomes.map((o, i) => (
                                                        <div key={i} className={`d-flex align-items-center small mb-2 ${darkMode ? 'text-white-50' : 'text-dark-50'}`}>
                                                            <FaCheckCircle className="text-success me-3" size={12} /> {o}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-primary fw-bold text-uppercase smaller mb-3">Recommended Resources</h6>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {generatedPlan.suggested_materials.map(m => (
                                                        <span key={m} className={`badge border rounded-pill px-3 py-2 fw-normal ${darkMode ? 'glass border-white border-opacity-10 text-white-50' : 'bg-light border-light text-dark'}`}>
                                                            <FaFileAlt className="me-2 text-info" /> {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <h6 className="text-primary fw-bold text-uppercase smaller mb-4">Lesson Sequence</h6>
                                        <div className={`timeline-ai ps-3 border-start ${darkMode ? 'border-white border-opacity-10' : 'border-light'}`}>
                                            {generatedPlan.timeline.map((item, i) => (
                                                <div key={i} className="position-relative mb-4 ps-4">
                                                    <div className={`position-absolute start-0 top-0 translate-middle-x rounded-circle border ${darkMode ? 'bg-primary border-dark' : 'bg-primary border-white'}`} style={{ width: '12px', height: '12px', marginLeft: '-15px', marginTop: '6px' }}></div>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{item.title}</h6>
                                                        <span className={`badge border smaller ${darkMode ? 'bg-dark border-white border-opacity-10 text-muted' : 'bg-light border-light text-muted'}`}>{item.time}</span>
                                                    </div>
                                                    <p className="small text-muted mb-0">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 flex-column text-center p-5">
                                        <div className={`rounded-circle p-4 mb-4 ${darkMode ? 'bg-white bg-opacity-5' : 'bg-light'}`}>
                                            <FaRobot size={60} className="text-muted opacity-25" />
                                        </div>
                                        <h4 className="text-muted fw-bold">Neural Engine Ready</h4>
                                        <p className="text-muted w-75 small">Configure your lesson parameters on the left and click 'Generate' to create a comprehensive academic roadmap powered by CCMS AI.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .letter-spacing-2 { letter-spacing: 2px; }
                .shadow-2xl { box-shadow: ${darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px rgba(0,0,0,0.05)'}; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; border-radius: 10px; }
                .min-vh-60 { min-height: 60vh; }
                .timeline-ai { border-left-style: dashed !important; }
            `}</style>
        </div>
    );
};

export default AILessonPlanner;
