import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaChalkboardTeacher, FaSearch, FaFilter, FaFileExport, FaCheckCircle, 
    FaClock, FaExclamationTriangle, FaChartLine, FaRobot, FaEllipsisV,
    FaEye, FaBrain, FaChartPie, FaArrowUp, FaArrowDown, FaPlus, FaBriefcase
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import PremiumCard from '../../components/common/PremiumCard';
import PageHeader from '../../components/common/PageHeader';

const TeachersPage = () => {
    const { darkMode } = useContext(ThemeContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('auth/institutions/users/');
            const allUsers = res.data.results || res.data;
            setTeachers(allUsers.filter(u => u.role === 'teacher'));
        } catch (err) {
            toast.error('Failed to access faculty database');
        } finally {
            setLoading(false);
        }
    };

    const workloadData = [
        { name: 'Prof. Akhil', workload: 85 },
        { name: 'Prof. Kumar', workload: 65 },
        { name: 'Prof. Rao', workload: 92 },
        { name: 'Prof. Smith', workload: 45 },
    ];

    const stats = [
        { label: 'Total Faculty', value: teachers.length, trend: 'Stable', color: '#7c3aed', icon: <FaChalkboardTeacher /> },
        { label: 'Active Faculty', value: teachers.filter(t => t.is_approved).length, trend: '+2', color: '#10b981', icon: <FaCheckCircle /> },
        { label: 'Avg Workload', value: '74%', trend: '+5%', color: '#2563eb', icon: <FaBriefcase /> },
        { label: 'AI Alerts', value: '2', trend: 'Critical', color: '#ef4444', icon: <FaRobot /> }
    ];

    return (
        <div className="pb-5 px-lg-4">
            <PageHeader 
                title="Faculty Intelligence HQ"
                subtitle="Manage institutional faculty, workloads, and teaching effectiveness"
                actions={[
                    { label: 'Export Roster', icon: <FaFileExport />, variant: 'secondary' },
                    { label: 'Onboard Faculty', icon: <FaPlus />, variant: 'primary' }
                ]}
            />

            {/* KPI Section */}
            <div className="row g-4 mb-4">
                {stats.map((stat, i) => (
                    <div key={i} className="col-md-3">
                        <PremiumCard className="h-100 border-0 shadow-sm">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-2 rounded-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <span className={`badge rounded-pill bg-opacity-10 text-${stat.trend === 'Critical' ? 'danger' : 'success'} bg-${stat.trend === 'Critical' ? 'danger' : 'success'} small`}>{stat.trend}</span>
                            </div>
                            <h3 className="fw-bold mb-1">{stat.value}</h3>
                            <p className="text-muted small mb-0 fw-bold uppercase letter-spacing-1">{stat.label}</p>
                        </PremiumCard>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Faculty Directory */}
                <div className="col-lg-8">
                    <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden">
                        <div className={`p-4 border-bottom d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-30'}`}>
                            <h6 className="fw-bold mb-0">Faculty Roster</h6>
                            <div className="input-group glass rounded-pill border shadow-sm" style={{ maxWidth: '250px' }}>
                                <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={12} /></span>
                                <input 
                                    type="text" 
                                    className={`form-control bg-transparent border-0 shadow-none py-1 small ${darkMode ? 'text-white' : ''}`} 
                                    placeholder="Search faculty..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                                <thead className="bg-transparent text-muted small uppercase">
                                    <tr>
                                        <th className="ps-4 py-3">Faculty Entity</th>
                                        <th className="py-3">Workload</th>
                                        <th className="py-3 text-center">AI Score</th>
                                        <th className="pe-4 py-3 text-end">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map(t => (
                                        <tr key={t.id} className="cursor-pointer" onClick={() => { setSelectedTeacher(t); setShowDrawer(true); }}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <img src={`https://ui-avatars.com/api/?name=${t.username}&background=7c3aed&color=fff`} className="rounded-circle border border-2 border-white shadow-sm me-3" width="36" height="36" alt="" />
                                                    <div>
                                                        <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{t.username}</div>
                                                        <div className="text-muted text-xs">Senior Professor • CS</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress flex-grow-1" style={{ height: '4px', maxWidth: '80px' }}>
                                                        <div className="progress-bar bg-ai-accent" style={{ width: '75%' }}></div>
                                                    </div>
                                                    <span className="small fw-bold">75%</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill bg-ai-gradient bg-opacity-10 text-ai-accent border border-ai-accent border-opacity-10 px-3">9.2</span>
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

                {/* AI Workload Analysis */}
                <div className="col-lg-4">
                    <PremiumCard className="border-0 shadow-lg h-100 p-4">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FaRobot className="text-ai-accent fs-4" />
                            <h6 className="fw-bold mb-0">Neural Workload Audit</h6>
                        </div>
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="workload" fill="url(#workloadGradient)" radius={[0, 4, 4, 0]} />
                                    <defs>
                                        <linearGradient id="workloadGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#7c3aed" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="p-3 rounded-4 bg-danger bg-opacity-5 border border-danger border-opacity-10">
                                <p className="smaller mb-0 text-danger fw-bold uppercase mb-1">Critical Workload</p>
                                <p className="smaller mb-0 opacity-75 fw-medium">Prof. Rao exceeds 90% capacity. AI suggests reallocating Course CS402.</p>
                            </div>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Faculty Profile Drawer */}
            <AnimatePresence>
                {showDrawer && selectedTeacher && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDrawer(false)}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2000"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className={`position-fixed top-0 end-0 h-100 shadow-2xl z-2001 overflow-hidden ${darkMode ? 'bg-dark' : 'bg-white'}`}
                            style={{ width: '450px', maxWidth: '90vw' }}
                        >
                            <div className="h-100 d-flex flex-column">
                                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">Faculty Profile</h5>
                                    <button onClick={() => setShowDrawer(false)} className="btn btn-close shadow-none"></button>
                                </div>
                                <div className="p-4 overflow-auto custom-scrollbar flex-grow-1">
                                    <div className="text-center mb-4">
                                        <img src={`https://ui-avatars.com/api/?name=${selectedTeacher.username}&background=7c3aed&color=fff`} className="rounded-circle border border-4 border-white shadow-lg mb-3" width="100" height="100" alt="" />
                                        <h4 className="fw-bold mb-1">{selectedTeacher.username}</h4>
                                        <p className="text-muted small uppercase fw-bold">Senior Professor • CSE</p>
                                    </div>

                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaBriefcase className="text-primary" /> Assigned Subjects</h6>
                                    <div className="space-y-2 mb-4">
                                        {['Data Structures', 'Algorithm Design', 'Machine Learning'].map((s, i) => (
                                            <div key={i} className={`p-2 px-3 rounded-pill border ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'} small fw-semibold mb-2`}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>

                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaChartPie className="text-ai-accent" /> Effectiveness Score</h6>
                                    <div className="p-3 rounded-4 bg-ai-gradient bg-opacity-10 border border-ai-accent border-opacity-20">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small fw-bold text-ai-accent uppercase">Student Engagement</span>
                                            <span className="fw-bold">94%</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar bg-ai-gradient" style={{ width: '94%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-top">
                                    <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-primary-glow">Generate Performance Report</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .bg-ai-gradient { background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%); }
                .text-ai-accent { color: #7c3aed; }
                .z-2000 { z-index: 2000; }
                .z-2001 { z-index: 2001; }
            `}</style>
        </div>
    );
};

export default TeachersPage;
