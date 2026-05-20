import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCheck, FaUserTimes, FaExclamationCircle, FaRobot, FaCalendarCheck, FaPercentage, FaExclamationTriangle, FaShieldAlt, FaTimes, FaCheck } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const StudentAttendance = () => {
    const { darkMode } = useContext(ThemeContext);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const kpiData = [
        { title: 'Overall Attendance', value: '82%', icon: <FaPercentage />, color: 'primary' },
        { title: 'Safe Subjects', value: '4/5', icon: <FaShieldAlt />, color: 'success' },
        { title: 'Classes Missed', value: '8', icon: <FaUserTimes />, color: 'warning' },
        { title: 'Critical Subjects', value: '1', icon: <FaExclamationCircle />, color: 'danger' },
    ];

    const subjects = [
        { id: 1, name: 'Data Structures', attended: 35, total: 40, percentage: 87.5, required: 75, status: 'Safe', color: 'success' },
        { id: 2, name: 'Operating Systems', attended: 28, total: 40, percentage: 70.0, required: 75, status: 'Critical', color: 'danger' },
        { id: 3, name: 'Database Systems', attended: 32, total: 40, percentage: 80.0, required: 75, status: 'Warning', color: 'warning' },
        { id: 4, name: 'Computer Networks', attended: 38, total: 40, percentage: 95.0, required: 75, status: 'Safe', color: 'success' },
        { id: 5, name: 'Machine Learning', attended: 34, total: 40, percentage: 85.0, required: 75, status: 'Safe', color: 'success' },
    ];

    // Data for the overall donut chart
    const pieData = [
        { name: 'Attended', value: 167, color: '#10b981' },
        { name: 'Missed', value: 33, color: '#ef4444' }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>My Attendance</h2>
                    <p className="text-muted mb-0 small">Track your presence, requirements, and AI alerts.</p>
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
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className={`text-${kpi.color} bg-${kpi.color} bg-opacity-10 p-2 rounded-3 d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                                        {React.cloneElement(kpi.icon, { size: 18 })}
                                    </div>
                                    <h3 className="fw-bold mb-0 fs-3">{kpi.value}</h3>
                                </div>
                                <p className="text-muted small mb-0 fw-semibold">{kpi.title}</p>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* Subject Cards */}
                    <div className="space-y-3">
                        <h5 className="fw-bold mb-3">Subject-wise Analytics</h5>
                        {subjects.map((sub) => (
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelectedSubject(sub)}
                                key={sub.id} 
                                className={`card border-0 shadow-sm rounded-4 cursor-pointer ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-white border-light'}`}
                                style={{ border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                            >
                                <div className="card-body p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <h6 className="fw-bold mb-1">{sub.name}</h6>
                                            <div className="small text-muted">Req: {sub.required}%</div>
                                        </div>
                                        <div className="col-md-5 mb-3 mb-md-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                                    <div className={`progress-bar bg-${sub.color}`} style={{ width: `${sub.percentage}%` }}></div>
                                                </div>
                                                <span className="fw-bold">{sub.percentage}%</span>
                                            </div>
                                            <div className="small text-muted mt-1 text-center">{sub.attended} / {sub.total} Classes Attended</div>
                                        </div>
                                        <div className="col-md-3 text-md-end">
                                            <span className={`badge rounded-pill bg-${sub.color} bg-opacity-10 text-${sub.color} border border-${sub.color} border-opacity-25 px-3 py-2 fw-bold`}>
                                                {sub.status === 'Critical' && <FaExclamationTriangle className="me-1" />}
                                                {sub.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* AI Advisor & Summary */}
                    <div className="space-y-4">
                        <div className={`card border-0 shadow-sm rounded-4 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-info bg-opacity-10 border-info'} border border-opacity-25`}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaRobot className="text-info" /> AI Attendance Advisor</h6>
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'} mb-3`}>
                                    <h6 className="fw-semibold small mb-1 text-danger">Operating Systems Action Required</h6>
                                    <p className="small text-muted mb-0">You are at 70%. You <strong>MUST</strong> attend the next 3 consecutive classes to reach the safe zone (75%).</p>
                                </div>
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-success">Computer Networks Status</h6>
                                    <p className="small text-muted mb-0">Excellent attendance (95%). It is safe to miss 2 classes for medical reasons if needed.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`card border-0 shadow-sm rounded-4 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                            <div className="card-body p-4 text-center">
                                <h6 className="fw-bold mb-3">Overall Distribution</h6>
                                <div style={{ height: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#000' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="d-flex justify-content-center gap-4 mt-2">
                                    <div className="d-flex align-items-center gap-2"><div className="rounded-circle bg-success" style={{width: '10px', height: '10px'}}></div> <small>Attended</small></div>
                                    <div className="d-flex align-items-center gap-2"><div className="rounded-circle bg-danger" style={{width: '10px', height: '10px'}}></div> <small>Missed</small></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Detail Drawer */}
            <AnimatePresence>
                {selectedSubject && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSubject(null)} className="position-fixed top-0 start-0 w-100 h-100 z-1050" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`position-fixed top-0 end-0 h-100 z-1060 shadow-lg ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`} style={{ width: '450px', maxWidth: '100%' }}>
                            <div className="p-4 h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">Subject Details</h4>
                                    <button onClick={() => setSelectedSubject(null)} className={`btn btn-sm rounded-circle ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}><FaTimes /></button>
                                </div>
                                
                                <div className="flex-grow-1 overflow-auto custom-scrollbar pe-2">
                                    <div className="mb-4">
                                        <h3 className="fw-bold">{selectedSubject.name}</h3>
                                        <div className="d-flex gap-2 mt-2">
                                            <span className={`badge bg-${selectedSubject.color} bg-opacity-10 text-${selectedSubject.color}`}>Current: {selectedSubject.percentage}%</span>
                                            <span className="badge bg-secondary bg-opacity-10 text-muted">Required: 75%</span>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-4 border mb-4 text-center ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-light border-light'}`}>
                                        <h1 className={`fw-bold display-4 text-${selectedSubject.color} mb-0`}>{selectedSubject.attended}/{selectedSubject.total}</h1>
                                        <p className="text-muted small fw-semibold text-uppercase mb-0 mt-2">Classes Attended</p>
                                    </div>

                                    <h6 className="fw-bold mb-3">AI Projection</h6>
                                    {selectedSubject.status === 'Critical' ? (
                                        <div className="alert alert-danger border-0 rounded-4 p-3 d-flex gap-3">
                                            <FaExclamationTriangle size={24} className="mt-1 flex-shrink-0" />
                                            <div>
                                                <strong>Severe Shortage</strong>
                                                <p className="small mb-0 mt-1">To reach 75%, you must attend the next 3 classes without absence. Next class is tomorrow at 10:00 AM.</p>
                                            </div>
                                        </div>
                                    ) : selectedSubject.status === 'Warning' ? (
                                        <div className="alert alert-warning border-0 rounded-4 p-3 d-flex gap-3 text-dark">
                                            <FaExclamationCircle size={24} className="mt-1 flex-shrink-0" />
                                            <div>
                                                <strong>Borderline Safe</strong>
                                                <p className="small mb-0 mt-1">You are just above the threshold. Missing 2 classes will push you into the critical zone.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-success border-0 rounded-4 p-3 d-flex gap-3">
                                            <FaShieldAlt size={24} className="mt-1 flex-shrink-0" />
                                            <div>
                                                <strong>Excellent Standing</strong>
                                                <p className="small mb-0 mt-1">Your attendance is perfect. Keep up the good work!</p>
                                            </div>
                                        </div>
                                    )}

                                    <h6 className="fw-bold mt-4 mb-3">Recent Timeline</h6>
                                    <div className="space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`p-2 rounded-3 border small d-flex justify-content-between align-items-center ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-white'}`}>
                                                <span>May {18 - i}, 2026</span>
                                                {i === 0 && selectedSubject.status === 'Critical' ? 
                                                    <span className="text-danger fw-bold"><FaTimes /> Absent</span> : 
                                                    <span className="text-success fw-bold"><FaCheck /> Present</span>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-top">
                                    <button onClick={() => setSelectedSubject(null)} className={`btn w-100 rounded-pill py-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>Close Overview</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default StudentAttendance;
