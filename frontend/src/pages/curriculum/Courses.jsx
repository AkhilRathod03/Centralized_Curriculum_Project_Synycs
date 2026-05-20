import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaBook, FaPlus, FaSearch, FaFilter, FaMagic, 
    FaChevronRight, FaUniversity, FaUsers, FaLayerGroup, 
    FaChartLine, FaRobot, FaBrain, FaCalendarAlt,
    FaEllipsisV, FaEdit, FaTrash, FaEye, FaFileDownload,
    FaShieldAlt, FaChartPie, FaLightbulb, FaCheckCircle,
    FaExclamationTriangle, FaGraduationCap, FaClock, FaChalkboardTeacher
} from 'react-icons/fa';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';
import EmptyState from '../../components/common/EmptyState';
import FacultyAssignModal from '../../components/curriculum/FacultyAssignModal';

const Courses = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const isStudent = user?.role === 'student';
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid, table, analytics
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [courseToAssign, setCourseToAssign] = useState(null);
    const [stats, setStats] = useState({
        totalCourses: 0,
        activeCourses: 0,
        facultyAssigned: 0,
        completionRate: 0,
        aiWarnings: 0,
        studentEnrollment: 0
    });

    // Mock analytics data
    const enrollmentTrends = [
        { name: 'Sem 1', enrollment: 300, completion: 85 },
        { name: 'Sem 2', enrollment: 280, completion: 78 },
        { name: 'Sem 3', enrollment: 250, completion: 90 },
        { name: 'Sem 4', enrollment: 320, completion: 88 },
        { name: 'Sem 5', enrollment: 290, completion: 92 },
        { name: 'Sem 6', enrollment: 310, completion: 95 },
    ];

    const moduleDistribution = [
        { name: 'Core Computing', value: 40, color: '#2563eb' },
        { name: 'Mathematics', value: 20, color: '#10b981' },
        { name: 'Professional Electives', value: 25, color: '#7c3aed' },
        { name: 'Humanities', value: 15, color: '#f59e0b' },
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) setSearchTerm(search);
        fetchCourses();
    }, [location.search]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const programId = location.state?.programId;
            const url = programId 
                ? `curriculum/courses/?program=${programId}`
                : 'curriculum/courses/';
                
            const res = await axiosInstance.get(url);
            const data = res.data.results || res.data;
            
            // Enrich courses with mock metrics
            const enriched = data.map((c, i) => ({
                ...c,
                programName: c.program_name || (location.state?.branchName || 'B.Tech Computer Science'),
                semester: c.semester || Math.floor(Math.random() * 8) + 1,
                credits: c.credits || 3,
                modulesCount: Math.floor(Math.random() * 5) + 3,
                students: Math.floor(Math.random() * 150) + 30,
                faculty: `Prof. ${['Smith', 'Johnson', 'Williams', 'Brown'][i % 4]}`,
                completion: Math.floor(Math.random() * 40) + 60,
                aiScore: Math.floor(Math.random() * 20) + 80,
                status: i % 5 === 0 ? 'Review Needed' : 'Active'
            }));

            setCourses(enriched);
            setStats({
                totalCourses: enriched.length,
                activeCourses: enriched.filter(c => c.status === 'Active').length,
                facultyAssigned: 12,
                completionRate: 82,
                aiWarnings: 3,
                studentEnrollment: enriched.reduce((acc, c) => acc + c.students, 0)
            });
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const handleGenerateAIAnalysis = () => {
        toast.info("Neural Engine evaluating curriculum dependencies...", {
            icon: <FaBrain className="text-ai-accent" />
        });
        setTimeout(() => {
            toast.success("AI Curriculum Insights generated!");
        }, 2000);
    };

    const filteredCourses = courses.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <p className={`mt-3 fw-medium ${darkMode ? 'text-white-50' : 'text-muted'}`}>Synthesizing course catalog...</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            className="pb-5 px-lg-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <PageHeader 
                title="Courses Management"
                subtitle="Manage academic courses, curriculum delivery, faculty allocation, and AI-driven course intelligence."
                breadcrumbs={[
                    !isStudent && { label: 'Curriculum', path: '/curriculum' }, 
                    { label: 'Courses' }
                ].filter(Boolean)}
                actions={[
                    { label: 'AI Insights', icon: <FaMagic />, variant: 'outline-primary', onClick: handleGenerateAIAnalysis },
                    !isStudent && { label: 'Import', icon: <FaFileDownload />, variant: 'outline-secondary' },
                    !isStudent && { label: 'Add Course', icon: <FaPlus />, variant: 'primary', onClick: () => navigate('/curriculum') }
                ].filter(Boolean)}
            />

            {/* 1. Course KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Courses', val: stats.totalCourses, icon: <FaBook />, color: '#2563eb', trend: '+5' },
                    { label: 'Active Courses', val: stats.activeCourses, icon: <FaCheckCircle />, color: '#10b981', trend: 'Stable' },
                    { label: 'Faculty Assigned', val: stats.facultyAssigned, icon: <FaChalkboardTeacher />, color: '#7c3aed', trend: '100% Covered' },
                    { label: 'Completion Rate', val: `${stats.completionRate}%`, icon: <FaChartLine />, color: '#06b6d4', trend: '+2.1%' },
                    { label: 'AI Warnings', val: stats.aiWarnings, icon: <FaExclamationTriangle />, color: '#f59e0b', trend: 'Requires Attention' },
                    { label: 'Total Enrollments', val: stats.studentEnrollment, icon: <FaUsers />, color: '#ec4899', trend: '+150' },
                ].map((s, i) => (
                    <motion.div key={i} className="col-6 col-md-4 col-xl-2" variants={itemVariants}>
                        <PremiumCard className="p-3 h-100 border-0 glass shadow-sm hover-lift">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: `${s.color}15`, color: s.color, width: '40px', height: '40px' }}>
                                    {React.cloneElement(s.icon, { size: 18 })}
                                </div>
                                <div className={`px-2 py-0 rounded-pill text-xs fw-bold ${s.trend.startsWith('+') || s.trend.includes('Covered') ? 'bg-success bg-opacity-10 text-success' : s.trend.includes('Attention') ? 'bg-warning bg-opacity-10 text-warning' : 'bg-light text-muted'}`}>
                                    {s.trend}
                                </div>
                            </div>
                            <h3 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{s.val}</h3>
                            <p className="text-muted text-xs fw-bold uppercase mb-0 opacity-70 letter-spacing-1">{s.label}</p>
                        </PremiumCard>
                    </motion.div>
                ))}
            </div>

            {/* 2. Search & View Controls */}
            <div className="card-modern p-3 mb-4 glass shadow-sm border-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div className="d-flex gap-2 p-1 border rounded-pill shadow-sm max-w-fit bg-white bg-opacity-5">
                    {[
                        { id: 'grid', icon: <FaLayerGroup /> },
                        { id: 'table', icon: <FaEllipsisV /> },
                        { id: 'analytics', icon: <FaChartLine /> }
                    ].map(m => (
                        <button 
                            key={m.id}
                            onClick={() => setViewMode(m.id)}
                            className={`btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center transition-all ${viewMode === m.id ? 'btn-primary shadow-primary-glow' : 'btn-link text-muted'}`}
                            style={{ width: '36px', height: '36px' }}
                        >
                            {m.icon}
                        </button>
                    ))}
                </div>

                <div className="d-flex gap-3 w-100" style={{ maxWidth: '600px' }}>
                    <div className={`input-group glass rounded-pill border shadow-sm ${darkMode ? 'border-secondary' : ''}`}>
                        <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={14} /></span>
                        <input 
                            type="text" 
                            className={`form-control bg-transparent border-0 shadow-none py-2 small ${darkMode ? 'text-white' : ''}`} 
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={`btn btn-light rounded-pill px-4 shadow-sm border ${darkMode ? 'bg-dark border-secondary text-white-50 hover-bg-opacity-20' : ''}`}>
                        <FaFilter className="me-2" size={12}/> Filters
                    </button>
                </div>
            </div>

            {/* 3. Main Workspace */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' && (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="row g-4"
                    >
                        {filteredCourses.length > 0 ? filteredCourses.map((c, i) => (
                            <div key={c.id} className="col-lg-4 col-xl-4">
                                <PremiumCard className="h-100 border-0 glass shadow-sm hover-lift p-0 overflow-hidden" onClick={() => setSelectedCourse(c)}>
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 shadow-inner">
                                                <FaBook size={24} />
                                            </div>
                                            {!isStudent && (
                                                <div className="dropdown">
                                                    <button className="btn btn-link text-muted p-0 shadow-none" data-bs-toggle="dropdown"><FaEllipsisV size={14} /></button>
                                                    <ul className={`dropdown-menu dropdown-menu-end border-0 shadow-2xl rounded-4 p-2 ${darkMode ? 'bg-dark border border-secondary' : ''}`}>
                                                        <li><button className="dropdown-item rounded-3 mb-1 py-2 small fw-bold"><FaEdit className="me-2" /> Edit</button></li>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item rounded-3 mb-1 py-2 small fw-bold"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCourseToAssign(c);
                                                                    setShowAssignModal(true);
                                                                }}
                                                            >
                                                                <FaChalkboardTeacher className="me-2" /> Assign Faculty
                                                            </button>
                                                        </li>
                                                        <li><button className="dropdown-item rounded-3 mb-1 py-2 small fw-bold text-ai-accent"><FaMagic className="me-2" /> AI Analysis</button></li>
                                                        <li><hr className="dropdown-divider opacity-10" /></li>
                                                        <li><button className="dropdown-item rounded-3 text-danger fw-bold py-2 small"><FaTrash className="me-2" /> Archive</button></li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h5 className={`fw-bold mb-1 text-truncate ${darkMode ? 'text-white' : 'text-dark'}`}>{c.name}</h5>
                                        <p className="text-muted text-xs fw-bold uppercase mb-3 opacity-70 letter-spacing-1">{c.code} • Sem {c.semester} • {c.credits} CR</p>
                                        
                                        <div className="d-flex gap-2 mb-4 flex-wrap">
                                            <span className="badge rounded-pill bg-light text-muted border px-2 py-1 fw-bold text-xs" style={{ fontSize: '0.6rem' }}>{c.programName.substring(0, 15)}...</span>
                                            <span className={`badge rounded-pill border px-2 py-1 fw-bold text-xs ${c.status === 'Active' ? 'bg-success bg-opacity-10 text-success border-success border-opacity-20' : 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-20'}`} style={{ fontSize: '0.6rem' }}>{c.status}</span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted text-xs fw-bold uppercase letter-spacing-1">Delivery Sync</span>
                                                <span className="text-primary fw-bold text-xs">{c.completion}%</span>
                                            </div>
                                            <div className="progress rounded-pill bg-black bg-opacity-5" style={{ height: '6px' }}>
                                                <div className="progress-bar bg-primary shadow-primary-glow" style={{ width: `${c.completion}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="row g-2 pt-3 border-top border-light border-opacity-50">
                                            <div className="col-4">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">Modules</div>
                                                    <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{c.modulesCount}</div>
                                                </div>
                                            </div>
                                            <div className="col-4 border-start border-end border-light border-opacity-50">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">Students</div>
                                                    <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{c.students}</div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">AI Intel</div>
                                                    <div className="text-ai-accent fw-bold small">{c.aiScore}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!isStudent && (
                                        <div className="p-3 pt-0 mt-auto">
                                            <button 
                                                className="btn btn-primary-premium w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/curriculum', { state: { courseId: c.id } });
                                                }}
                                            >
                                                <FaEye size={12} /> Enter Studio
                                            </button>
                                        </div>
                                    )}
                                </PremiumCard>
                            </div>
                        )) : (
                            <div className="col-12 py-5">
                                <EmptyState 
                                    title="No courses available yet."
                                    description="Create and organize academic courses with AI-powered curriculum intelligence."
                                    actionLabel="Create First Course"
                                    onAction={() => navigate('/curriculum')}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {viewMode === 'table' && (
                    <motion.div 
                        key="table"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden">
                            <div className="table-responsive">
                                <table className={`table table-hover align-middle mb-0 custom-enterprise-table ${darkMode ? 'table-dark' : ''}`}>
                                    <thead className={`${darkMode ? 'bg-dark bg-opacity-40' : 'bg-light bg-opacity-50'}`}>
                                        <tr>
                                            <th className="ps-4 py-3 border-0 text-muted small uppercase letter-spacing-1">Course Identity</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Structure</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Faculty Node</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Completion Flow</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Neural Health</th>
                                            <th className="pe-4 py-3 border-0 text-end text-muted small uppercase letter-spacing-1">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {filteredCourses.map(c => (
                                            <tr key={c.id} className={`${darkMode ? 'border-secondary border-opacity-20' : 'border-light border-opacity-50'}`}>
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                                                            <FaBook size={16} />
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{c.name}</span>
                                                            <span className="text-muted text-xs fw-bold uppercase letter-spacing-1">{c.code}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-muted border px-2 py-1 fw-bold text-xs" style={{ fontSize: '0.65rem' }}>Sem {c.semester} • {c.credits} CR</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img src={`https://ui-avatars.com/api/?name=${c.faculty.split(' ')[1]}&background=random`} className="rounded-circle border border-2 border-white shadow-sm me-2" width="24" height="24" alt="" />
                                                        <span className="small text-muted fw-medium">{c.faculty}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3" style={{ minWidth: '130px' }}>
                                                        <div className="progress flex-grow-1 rounded-pill" style={{ height: '6px' }}>
                                                            <div className="progress-bar bg-primary" style={{ width: `${c.completion}%` }}></div>
                                                        </div>
                                                        <span className="small fw-bold text-primary">{c.completion}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className={`rounded-circle me-2 ${c.aiScore > 90 ? 'bg-success' : 'bg-warning'}`} style={{ width: '8px', height: '8px', boxShadow: `0 0 10px ${c.aiScore > 90 ? '#10b981' : '#f59e0b'}60` }}></div>
                                                        <span className="fw-bold small text-ai-accent">{c.aiScore} Intel</span>
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className={`btn btn-icon-sm border rounded-circle ${darkMode ? 'btn-dark border-secondary text-white' : 'btn-light'}`}><FaEdit size={12} /></button>
                                                        <button className={`btn btn-icon-sm border rounded-circle ${darkMode ? 'btn-dark border-secondary text-white' : 'btn-light'}`}><FaEye size={12} /></button>
                                                        <button className={`btn btn-icon-sm border rounded-circle text-danger ${darkMode ? 'btn-dark border-secondary' : 'btn-light'}`}><FaTrash size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </PremiumCard>
                    </motion.div>
                )}

                {viewMode === 'analytics' && (
                    <motion.div 
                        key="analytics"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="row g-4"
                    >
                        <div className="col-lg-8">
                            <PremiumCard title="Course Enrollment Trends" subtitle="Performance and attendance correlation across semesters" className="h-100 border-0 glass shadow-sm">
                                <div style={{ width: '100%', height: '350px' }} className="pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={enrollmentTrends}>
                                            <defs>
                                                <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--card-shadow)', backgroundColor: darkMode ? '#1e293b' : '#fff' }} />
                                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}/>
                                            <Area yAxisId="left" type="monotone" name="Enrollment" dataKey="enrollment" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollment)" />
                                            <Area yAxisId="right" type="monotone" name="Avg Completion %" dataKey="completion" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletion)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </PremiumCard>
                        </div>
                        <div className="col-lg-4">
                            <PremiumCard title="Module Distribution" subtitle="Curriculum structural density" className="h-100 border-0 glass shadow-sm">
                                <div style={{ width: '100%', height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={moduleDistribution} 
                                                innerRadius={70} 
                                                outerRadius={110} 
                                                paddingAngle={5} 
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {moduleDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)', backgroundColor: darkMode ? '#1e293b' : '#fff' }} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </PremiumCard>
                        </div>

                        <div className="col-lg-12">
                            <PremiumCard className="border-0 shadow-lg ai-neon-card p-5">
                                <div className="row align-items-center">
                                    <div className="col-lg-8">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-ai-gradient rounded-circle p-3 me-3 shadow-lg">
                                                <FaBrain className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="fw-bold mb-0 text-white">Course Diagnostics & Recommendations</h4>
                                                <p className="text-white-50 small mb-0">Deep learning analysis of pedagogical structures</p>
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            {[
                                                { title: 'Prerequisite Detection', score: 'Warning', icon: <FaExclamationTriangle />, msg: 'AI detected missing API security module in Web Development course.' },
                                                { title: 'Pedagogy Balance', score: 'Fair', icon: <FaChartPie />, msg: 'Course lacks practical assignments in theoretical segments.' },
                                                { title: 'Student Difficulty', score: 'High Alert', icon: <FaUsers />, msg: 'Students consistently struggle with recursion topics in DS.' }
                                            ].map((node, i) => (
                                                <div key={i} className="col-md-4">
                                                    <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 h-100">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <div className="text-ai-accent">{node.icon}</div>
                                                            <span className="text-white text-xs fw-bold uppercase letter-spacing-1">{node.title}</span>
                                                        </div>
                                                        <h5 className="text-warning fw-bold mb-2">{node.score}</h5>
                                                        <p className="text-white-50 smaller mb-0 opacity-70">{node.msg}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 text-center mt-4 mt-lg-0">
                                        <div className="p-4 rounded-5 glass-card d-inline-block border border-white border-opacity-10 shadow-2xl">
                                            <h1 className="display-4 fw-bold text-white mb-0">91%</h1>
                                            <p className="text-ai-accent fw-bold uppercase small letter-spacing-1">Syllabus Health</p>
                                            <div className="mt-3">
                                                <FaLightbulb size={40} className="text-warning opacity-80" />
                                            </div>
                                        </div>
                                        <button className="btn bg-ai-gradient text-white w-100 rounded-pill py-3 mt-4 fw-bold shadow-lg border-0">
                                            Execute Optimization Protocol
                                        </button>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Course Details Drawer */}
            <AnimatePresence>
                {selectedCourse && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-1050"
                            onClick={() => setSelectedCourse(null)}
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`position-fixed top-0 end-0 h-100 shadow-2xl z-1060 p-0 overflow-hidden ${darkMode ? 'bg-dark border-start border-secondary' : 'bg-white'}`}
                            style={{ width: '500px' }}
                        >
                            <div className="h-100 d-flex flex-column">
                                <div className={`p-4 border-bottom d-flex align-items-center justify-content-between ${darkMode ? 'bg-dark bg-opacity-40 border-secondary' : 'bg-ai-gradient bg-opacity-5'}`}>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                                            <FaBook size={18} />
                                        </div>
                                        <div>
                                            <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedCourse.name}</h6>
                                            <span className="text-muted smaller fw-bold uppercase letter-spacing-1">{selectedCourse.code} Detail</span>
                                        </div>
                                    </div>
                                    <button className={`btn-close smaller shadow-none ${darkMode ? 'btn-close-white' : ''}`} onClick={() => setSelectedCourse(null)}></button>
                                </div>

                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                                    <div className="row g-3 mb-4">
                                        <div className="col-4">
                                            <div className="p-3 rounded-4 border bg-light bg-opacity-30 text-center">
                                                <div className="text-muted text-xs fw-bold uppercase mb-1">Sem</div>
                                                <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedCourse.semester}</h5>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="p-3 rounded-4 border bg-light bg-opacity-30 text-center">
                                                <div className="text-muted text-xs fw-bold uppercase mb-1">Credits</div>
                                                <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedCourse.credits}</h5>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="p-3 rounded-4 border bg-light bg-opacity-30 text-center">
                                                <div className="text-muted text-xs fw-bold uppercase mb-1">Modules</div>
                                                <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedCourse.modulesCount}</h5>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-xs text-muted uppercase mb-3 letter-spacing-1">Faculty & Resources</h6>
                                    <div className={`p-3 rounded-4 border mb-4 d-flex align-items-center transition-all ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-50'}`}>
                                        <img src={`https://ui-avatars.com/api/?name=${selectedCourse.faculty.split(' ')[1]}&background=2563eb&color=fff`} className="rounded-circle border border-2 border-white shadow-sm me-3" width="40" height="40" alt="" />
                                        <div>
                                            <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedCourse.faculty}</div>
                                            <div className="text-muted text-xs">Lead Instructor</div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary ms-auto rounded-pill px-3 fw-bold" style={{ fontSize: '0.65rem' }}>Contact</button>
                                    </div>

                                    <PremiumCard className="border-0 ai-neon-card text-white p-4 mb-4">
                                        <h6 className="fw-bold mb-3 text-ai-accent small d-flex align-items-center"><FaRobot className="me-2" /> AI Structural Review</h6>
                                        <div className="p-3 rounded-3 bg-white bg-opacity-5 mb-2 border border-white border-opacity-5">
                                            <span className="text-xs fw-bold text-warning uppercase d-block mb-1 letter-spacing-1">Bloom Taxonomy Alert</span>
                                            <p className="smaller mb-0 opacity-80 fw-medium">High concentration of 'Remember' and 'Understand' objectives. AI recommends adding 3 'Evaluate/Create' assignments.</p>
                                        </div>
                                    </PremiumCard>

                                    <h6 className="fw-bold text-xs text-muted uppercase mb-3 letter-spacing-1">Module Sequence</h6>
                                    <div className="space-y-2 mb-4">
                                        {Array.from({ length: selectedCourse.modulesCount }).map((_, i) => (
                                            <div key={i} className={`p-3 rounded-4 border mb-2 d-flex align-items-center transition-all ${darkMode ? 'hover-bg-opacity-20 border-secondary text-white-50' : 'hover-light border-light text-dark'}`}>
                                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3"><FaCheckCircle size={10} className="text-success" /></div>
                                                <span className="small fw-bold">Unit {i + 1}: Conceptual Framework</span>
                                                <FaChevronRight size={10} className="ms-auto opacity-25" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`p-4 border-top ${darkMode ? 'border-secondary' : 'border-light'} d-grid gap-2`}>
                                    {!isStudent && (
                                        <button 
                                            className="btn btn-primary-premium rounded-pill py-2 fw-bold shadow-sm" 
                                            onClick={() => navigate('/curriculum', { state: { courseId: selectedCourse.id } })}
                                        >
                                            Open in Curriculum Studio
                                        </button>
                                    )}
                                    <button className="btn btn-outline-secondary rounded-pill py-2 fw-bold small" onClick={() => setSelectedCourse(null)}>Close Panel</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 5. Faculty Assignment Modal */}
            <FacultyAssignModal 
                show={showAssignModal}
                handleClose={() => setShowAssignModal(false)}
                course={courseToAssign}
                onSuccess={fetchCourses}
            />

            <style>{`
                .text-ai-accent { color: #7c3aed !important; }
                .shadow-primary-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
                .letter-spacing-1 { letter-spacing: 1px; }
                .hover-lift:hover { transform: translateY(-4px); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                [data-bs-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>
        </motion.div>
    );
};

export default Courses;