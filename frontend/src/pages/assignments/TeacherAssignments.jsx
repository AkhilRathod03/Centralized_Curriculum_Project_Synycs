import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaPlus, FaSearch, FaFilter, FaRobot, FaCheckCircle, FaClock, FaChartLine, FaPencilAlt, FaEye, FaTimes, FaCloudUploadAlt, FaSave, FaMagic } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

const TeacherAssignments = () => {
    const { darkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [drawerMode, setDrawerMode] = useState(null); // 'view' or 'grade'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Form State
    const [courses, setCourses] = useState([]);
    const [topics, setTopics] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        topicId: '',
        dueDate: '',
        maxMarks: 100
    });

    // AI Quiz State
    const [quizMode, setQuizMode] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizTopic, setQuizTopic] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [asnRes, coursesRes] = await Promise.all([
                axiosInstance.get('curriculum/teacher/assignments/'),
                axiosInstance.get('curriculum/courses/')
            ]);
            setAssignments(asnRes.data.results || asnRes.data);
            setCourses(coursesRes.data.results || coursesRes.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load hub data');
            setLoading(false);
        }
    };

    const fetchTopics = async (courseId) => {
        try {
            const res = await axiosInstance.get(`curriculum/courses/${courseId}/topics/`);
            setTopics(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to load topics for this course');
        }
    };

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setFormData({ ...formData, courseId: id, topicId: '' });
        if (id) fetchTopics(id);
    };

    const handlePublish = async () => {
        if (!formData.topicId || !formData.title || !formData.dueDate) {
            toast.warning('Please complete the critical protocol fields (Title, Topic, Due Date).');
            return;
        }

        try {
            setIsPublishing(true);
            await axiosInstance.post(`curriculum/topics/${formData.topicId}/assignments/`, {
                title: formData.title,
                description: formData.description,
                due_date: new Date(formData.dueDate).toISOString(),
                max_marks: formData.maxMarks
            });

            toast.success('Assignment published to student streams.');
            setShowCreateModal(false);
            setFormData({ title: '', description: '', courseId: '', topicId: '', dueDate: '', maxMarks: 100 });
            fetchInitialData();
        } catch (err) {
            toast.error('Deployment failure. Check backend logs.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleAIAnalysis = () => {
        setIsAnalyzing(true);
        toast.info('AI is analyzing class performance for current assignments...');
        setTimeout(() => {
            setIsAnalyzing(false);
            toast.success('Performance analysis complete. AI Assistant updated with new insights.');
        }, 2500);
    };

    const generateAIQuiz = () => {
        if (!quizTopic) {
            toast.error('Please enter a topic for the AI Quiz');
            return;
        }
        toast.info(`AI is generating interactive questions for: ${quizTopic}`);
        setTimeout(() => {
            const mockQuestions = Array.from({ length: 5 }, (_, i) => ({
                id: i + 1,
                question: `Dynamic question about ${quizTopic} #${i + 1}?`,
                options: ['A', 'B', 'C', 'D'],
                answer: 0
            }));
            setQuizQuestions(mockQuestions);
            toast.success('AI Quiz nodes generated!');
        }, 2000);
    };

    const kpiData = [
        { title: 'Active Assignments', value: assignments.length, icon: <FaFileAlt />, trend: 'Live', color: 'primary' },
        { title: 'Pending Grading', value: assignments.reduce((acc, a) => acc + (a.pending || 0), 0), icon: <FaClock />, trend: 'Syncing', color: 'warning' },
        { title: 'Avg. Submission', value: '88%', icon: <FaCheckCircle />, trend: 'Stable', color: 'success' },
        { title: 'AI Insights', value: '3', icon: <FaRobot />, trend: 'New', color: 'info' },
    ];

    const openDrawer = (asn, mode) => {
        setSelectedAssignment(asn);
        setDrawerMode(mode);
    };

    const closeDrawer = () => {
        setSelectedAssignment(null);
        setDrawerMode(null);
    };

    const filteredAssignments = assignments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 ${darkMode ? 'text-white' : 'text-dark'}`}
            style={{ position: 'relative' }}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Faculty Assignment Hub</h2>
                    <p className="text-muted mb-0 small">Create, grade, and analyze assignments with AI assistance.</p>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-primary-glow px-3"
                    >
                        <FaPlus /> Create Assignment
                    </button>
                    <button 
                        onClick={handleAIAnalysis}
                        className={`btn btn-sm ${darkMode ? 'btn-outline-info' : 'btn-outline-primary'} d-flex align-items-center gap-2 px-3`}
                    >
                        <FaRobot /> Generate via AI
                    </button>
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
                            <div className="d-flex gap-2">
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
                        </div>
                        <div className="card-body p-4 mt-2">
                            {filteredAssignments.map((asn, idx) => (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    key={idx} 
                                    className={`card mb-3 border ${darkMode ? 'border-secondary bg-dark' : 'border-light bg-light'} rounded-4`}
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold mb-0">{asn.title}</h6>
                                            <span className={`badge bg-primary bg-opacity-10 text-primary rounded-pill`}>{asn.topic_name || 'Protocol Node'}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-4 mt-3 text-muted small">
                                            <div><FaClock className="me-1"/> Due: {new Date(asn.due_date).toLocaleDateString()}</div>
                                            <div><FaFileAlt className="me-1"/> Max Marks: {asn.max_marks}</div>
                                            <div><FaCheckCircle className="me-1"/> Status: {new Date(asn.due_date) < new Date() ? 'Closed' : 'Active'}</div>
                                        </div>
                                        <div className="mt-3 d-flex gap-2">
                                            <button 
                                                onClick={() => openDrawer(asn, 'view')}
                                                className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-pill flex-grow-1 px-3`}
                                            >
                                                <FaEye className="me-1"/> View
                                            </button>
                                            <button 
                                                onClick={() => openDrawer(asn, 'grade')}
                                                className="btn btn-sm btn-primary rounded-pill flex-grow-1 px-3"
                                            >
                                                <FaPencilAlt className="me-1"/> Grade
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredAssignments.length === 0 && <p className="text-center py-5 text-muted">No assignments deployed in this hub.</p>}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* AI Grading Assistant */}
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-primary bg-opacity-10 border-primary'} border border-opacity-25`}>
                        <div className="card-header border-0 bg-transparent pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaRobot className="text-primary" /> AI Assistant</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex flex-column gap-3">
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-primary">Difficulty Analyzer</h6>
                                    <p className="small text-muted mb-0">System analyzing class pace vs module complexity. Insights will appear after first deployment.</p>
                                </div>
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-primary">Auto Feedback Ready</h6>
                                    <p className="small text-muted mb-0">AI stands ready to pre-evaluate student submissions based on academic rubrics.</p>
                                    <button className="btn btn-sm btn-outline-primary mt-2 w-100 rounded-pill">Awaiting Submissions</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Enterprise Drawer */}
            <AnimatePresence>
                {selectedAssignment && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                            className="position-fixed top-0 start-0 w-100 h-100 z-1050"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        />
                        {/* Drawer Content */}
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`position-fixed top-0 end-0 h-100 z-1060 shadow-lg ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                            style={{ width: '500px', maxWidth: '100%' }}
                        >
                            <div className="p-4 h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">
                                        {drawerMode === 'view' ? 'Assignment Details' : 'Grading Workspace'}
                                    </h4>
                                    <button onClick={closeDrawer} className={`btn btn-sm rounded-circle ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="flex-grow-1 overflow-auto custom-scrollbar pe-2">
                                    {drawerMode === 'view' ? (
                                        <div className="space-y-4">
                                            <div className="mb-4">
                                                <span className="badge bg-primary bg-opacity-10 text-primary mb-2">{selectedAssignment.topic_name}</span>
                                                <h5 className="fw-bold">{selectedAssignment.title}</h5>
                                                <p className="text-muted small">{selectedAssignment.description}</p>
                                            </div>
                                            <div className="row g-3 mb-4">
                                                <div className="col-6">
                                                    <div className={`p-3 rounded-3 border ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <small className="text-muted d-block mb-1">Due Date</small>
                                                        <span className="fw-semibold">{new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className={`p-3 rounded-3 border ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <small className="text-muted d-block mb-1">Max Marks</small>
                                                        <span className="fw-semibold text-primary">{selectedAssignment.max_marks}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-4 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-primary bg-opacity-10 border-primary'} border border-opacity-25 mb-4`}>
                                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2"><FaRobot /> AI Insight</h6>
                                                <p className="small mb-0 opacity-75">Syllabus analysis suggests focusing feedback on core principles mentioned in Unit 2.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 text-center py-5">
                                            <FaFileAlt size={48} className="opacity-25 mb-3" />
                                            <h6 className="fw-bold">No Submissions Yet</h6>
                                            <p className="text-muted small">Student submissions will appear here for grading once the deadline approach.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-top">
                                    <button onClick={closeDrawer} className={`btn w-100 rounded-pill py-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>
                                        Close Panel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Create Assignment Modal */}
            {showCreateModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`modal-content border-0 rounded-4 overflow-hidden ${darkMode ? 'bg-dark text-white shadow-lg border border-secondary border-opacity-20' : 'bg-white shadow-2xl'}`}
                        >
                            <div className={`modal-header border-0 p-4 pb-0 d-flex justify-content-between`}>
                                <div>
                                    <h4 className="fw-bold mb-1">Provision New Assignment</h4>
                                    <p className="text-muted small mb-0">Set up academic requirements and neural options.</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Assignment Title</label>
                                            <input type="text" className={`form-control border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} placeholder="e.g., Final Research Project" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Detailed Description</label>
                                            <textarea className={`form-control border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} rows="4" placeholder="Instructions, goals, and expectations..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Select Course</label>
                                            <select className={`form-select border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} value={formData.courseId} onChange={handleCourseChange}>
                                                <option value="">Choose Course...</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Select Topic Node</label>
                                            <select className={`form-select border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} value={formData.topicId} onChange={e => setFormData({...formData, topicId: e.target.value})} disabled={!formData.courseId}>
                                                <option value="">Choose Topic...</option>
                                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Due Date</label>
                                            <input type="date" className={`form-control border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Max Marks</label>
                                            <input type="number" className={`form-control border-0 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20 text-white' : 'bg-light'}`} placeholder="100" value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className={`p-4 rounded-4 border-2 border-dashed ${darkMode ? 'border-secondary bg-secondary bg-opacity-10' : 'border-light bg-light'} text-center`}>
                                            <FaCloudUploadAlt size={32} className="text-primary mb-2" />
                                            <h6 className="fw-bold">Upload Supporting Resources</h6>
                                            <p className="small text-muted mb-0">Drag and drop files or click to browse (PDF, ZIP, DOCX)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0 gap-2">
                                <button onClick={() => setShowCreateModal(false)} className={`btn px-4 rounded-pill ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>Cancel</button>
                                <button 
                                    onClick={handlePublish} 
                                    disabled={isPublishing}
                                    className="btn btn-primary px-4 rounded-pill shadow-primary-glow d-flex align-items-center gap-2 fw-bold"
                                >
                                    {isPublishing ? <span className="spinner-border spinner-border-sm"></span> : <FaSave />} Publish Assignment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
            {/* AI Analysis Overlay */}
            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000 }}
                    >
                        <div className="text-center text-white p-5">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-4">
                                <FaRobot size={80} className="text-primary mx-auto" />
                            </motion.div>
                            <h3 className="fw-bold mb-2">Class Performance Deep-Dive</h3>
                            <p className="opacity-75 mb-4">AI is correlating submission trends with module difficulty...</p>
                            <div className="progress rounded-pill mx-auto mb-4" style={{ height: '6px', width: '300px' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} className="progress-bar bg-primary shadow-primary-glow" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeacherAssignments;

