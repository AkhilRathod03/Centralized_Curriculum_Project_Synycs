import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaUserGraduate, FaSearch, FaFilter, FaFileExport, FaCheckCircle, 
    FaClock, FaExclamationTriangle, FaChartLine, FaRobot, FaEllipsisV,
    FaEye, FaBrain, FaChartPie, FaArrowUp, FaArrowDown, FaPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import PremiumCard from '../../components/common/PremiumCard';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const AdminStudents = () => {
    const { darkMode } = useContext(ThemeContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    const performanceData = [
        { name: 'Mon', score: 65 },
        { name: 'Tue', score: 72 },
        { name: 'Wed', score: 68 },
        { name: 'Thu', score: 85 },
        { name: 'Fri', score: 90 },
        { name: 'Sat', score: 88 },
        { name: 'Sun', score: 82 },
    ];

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('auth/institutions/users/');
            const allUsers = res.data.results || res.data;
            setStudents(allUsers.filter(u => u.role === 'student'));
        } catch (err) {
            toast.error('Failed to access student database');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Students', value: students.length, trend: '+12%', color: '#2563eb', icon: <FaUserGraduate /> },
        { label: 'Active Status', value: students.filter(s => s.is_approved).length, trend: 'Stable', color: '#10b981', icon: <FaCheckCircle /> },
        { label: 'Students At Risk', value: 8, trend: '+3', color: '#ef4444', icon: <FaExclamationTriangle /> },
        { label: 'Avg Attendance', value: '84%', trend: '-2%', color: '#f59e0b', icon: <FaClock /> }
    ];

    return (
        <div className="pb-5 px-lg-4">
            <PageHeader 
                title="Student Intelligence Hub"
                subtitle="Institution-wide student monitoring and academic analytics"
                actions={[
                    { label: 'Export Analytics', icon: <FaFileExport />, variant: 'secondary' },
                    { label: 'Register Student', icon: <FaPlus />, variant: 'primary' }
                ]}
            />

            {/* KPI Section */}
            <div className="row g-4 mb-4">
                {stats.map((stat, i) => (
                    <div key={i} className="col-md-3">
                        <PremiumCard className="h-100 border-0 shadow-sm hover-lift transition-all">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-2 rounded-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className={`badge rounded-pill ${stat.trend.startsWith('+') ? 'bg-success' : stat.trend === 'Stable' ? 'bg-info' : 'bg-danger'} bg-opacity-10 text-${stat.trend.startsWith('+') ? 'success' : stat.trend === 'Stable' ? 'info' : 'danger'} smaller fw-bold`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <h3 className="fw-bold mb-1">{stat.value}</h3>
                            <p className="text-muted small mb-0 fw-bold uppercase letter-spacing-1">{stat.label}</p>
                            <div className="mt-3" style={{ height: '30px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData}>
                                        <Area type="monotone" dataKey="score" stroke={stat.color} fill={`${stat.color}20`} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </PremiumCard>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Main Workspace */}
                <div className="col-lg-8">
                    <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden h-100">
                        <div className={`p-4 border-bottom d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-30'}`}>
                            <h6 className="fw-bold mb-0">Student Directory</h6>
                            <div className="input-group glass rounded-pill border shadow-sm" style={{ maxWidth: '250px' }}>
                                <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={12} /></span>
                                <input 
                                    type="text" 
                                    className={`form-control bg-transparent border-0 shadow-none py-1 small ${darkMode ? 'text-white' : ''}`} 
                                    placeholder="Search registry..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                                <thead className="bg-transparent">
                                    <tr>
                                        <th className="ps-4 py-3 text-muted small uppercase">Student Entity</th>
                                        <th className="py-3 text-muted small uppercase">Performance</th>
                                        <th className="py-3 text-muted small uppercase">Risk Score</th>
                                        <th className="pe-4 py-3 text-end text-muted small uppercase">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className="cursor-pointer" onClick={() => { setSelectedStudent(student); setShowDrawer(true); }}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${student.username}&background=2563eb&color=fff`} 
                                                        className="rounded-circle border border-2 border-white shadow-sm me-3" 
                                                        width="36" height="36" alt=""
                                                    />
                                                    <div>
                                                        <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{student.username}</div>
                                                        <div className="text-muted text-xs">{student.unique_id || 'STU-001'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress flex-grow-1" style={{ height: '4px', maxWidth: '80px' }}>
                                                        <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                                                    </div>
                                                    <span className="small fw-bold">7.5</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 small">Low Risk</span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button className={`btn btn-icon-sm rounded-circle ${darkMode ? 'btn-dark' : 'btn-light'}`}><FaEye size={12} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </PremiumCard>
                </div>

                {/* AI Intelligence Sidebar */}
                <div className="col-lg-4">
                    <PremiumCard className="border-0 shadow-lg ai-neon-card h-100 text-white overflow-hidden position-relative">
                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                            <FaBrain size={120} />
                        </div>
                        <div className="position-relative z-1">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-ai-gradient p-2 rounded-3 shadow-lg">
                                    <FaRobot size={20} />
                                </div>
                                <h5 className="fw-bold mb-0">AI Student Insights</h5>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'Low Attendance Prediction', msg: '8 students likely to drop below 75% threshold next week.', color: '#ef4444' },
                                    { title: 'Weak Performance Alert', msg: 'Module 3 topics showing 20% lower mastery across students.', color: '#f59e0b' },
                                    { title: 'Engagement Spike', msg: 'Interactive lab sessions improved participation by 45%.', color: '#10b981' }
                                ].map((alert, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 mb-3"
                                    >
                                        <h6 className="small fw-bold mb-1" style={{ color: alert.color }}>{alert.title}</h6>
                                        <p className="smaller mb-0 opacity-75">{alert.msg}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="btn bg-ai-gradient text-white w-100 rounded-pill py-2 fw-bold mt-3 shadow-lg border-0 hover-lift">
                                Generate Strategic Report
                            </button>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Student Profile Drawer */}
            <AnimatePresence>
                {showDrawer && selectedStudent && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDrawer(false)}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2000"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className={`position-fixed top-0 end-0 h-100 shadow-2xl z-2001 overflow-hidden ${darkMode ? 'bg-dark' : 'bg-white'}`}
                            style={{ width: '450px', maxWidth: '90vw' }}
                        >
                            <div className="h-100 d-flex flex-column">
                                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">Student Profile</h5>
                                    <button onClick={() => setShowDrawer(false)} className="btn btn-close shadow-none"></button>
                                </div>
                                <div className="p-4 overflow-auto custom-scrollbar flex-grow-1">
                                    <div className="text-center mb-4">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${selectedStudent.username}&background=2563eb&color=fff`} 
                                            className="rounded-circle border border-4 border-white shadow-lg mb-3" 
                                            width="100" height="100" alt=""
                                        />
                                        <h4 className="fw-bold mb-1">{selectedStudent.username}</h4>
                                        <p className="text-muted small uppercase fw-bold letter-spacing-1">{selectedStudent.unique_id || 'STU-001'}</p>
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <div className={`p-3 rounded-4 border ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'}`}>
                                                <div className="text-muted smaller fw-bold uppercase mb-1">Attendance</div>
                                                <div className="fw-bold h5 mb-0 text-success">92%</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className={`p-3 rounded-4 border ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'}`}>
                                                <div className="text-muted smaller fw-bold uppercase mb-1">Current GPA</div>
                                                <div className="fw-bold h5 mb-0 text-primary">3.8</div>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaChartLine className="text-primary" /> Academic Progress</h6>
                                    <div className="mb-4" style={{ height: '150px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={performanceData}>
                                                <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaBrain className="text-ai-accent" /> AI Career Readiness</h6>
                                    <div className="p-3 rounded-4 bg-ai-gradient bg-opacity-10 border border-ai-accent border-opacity-20 text-ai-accent">
                                        <p className="small mb-0 fw-medium">Highly proficient in Logic Design and Python. Recommending advanced AI specialization tracks.</p>
                                    </div>
                                </div>
                                <div className="p-4 border-top">
                                    <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-primary-glow">Message Student</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .ai-neon-card { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); }
                .bg-ai-gradient { background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%); }
                .text-ai-accent { color: #7c3aed; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .smaller { font-size: 0.75rem; }
                .z-2000 { z-index: 2000; }
                .z-2001 { z-index: 2001; }
            `}</style>
        </div>
    );
};

export default AdminStudents;
