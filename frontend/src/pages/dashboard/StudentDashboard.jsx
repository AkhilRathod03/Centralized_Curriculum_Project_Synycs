import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaBook, FaCheckCircle, FaClock, FaRocket, FaLightbulb, 
    FaUserGraduate, FaFileAlt, FaRobot, FaCalendarCheck, 
    FaChevronRight, FaPlayCircle, FaAward, FaFolderOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        completedTopics: 0,
        totalTopics: 0,
        avgProgress: 0,
        attendance: 85
    });

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/courses/');
            const coursesData = res.data.results || res.data;
            
            let totalT = 0;
            let doneT = 0;

            const enriched = await Promise.all(coursesData.map(async (course) => {
                const modulesRes = await axiosInstance.get(`curriculum/courses/${course.id}/modules/`);
                const modules = modulesRes.data.results || modulesRes.data;
                
                let cTotal = 0;
                let cDone = 0;
                modules.forEach(m => {
                    if (m.topics) {
                        m.topics.forEach(t => {
                            cTotal++;
                            if (t.is_completed) cDone++;
                        });
                    }
                });
                
                totalT += cTotal;
                doneT += cDone;

                return {
                    ...course,
                    progress: cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0,
                    topicCount: cTotal,
                    doneCount: cDone
                };
            }));

            setCourses(enriched);
            setStats({
                completedTopics: doneT,
                totalTopics: totalT,
                avgProgress: totalT > 0 ? Math.round((doneT / totalT) * 100) : 0,
                attendance: 92
            });
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load student dashboard');
            setLoading(false);
        }
    };

    const handleAIChat = () => {
        navigate('/student-assistant');
        toast.info("Connecting to AI Study Assistant...", {
            icon: <FaRobot className="text-primary" />,
            position: "bottom-right"
        });
    };

    const handleContinueLearning = (courseId) => {
        localStorage.setItem('selectedCourse', courseId);
        navigate('/courses');
    };

    const performanceData = [
        { name: 'W1', score: 60 },
        { name: 'W2', score: 65 },
        { name: 'W3', score: 80 },
        { name: 'W4', score: 75 },
        { name: 'W5', score: 90 },
        { name: 'W6', score: 85 },
    ];

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 fw-medium text-muted">Loading your classroom...</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            className="pb-5 px-lg-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
            {/* 1. Student Hero Header */}
            <div className="card-modern hero-banner-enterprise p-4 mb-4 text-white shadow-lg overflow-hidden position-relative rounded-5" style={{ minHeight: '180px' }}>
                <div className="row align-items-center position-relative z-1">
                    <div className="col-auto">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user?.username}&background=fff&color=2563eb`} 
                            className="rounded-circle border border-4 border-white border-opacity-30 shadow-2xl" 
                            width="90" height="90"
                            alt="Student"
                        />
                    </div>
                    <div className="col-lg-7 ps-lg-4">
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-2 border border-white border-opacity-25 shadow-sm">
                            <FaAward className="me-2 text-warning" size={10} /> <span className="small fw-bold uppercase letter-spacing-1 text-white" style={{ fontSize: '0.6rem' }}>Dean's List Contender</span>
                        </motion.div>
                        <h2 className="fw-bold mb-1 display-title text-white">Hi, {user?.username}! Ready to learn? 🚀</h2>
                        <div className="d-flex flex-wrap gap-3 mt-2">
                            <span className="text-white opacity-80 small d-flex align-items-center fw-medium">
                                <FaCheckCircle className="text-white me-2" size={12} /> {stats.completedTopics} Topics Mastered
                            </span>
                            <span className="text-white opacity-80 small d-flex align-items-center fw-medium cursor-pointer hover-text-white" onClick={() => navigate('/schedule')}>
                                <FaCalendarCheck className="text-white me-2" size={12} /> Next: 10:00 AM
                            </span>
                        </div>
                    </div>
                    <div className="col text-end d-none d-lg-block pe-4">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }} 
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="position-relative d-inline-block"
                        >
                            <div className="glass-card rounded-circle d-inline-flex p-4 border border-white border-opacity-30 shadow-2xl position-relative" style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                <div className="w-100 h-100 rounded-circle border border-white border-opacity-20 d-flex align-items-center justify-content-center position-relative">
                                    <FaUserGraduate size={48} className="text-white opacity-90" />
                                    
                                    {/* Orbiting Learning Rocket */}
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="position-absolute w-100 h-100 rounded-circle"
                                    >
                                        <div className="position-absolute bg-white text-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ top: '-10px', right: '10px', width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.5)' }}>
                                            <FaRocket size={16} />
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="position-absolute bottom-0 end-0 mb-1 me-1 text-center bg-white rounded-pill px-2 py-0 border border-primary border-opacity-20 shadow-sm" style={{ minWidth: '45px' }}>
                                    <span className="text-primary fw-bold" style={{ fontSize: '0.65rem' }}>{stats.avgProgress}%</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="position-absolute bg-primary opacity-20 rounded-circle" style={{ width: '400px', height: '400px', top: '-150px', right: '-100px', filter: 'blur(80px)' }}></div>
                <div className="position-absolute bg-cyan-highlight opacity-10 rounded-circle" style={{ width: '250px', height: '250px', bottom: '-100px', left: '-50px', filter: 'blur(50px)' }}></div>
            </div>

            {/* 2. KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Active Courses', val: courses.length, icon: <FaBook />, color: '#2563eb', trend: 'Current', path: '/courses' },
                    { label: 'Topics Done', val: stats.completedTopics, icon: <FaCheckCircle />, color: '#10b981', trend: `of ${stats.totalTopics}`, path: '/courses' },
                    { label: 'Study Resources', val: '48', icon: <FaFolderOpen />, color: '#6366f1', trend: 'Cloud', path: '/resources' },
                    { label: 'My Faculty', val: '12', icon: <FaUserGraduate />, color: '#7c3aed', trend: 'Active', path: '/my-faculty' },
                    { label: 'Attendance', val: `${stats.attendance}%`, icon: <FaCalendarCheck />, color: '#f59e0b', trend: 'Stable', path: '/attendance' },
                    { label: 'Credits', val: '18', icon: <FaAward />, color: '#06b6d4', trend: '+3', path: '/courses' },
                    { label: 'Study Streak', val: '12 Days', icon: <FaClock />, color: '#ec4899', trend: 'Fire', path: '/schedule' },
                ].map((s, i) => (
                    <motion.div key={i} className="col-6 col-md-4 col-xl-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                        <div className="card-modern p-3 h-100 border-0 glass shadow-sm hover-lift cursor-pointer" onClick={() => navigate(s.path)}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: `${s.color}15`, color: s.color, width: '40px', height: '40px' }}>
                                    {React.cloneElement(s.icon, { size: 18 })}
                                </div>
                                <div className={`px-2 py-0 rounded-pill text-xs fw-bold ${s.trend.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
                                    {s.trend}
                                </div>
                            </div>
                            <h3 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{s.val}</h3>
                            <p className="text-muted text-xs fw-bold uppercase mb-0 opacity-70 letter-spacing-1">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="row g-4">
                {/* Enrolled Courses */}
                <div className="col-lg-8">
                    <div className="card-modern border-0 p-4 glass-card">
                        <h5 className="fw-bold mb-4 text-dark">My Learning Journey</h5>
                        <div className="row g-3">
                            {courses.map(course => (
                                <div key={course.id} className="col-md-6">
                                    <div className="p-4 rounded-4 border hover-shadow-sm transition-all position-relative overflow-hidden group cursor-pointer bg-light border-light" onClick={() => handleContinueLearning(course.id)}>
                                        <div className="position-relative z-1">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="badge border rounded-pill bg-white text-primary">{course.code}</span>
                                                <div className="d-flex align-items-center px-2 py-1 rounded-pill border bg-white text-dark">
                                                    <FaRocket className="text-primary me-1" size={10} />
                                                    <span className="fw-bold" style={{ fontSize: '0.7rem' }}>{course.progress}%</span>
                                                </div>
                                            </div>
                                            <h6 className="fw-bold mb-4 text-dark">{course.name}</h6>
                                            <div className="progress rounded-pill mb-3" style={{ height: '6px' }}>
                                                <div className="progress-bar bg-primary" style={{ width: `${course.progress}%` }}></div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted smaller">{course.doneCount} / {course.topicCount} Topics Done</small>
                                                <button className="btn btn-sm rounded-pill shadow-sm fw-bold px-3 btn-white bg-white text-primary">
                                                    <FaPlayCircle className="me-1" /> Continue
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && <p className="text-muted small text-center py-4">You are not enrolled in any courses yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Recommended & Deadlines */}
                <div className="col-lg-4">
                    <div className="card-modern border-0 p-4 mb-4 glass-card">
                        <h5 className="fw-bold mb-4 text-dark">Upcoming Deadlines</h5>
                        <div className="space-y-4">
                            {[
                                { title: 'Java Project Submission', date: 'Tomorrow', type: 'Project', color: 'danger' },
                                { title: 'DBMS Quiz 2', date: 'May 18', type: 'Quiz', color: 'warning' },
                                { title: 'Web Tech Assignment', date: 'May 20', type: 'Assignment', color: 'info' },
                            ].map((item, i) => (
                                <div key={i} className="d-flex align-items-center p-3 rounded-4 mb-3 cursor-pointer transition-all bg-light hover-bg-light border-light">
                                    <div className={`bg-${item.color} bg-opacity-10 p-2 rounded-3 me-3 text-${item.color}`}>
                                        <FaFileAlt size={14} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-0 small text-dark">{item.title}</h6>
                                        <small className="text-muted smaller">{item.type} • <span className="text-dark fw-bold">{item.date}</span></small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-modern border-0 p-4 bg-dark text-white shadow-lg ai-neon-card">
                        <h5 className="fw-bold mb-3 d-flex align-items-center text-white">
                            <FaLightbulb className="text-warning me-2" /> Recommended
                        </h5>
                        <p className="smaller opacity-75 mb-4 text-white">Based on your recent progress in Java Programming.</p>
                        <div className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 cursor-pointer hover-bg-opacity-20 transition-all">
                            <div className="fw-bold small mb-1 text-white">Multi-threading in Java</div>
                            <div className="d-flex align-items-center opacity-50 smaller text-white">
                                <FaPlayCircle className="me-1" /> 15 mins Video • Advanced
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <style>{`
                .smaller { font-size: 0.75rem; }
                .hover-bg-opacity-20:hover { background-color: rgba(255,255,255,0.2) !important; }
            `}</style>
        </motion.div>
    );
};

export default StudentDashboard;
