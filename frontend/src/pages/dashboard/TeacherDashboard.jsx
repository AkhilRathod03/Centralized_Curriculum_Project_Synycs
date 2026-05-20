import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaBook, FaCheckCircle, FaClock, FaMagic, FaPlus, 
    FaUserGraduate, FaFileAlt, FaBrain, FaCalendarCheck, 
    FaChevronRight, FaRobot, FaLightbulb, FaChartLine,
    FaUsers, FaGraduationCap, FaEdit, FaTrash, FaPlusCircle,
    FaRocket, FaMicrophone, FaHistory, FaExclamationCircle,
    FaUserTie, FaChalkboardTeacher, FaFolderOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, LineChart, Line 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AIArchitectModal from '../../components/dashboard/AIArchitectModal';

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAIArchitect, setShowAIArchitect] = useState(false);
    const navigate = useNavigate();
    
    // Mock detailed analytics
    const teachingHoursData = [
        { name: 'Mon', hours: 4 }, { name: 'Tue', hours: 6 },
        { name: 'Wed', hours: 2 }, { name: 'Thu', hours: 5 },
        { name: 'Fri', hours: 4 }, { name: 'Sat', hours: 0 },
        { name: 'Sun', hours: 0 },
    ];

    const studentEngagementData = [
        { name: 'Week 1', engagement: 65 }, { name: 'Week 2', engagement: 72 },
        { name: 'Week 3', engagement: 68 }, { name: 'Week 4', engagement: 85 },
        { name: 'Week 5', engagement: 80 }, { name: 'Week 6', engagement: 92 },
    ];

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/courses/');
            const coursesData = res.data.results || res.data;
            
            const enriched = await Promise.all(coursesData.map(async (course) => {
                const modulesRes = await axiosInstance.get(`curriculum/courses/${course.id}/modules/`);
                const modules = modulesRes.data.results || modulesRes.data;
                
                let total = 0; let done = 0;
                modules.forEach(m => {
                    if (m.topics) {
                        m.topics.forEach(t => {
                            total++;
                            if (t.is_completed) done++;
                        });
                    }
                });
                
                return {
                    ...course,
                    progress: total > 0 ? Math.round((done / total) * 100) : 0,
                    topicCount: total,
                    doneCount: done,
                    upcoming: 'Tomorrow, 10:00 AM'
                };
            }));

            setCourses(enriched);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load dashboard statistics');
            setLoading(false);
        }
    };

    const totalStudents = courses.reduce((acc, c) => acc + (c.student_count || 0), 0);

    const getAISuggestion = (courseName) => {
        const c = courseName?.toLowerCase();
        if (c?.includes('python') || c?.includes('programming')) return "Focus on List Comprehensions";
        if (c?.includes('data structure') || c?.includes('algorithm')) return "Recursion revision recommended";
        if (c?.includes('database') || c?.includes('sql')) return "Joins & Normalization deep-dive";
        if (c?.includes('web') || c?.includes('react')) return "State Management audit needed";
        if (c?.includes('network')) return "OSI Layer 4 protocols recap";
        if (c?.includes('os') || c?.includes('operating')) return "Deadlock prevention check";
        return "Student engagement is peaking";
    };

    const handleAIAction = (tool) => {
        if (tool === 'Lesson Architect' || tool === 'AI Lesson Planner') {
            setShowAIArchitect(true);
        } else {
            toast.info(`Launching ${tool}...`, {
                icon: <FaMagic className="text-primary" />,
                position: "bottom-right"
            });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className={`d-flex align-items-center justify-content-center vh-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className={`mt-3 fw-medium ${darkMode ? 'text-white-50' : 'text-muted'}`}>Assembling your teacher portal...</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            className="pb-5 px-lg-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. Welcome Hero Section */}
            <div className="card-modern hero-banner-enterprise p-4 mb-4 text-white shadow-lg overflow-hidden position-relative rounded-5" style={{ minHeight: '180px' }}>
                <div className="row align-items-center position-relative z-1">
                    <div className="col-lg-8">
                        <motion.div variants={itemVariants} className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-3 border border-white border-opacity-25 shadow-sm">
                            <FaRobot className="me-2 text-white" size={10} /> <span className="small fw-bold uppercase letter-spacing-1 text-white" style={{ fontSize: '0.6rem' }}>Academic Intelligence Active</span>
                        </motion.div>
                        <motion.h2 className="fw-bold mb-1 display-title text-white" variants={itemVariants}>
                            Welcome back, Prof. {user?.username} ✨
                        </motion.h2>
                        <motion.p className="text-white opacity-80 small mb-4 d-flex align-items-center fw-medium" variants={itemVariants}>
                            <FaCalendarCheck className="me-2 opacity-70" /> 3 Classes & 12 Pending Assessments Scheduled Today
                        </motion.p>
                        <motion.div className="d-flex flex-wrap gap-2" variants={itemVariants}>
                            <button className="btn btn-white rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center small" onClick={() => navigate('/schedule')}>
                                <FaCalendarCheck className="me-2" size={10} /> Live Schedule
                            </button>
                            <button className="btn btn-white rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center small" onClick={() => handleAIAction('Lesson Architect')}>
                                <FaMagic className="me-2" size={10} /> AI Architect
                            </button>
                        </motion.div>
                    </div>
                    <div className="col-lg-4 text-center d-none d-lg-block">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }} 
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="position-relative d-inline-block"
                        >
                            <div className="glass-card rounded-circle d-inline-flex p-4 border border-white border-opacity-30 shadow-2xl position-relative" style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                <div className="w-100 h-100 rounded-circle border border-white border-opacity-20 d-flex align-items-center justify-content-center position-relative">
                                    <FaChalkboardTeacher size={48} className="text-white opacity-90" />
                                    
                                    {/* Orbiting AI Brain */}
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="position-absolute w-100 h-100 rounded-circle"
                                    >
                                        <div className="position-absolute bg-white text-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ top: '-10px', right: '10px', width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.5)' }}>
                                            <FaBrain size={16} />
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="position-absolute bottom-0 end-0 mb-1 me-1">
                                    <div className="bg-success rounded-circle shadow-lg pulse-green" style={{ width: '16px', height: '16px', border: '3px solid #fff' }}></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="position-absolute bg-primary opacity-20 rounded-circle" style={{ width: '400px', height: '400px', top: '-150px', right: '-100px', filter: 'blur(80px)' }}></div>
                <div className="position-absolute bg-purple-ai opacity-10 rounded-circle" style={{ width: '250px', height: '250px', bottom: '-100px', left: '-50px', filter: 'blur(50px)' }}></div>
            </div>

            {/* 2. KPI Statistic Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Assigned Courses', val: courses.length, icon: <FaBook />, color: '#2563eb', trend: '+1', path: '/curriculum' },
                    { label: 'Total Students', val: totalStudents, icon: <FaUsers />, color: '#7c3aed', trend: 'Live', path: '/students' },
                    { label: 'Cloud Resources', val: '24', icon: <FaFolderOpen />, color: '#6366f1', trend: 'Secure', path: '/resources' },
                    { label: 'Assignments', val: '12', icon: <FaFileAlt />, color: '#f59e0b', trend: '-3', path: '/assignments' },
                    { label: 'Attendance', val: '94%', icon: <FaUserTie />, color: '#3b82f6', trend: 'Stable', path: '/attendance' },
                    { label: 'Live Classes', val: '3', icon: <FaClock />, color: '#ec4899', trend: 'Active', path: '/schedule' },
                ].map((s, i) => (
                    <motion.div key={i} className="col-6 col-md-4 col-xl-2" variants={itemVariants}>
                        <div className="card-modern p-3 h-100 border-0 glass shadow-sm hover-lift cursor-pointer" onClick={() => navigate(s.path)}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: `${s.color}15`, color: s.color, width: '40px', height: '40px' }}>
                                    {React.cloneElement(s.icon, { size: 18 })}
                                </div>
                                <div className={`px-2 py-0 rounded-pill text-xs fw-bold ${s.trend.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : s.trend === 'Stable' || s.trend === 'Active' ? 'bg-light text-muted' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                    {s.trend}
                                </div>
                            </div>
                            <h3 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{s.val}</h3>
                            <p className="text-muted text-xs fw-bold uppercase mb-0 opacity-70 letter-spacing-1">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="row g-4 mb-5">
                {/* 3. Teaching Analytics */}
                <div className="col-lg-8">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card" variants={itemVariants}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>Student Engagement Trends</h5>
                                <p className="text-muted small mb-0">Weekly participation across all courses</p>
                            </div>
                            <div className="dropdown">
                                <button className="btn btn-light btn-sm rounded-pill px-3 border" data-bs-toggle="dropdown">This Semester</button>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={studentEngagementData}>
                                    <defs>
                                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: darkMode ? '#1e293b' : '#fff' }} />
                                    <Area type="monotone" dataKey="engagement" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorEngagement)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* 5. AI Teacher Suite */}
                <div className="col-lg-4">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card" variants={itemVariants}>
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-ai-gradient rounded-circle p-2 me-3 shadow-lg">
                                <FaMagic className="text-white" size={20} />
                            </div>
                            <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>AI Teacher Suite</h5>
                        </div>
                        <div className="d-grid gap-3">
                            {[
                                { title: 'AI Lesson Planner', desc: 'Gen auto lesson notes', icon: <FaBrain />, color: '#6366f1' },
                                { title: 'Quiz Generator', desc: 'Auto assessment tool', icon: <FaFileAlt />, color: '#a855f7' },
                                { title: 'Bloom Analyzer', desc: 'Curriculum depth check', icon: <FaChartLine />, color: '#ec4899' },
                                { title: 'PPT Generator', desc: 'Gen slide decks', icon: <FaRocket />, color: '#3b82f6' },
                            ].map((tool, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleAIAction(tool.title)}
                                    className={`btn border p-3 text-start d-flex align-items-center rounded-4 transition-all hover-lift ${darkMode ? 'bg-dark bg-opacity-25 border-secondary text-white' : 'bg-light bg-opacity-50 border-light text-dark'}`}
                                >
                                    <div className="p-2 rounded-3 me-3" style={{ backgroundColor: `${tool.color}25`, color: tool.color }}>
                                        {tool.icon}
                                    </div>
                                    <div>
                                        <div className="fw-bold small">{tool.title}</div>
                                        <div className="opacity-50 text-xs">{tool.desc}</div>
                                    </div>
                                    <FaChevronRight className="ms-auto opacity-25" size={10} />
                                </button>
                            ))}
                        </div>
                        <button className="btn bg-ai-gradient text-white w-100 rounded-pill py-3 mt-4 fw-bold border-0 shadow-lg hover-lift">
                            Open AI Co-Pilot
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* 4. My Courses Section */}
            <motion.div className="mb-5" variants={itemVariants}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>My Assigned Courses</h4>
                    <button className="btn btn-light rounded-pill px-4 border" onClick={() => navigate('/curriculum')}>View All Courses</button>
                </div>
                <div className="row g-4">
                    {courses.map(course => (
                        <div key={course.id} className="col-lg-4">
                            <div className="card-modern border-0 glass-card p-0 overflow-hidden hover-lift h-100">
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3">{course.code}</span>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-light btn-sm rounded-circle"><FaEdit size={12} /></button>
                                            <button className="btn btn-light btn-sm rounded-circle"><FaTrash size={12} className="text-danger" /></button>
                                        </div>
                                    </div>
                                    <h5 className={`fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>{course.name}</h5>
                                    <p className="text-muted smaller mb-4">Next Class: {course.upcoming}</p>
                                    
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted smaller fw-bold">SYLLABUS PROGRESS</span>
                                            <span className="text-primary fw-bold smaller">{course.progress}%</span>
                                        </div>
                                        <div className="progress rounded-pill" style={{ height: '8px' }}>
                                            <div className="progress-bar bg-primary" style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-ai-gradient bg-opacity-10 rounded-4 mb-4 border border-primary border-opacity-10 d-flex align-items-center">
                                        <FaLightbulb className="text-primary me-2" size={14} />
                                        <span className={`smaller fw-medium ${darkMode ? 'text-white' : 'text-dark'}`}>AI Suggest: "{getAISuggestion(course.name)}"</span>
                                    </div>

                                    <button 
                                        className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                                        onClick={() => navigate('/curriculum')}
                                    >
                                        Manage Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="row g-4">
                {/* 7. Student Insights */}
                <div className="col-lg-4">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card" variants={itemVariants}>
                        <h5 className={`fw-bold mb-4 d-flex align-items-center ${darkMode ? 'text-white' : 'text-dark'}`}>
                            <FaUsers className="text-primary me-2" /> Student Insights
                        </h5>
                        <div className="space-y-3">
                            {[
                                { name: 'Rahul Sharma', status: 'Weak', impact: 'High', color: 'danger' },
                                { name: 'Sneha Patel', status: 'Top Performer', impact: 'Low', color: 'success' },
                                { name: 'Vicky Kaul', status: 'Low Attendance', impact: 'Med', color: 'warning' },
                            ].map((s, i) => (
                                <div key={i} className={`p-3 rounded-4 mb-2 d-flex align-items-center border ${darkMode ? 'bg-dark bg-opacity-25 border-secondary' : 'bg-light bg-opacity-50 border-light'}`}>
                                    <img src={`https://ui-avatars.com/api/?name=${s.name}&background=random`} className="rounded-circle me-3" width="35" alt="" />
                                    <div className="flex-grow-1">
                                        <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{s.name}</div>
                                        <div className={`text-${s.color} text-xs fw-bold`}>{s.status}</div>
                                    </div>
                                    <button className={`btn btn-sm rounded-pill shadow-sm text-xs px-3 border ${darkMode ? 'btn-dark border-secondary' : 'btn-white bg-white'}`}>Report</button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* 8. Assignment Management */}
                <div className="col-lg-4">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card" variants={itemVariants}>
                        <h5 className={`fw-bold mb-4 d-flex align-items-center ${darkMode ? 'text-white' : 'text-dark'}`}>
                            <FaFileAlt className="text-primary me-2" /> Recent Submissions
                        </h5>
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0">
                                <thead>
                                    <tr className="text-muted smaller uppercase">
                                        <th>Student</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Amit K.', status: 'Pending', color: 'warning' },
                                        { name: 'Priya S.', status: 'Graded', color: 'success' },
                                        { name: 'Rohan M.', status: 'Late', color: 'danger' },
                                    ].map((a, i) => (
                                        <tr key={i}>
                                            <td className={`small fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>{a.name}</td>
                                            <td><span className={`badge bg-${a.color} bg-opacity-10 text-${a.color} rounded-pill`}>{a.status}</span></td>
                                            <td><button className={`btn btn-sm rounded-pill px-3 text-xs ${darkMode ? 'btn-dark border-secondary' : 'btn-light'}`}>Evaluate</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="btn btn-light w-100 rounded-pill py-2 mt-4 smaller fw-bold text-muted border">
                            Open Grading Hub
                        </button>
                    </motion.div>
                </div>

                {/* 9. Activity Timeline */}
                <div className="col-lg-4">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card" variants={itemVariants}>
                        <h5 className={`fw-bold mb-4 d-flex align-items-center ${darkMode ? 'text-white' : 'text-dark'}`}>
                            <FaHistory className="text-primary me-2" /> Recent Activity
                        </h5>
                        <div className="timeline ps-2">
                            {[
                                { title: 'Uploaded Syllabus PDF', time: '10m ago', icon: <FaFileAlt />, color: 'primary' },
                                { title: 'Marked Attendance - B.Tech CS', time: '2h ago', icon: <FaCheckCircle />, color: 'success' },
                                { title: 'Added AI Assignment', time: 'Yesterday', icon: <FaBrain />, color: 'purple' },
                            ].map((item, i) => (
                                <div key={i} className="d-flex mb-4 position-relative">
                                    <div className={`p-2 rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} me-3 z-1`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.icon}
                                    </div>
                                    <div className={`pb-2 border-bottom w-100 ${darkMode ? 'border-secondary' : ''}`}>
                                        <p className={`small mb-0 fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>{item.title}</p>
                                        <small className="text-muted">{item.time}</small>
                                    </div>
                                    {i !== 2 && <div className={`position-absolute start-0 top-0 mt-4 ms-3 ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`} style={{ width: '2px', height: '100%', marginLeft: '2px' }}></div>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 10. Floating AI Assistant Button */}
            <button className="btn-ai-float bg-ai-gradient shadow-2xl" onClick={() => handleAIAction('AI Assistant')}>
                <FaRobot size={24} />
            </button>

            <AIArchitectModal 
                show={showAIArchitect} 
                handleClose={() => setShowAIArchitect(false)} 
            />

            <style>{`
                .glass-card { background: ${darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)'} !important; }
                .bg-purple { color: #a855f7 !important; }
                [data-bs-theme='dark'] .text-dark { color: #f8fafc !important; }
                [data-bs-theme='dark'] .bg-light { background-color: rgba(255,255,255,0.05) !important; }
                .hover-lift:hover { transform: translateY(-4px); }
            `}</style>
        </motion.div>
    );
};

export default TeacherDashboard;
