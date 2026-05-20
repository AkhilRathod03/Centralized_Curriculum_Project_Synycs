import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, 
    FaCheckCircle, FaClock, FaPlus, FaUserPlus, FaMagic, 
    FaChartLine, FaExclamationTriangle, FaBrain, FaCalendarAlt,
    FaUniversity, FaFileAlt, FaChevronRight, FaRobot, FaProjectDiagram,
    FaBook, FaUserShield, FaHistory, FaArrowUp, FaArrowDown, FaServer, FaShieldAlt,
    FaLayerGroup
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        programCount: 0,
        courseCount: 0,
        teacherCount: 0,
        studentCount: 0,
        overallCompletion: 0,
        pendingApprovals: 5
    });
    const [programProgress, setProgramProgress] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock engagement data
    const engagementData = [
        { name: 'Mon', students: 400, teachers: 240 },
        { name: 'Tue', students: 300, teachers: 139 },
        { name: 'Wed', students: 500, teachers: 980 },
        { name: 'Thu', students: 278, teachers: 390 },
        { name: 'Fri', students: 189, teachers: 480 },
        { name: 'Sat', students: 239, teachers: 380 },
        { name: 'Sun', students: 349, teachers: 430 },
    ];

    useEffect(() => {
        fetchDashboardData();
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const res = await axiosInstance.get('audit/logs/');
            setAuditLogs((res.data.results || res.data).slice(0, 5));
        } catch (err) {
            console.error('Failed to fetch audit logs');
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const programsRes = await axiosInstance.get('curriculum/programs/');
            const programs = programsRes.data.results || programsRes.data;
            
            let totalTopics = 0;
            let completedTopics = 0;
            const progressData = [];

            for (const prog of programs) {
                const coursesRes = await axiosInstance.get(`curriculum/courses/?program=${prog.id}`);
                const courses = coursesRes.data.results || coursesRes.data;
                
                let progTotal = 0;
                let progDone = 0;

                for (const course of courses) {
                    const modulesRes = await axiosInstance.get(`curriculum/courses/${course.id}/modules/`);
                    const modules = modulesRes.data.results || modulesRes.data;
                    
                    modules.forEach(m => {
                        if (m.topics) {
                            m.topics.forEach(t => {
                                progTotal++;
                                if (t.is_completed) progDone++;
                            });
                        }
                    });
                }

                totalTopics += progTotal;
                completedTopics += progDone;
                
                progressData.push({
                    name: prog.name.substring(0, 10) + '...',
                    progress: progTotal > 0 ? Math.round((progDone / progTotal) * 100) : 0,
                });
            }

            const usersRes = await axiosInstance.get('auth/institutions/users/');
            const allUsers = usersRes.data.results || usersRes.data;
            const tCount = allUsers.filter(u => u.role === 'teacher').length;
            const sCount = allUsers.filter(u => u.role === 'student').length;

            setProgramProgress(progressData.slice(0, 6)); // limit to 6 for chart
            setStats({
                programCount: programs.length,
                courseCount: programs.length * 8, // Estimated
                teacherCount: tCount,
                studentCount: sCount,
                overallCompletion: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
                pendingApprovals: allUsers.filter(u => !u.is_approved).length
            });
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAIReport = () => {
        toast.info("AI is synthesizing institution data...", {
            icon: <FaBrain className="text-primary" />
        });
        setTimeout(() => {
            toast.success("Academic Insight Report generated successfully!");
        }, 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className={`d-flex align-items-center justify-content-center vh-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className={`mt-3 fw-medium ${darkMode ? 'text-white-50' : 'text-muted'}`}>Preparing your analytics...</p>
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
            {/* 1. Compact Hero Banner Refinement */}
            <div className="card-modern hero-banner-enterprise p-4 mb-4 text-white shadow-lg overflow-hidden position-relative rounded-5" style={{ minHeight: '180px' }}>
                <div className="row align-items-center position-relative z-1">
                    <div className="col-lg-8">
                        <motion.div variants={itemVariants} className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-3 border border-white border-opacity-25 shadow-sm">
                            <FaShieldAlt className="me-2 text-white" size={10} /> <span className="small fw-bold uppercase letter-spacing-1 text-white" style={{ fontSize: '0.6rem' }}>Institutional Intelligence HQ</span>
                        </motion.div>
                        <motion.h2 className="fw-bold mb-1 display-title text-white" variants={itemVariants}>
                            {user?.institution_name || 'Synycs Academy'}
                        </motion.h2>
                        <motion.p className="text-white opacity-80 small mb-4 d-flex align-items-center fw-medium" variants={itemVariants}>
                            <FaCalendarAlt className="me-2 opacity-70" /> Academic Session 2025-26 • Welcome back, {user?.username}
                        </motion.p>
                        <motion.div className="d-flex flex-wrap gap-2" variants={itemVariants}>
                            <button className="btn btn-white rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center small" onClick={() => navigate('/curriculum')}>
                                <FaPlus className="me-2" size={10} /> Add Course
                            </button>
                            <button className="btn btn-white rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center small" onClick={() => navigate('/users')}>
                                <FaUserPlus className="me-2" size={10} /> Manage Access
                            </button>
                            <button className="btn btn-white rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center small d-none d-md-flex" onClick={handleGenerateAIReport}>
                                <FaMagic className="me-2" size={10} /> Neural Report
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
                                    <FaUniversity size={48} className="text-white opacity-90" />
                                    
                                    {/* Orbiting Shield (Institutional Security) */}
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="position-absolute w-100 h-100 rounded-circle"
                                    >
                                        <div className="position-absolute bg-white text-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ top: '-10px', right: '10px', width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.5)' }}>
                                            <FaShieldAlt size={16} />
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
                <div className="position-absolute bg-cyan-highlight opacity-10 rounded-circle" style={{ width: '250px', height: '250px', bottom: '-100px', left: '-50px', filter: 'blur(50px)' }}></div>
            </div>

            {/* 2. KPI Cards - Analytics First */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Students', val: stats.studentCount, icon: <FaUserGraduate />, color: '#2563eb', path: '/students', trend: '+12.5%' },
                    { label: 'Faculty', val: stats.teacherCount, icon: <FaChalkboardTeacher />, color: '#10b981', path: '/teachers', trend: 'Stable' },
                    { label: 'Programs', val: stats.programCount, icon: <FaLayerGroup />, color: '#7c3aed', path: '/programs', trend: '+2' },
                    { label: 'Courses', val: stats.courseCount, icon: <FaBook />, color: '#f59e0b', path: '/courses', trend: '+4.2%' },
                    { label: 'Audit Desk', val: stats.pendingApprovals, icon: <FaUserShield />, color: '#ef4444', path: '/users', trend: '-2' },
                    { label: 'Performance', val: `${stats.overallCompletion}%`, icon: <FaChartLine />, color: '#06b6d4', path: '/curriculum', trend: '+5.1%' },
                ].map((s, i) => (
                    <motion.div key={i} className="col-6 col-md-4 col-xl-2" variants={itemVariants}>
                        <div className="card-modern p-3 h-100 border-0 glass shadow-sm hover-lift cursor-pointer" onClick={() => navigate(s.path)}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: `${s.color}15`, color: s.color, width: '40px', height: '40px' }}>
                                    {React.cloneElement(s.icon, { size: 18 })}
                                </div>
                                <div className={`px-2 py-0 rounded-pill text-xs fw-bold ${s.trend.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : s.trend === 'Stable' ? 'bg-light text-muted' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                    {s.trend}
                                </div>
                            </div>
                            <h3 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{s.val}</h3>
                            <p className="text-muted text-xs fw-bold uppercase mb-0 opacity-70 letter-spacing-1">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* NEW: Institutional Performance Snapshot (Reports Integration) */}
            <motion.div className="row g-4 mb-4" variants={itemVariants}>
                <div className="col-12">
                    <div className="card-modern border-0 p-4 bg-ai-gradient text-white shadow-lg rounded-5">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-white bg-opacity-20 p-2 rounded-circle">
                                        <FaChartLine size={20} />
                                    </div>
                                    <h4 className="fw-bold mb-0">Institutional Intelligence Snapshot</h4>
                                </div>
                                <p className="opacity-80 small mb-0">Neural analysis indicates 88% overall attendance with a 5% increase in STEM engagement this semester. 3 high-risk clusters identified in Module 2 submissions.</p>
                            </div>
                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                <button className="btn btn-white rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/reports')}>
                                    Access Full Reports Hub
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4 mb-4">
                {/* 3. Analytics Chart */}
                <div className="col-lg-8">
                    <motion.div className="card-modern border-0 p-4 h-100 glass-card shadow-sm" variants={itemVariants}>
                        <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                            <div>
                                <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>Growth & Engagement</h6>
                                <p className="text-muted smaller mb-0">Cross-departmental platform activity</p>
                            </div>
                            <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 shadow-sm smaller text-muted" style={{ width: '100px' }}>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={engagementData}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)', backgroundColor: darkMode ? '#1e293b' : '#fff', fontSize: '11px' }} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}/>
                                    <Area type="monotone" name="Students" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                                    <Area type="monotone" name="Teachers" dataKey="teachers" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTeachers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* 4. AI Curriculum Intelligence */}
                <div className="col-lg-4">
                    <motion.div className="card-modern border-0 p-4 h-100 ai-neon-card shadow-2xl" variants={itemVariants}>
                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                            <FaBrain size={120} className="text-ai-accent" />
                        </div>
                        <div className="position-relative z-1 d-flex flex-column h-100">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-ai-gradient rounded-circle p-2 me-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                    <FaBrain className="text-white" size={16} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-white uppercase letter-spacing-1 small">Neural Insights</h6>
                                    <p className="text-white-50 smaller mb-0 opacity-70">Real-time academic analysis</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-auto">
                                {[
                                    { type: 'Prerequisite', msg: 'Missing DS before Algorithms', sev: 'CRITICAL', color: '#ef4444' },
                                    { type: 'Optimization', msg: 'Merge Duplicate Modules', sev: 'STRATEGY', color: '#f59e0b' },
                                    { type: 'Taxonomy', msg: 'Low "Create" Level Objectives', sev: 'ANALYSIS', color: '#06b6d4' }
                                ].map((alert, idx) => (
                                    <div key={idx} className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 cursor-pointer hover-bg-opacity-20 transition-all shadow-sm mb-2">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold text-white-50 uppercase" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>{alert.type}</span>
                                            <span className="badge rounded-pill px-2 py-1" style={{ fontSize: '0.5rem', backgroundColor: `${alert.color}20`, color: alert.color, border: `1px solid ${alert.color}40` }}>{alert.sev}</span>
                                        </div>
                                        <p className="smaller mb-0 text-white fw-medium opacity-90">{alert.msg}</p>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleGenerateAIReport} className="btn bg-ai-gradient text-white w-100 rounded-3 py-2 fw-bold shadow-lg mt-4 border-0 small hover-lift">
                                <FaMagic className="me-2" size={12} /> Intelligence Hub
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="row g-4">
                {/* 10. Global Activity Timeline */}
                <div className="col-lg-7">
                    <motion.div className="card-modern border-0 p-4 h-100 glass shadow-sm" variants={itemVariants}>
                        <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                            <h6 className={`fw-bold mb-0 d-flex align-items-center ${darkMode ? 'text-white' : 'text-dark'}`}>
                                <FaHistory className="text-primary me-2" /> System Activity
                            </h6>
                            <Link to="/audit-logs" className="text-primary text-decoration-none smaller fw-bold uppercase letter-spacing-1">View Archive</Link>
                        </div>
                        <div className="timeline ps-2">
                            {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                                <div key={i} className="d-flex mb-3 position-relative">
                                    <div className="me-3 position-relative z-1">
                                        <div className={`bg-light rounded-circle p-2 d-flex align-items-center justify-content-center ${darkMode ? 'bg-opacity-10 border-secondary' : 'border-white'} border shadow-sm`} style={{ width: '34px', height: '34px' }}>
                                            <FaClock size={11} className="text-primary opacity-80" />
                                        </div>
                                    </div>
                                    <div className="pb-3 w-100 border-bottom border-light border-opacity-50">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <p className={`smaller mb-0 fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
                                                {log.user_detail?.username || 'System Engine'}
                                            </p>
                                            <span className="text-muted fw-medium text-xs">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-muted smaller mb-0 opacity-80">
                                            <span className={`fw-bold text-uppercase me-1 ${log.action === 'CREATE' ? 'text-success' : log.action === 'DELETE' ? 'text-danger' : 'text-primary'}`} style={{ fontSize: '0.6rem' }}>{log.action}</span>
                                            <span>{log.model_name} recorded by administrator</span>
                                        </p>
                                    </div>
                                    {i !== auditLogs.length - 1 && (
                                        <div className="position-absolute start-0 top-0 mt-4 bg-secondary bg-opacity-20" style={{ width: '1px', height: '100%', marginLeft: '17px' }}></div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-4">
                                    <p className="text-muted smaller mb-0">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* System Status Widget */}
                <div className="col-lg-5">
                    <motion.div className="card-modern border-0 p-4 h-100 glass shadow-sm" variants={itemVariants}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className={`fw-bold mb-0 d-flex align-items-center ${darkMode ? 'text-white' : 'text-dark'}`}>
                                <FaServer className="text-cyan-highlight me-2" /> Platform Health
                            </h6>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold pulse-green" style={{ fontSize: '0.6rem' }}>OPERATIONAL</span>
                        </div>
                        
                        <div className="p-4 rounded-4 bg-light bg-opacity-30 mb-4 border border-light shadow-inner">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold uppercase text-xs letter-spacing-1">Network Uptime</span>
                                <span className="text-success smaller fw-bold">99.98%</span>
                            </div>
                            <div className="progress rounded-pill mb-4" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                <div className="progress-bar bg-success shadow-sm" style={{ width: '99.98%' }}></div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold uppercase text-xs letter-spacing-1">Neural Engine Load</span>
                                <span className="text-primary smaller fw-bold">24.2%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                <div className="progress-bar bg-ai-gradient shadow-primary-glow" style={{ width: '24.2%' }}></div>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2">
                            {[
                                { label: 'PostgreSQL Cluster', status: 'ACTIVE', color: '#10b981' },
                                { label: 'Gemini Neural API', status: 'ACTIVE', color: '#10b981' },
                                { label: 'Async Task Worker', status: 'SYNCING', color: '#f59e0b' }
                            ].map((s, i) => (
                                <div key={i} className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 hover-light transition-all">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle me-3" style={{ width: '8px', height: '8px', backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}60` }}></div>
                                        <span className={`fw-bold smaller ${darkMode ? 'text-white-50' : 'text-muted'}`}>{s.label}</span>
                                    </div>
                                    <span className="fw-bold uppercase" style={{ fontSize: '0.55rem', color: s.color, letterSpacing: '0.5px' }}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Floating AI Assistant Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="btn-ai-float bg-ai-gradient shadow-2xl border-0"
                onClick={handleGenerateAIReport}
            >
                <FaRobot size={24} />
            </motion.button>

            <style>{`
                .max-w-600 { max-width: 600px; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .hover-opacity-20:hover { background-color: rgba(255,255,255,0.15); }
            `}</style>
        </motion.div>
    );
};

export default AdminDashboard;
