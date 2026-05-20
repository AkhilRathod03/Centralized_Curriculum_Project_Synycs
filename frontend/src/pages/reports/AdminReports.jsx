import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaChartLine, FaUsers, FaUserTie, FaUniversity, FaCheckCircle, 
    FaBookOpen, FaExclamationTriangle, FaRobot, FaDownload, FaFilter, 
    FaSearch, FaCalendarAlt, FaChartBar, FaArrowUp, FaArrowDown, FaMagic,
    FaFileAlt
} from 'react-icons/fa';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminReports = () => {
    const { darkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState('This Semester');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/reports/admin/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching admin reports:", error);
            toast.error("Failed to load institution intelligence.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format) => {
        toast.info(`Preparing ${format.toUpperCase()} report with institutional branding...`);
        setTimeout(() => {
            toast.success(`Report exported successfully!`);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="p-5 text-center">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="mb-3"
                >
                    <FaRobot size={50} className="text-primary" />
                </motion.div>
                <h5 className="fw-bold">Generating Institution Intelligence...</h5>
                <p className="text-muted small">Aggregating departmental data and running neural analysis</p>
            </div>
        );
    }

    const kpiIcons = [
        <FaUsers />, <FaUserTie />, <FaUniversity />, <FaCheckCircle />, 
        <FaBookOpen />, <FaChartLine />, <FaExclamationTriangle />, <FaMagic />
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`container-fluid py-4 h-100 overflow-auto custom-scrollbar ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            {/* Header Section */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="display-title mb-1 text-gradient-primary">Academic Intelligence Center</h2>
                    <p className="text-muted mb-0 small fw-medium">
                        <FaRobot className="me-2 text-primary" /> AI-Powered Institutional Reporting Workspace
                    </p>
                </div>
                
                <div className="d-flex flex-wrap gap-2">
                    <div className="dropdown">
                        <button className={`btn btn-sm ${darkMode ? 'btn-dark border-secondary' : 'btn-white'} rounded-pill px-3 shadow-sm dropdown-toggle`} type="button" data-bs-toggle="dropdown">
                            <FaCalendarAlt className="me-2 text-primary" /> {dateRange}
                        </button>
                        <ul className={`dropdown-menu ${darkMode ? 'dropdown-menu-dark shadow-lg' : ''} border-0 rounded-4 shadow-sm`}>
                            <li><button className="dropdown-item small" onClick={() => setDateRange('Last 30 Days')}>Last 30 Days</button></li>
                            <li><button className="dropdown-item small" onClick={() => setDateRange('This Semester')}>This Semester</button></li>
                            <li><button className="dropdown-item small" onClick={() => setDateRange('Last Semester')}>Last Semester</button></li>
                            <li><button className="dropdown-item small" onClick={() => setDateRange('Full Year')}>Full Year</button></li>
                        </ul>
                    </div>
                    
                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary-premium rounded-pill px-4 d-flex align-items-center gap-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <FaDownload /> Export Intelligence
                        </button>
                        <ul className={`dropdown-menu ${darkMode ? 'dropdown-menu-dark' : ''} border-0 rounded-4 shadow-lg`}>
                            <li><button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleExport('pdf')}><FaFileAlt className="text-danger" /> Institutional PDF</button></li>
                            <li><button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleExport('excel')}><FaChartBar className="text-success" /> Academic Excel</button></li>
                            <li><button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleExport('csv')}><FaFileAlt className="text-primary" /> Raw CSV Data</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* KPI Analytics Cards */}
            <div className="row g-3 mb-4">
                {reportData?.kpi.map((kpi, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-md-4 col-xl-3">
                        <motion.div 
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`card-modern h-100 p-3 border-0 shadow-sm ${darkMode ? 'bg-glass-dark' : 'bg-white'}`}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className={`p-2 rounded-3 bg-${kpi.color} bg-opacity-10 text-${kpi.color} d-flex align-items-center justify-content-center`} style={{ width: '42px', height: '42px' }}>
                                    {React.cloneElement(kpiIcons[idx % kpiIcons.length], { size: 20 })}
                                </div>
                                <div className={`small fw-bold d-flex align-items-center gap-1 ${kpi.trend.startsWith('+') ? 'text-success' : kpi.trend.startsWith('-') ? 'text-danger' : 'text-muted'}`}>
                                    {kpi.trend.startsWith('+') ? <FaArrowUp size={10} /> : kpi.trend.startsWith('-') ? <FaArrowDown size={10} /> : null}
                                    {kpi.trend}
                                </div>
                            </div>
                            <h3 className="fw-bold mb-0" style={{ letterSpacing: '-1px' }}>{kpi.value}</h3>
                            <p className="text-muted smaller text-uppercase fw-bold mb-0 opacity-75">{kpi.title}</p>
                            
                            {/* Mini trend indicator bar */}
                            <div className="progress mt-3" style={{ height: '3px', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <div className={`progress-bar bg-${kpi.color}`} style={{ width: '65%' }}></div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Academic Performance Trends */}
                <div className="col-lg-8">
                    <div className={`card-modern p-4 h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold mb-1">Academic Performance Trends</h5>
                                <p className="text-muted smaller mb-0">Monthly monitoring of attendance vs grade index</p>
                            </div>
                            <div className="d-flex gap-2">
                                <div className="d-flex align-items-center gap-2 smaller fw-bold">
                                    <span className="p-1 rounded-circle bg-primary" style={{ width: '10px', height: '10px' }}></span> Attendance
                                </div>
                                <div className="d-flex align-items-center gap-2 smaller fw-bold">
                                    <span className="p-1 rounded-circle bg-ai-accent" style={{ width: '10px', height: '10px' }}></span> Performance
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ height: '320px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reportData?.academic_trends}>
                                    <defs>
                                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--ai-accent)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--ai-accent)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--card-shadow-hover)' }} />
                                    <Area type="monotone" dataKey="attendance" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                                    <Area type="monotone" dataKey="performance" stroke="var(--ai-accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorPerf)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* AI Intelligence Section */}
                <div className="col-lg-4">
                    <div className="ai-neon-card rounded-4 p-4 h-100 text-white">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-ai-gradient p-2 rounded-circle shadow-lg">
                                <FaRobot size={28} />
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0">Neural Insights</h5>
                                <p className="text-muted smaller mb-0" style={{ color: 'rgba(255,255,255,0.5) !important' }}>Real-time institutional diagnostics</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {reportData?.ai_insights.map((insight, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx} 
                                    className="d-flex gap-3 mb-4 align-items-start"
                                >
                                    <div className={`mt-1 p-1 rounded-circle ${idx === 0 ? 'bg-danger' : idx === 1 ? 'bg-warning' : 'bg-primary'}`} style={{ width: '8px', height: '8px', boxShadow: '0 0 10px currentColor' }}></div>
                                    <p className="small mb-0 opacity-90">{insight}</p>
                                </motion.div>
                            ))}
                        </div>
                        
                        <button className="btn bg-ai-gradient text-white w-100 rounded-pill py-2 mt-3 fw-bold border-0 shadow-lg hover-lift">
                            Run Institutional Deep Scan
                        </button>
                    </div>
                </div>
            </div>

            {/* Department Comparison Table */}
            <div className={`card-modern mb-4 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h5 className="fw-bold mb-0">Department Comparative Analytics</h5>
                    <div className="d-flex gap-2">
                        <div className="input-group input-group-sm rounded-pill border overflow-hidden" style={{ width: '300px' }}>
                            <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-muted' : 'bg-light text-muted'}`}><FaSearch /></span>
                            <input 
                                type="text" 
                                className={`form-control border-0 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`} 
                                placeholder="Search departments..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-pill px-3`}><FaFilter /> Filters</button>
                    </div>
                </div>
                
                <div className="table-responsive">
                    <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                        <thead className={darkMode ? 'table-dark' : 'table-light'}>
                            <tr>
                                <th className="ps-4 py-3 smaller text-uppercase fw-bold text-muted">Department Name</th>
                                <th className="py-3 smaller text-uppercase fw-bold text-muted text-center">Attendance %</th>
                                <th className="py-3 smaller text-uppercase fw-bold text-muted text-center">Performance Index</th>
                                <th className="py-3 smaller text-uppercase fw-bold text-muted text-center">AI Risk Status</th>
                                <th className="pe-4 py-3 smaller text-uppercase fw-bold text-muted text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData?.department_comparison.map((dept, idx) => (
                                <tr key={idx} className="transition-all">
                                    <td className="ps-4 fw-bold">{dept.name}</td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                                                <div className={`progress-bar ${dept.attendance > 90 ? 'bg-success' : dept.attendance > 80 ? 'bg-primary' : 'bg-danger'}`} style={{ width: `${dept.attendance}%` }}></div>
                                            </div>
                                            <span className="smaller fw-bold">{dept.attendance}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                                                <div className={`progress-bar ${dept.performance > 85 ? 'bg-ai-accent' : dept.performance > 75 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${dept.performance}%` }}></div>
                                            </div>
                                            <span className="smaller fw-bold">{dept.performance}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill px-3 py-1 ${dept.risk === 'High' ? 'bg-danger bg-opacity-10 text-danger border border-danger' : dept.risk === 'Medium' ? 'bg-warning bg-opacity-10 text-warning border border-warning' : 'bg-success bg-opacity-10 text-success border border-success'} border-opacity-25`}>
                                            {dept.risk} Risk
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'} btn-icon-sm`} title="Detailed Analytics"><FaChartLine /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Institutional Health Score Widget */}
            <div className={`card-modern p-4 mb-4 text-white bg-ai-gradient border-0 shadow-lg`}>
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h4 className="fw-bold mb-2">Institutional Health Score: 84/100</h4>
                        <p className="small mb-0 opacity-90">Your institution is performing 12% better than the national benchmark for 2026. Academic engagement is at its peak in the AI & ML department.</p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <button className="btn btn-white rounded-pill px-4 fw-bold">View Full Audit</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminReports;
