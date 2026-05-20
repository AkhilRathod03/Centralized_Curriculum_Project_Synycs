import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaUsers, FaSearch, FaFilter, FaFileExport, FaCheckCircle, 
    FaClock, FaExclamationCircle, FaChartLine, FaRobot, FaChalkboardTeacher,
    FaEye, FaBrain, FaChartBar, FaArrowUp, FaArrowDown, FaPlus, FaCommentAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import PremiumCard from '../../components/common/PremiumCard';
import PageHeader from '../../components/common/PageHeader';

const TeacherStudents = () => {
    const { darkMode } = useContext(ThemeContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCourse, setActiveTab] = useState('all');

    const courseData = [
        { name: 'Data Structures', students: 45, avgPerf: 78, attendance: 85 },
        { name: 'Algorithm Design', students: 38, avgPerf: 82, attendance: 92 },
    ];

    const distributionData = [
        { name: 'A Grade', value: 15, color: '#10b981' },
        { name: 'B Grade', value: 25, color: '#2563eb' },
        { name: 'C Grade', value: 10, color: '#f59e0b' },
        { name: 'Risk', value: 5, color: '#ef4444' },
    ];

    useEffect(() => {
        fetchTeacherStudents();
    }, []);

    const fetchTeacherStudents = async () => {
        try {
            setLoading(true);
            // In a real app, this would be a specific endpoint for teacher's students
            const res = await axiosInstance.get('auth/institutions/users/');
            const allUsers = res.data.results || res.data;
            setStudents(allUsers.filter(u => u.role === 'student').slice(0, 10)); // Mocking teacher's students
        } catch (err) {
            toast.error('Failed to load class records');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Enrolled', value: '83', icon: <FaUsers />, color: '#2563eb' },
        { label: 'Class Avg GPA', value: '7.8', icon: <FaChartLine />, color: '#10b981' },
        { label: 'Weak Students', value: '6', icon: <FaExclamationCircle />, color: '#ef4444' },
        { label: 'Attendance %', value: '88%', icon: <FaCheckCircle />, color: '#06b6d4' }
    ];

    return (
        <div className="pb-5 px-lg-4">
            <PageHeader 
                title="Classroom Intelligence"
                subtitle="Monitor performance and engagement of students in your courses"
                actions={[
                    { label: 'Export Gradebook', icon: <FaFileExport />, variant: 'secondary' },
                    { label: 'Bulk Message', icon: <FaCommentAlt />, variant: 'primary' }
                ]}
            />

            {/* KPI Section */}
            <div className="row g-4 mb-4">
                {stats.map((stat, i) => (
                    <div key={i} className="col-md-3">
                        <PremiumCard className="h-100 border-0 shadow-sm">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0">{stat.value}</h4>
                                    <p className="text-muted small mb-0 fw-bold uppercase letter-spacing-1" style={{ fontSize: '0.65rem' }}>{stat.label}</p>
                                </div>
                            </div>
                        </PremiumCard>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Students List */}
                <div className="col-lg-7">
                    <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden">
                        <div className={`p-4 border-bottom d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-30'}`}>
                            <h6 className="fw-bold mb-0">Assigned Students</h6>
                            <div className="input-group glass rounded-pill border shadow-sm" style={{ maxWidth: '220px' }}>
                                <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={12} /></span>
                                <input 
                                    type="text" 
                                    className={`form-control bg-transparent border-0 shadow-none py-1 small ${darkMode ? 'text-white' : ''}`} 
                                    placeholder="Find student..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                                <thead className="bg-transparent text-muted small uppercase">
                                    <tr>
                                        <th className="ps-4 py-3">Student</th>
                                        <th className="py-3 text-center">Attendance</th>
                                        <th className="py-3 text-center">Submissions</th>
                                        <th className="pe-4 py-3 text-end">AI Insight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <img src={`https://ui-avatars.com/api/?name=${s.username}&background=random&color=fff`} className="rounded-circle" width="32" height="32" alt="" />
                                                    <span className="fw-bold small">{s.username}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`fw-bold small ${parseInt(s.id) % 3 === 0 ? 'text-danger' : 'text-success'}`}>{95 - (parseInt(s.id) * 2)}%</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary small px-3">12/15</span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-icon-sm btn-light-ai rounded-circle" title="AI Mastering Prediction"><FaBrain size={12} /></button>
                                                    <button className="btn btn-icon-sm btn-light rounded-circle"><FaEye size={12} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </PremiumCard>
                </div>

                {/* Performance Grade Distribution */}
                <div className="col-lg-5">
                    <PremiumCard className="border-0 shadow-lg h-100 p-4">
                        <h6 className="fw-bold mb-4">Grade Distribution Cluster</h6>
                        <div style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={distributionData} 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-4 p-3 rounded-4 bg-ai-gradient bg-opacity-5 border border-ai-accent border-opacity-10">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <FaRobot className="text-ai-accent" />
                                <span className="small fw-bold text-ai-accent uppercase">Neural Teaching Tip</span>
                            </div>
                            <p className="smaller mb-0 opacity-75 fw-medium">Students are struggling with recursion logic. Suggesting an additional visual lab session to improve mastery by 20%.</p>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            <style>{`
                .btn-light-ai { background: #7c3aed15; color: #7c3aed; border: 1px solid #7c3aed20; }
                .btn-light-ai:hover { background: #7c3aed25; }
                .bg-ai-gradient { background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%); }
                .text-ai-accent { color: #7c3aed; }
                .uppercase { text-transform: uppercase; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default TeacherStudents;
