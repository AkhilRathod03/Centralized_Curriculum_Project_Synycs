import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaLayerGroup, FaPlus, FaSearch, FaFilter, FaMagic, 
    FaChevronRight, FaUniversity, FaUsers, FaBook, 
    FaChartLine, FaRobot, FaBrain, FaCalendarAlt,
    FaEllipsisV, FaEdit, FaTrash, FaEye, FaFileDownload,
    FaShieldAlt, FaChartPie, FaLightbulb, FaCheckCircle,
    FaExclamationTriangle, FaGraduationCap
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

const Programs = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid, table, analytics
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [stats, setStats] = useState({
        totalPrograms: 0,
        activeDepts: 0,
        coursesLinked: 0,
        curriculumCompletion: 0,
        aiWarnings: 0,
        accreditationStatus: 'Good'
    });

    // Mock analytics data
    const deptDistribution = [
        { name: 'Computer Science', value: 45, color: '#2563eb' },
        { name: 'Mechanical', value: 25, color: '#10b981' },
        { name: 'Business', value: 20, color: '#7c3aed' },
        { name: 'Arts', value: 10, color: '#f59e0b' },
    ];

    const growthData = [
        { name: 'Jan', enrollment: 400 },
        { name: 'Feb', enrollment: 600 },
        { name: 'Mar', enrollment: 550 },
        { name: 'Apr', enrollment: 800 },
        { name: 'May', enrollment: 950 },
        { name: 'Jun', enrollment: 1100 },
    ];

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/programs/');
            const data = res.data.results || res.data;
            
            // Enrich programs with course counts and progress (mocking some metrics)
            const enriched = data.map((p, i) => ({
                ...p,
                dept: p.institution_name || 'School of Engineering',
                courses: Math.floor(Math.random() * 20) + 10,
                students: Math.floor(Math.random() * 500) + 200,
                completion: Math.floor(Math.random() * 40) + 60,
                aiScore: Math.floor(Math.random() * 15) + 80,
                accreditation: i % 3 === 0 ? 'Pending' : 'Active'
            }));

            setPrograms(enriched);
            setStats({
                totalPrograms: enriched.length,
                activeDepts: 4,
                coursesLinked: enriched.reduce((acc, p) => acc + p.courses, 0),
                curriculumCompletion: 78,
                aiWarnings: 5,
                accreditationStatus: 'Platinum'
            });
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load institutional programs');
            setLoading(false);
        }
    };

    const handleGenerateAIAnalysis = () => {
        toast.info("Neural Engine analyzing curriculum alignment...", {
            icon: <FaBrain className="text-ai-accent" />
        });
        setTimeout(() => {
            toast.success("AI Curriculum Analysis complete!");
        }, 2000);
    };

    const filteredPrograms = programs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
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
                <p className={`mt-3 fw-medium ${darkMode ? 'text-white-50' : 'text-muted'}`}>Synthesizing institutional structure...</p>
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
                title="Programs Management"
                subtitle="Manage institutional academic structures, departments, and curriculum frameworks."
                breadcrumbs={[{ label: 'Curriculum', path: '/curriculum' }, { label: 'Programs' }]}
                actions={[
                    { label: 'AI Analysis', icon: <FaMagic />, variant: 'outline-primary', onClick: handleGenerateAIAnalysis },
                    { label: 'Import', icon: <FaFileDownload />, variant: 'outline-secondary' },
                    { label: 'Add Program', icon: <FaPlus />, variant: 'primary', onClick: () => navigate('/curriculum') }
                ]}
            />

            {/* 1. Program KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Programs', val: stats.totalPrograms, icon: <FaLayerGroup />, color: '#2563eb', trend: '+2' },
                    { label: 'Active Depts', val: stats.activeDepts, icon: <FaUniversity />, color: '#7c3aed', trend: 'Stable' },
                    { label: 'Courses Linked', val: stats.coursesLinked, icon: <FaBook />, color: '#10b981', trend: '+14' },
                    { label: 'Completion', val: `${stats.curriculumCompletion}%`, icon: <FaCheckCircle />, color: '#06b6d4', trend: '+4.2%' },
                    { label: 'AI Warnings', val: stats.aiWarnings, icon: <FaExclamationTriangle />, color: '#f59e0b', trend: '-2' },
                    { label: 'Accreditation', val: stats.accreditationStatus, icon: <FaShieldAlt />, color: '#ef4444', trend: 'Audit Ready' },
                ].map((s, i) => (
                    <motion.div key={i} className="col-6 col-md-4 col-xl-2" variants={itemVariants}>
                        <PremiumCard className="p-3 h-100 border-0 glass shadow-sm hover-lift">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: `${s.color}15`, color: s.color, width: '40px', height: '40px' }}>
                                    {React.cloneElement(s.icon, { size: 18 })}
                                </div>
                                <div className={`px-2 py-0 rounded-pill text-xs fw-bold ${s.trend.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : s.trend.includes('Ready') ? 'bg-info bg-opacity-10 text-info' : 'bg-light text-muted'}`}>
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

                <div className={`input-group glass rounded-pill border shadow-sm ${darkMode ? 'border-secondary' : ''}`} style={{ maxWidth: '400px' }}>
                    <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={14} /></span>
                    <input 
                        type="text" 
                        className={`form-control bg-transparent border-0 shadow-none py-2 small ${darkMode ? 'text-white' : ''}`} 
                        placeholder="Search programs by name or code..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-link text-muted pe-3 shadow-none"><FaFilter size={12} /></button>
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
                        {filteredPrograms.length > 0 ? filteredPrograms.map((p, i) => (
                            <div key={p.id} className="col-lg-4 col-xl-4">
                                <PremiumCard className="h-100 border-0 glass shadow-sm hover-lift p-0 overflow-hidden" onClick={() => setSelectedProgram(p)}>
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 shadow-inner">
                                                <FaGraduationCap size={24} />
                                            </div>
                                            <div className="dropdown">
                                                <button className="btn btn-link text-muted p-0 shadow-none" data-bs-toggle="dropdown"><FaEllipsisV size={14} /></button>
                                                <ul className={`dropdown-menu dropdown-menu-end border-0 shadow-2xl rounded-4 p-2 ${darkMode ? 'bg-dark border border-secondary' : ''}`}>
                                                    <li><button className="dropdown-item rounded-3 mb-1 py-2 small fw-bold"><FaEdit className="me-2" /> Edit</button></li>
                                                    <li><button className="dropdown-item rounded-3 mb-1 py-2 small fw-bold"><FaBook className="me-2" /> Curriculum</button></li>
                                                    <li><button className="dropdown-item rounded-3 mb-1 py-2 small fw-bold text-ai-accent"><FaMagic className="me-2" /> AI Insights</button></li>
                                                    <li><hr className="dropdown-divider opacity-10" /></li>
                                                    <li><button className="dropdown-item rounded-3 text-danger fw-bold py-2 small"><FaTrash className="me-2" /> Archive</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <h5 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{p.name}</h5>
                                        <p className="text-muted text-xs fw-bold uppercase mb-3 opacity-70 letter-spacing-1">{p.code} • {p.duration_years} Years</p>
                                        
                                        <div className="d-flex gap-2 mb-4">
                                            <span className="badge rounded-pill bg-light text-muted border px-2 py-1 fw-bold text-xs" style={{ fontSize: '0.6rem' }}>{p.dept.substring(0, 15)}...</span>
                                            <span className={`badge rounded-pill border px-2 py-1 fw-bold text-xs ${p.accreditation === 'Active' ? 'bg-success bg-opacity-10 text-success border-success border-opacity-20' : 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-20'}`} style={{ fontSize: '0.6rem' }}>{p.accreditation}</span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted text-xs fw-bold uppercase letter-spacing-1">Curriculum Sync</span>
                                                <span className="text-primary fw-bold text-xs">{p.completion}%</span>
                                            </div>
                                            <div className="progress rounded-pill bg-black bg-opacity-5" style={{ height: '6px' }}>
                                                <div className="progress-bar bg-primary shadow-primary-glow" style={{ width: `${p.completion}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="row g-2 pt-3 border-top border-light border-opacity-50">
                                            <div className="col-4">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">Courses</div>
                                                    <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{p.courses}</div>
                                                </div>
                                            </div>
                                            <div className="col-4 border-start border-end border-light border-opacity-50">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">Students</div>
                                                    <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{p.students}</div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="text-center">
                                                    <div className="text-muted smaller fw-bold uppercase opacity-50 mb-1">AI Score</div>
                                                    <div className="text-ai-accent fw-bold small">{p.aiScore}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 pt-0 mt-auto">
                                        <button className="btn btn-primary-premium w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm">
                                            <FaEye size={12} /> Explore Workspace
                                        </button>
                                    </div>
                                </PremiumCard>
                            </div>
                        )) : (
                            <div className="col-12 py-5">
                                <EmptyState 
                                    title="No academic programs created yet."
                                    description="Start building your institution curriculum structure with AI-powered academic planning."
                                    actionLabel="Create First Program"
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
                                            <th className="ps-4 py-3 border-0 text-muted small uppercase letter-spacing-1">Program Identity</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Department</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Duration</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Syllabus Stack</th>
                                            <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">AI Health</th>
                                            <th className="pe-4 py-3 border-0 text-end text-muted small uppercase letter-spacing-1">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {filteredPrograms.map(p => (
                                            <tr key={p.id} className={`${darkMode ? 'border-secondary border-opacity-20' : 'border-light border-opacity-50'}`}>
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                                                            <FaGraduationCap size={16} />
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{p.name}</span>
                                                            <span className="text-muted text-xs fw-bold uppercase letter-spacing-1">{p.code}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="small text-muted fw-medium">{p.dept}</span></td>
                                                <td><span className="badge rounded-pill bg-light text-muted border px-3 fw-bold small">{p.duration_years} Years</span></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3" style={{ minWidth: '150px' }}>
                                                        <div className="progress flex-grow-1 rounded-pill" style={{ height: '6px' }}>
                                                            <div className="progress-bar bg-primary" style={{ width: `${p.completion}%` }}></div>
                                                        </div>
                                                        <span className="small fw-bold text-primary">{p.completion}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className={`rounded-circle me-2 ${p.aiScore > 90 ? 'bg-success' : 'bg-warning'}`} style={{ width: '8px', height: '8px', boxShadow: `0 0 10px ${p.aiScore > 90 ? '#10b981' : '#f59e0b'}60` }}></div>
                                                        <span className="fw-bold small text-ai-accent">{p.aiScore} Intel</span>
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className={`btn btn-icon-sm border rounded-circle ${darkMode ? 'btn-dark border-secondary text-white' : 'btn-light'}`}><FaEdit size={12} /></button>
                                                        <button className={`btn btn-icon-sm border rounded-circle ${darkMode ? 'btn-dark border-secondary text-white' : 'btn-light'}`}><FaBook size={12} /></button>
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
                            <PremiumCard title="Institutional Enrollment Growth" subtitle="Cumulative student registration across all programs" className="h-100 border-0 glass shadow-sm">
                                <div style={{ width: '100%', height: '350px' }} className="pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--card-shadow)', backgroundColor: darkMode ? '#1e293b' : '#fff' }} />
                                            <Area type="monotone" dataKey="enrollment" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </PremiumCard>
                        </div>
                        <div className="col-lg-4">
                            <PremiumCard title="Department Distribution" subtitle="Program density per faculty" className="h-100 border-0 glass shadow-sm">
                                <div style={{ width: '100%', height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={deptDistribution} 
                                                innerRadius={70} 
                                                outerRadius={110} 
                                                paddingAngle={5} 
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {deptDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
                                                <h4 className="fw-bold mb-0 text-white">Neural Curriculum Intelligence</h4>
                                                <p className="text-white-50 small mb-0">Cross-institutional alignment and industrial relevance analysis</p>
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            {[
                                                { title: 'Industry Alignment', score: '92%', icon: <FaChartLine />, msg: 'Highly aligned with current market tech stacks.' },
                                                { title: 'Skill Gap Matrix', score: 'Low', icon: <FaExclamationTriangle />, msg: 'Detected slight lab coverage gaps in Semester 4.' },
                                                { title: 'Bloom Compliance', score: 'Verified', icon: <FaCheckCircle />, msg: 'Structural taxonomy meets global academic standards.' }
                                            ].map((node, i) => (
                                                <div key={i} className="col-md-4">
                                                    <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 h-100">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <div className="text-ai-accent">{node.icon}</div>
                                                            <span className="text-white text-xs fw-bold uppercase letter-spacing-1">{node.title}</span>
                                                        </div>
                                                        <h5 className="text-white fw-bold mb-2">{node.score}</h5>
                                                        <p className="text-white-50 smaller mb-0 opacity-70">{node.msg}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-lg-4 text-center mt-4 mt-lg-0">
                                        <div className="p-4 rounded-5 glass-card d-inline-block border border-white border-opacity-10 shadow-2xl">
                                            <h1 className="display-4 fw-bold text-white mb-0">8.4</h1>
                                            <p className="text-ai-accent fw-bold uppercase small letter-spacing-1">Global Quality Index</p>
                                            <div className="mt-3">
                                                <FaRobot size={40} className="text-white opacity-20" />
                                            </div>
                                        </div>
                                        <button className="btn bg-ai-gradient text-white w-100 rounded-pill py-3 mt-4 fw-bold shadow-lg border-0">
                                            Re-Initialize Neural Audit
                                        </button>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Program Details Drawer (Simplified Placeholder) */}
            <AnimatePresence>
                {selectedProgram && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-1050"
                            onClick={() => setSelectedProgram(null)}
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
                                            <FaLayerGroup size={18} />
                                        </div>
                                        <div>
                                            <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedProgram.name}</h6>
                                            <span className="text-muted smaller fw-bold uppercase letter-spacing-1">{selectedProgram.code} Workspace</span>
                                        </div>
                                    </div>
                                    <button className={`btn-close smaller shadow-none ${darkMode ? 'btn-close-white' : ''}`} onClick={() => setSelectedProgram(null)}></button>
                                </div>

                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <div className="p-3 rounded-4 border bg-light bg-opacity-30">
                                                <div className="text-muted text-xs fw-bold uppercase mb-1">Total Semesters</div>
                                                <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>8 Nodes</h5>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-3 rounded-4 border bg-light bg-opacity-30">
                                                <div className="text-muted text-xs fw-bold uppercase mb-1">Learning Units</div>
                                                <h5 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>48 Courses</h5>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-xs text-muted uppercase mb-3 letter-spacing-1">Program Hierarchy</h6>
                                    <div className="space-y-2 mb-4">
                                        {['Core Engineering', 'Applied Mathematics', 'Professional Electives', 'Internship & Projects'].map((node, i) => (
                                            <div key={i} className={`p-3 rounded-4 border mb-2 d-flex align-items-center transition-all ${darkMode ? 'hover-bg-opacity-20 border-secondary text-white-50' : 'hover-light border-light text-dark'}`}>
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3"><FaBook size={10} className="text-primary" /></div>
                                                <span className="small fw-bold">{node}</span>
                                                <FaChevronRight size={10} className="ms-auto opacity-25" />
                                            </div>
                                        ))}
                                    </div>

                                    <PremiumCard className="border-0 ai-neon-card text-white p-4 mb-4">
                                        <h6 className="fw-bold mb-3 text-ai-accent small d-flex align-items-center"><FaRobot className="me-2" /> Program Intelligence</h6>
                                        <div className="p-3 rounded-3 bg-white bg-opacity-5 mb-2 border border-white border-opacity-5">
                                            <span className="text-xs fw-bold text-ai-accent uppercase d-block mb-1 letter-spacing-1">Optimization Note</span>
                                            <p className="smaller mb-0 opacity-80 fw-medium">Consider merging "Data Structures" with "Algorithms" for better conceptual flow in Semester 3.</p>
                                        </div>
                                    </PremiumCard>

                                    <h6 className="fw-bold text-xs text-muted uppercase mb-3 letter-spacing-1">Allocated Faculty</h6>
                                    <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                                        {[1,2,3,4,5].map(i => (
                                            <img key={i} src={`https://ui-avatars.com/api/?name=Prof+${i}&background=random`} className="rounded-circle border border-2 border-white shadow-sm" width="36" height="36" alt="" title={`Prof. ${i}`} />
                                        ))}
                                        <div className="rounded-circle bg-light border border-2 border-white shadow-sm d-flex align-items-center justify-content-center fw-bold small text-muted" style={{ width: '36px', height: '36px' }}>+8</div>
                                    </div>
                                </div>

                                <div className={`p-4 border-top ${darkMode ? 'border-secondary' : 'border-light'} d-grid gap-2`}>
                                    <button className="btn btn-primary-premium rounded-pill py-2 fw-bold shadow-sm" onClick={() => navigate('/curriculum')}>View Full Curriculum Tree</button>
                                    <button className="btn btn-outline-secondary rounded-pill py-2 fw-bold small" onClick={() => setSelectedProgram(null)}>Dismiss Explorer</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .text-ai-accent { color: #7c3aed !important; }
                .shadow-primary-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
                .letter-spacing-1 { letter-spacing: 1px; }
                .hover-lift:hover { transform: translateY(-4px); }
                .ai-shimmer { background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                [data-bs-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>
        </motion.div>
    );
};

export default Programs;
