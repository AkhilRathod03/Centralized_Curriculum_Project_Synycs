import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaSearch, FaFilter, FaExclamationTriangle, FaRobot, FaDownload, FaEye, FaEdit, FaArchive, FaChartPie, FaCheckCircle, FaClock, FaTimes, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminAssignments = () => {
    const { darkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showAIReport, setShowAIReport] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const kpiData = [
        { title: 'Total Assignments', value: '1,248', icon: <FaFileAlt />, trend: '+12%', color: 'primary' },
        { title: 'Submission Rate', value: '84.2%', icon: <FaCheckCircle />, trend: '+2.1%', color: 'success' },
        { title: 'Pending Reviews', value: '342', icon: <FaClock />, trend: '-5%', color: 'warning' },
        { title: 'AI Risk Alerts', value: '18', icon: <FaExclamationTriangle />, trend: 'Needs Action', color: 'danger' },
    ];

    const mockAssignments = [
        { id: 'ASN-001', title: 'Data Structures Capstone', course: 'CS301', faculty: 'Dr. Smith', due: '2026-05-20', submitRate: '92%', status: 'Active', risk: 'Low', dept: 'Computer Science' },
        { id: 'ASN-002', title: 'Machine Learning Model', course: 'AI402', faculty: 'Dr. Chen', due: '2026-05-22', submitRate: '68%', status: 'Active', risk: 'High', dept: 'Artificial Intelligence' },
        { id: 'ASN-003', title: 'Ethics in Tech Essay', course: 'HUM201', faculty: 'Prof. Davis', due: '2026-05-18', submitRate: '100%', status: 'Completed', risk: 'Medium', dept: 'Humanities' },
    ];

    const handleExport = () => {
        toast.success('Generating institutional assignment report...');
    };

    const handleAIAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        toast.info('Neural engine is scanning 1,248 assignments across all departments...');
        
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            toast.success('Institution-wide AI analysis complete!');
        }, 3000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Institution Assignments HQ</h2>
                    <p className="text-muted mb-0 small">Centralized monitoring and AI intelligence workspace</p>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={handleExport} className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} d-flex align-items-center gap-2 px-3`}>
                        <FaDownload /> Export Report
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

            {/* Workspace & Search */}
            <div className={`card border-0 shadow-sm rounded-4 mb-4 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                <div className={`card-header border-bottom-0 bg-transparent pt-4 pb-0 px-4 d-flex justify-content-between align-items-center`}>
                    <h5 className="fw-bold mb-0">Global Assignment Registry</h5>
                    <div className="d-flex gap-2">
                        <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ width: '250px', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <span className={`input-group-text border-0 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}><FaSearch /></span>
                            <input 
                                type="text" 
                                className={`form-control border-0 ${darkMode ? 'bg-dark text-light placeholder-light' : 'bg-light text-dark'}`} 
                                placeholder="Search assignments..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-pill px-3 d-flex align-items-center gap-2`}>
                            <FaFilter /> Filters
                        </button>
                    </div>
                </div>
                <div className="card-body p-0 mt-3">
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                            <thead className={darkMode ? 'table-dark' : 'table-light'}>
                                <tr>
                                    <th className="ps-4 fw-semibold text-muted small text-uppercase">Title</th>
                                    <th className="fw-semibold text-muted small text-uppercase">Course</th>
                                    <th className="fw-semibold text-muted small text-uppercase">Faculty</th>
                                    <th className="fw-semibold text-muted small text-uppercase">Due Date</th>
                                    <th className="fw-semibold text-muted small text-uppercase">Submit %</th>
                                    <th className="fw-semibold text-muted small text-uppercase">AI Risk</th>
                                    <th className="text-end pe-4 fw-semibold text-muted small text-uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockAssignments.map((asn, idx) => (
                                    <tr key={idx} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                        <td className="ps-4">
                                            <div className="fw-semibold">{asn.title}</div>
                                            <div className="small text-muted">{asn.id}</div>
                                        </td>
                                        <td><span className={`badge ${darkMode ? 'bg-secondary bg-opacity-50 text-light' : 'bg-light text-dark'} rounded-pill border`}>{asn.course}</span></td>
                                        <td>{asn.faculty}</td>
                                        <td className="small">{asn.due}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-primary" style={{ width: asn.submitRate }}></div>
                                                </div>
                                                <span className="small fw-bold">{asn.submitRate}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill bg-${asn.risk === 'High' ? 'danger' : asn.risk === 'Medium' ? 'warning' : 'success'} bg-opacity-10 text-${asn.risk === 'High' ? 'danger' : asn.risk === 'Medium' ? 'warning' : 'success'} border border-${asn.risk === 'High' ? 'danger' : asn.risk === 'Medium' ? 'warning' : 'success'} border-opacity-25 px-2 py-1 small`}>
                                                {asn.risk === 'High' && <FaExclamationTriangle className="me-1" />}
                                                {asn.risk} Risk
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group btn-group-sm">
                                                <button onClick={() => setSelectedAssignment(asn)} className={`btn btn-link text-${darkMode ? 'light' : 'dark'} p-1`} title="View"><FaEye /></button>
                                                <button onClick={() => { setSelectedAssignment(asn); setShowAIReport(true); }} className="btn btn-link text-primary p-1" title="AI Report"><FaRobot /></button>
                                                <button onClick={() => toast.info(`Archiving ${asn.id}...`)} className={`btn btn-link text-${darkMode ? 'secondary' : 'muted'} p-1`} title="Archive"><FaArchive /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* AI Insights Section */}
            <div className={`card border-0 shadow-sm rounded-4 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-primary bg-opacity-10 border-primary'} border border-opacity-25`}>
                <div className="card-body p-4 d-flex align-items-start gap-3">
                    <div className="bg-primary text-white p-3 rounded-circle shadow-primary-glow">
                        <FaRobot size={24} />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1">AI Intelligence Report</h6>
                        <p className="small text-muted mb-0">System analysis indicates a potential plagiarism pattern in CS301 submissions. High difficulty level detected for AI402 which correlates with the low 68% submission rate. Suggesting faculty review of AI402 rubric.</p>
                    </div>
                </div>
            </div>

            {/* Admin Detail Drawer */}
            <AnimatePresence>
                {selectedAssignment && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedAssignment(null); setShowAIReport(false); }} className="position-fixed top-0 start-0 w-100 h-100 z-1050" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`position-fixed top-0 end-0 h-100 z-1060 shadow-lg ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`} style={{ width: '500px', maxWidth: '100%' }}>
                            <div className="p-4 h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">{showAIReport ? 'AI Analysis Report' : 'Assignment Overview'}</h4>
                                    <button onClick={() => { setSelectedAssignment(null); setShowAIReport(false); }} className={`btn btn-sm rounded-circle ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}><FaTimes /></button>
                                </div>
                                <div className="flex-grow-1 overflow-auto custom-scrollbar pe-2">
                                    {!showAIReport ? (
                                        <div className="space-y-4">
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="badge bg-primary bg-opacity-10 text-primary">{selectedAssignment.course}</span>
                                                    <span className="small text-muted">{selectedAssignment.dept}</span>
                                                </div>
                                                <h5 className="fw-bold">{selectedAssignment.title}</h5>
                                                <p className="small text-muted">Managed by <strong>{selectedAssignment.faculty}</strong></p>
                                            </div>
                                            <div className="row g-3 mb-4">
                                                <div className="col-6">
                                                    <div className={`p-3 rounded-3 border ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <small className="text-muted d-block mb-1">Submission Rate</small>
                                                        <span className="fw-bold text-success fs-5">{selectedAssignment.submitRate}</span>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className={`p-3 rounded-3 border ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <small className="text-muted d-block mb-1">Security Risk</small>
                                                        <span className={`fw-bold fs-5 ${selectedAssignment.risk === 'High' ? 'text-danger' : 'text-success'}`}>{selectedAssignment.risk}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <h6 className="fw-bold small text-uppercase text-muted mb-3">Institutional Performance</h6>
                                                <div className={`p-3 rounded-4 border ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-light'}`}>
                                                    <div className="d-flex align-items-center gap-3 mb-3">
                                                        <FaChartLine className="text-primary" />
                                                        <div>
                                                            <div className="small fw-bold">Growth Trend</div>
                                                            <div className="small text-muted">+14% engagement vs last year</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <FaShieldAlt className="text-success" />
                                                        <div>
                                                            <div className="small fw-bold">Compliance</div>
                                                            <div className="small text-muted">All rubrics meet university standards</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className={`p-4 rounded-4 border ${darkMode ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : 'bg-primary bg-opacity-10'}`}>
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <FaRobot className="text-primary fs-3" />
                                                    <h6 className="fw-bold mb-0">Deep Analysis: {selectedAssignment.id}</h6>
                                                </div>
                                                <p className="small mb-0">Our neural engine has identified a <strong>{selectedAssignment.risk === 'High' ? 'critical' : 'minor'}</strong> anomaly in the submission timeline for this course.</p>
                                            </div>
                                            <div className="mt-4">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted">AI Detections</h6>
                                                <div className="space-y-3">
                                                    <div className={`p-3 rounded-3 border-start border-4 border-danger ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm mb-2`}>
                                                        <div className="fw-bold small">Plagiarism Clusters</div>
                                                        <p className="small text-muted mb-0">3 groups of students sharing similar code structures in Module 2.</p>
                                                    </div>
                                                    <div className={`p-3 rounded-3 border-start border-4 border-warning ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm mb-2`}>
                                                        <div className="fw-bold small">Difficulty Spike</div>
                                                        <p className="small text-muted mb-0">80% of students failed the mid-assignment check-in. Rubric may be too rigid.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary w-100 rounded-pill mt-4 shadow-primary-glow">Generate Full Faculty Report</button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-top">
                                    <button onClick={() => { setSelectedAssignment(null); setShowAIReport(false); }} className={`btn w-100 rounded-pill py-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>Close Overview</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="mb-4"
                            >
                                <FaRobot size={80} className="text-primary mx-auto" />
                            </motion.div>
                            <h3 className="fw-bold mb-2">Neural Pattern Analysis in Progress</h3>
                            <p className="opacity-75 mb-4">Scanning 1,248 submissions for plagiarism, difficulty anomalies, and engagement gaps...</p>
                            <div className="progress rounded-pill mx-auto mb-4" style={{ height: '6px', width: '300px' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3 }}
                                    className="progress-bar bg-primary shadow-primary-glow"
                                />
                            </div>
                            <div className="small text-muted fst-italic">Analyzing institutional benchmarks...</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Analysis Results Modal */}
            <AnimatePresence>
                {analysisComplete && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2900 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`modal-content border-0 rounded-4 shadow-2xl ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                                <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between">
                                    <h4 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaRobot className="text-primary" /> Institution Intelligence Report</h4>
                                    <button onClick={() => setAnalysisComplete(false)} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className={`p-3 rounded-4 border h-100 ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light'}`}>
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Risk Anomalies</h6>
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <span className="badge bg-danger p-2 rounded-circle"><FaExclamationTriangle /></span>
                                                    <div className="small fw-semibold">High Plagiarism Cluster detected in <strong>AI402</strong> (Module 2)</div>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="badge bg-warning p-2 rounded-circle text-dark"><FaClock /></span>
                                                    <div className="small fw-semibold">Difficulty spike in <strong>CS301</strong> (85% failure on check-in)</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className={`p-3 rounded-4 border h-100 ${darkMode ? 'bg-primary bg-opacity-5 border-primary border-opacity-25' : 'bg-primary bg-opacity-5 border-primary border-opacity-10'}`}>
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted">AI Recommendations</h6>
                                                <ul className="small space-y-2 mb-0 ps-3">
                                                    <li className="mb-2">Adjust rubric for CS301 to accommodate slower conceptual pace.</li>
                                                    <li className="mb-2">Flag AI402 for manual audit of submission source code.</li>
                                                    <li>Distribute auto-study guides to 342 students at risk of delay.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button onClick={() => setAnalysisComplete(false)} className="btn btn-primary w-100 rounded-pill py-2 shadow-primary-glow">Deploy Intelligence Interventions</button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminAssignments;

