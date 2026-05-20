import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCheck, FaExclamationTriangle, FaChartPie, FaDownload, FaRobot, FaSearch, FaFilter, FaUsers, FaChartLine, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AdminAttendance = () => {
    const { darkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);

    const kpiData = [
        { title: 'Overall Attendance', value: '88.5%', icon: <FaUserCheck />, trend: '+1.2%', color: 'success' },
        { title: 'Below Threshold', value: '142', icon: <FaUsers />, trend: 'Needs Action', color: 'danger' },
        { title: "Today's Rate", value: '91.2%', icon: <FaCalendarAlt />, trend: 'Stable', color: 'primary' },
        { title: 'AI Risk Alerts', value: '5', icon: <FaExclamationTriangle />, trend: 'Critical', color: 'warning' },
    ];

    const departmentData = [
        { dept: 'Computer Science', attendance: 92, risk: 'Low' },
        { dept: 'Mechanical', attendance: 85, risk: 'Medium' },
        { dept: 'Civil', attendance: 78, risk: 'High' },
        { dept: 'Electronics', attendance: 88, risk: 'Low' },
    ];

    const monthlyTrends = [
        { name: 'Jan', rate: 95 }, { name: 'Feb', rate: 93 }, { name: 'Mar', rate: 89 }, 
        { name: 'Apr', rate: 85 }, { name: 'May', rate: 88 }
    ];

    const handleAIAnalysis = () => {
        setIsAnalyzing(true);
        toast.info('Neural engine scanning institution-wide attendance patterns...');
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowAIReport(true);
            toast.success('Institution intelligence report generated.');
        }, 3000);
    };

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
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Institution Attendance HQ</h2>
                    <p className="text-muted mb-0 small">Centralized monitoring and predictive AI analytics</p>
                </div>
                <div className="d-flex gap-2">
                    <button className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} d-flex align-items-center gap-2 px-3`}>
                        <FaDownload /> Export PDF
                    </button>
                    <button onClick={handleAIAnalysis} className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-primary-glow px-3">
                        <FaRobot /> Generate AI Analysis
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
                {/* Department Analytics */}
                <div className="col-lg-8">
                    <div className={`card border-0 shadow-sm rounded-4 mb-4 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                        <div className={`card-header border-bottom-0 bg-transparent pt-4 pb-0 px-4 d-flex justify-content-between align-items-center`}>
                            <h5 className="fw-bold mb-0">Department Performance</h5>
                            <div className="d-flex gap-2">
                                <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ width: '250px', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                    <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}><FaSearch /></span>
                                    <input 
                                        type="text" 
                                        className={`form-control border-0 ${darkMode ? 'bg-dark text-light placeholder-light' : 'bg-light text-dark'}`} 
                                        placeholder="Search departments..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 mt-3">
                            <div className="table-responsive">
                                <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                                    <thead className={darkMode ? 'table-dark' : 'table-light'}>
                                        <tr>
                                            <th className="ps-4 fw-semibold text-muted small text-uppercase">Department</th>
                                            <th className="fw-semibold text-muted small text-uppercase">Attendance Rate</th>
                                            <th className="fw-semibold text-muted small text-uppercase">Risk Level</th>
                                            <th className="text-end pe-4 fw-semibold text-muted small text-uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departmentData.map((dept, idx) => (
                                            <tr key={idx} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                                <td className="ps-4 fw-semibold">{dept.dept}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '150px' }}>
                                                            <div className={`progress-bar ${dept.attendance >= 90 ? 'bg-success' : dept.attendance >= 80 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${dept.attendance}%` }}></div>
                                                        </div>
                                                        <span className="small fw-bold">{dept.attendance}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill bg-${dept.risk === 'High' ? 'danger' : dept.risk === 'Medium' ? 'warning text-dark' : 'success'} bg-opacity-10 text-${dept.risk === 'High' ? 'danger' : dept.risk === 'Medium' ? 'warning' : 'success'} border border-${dept.risk === 'High' ? 'danger' : dept.risk === 'Medium' ? 'warning' : 'success'} border-opacity-25 px-2 py-1 small`}>
                                                        {dept.risk} Risk
                                                    </span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <button className={`btn btn-link text-${darkMode ? 'light' : 'dark'} p-1`}><FaChartPie /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="col-lg-4">
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                        <div className="card-header border-0 bg-transparent pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0">Institution Trend</h5>
                        </div>
                        <div className="card-body p-4" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrends}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#aaa' : '#666', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: darkMode ? '#aaa' : '#666', fontSize: 12}} domain={['dataMin - 5', 100]} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#000', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                                    <Area type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className={`mt-4 card border-0 shadow-sm rounded-4 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-primary bg-opacity-10 border-primary'} border border-opacity-25`}>
                <div className="card-body p-4 d-flex align-items-start gap-3">
                    <div className="bg-primary text-white p-3 rounded-circle shadow-primary-glow">
                        <FaRobot size={24} />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1">AI Intelligence Report</h6>
                        <p className="small text-muted mb-0">Analysis indicates a 4% drop in Civil Engineering attendance on Fridays. 142 students across the institution are at critical risk of falling below the 75% mandate before mid-terms. Recommending targeted automated warnings.</p>
                    </div>
                </div>
            </div>

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
                            <h3 className="fw-bold mb-2">Neural Pattern Analysis</h3>
                            <p className="opacity-75 mb-4">Scanning thousands of attendance records for anomalies...</p>
                            <div className="progress rounded-pill mx-auto mb-4" style={{ height: '6px', width: '300px' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} className="progress-bar bg-primary shadow-primary-glow" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Results Modal */}
            <AnimatePresence>
                {showAIReport && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2900 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`modal-content border-0 rounded-4 shadow-2xl ${darkMode ? 'bg-dark text-white border-secondary border border-opacity-20' : 'bg-white'}`}>
                                <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between">
                                    <h4 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaRobot className="text-primary" /> Institutional Risk Radar</h4>
                                    <button onClick={() => setShowAIReport(false)} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className={`p-4 rounded-4 border h-100 ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'}`}>
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Detected Anomalies</h6>
                                                <div className="space-y-3">
                                                    <div className="d-flex align-items-start gap-3">
                                                        <span className="badge bg-danger p-2 rounded-circle mt-1"><FaExclamationTriangle /></span>
                                                        <div>
                                                            <div className="small fw-bold">Critical Shortage: Civil Dept</div>
                                                            <p className="small text-muted mb-0">Consistent Friday drops detected. Average rate is now 78%.</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-start gap-3 mt-3">
                                                        <span className="badge bg-warning text-dark p-2 rounded-circle mt-1"><FaChartLine /></span>
                                                        <div>
                                                            <div className="small fw-bold">Pre-Exam Drop</div>
                                                            <p className="small text-muted mb-0">Institution-wide drop of 2% leading up to mid-terms.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className={`p-4 rounded-4 border h-100 ${darkMode ? 'bg-primary bg-opacity-5 border-primary border-opacity-25' : 'bg-primary bg-opacity-5 border-primary border-opacity-10'}`}>
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted">AI Prescriptions</h6>
                                                <ul className="small space-y-3 mb-0 ps-3">
                                                    <li className="mb-2"><strong>Automated Warning:</strong> Send auto-alerts to the 142 students below threshold.</li>
                                                    <li className="mb-2"><strong>Schedule Review:</strong> Review Friday timetable for Civil Engineering department.</li>
                                                    <li><strong>Faculty Briefing:</strong> Alert HODs regarding the pre-exam attendance drop.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button onClick={() => setShowAIReport(false)} className="btn btn-primary w-100 rounded-pill py-2 shadow-primary-glow">Authorize Interventions</button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default AdminAttendance;
