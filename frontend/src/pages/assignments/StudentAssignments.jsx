import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaSearch, FaRobot, FaCheckCircle, FaClock, FaUpload, FaExclamationCircle, FaStar, FaHistory, FaTimes, FaCloudUploadAlt, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StudentAssignments = () => {
    const { darkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const kpiData = [
        { title: 'Pending Assignments', value: '3', icon: <FaClock />, trend: 'Due soon', color: 'warning' },
        { title: 'Submitted', value: '14', icon: <FaCheckCircle />, trend: 'This term', color: 'success' },
        { title: 'Average Grade', value: 'A-', icon: <FaStar />, trend: 'Top 15%', color: 'primary' },
        { title: 'AI Study Tips', value: '2', icon: <FaRobot />, trend: 'New', color: 'info' },
    ];

    const mockAssignments = [
        { 
            id: 'ASN-001', 
            title: 'Data Structures Capstone', 
            course: 'CS301', 
            due: '2026-05-20', 
            status: 'Pending', 
            timeRemaining: '2 Days', 
            aiTip: 'Focus on graph traversal algorithms.',
            instructions: 'Implement a complete Graph library with BFS, DFS, and Dijkstra. Ensure O(V+E) complexity.',
            resources: ['Dijkstra_Guide.pdf', 'Sample_Input.txt'],
            hasQuiz: true
        },
        { 
            id: 'ASN-002', 
            title: 'React Performance Hooks', 
            course: 'WEB302', 
            due: '2026-05-25', 
            status: 'Pending', 
            timeRemaining: '1 Week', 
            aiTip: 'Review useMemo and useCallback.',
            instructions: 'Refactor the provided codebase to eliminate unnecessary re-renders in the list component.',
            resources: ['React_Profiler_Tutorial.mp4'],
            hasQuiz: true
        },
        { 
            id: 'ASN-003', 
            title: 'Ethics Essay', 
            course: 'HUM201', 
            due: '2026-05-15', 
            status: 'Graded', 
            grade: '95/100', 
            aiTip: 'Great logical flow detected.',
            instructions: 'Write a 1500-word essay on the impact of Algorithmic Bias in social media.',
            feedback: 'Excellent depth of research. Your analysis of the TikTok algorithm was particularly insightful.',
            hasQuiz: false
        },
    ];

    const handleQuizSubmit = () => {
        toast.success('AI Quiz submitted successfully! AI is evaluating your answers...');
        setQuizSubmitted(true);
        setTimeout(() => {
            setShowQuiz(false);
            setQuizSubmitted(false);
            setCurrentQuestion(0);
        }, 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Academic Tasks</h2>
                    <p className="text-muted mb-0 small">Track deadlines and upload submissions</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {kpiData.map((kpi, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-xl-3">
                        <motion.div 
                            whileHover={{ y: -3 }}
                            className={`card h-100 border-0 shadow-sm ${darkMode ? 'bg-glass-dark' : 'bg-glass-light'} rounded-4`}
                            style={{ 
                                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                            }}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className={`text-${kpi.color} bg-${kpi.color} bg-opacity-10 p-2 rounded-3 d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                                        {React.cloneElement(kpi.icon, { size: 18 })}
                                    </div>
                                    <span className={`badge bg-${kpi.color} bg-opacity-10 text-${kpi.color} rounded-pill px-2`}>
                                        {kpi.trend}
                                    </span>
                                </div>
                                <h3 className="fw-bold mb-1 fs-4">{kpi.value}</h3>
                                <p className="text-muted small mb-0 fw-semibold">{kpi.title}</p>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* Workspace */}
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                        <div className={`card-header border-bottom-0 bg-transparent pt-4 pb-0 px-4 d-flex justify-content-between align-items-center`}>
                            <h5 className="fw-bold mb-0">My Assignments</h5>
                            <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ width: '200px', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}><FaSearch /></span>
                                <input 
                                    type="text" 
                                    className={`form-control border-0 ${darkMode ? 'bg-dark text-light placeholder-light' : 'bg-light text-dark'}`} 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="card-body p-4 mt-2">
                            {mockAssignments.map((asn, idx) => (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    key={idx} 
                                    className={`card mb-3 border ${darkMode ? 'border-secondary bg-dark' : 'border-light bg-light'} rounded-4`}
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold mb-1">{asn.title}</h6>
                                                <span className={`badge bg-primary bg-opacity-10 text-primary rounded-pill me-2`}>{asn.course}</span>
                                                {asn.status === 'Graded' && <span className="badge bg-success bg-opacity-10 text-success rounded-pill">{asn.grade}</span>}
                                            </div>
                                            <span className={`badge rounded-pill ${asn.status === 'Pending' ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                                                {asn.status}
                                            </span>
                                        </div>
                                        
                                        {asn.status === 'Pending' && (
                                            <div className="d-flex align-items-center gap-2 mt-3 text-danger small fw-semibold">
                                                <FaExclamationCircle /> Due in {asn.timeRemaining} ({asn.due})
                                            </div>
                                        )}

                                        <div className={`mt-3 p-2 rounded-3 small ${darkMode ? 'bg-primary bg-opacity-10 text-light' : 'bg-light text-dark'}`}>
                                            <FaRobot className="text-primary me-2" /> <strong>AI Tip:</strong> {asn.aiTip}
                                        </div>

                                        <div className="mt-3 d-flex gap-2">
                                            <button 
                                                onClick={() => setSelectedAssignment(asn)}
                                                className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-pill flex-grow-1 px-3`}
                                            >
                                                View Details
                                            </button>
                                            {asn.hasQuiz && asn.status === 'Pending' && (
                                                <button 
                                                    onClick={() => { setSelectedAssignment(asn); setShowQuiz(true); }}
                                                    className="btn btn-sm btn-info text-white rounded-pill flex-grow-1 px-3 d-flex align-items-center justify-content-center gap-2"
                                                >
                                                    <FaRobot /> Take AI Quiz
                                                </button>
                                            )}
                                            {asn.status === 'Pending' ? (
                                                <button 
                                                    onClick={() => { setSelectedAssignment(asn); setShowSubmitModal(true); }}
                                                    className="btn btn-sm btn-primary rounded-pill flex-grow-1 px-3"
                                                >
                                                    <FaUpload className="me-1"/> Submit
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedAssignment(asn)}
                                                    className={`btn btn-sm ${darkMode ? 'btn-outline-info' : 'btn-outline-primary'} rounded-pill flex-grow-1 px-3`}
                                                >
                                                    <FaHistory className="me-1"/> Feedback
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* AI Study Recommendations */}
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-info bg-opacity-10 border-info'} border border-opacity-25`}>
                        <div className="card-header border-0 bg-transparent pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaRobot className="text-info" /> AI Study Guide</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex flex-column gap-3">
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-info">Time Estimation</h6>
                                    <p className="small text-muted mb-0">Based on your past performance, allocate at least <strong>4 hours</strong> for the CS301 Capstone project.</p>
                                </div>
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-info">Concept Gap Detected</h6>
                                    <p className="small text-muted mb-0">You struggled with dynamic programming in the last quiz. Review module 4 before starting the CS301 assignment.</p>
                                    <button className="btn btn-sm btn-outline-info mt-2 w-100 rounded-pill">View Resources</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Detail Drawer */}
            <AnimatePresence>
                {selectedAssignment && !showSubmitModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAssignment(null)} className="position-fixed top-0 start-0 w-100 h-100 z-1050" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`position-fixed top-0 end-0 h-100 z-1060 shadow-lg ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`} style={{ width: '450px', maxWidth: '100%' }}>
                            <div className="p-4 h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">Assignment Info</h4>
                                    <button onClick={() => setSelectedAssignment(null)} className={`btn btn-sm rounded-circle ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}><FaTimes /></button>
                                </div>
                                <div className="flex-grow-1 overflow-auto custom-scrollbar pe-2">
                                    <div className="mb-4">
                                        <span className="badge bg-primary bg-opacity-10 text-primary mb-2">{selectedAssignment.course}</span>
                                        <h5 className="fw-bold">{selectedAssignment.title}</h5>
                                        <div className="d-flex gap-3 mt-2">
                                            <span className="small text-muted"><FaClock className="me-1"/> Due: {selectedAssignment.due}</span>
                                            <span className="small text-primary fw-bold"><FaStar className="me-1"/> 100 Marks</span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <h6 className="fw-bold small text-uppercase text-muted mb-2">Instructions</h6>
                                        <p className="small">{selectedAssignment.instructions}</p>
                                    </div>
                                    {selectedAssignment.resources && (
                                        <div className="mb-4">
                                            <h6 className="fw-bold small text-uppercase text-muted mb-2">Attached Resources</h6>
                                            <div className="space-y-2">
                                                {selectedAssignment.resources.map((res, i) => (
                                                    <div key={i} className={`p-2 rounded-3 border small d-flex align-items-center gap-2 ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <FaFileAlt className="text-primary" /> {res}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedAssignment.status === 'Graded' && (
                                        <div className={`p-3 rounded-4 border-2 border-primary border-opacity-25 ${darkMode ? 'bg-glass-dark' : 'bg-success bg-opacity-10'}`}>
                                            <h6 className="fw-bold mb-2">Faculty Feedback</h6>
                                            <p className="small mb-0 italic">"{selectedAssignment.feedback}"</p>
                                        </div>
                                    )}
                                    <div className={`mt-4 p-3 rounded-4 border ${darkMode ? 'border-info bg-info bg-opacity-5' : 'border-info bg-info bg-opacity-10'}`}>
                                        <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-info"><FaRobot /> Preparation AI Tip</h6>
                                        <p className="small mb-0 opacity-75">{selectedAssignment.aiTip}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-top">
                                    {selectedAssignment.status === 'Pending' && (
                                        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary w-100 rounded-pill py-2 mb-2 shadow-primary-glow">Submit Now</button>
                                    )}
                                    <button onClick={() => setSelectedAssignment(null)} className={`btn w-100 rounded-pill py-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>Close</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Submission Modal */}
            {showSubmitModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`modal-content border-0 rounded-4 overflow-hidden ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                            <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between">
                                <h5 className="fw-bold mb-0">Upload Submission</h5>
                                <button onClick={() => setShowSubmitModal(false)} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small mb-3">Uploading for: <strong>{selectedAssignment?.title}</strong></p>
                                <div className={`p-5 rounded-4 border-2 border-dashed ${darkMode ? 'border-secondary bg-secondary bg-opacity-10' : 'border-light bg-light'} text-center`}>
                                    <FaCloudUploadAlt size={40} className="text-primary mb-2" />
                                    <h6 className="fw-bold">Drag & Drop Project Files</h6>
                                    <p className="small text-muted mb-0">Max size: 50MB (.zip, .pdf, .pdf)</p>
                                </div>
                                <div className="mt-3">
                                    <label className="form-label small fw-bold">Comments for Teacher</label>
                                    <textarea className={`form-control border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} rows="3" placeholder="Any notes about your submission..."></textarea>
                                </div>
                                <div className={`mt-4 p-3 rounded-3 d-flex align-items-center gap-3 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-primary bg-opacity-10'} border`}>
                                    <div className="bg-primary text-white p-2 rounded-3"><FaRobot /></div>
                                    <p className="small mb-0"><strong>AI Insight:</strong> Our system will automatically check for plagiarism and code quality before notifying your teacher.</p>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0 gap-2">
                                <button onClick={() => setShowSubmitModal(false)} className={`btn px-4 rounded-pill ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>Cancel</button>
                                <button className="btn btn-primary px-4 rounded-pill shadow-primary-glow d-flex align-items-center gap-2">
                                    <FaPaperPlane /> Submit Assignment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
            {/* AI Quiz Modal */}
            <AnimatePresence>
                {showQuiz && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 3000 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`modal-content border-0 rounded-4 overflow-hidden shadow-2xl ${darkMode ? 'bg-dark text-white border border-secondary border-opacity-20' : 'bg-white'}`}>
                                <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2"><FaRobot className="text-info" /> Interactive AI Quiz</h4>
                                        <p className="text-muted small mb-0">{selectedAssignment?.title}</p>
                                    </div>
                                    <button onClick={() => setShowQuiz(false)} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="small fw-bold">Question {currentQuestion + 1} of 25</span>
                                        <div className="progress rounded-pill" style={{ width: '150px', height: '6px' }}>
                                            <div className="progress-bar bg-info" style={{ width: `${((currentQuestion + 1) / 25) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-4 border ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'} mb-4`}>
                                        <h5 className="fw-bold mb-0">What is the primary advantage of using {selectedAssignment?.course} principles for resource management?</h5>
                                    </div>
                                    <div className="row g-3">
                                        {['Reduced Latency', 'High Scalability', 'Data Integrity', 'Auto-Scaling'].map((opt, i) => (
                                            <div key={i} className="col-md-6">
                                                <button className={`btn w-100 p-3 rounded-4 text-start border-2 ${darkMode ? 'btn-outline-light border-opacity-10 hover:bg-info' : 'btn-outline-dark border-opacity-10 hover:bg-light'}`}>
                                                    <span className="me-3 fw-bold">{String.fromCharCode(65 + i)}.</span> {opt}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                                    {currentQuestion < 24 ? (
                                        <button onClick={() => setCurrentQuestion(prev => prev + 1)} className="btn btn-primary px-5 rounded-pill shadow-primary-glow ms-auto">Next Question</button>
                                    ) : (
                                        <button onClick={handleQuizSubmit} className="btn btn-success px-5 rounded-pill shadow-lg ms-auto">Submit Quiz</button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quiz Submission Overlay */}
            <AnimatePresence>
                {quizSubmitted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-4000" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                        <div className="text-center text-white p-5">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-success text-white p-4 rounded-circle mb-4 mx-auto" style={{ width: '100px', height: '100px', fontSize: '40px' }}>
                                <FaCheckCircle />
                            </motion.div>
                            <h2 className="fw-bold mb-2">Quiz Submitted!</h2>
                            <p className="opacity-75">AI is generating your instant performance report...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentAssignments;

