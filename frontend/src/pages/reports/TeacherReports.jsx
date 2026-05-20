import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
    FaChalkboardTeacher, FaStar, FaFileAlt, FaUsers, FaExclamationTriangle, 
    FaRobot, FaChartPie, FaDownload, FaSearch, FaFilter, FaLightbulb
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, Legend, Cell
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherReports = () => {
    const { darkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/reports/teacher/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching teacher reports:", error);
            toast.error("Failed to load academic reports.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 h-100 overflow-auto custom-scrollbar ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Teaching Intelligence HQ</h2>
                    <p className="text-muted small mb-0">Classroom performance and academic growth analytics</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 shadow-primary-glow d-flex align-items-center gap-2">
                    <FaDownload /> Export Gradebook
                </button>
            </div>

            {/* Teacher KPI Cards */}
            <div className="row g-3 mb-4">
                {reportData?.kpi.map((kpi, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-lg-2-4" style={{ flex: '0 0 20%', maxWidth: '20%' }}>
                        <div className={`card-modern p-3 border-0 shadow-sm ${darkMode ? 'bg-glass-dark' : 'bg-white'}`}>
                            <div className={`p-2 rounded-3 bg-${kpi.color} bg-opacity-10 text-${kpi.color} mb-3`} style={{ width: '38px', height: '38px' }}>
                                {kpi.icon === 'calendar' && <FaChalkboardTeacher />}
                                {kpi.icon === 'star' && <FaStar />}
                                {kpi.icon === 'file' && <FaFileAlt />}
                                {kpi.icon === 'users' && <FaUsers />}
                                {kpi.icon === 'alert' && <FaExclamationTriangle />}
                            </div>
                            <h4 className="fw-bold mb-0">{kpi.value}</h4>
                            <p className="text-muted smaller mb-0 fw-semibold">{kpi.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Course Performance Chart */}
                <div className="col-lg-8">
                    <div className={`card-modern p-4 h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                        <h5 className="fw-bold mb-4">Course Analytics Overview</h5>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData?.course_analytics}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                    <XAxis dataKey="course" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend />
                                    <Bar dataKey="avg_marks" name="Avg Marks" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="attendance" name="Attendance %" fill="var(--ai-accent)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* AI Teaching Recommendations */}
                <div className="col-lg-4">
                    <div className={`card-modern p-4 h-100 border-0 ${darkMode ? 'bg-glass-dark' : 'bg-light'}`}>
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FaLightbulb className="text-warning fs-4" />
                            <h5 className="fw-bold mb-0">AI Teaching Insights</h5>
                        </div>
                        <div className="space-y-4">
                            {reportData?.ai_insights.map((insight, idx) => (
                                <div key={idx} className="d-flex gap-3 mb-3">
                                    <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-circle h-fit mt-1">
                                        <FaRobot size={12} />
                                    </div>
                                    <p className="small mb-0 opacity-75">{insight}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-outline-primary w-100 rounded-pill mt-4 border-dashed">
                            Analyze Student Feedback
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TeacherReports;
