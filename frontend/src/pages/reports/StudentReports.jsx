import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
    FaGraduationCap, FaCheckCircle, FaBook, FaExclamationTriangle, 
    FaRobot, FaChartLine, FaDownload, FaBrain, FaChartBar
} from 'react-icons/fa';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentReports = () => {
    const { darkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/reports/student/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching student reports:", error);
            toast.error("Failed to load your academic profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            setDownloading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/reports/student/resume/', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Career_Profile_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("AI Career Profile downloaded!");
        } catch (error) {
            console.error("Error downloading report:", error);
            toast.error("Failed to generate AI profile.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`container-fluid py-4 h-100 overflow-auto custom-scrollbar ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Academic Intelligence</h2>
                    <p className="text-muted small mb-0">Personalized performance tracking and AI career readiness</p>
                </div>
                <button 
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="btn btn-primary rounded-pill px-4 shadow-primary-glow d-flex align-items-center gap-2"
                >
                    {downloading ? <span className="spinner-border spinner-border-sm"></span> : <FaDownload />}
                    {downloading ? 'Processing AI...' : 'Download Resume Report'}
                </button>
            </div>

            {/* Student KPI Cards */}
            <div className="row g-3 mb-4">
                {reportData?.kpi.map((kpi, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-lg-2-4" style={{ flex: '0 0 20%', maxWidth: '20%' }}>
                        <div className={`card-modern p-3 border-0 shadow-sm ${darkMode ? 'bg-glass-dark' : 'bg-white'}`}>
                            <h4 className="fw-bold mb-0 text-primary">{kpi.value}</h4>
                            <p className="text-muted smaller mb-0 fw-semibold text-uppercase opacity-75">{kpi.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Subject Performance Radar */}
                <div className="col-lg-7">
                    <div className={`card-modern p-4 h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                        <h5 className="fw-bold mb-4">Skill & Subject Proficiency</h5>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={reportData?.subject_performance}>
                                    <PolarGrid stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                    <Radar name="Attendance" dataKey="attendance" stroke="var(--ai-accent)" fill="var(--ai-accent)" fillOpacity={0.3} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* AI Academic Advisor */}
                <div className="col-lg-5">
                    <div className={`card-modern p-4 h-100 border-0 bg-ai-gradient text-white shadow-lg`}>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-white bg-opacity-20 p-2 rounded-circle">
                                <FaBrain size={24} />
                            </div>
                            <h5 className="fw-bold mb-0 text-white">AI Academic Advisor</h5>
                        </div>
                        <div className="space-y-4">
                            {reportData?.ai_insights.map((insight, idx) => (
                                <div key={idx} className="glass-card p-3 mb-3 border-0">
                                    <div className="d-flex gap-3 align-items-start">
                                        <FaRobot className="mt-1" />
                                        <p className="small mb-0 text-white opacity-90">{insight}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-white w-100 rounded-pill mt-3 fw-bold">
                            Generate Personalized Study Plan
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentReports;
