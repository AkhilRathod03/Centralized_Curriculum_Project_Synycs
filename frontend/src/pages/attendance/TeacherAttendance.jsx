import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCheck, FaUserTimes, FaExclamationCircle, FaRobot, FaSearch, FaClipboardList, FaCheck, FaTimes, FaCalendarDay, FaDownload, FaClock, FaChartLine, FaSave, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

const TeacherAttendance = () => {
    const { darkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAttendanceWorkspace, setShowAttendanceWorkspace] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/courses/');
            setCourses(res.data.results || res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load assigned courses');
            setLoading(false);
        }
    };

    const handleStartSession = async (course) => {
        try {
            setSelectedCourse(course);
            const res = await axiosInstance.get(`curriculum/courses/${course.id}/students/`);
            const studentsData = res.data.results || res.data;
            setStudents(studentsData.map(s => ({ ...s, status: 'present' }))); // Default to present
            setShowAttendanceWorkspace(true);
        } catch (err) {
            toast.error('Failed to load student roster');
        }
    };

    const kpiData = [
        { title: 'Classes Conducted', value: '42', icon: <FaClipboardList />, trend: 'This Term', color: 'primary' },
        { title: 'Avg. Attendance', value: '89%', icon: <FaUserCheck />, trend: '+2%', color: 'success' },
        { title: 'Risk Students', value: '4', icon: <FaExclamationCircle />, trend: '< 75%', color: 'danger' },
        { title: 'AI Alerts', value: '2', icon: <FaRobot />, trend: 'New', color: 'info' },
    ];

    const markAttendance = (id, status) => {
        setStudents(students.map(s => s.id === id ? { ...s, status } : s));
    };

    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: 'present' })));
        toast.success('All students marked Present.');
    };

    const saveAttendance = async () => {
        try {
            setIsSaving(true);
            const date = new Date().toISOString().split('T')[0];
            const records = students.map(s => ({
                student_id: s.id,
                status: s.status
            }));

            await axiosInstance.post('curriculum/attendance/bulk/', {
                course_id: selectedCourse.id,
                date: date,
                records: records
            });

            setIsSaving(false);
            setShowAttendanceWorkspace(false);
            toast.success(`Attendance for ${selectedCourse.name} saved successfully.`);
        } catch (err) {
            toast.error('Failed to sync attendance with cloud.');
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`container-fluid py-4 ${darkMode ? 'text-white' : 'text-dark'}`}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Classroom Attendance</h2>
                    <p className="text-muted mb-0 small">Manage your daily class attendance with AI tracking.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {kpiData.map((kpi, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-xl-3">
                        <motion.div 
                            whileHover={{ y: -3 }}
                            className={`card h-100 border-0 shadow-sm rounded-4`}
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
                <div className="col-lg-8">
                    {/* Classes Dashboard */}
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}>
                        <div className={`card-header border-bottom-0 bg-transparent pt-4 pb-0 px-4 d-flex justify-content-between align-items-center`}>
                            <h5 className="fw-bold mb-0">My Active Courses</h5>
                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill"><FaCalendarDay className="me-1"/> Today</span>
                        </div>
                        <div className="card-body p-4 mt-2">
                            {courses.map((cls, idx) => (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    key={idx} 
                                    className={`card mb-3 border ${darkMode ? 'border-secondary bg-dark' : 'border-light bg-light'} rounded-4`}
                                >
                                    <div className="card-body p-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold mb-1">{cls.name}</h6>
                                            <div className="small text-muted d-flex gap-3">
                                                <span><FaBook className="me-1"/> {cls.code}</span>
                                                <span>• Sem {cls.semester}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleStartSession(cls)} className="btn btn-sm btn-outline-primary rounded-pill px-4 fw-bold">Mark Attendance</button>
                                    </div>
                                </motion.div>
                            ))}
                            {courses.length === 0 && <p className="text-center py-4 text-muted">No courses assigned to you yet.</p>}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* AI Assistant */}
                    <div className={`card border-0 shadow-sm rounded-4 h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-primary bg-opacity-10 border-primary'} border border-opacity-25`}>
                        <div className="card-header border-0 bg-transparent pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaRobot className="text-primary" /> AI Insights</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="space-y-3">
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-danger d-flex align-items-center gap-2"><FaExclamationCircle /> At-Risk Students</h6>
                                    <p className="small text-muted mb-0">System analyzing attendance patterns for your assigned courses...</p>
                                </div>
                                <div className={`p-3 rounded-3 ${darkMode ? 'bg-dark' : 'bg-white'} shadow-sm border ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                    <h6 className="fw-semibold small mb-1 text-primary d-flex align-items-center gap-2"><FaChartLine /> Predictive Trend</h6>
                                    <p className="small text-muted mb-0">Attendance historical data will appear here once you record sessions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Workspace Modal / Fullscreen */}
            <AnimatePresence>
                {showAttendanceWorkspace && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`position-fixed top-0 start-0 w-100 h-100 z-3000 overflow-hidden ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                    >
                        <div className="d-flex flex-column h-100">
                            {/* Workspace Header */}
                            <div className={`p-4 d-flex justify-content-between align-items-center border-bottom ${darkMode ? 'border-secondary' : 'border-light'}`}>
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-1">
                                        <h3 className="fw-bold mb-0">{selectedCourse?.name}</h3>
                                        <span className="badge bg-primary rounded-pill">Today's Session</span>
                                    </div>
                                    <p className="text-muted small mb-0">Total Students: {students.length} • Marked: {students.filter(s => s.status !== null).length}</p>
                                </div>
                                <div className="d-flex gap-3 align-items-center">
                                    <button onClick={markAllPresent} className="btn btn-outline-success rounded-pill d-flex align-items-center gap-2 fw-bold px-4">
                                        <FaCheck /> Mark All Present
                                    </button>
                                    <button 
                                        onClick={saveAttendance} 
                                        disabled={isSaving}
                                        className="btn btn-primary rounded-pill d-flex align-items-center gap-2 shadow-primary-glow fw-bold px-5"
                                    >
                                        {isSaving ? <span className="spinner-border spinner-border-sm"></span> : <FaSave />} {isSaving ? 'Saving...' : 'Save & Submit'}
                                    </button>
                                    <button onClick={() => setShowAttendanceWorkspace(false)} className={`btn btn-link ${darkMode ? 'text-light' : 'text-dark'}`}>
                                        <FaTimes size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Workspace Body */}
                            <div className={`flex-grow-1 p-4 overflow-auto ${darkMode ? 'bg-dark' : 'bg-light'}`}>
                                <div className="container" style={{ maxWidth: '900px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ width: '300px', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                            <span className={`input-group-text border-0 ${darkMode ? 'bg-secondary bg-opacity-20 text-light' : 'bg-white text-dark'}`}><FaSearch /></span>
                                            <input 
                                                type="text" 
                                                className={`form-control border-0 p-2 ${darkMode ? 'bg-secondary bg-opacity-20 text-light placeholder-light' : 'bg-white text-dark'}`} 
                                                placeholder="Search student name..." 
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {students.filter(s => s.username.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
                                            <motion.div 
                                                layout
                                                key={student.id} 
                                                className={`p-3 rounded-4 d-flex justify-content-between align-items-center border shadow-sm mb-3 ${
                                                    darkMode ? 'bg-glass-dark border-secondary' : 'bg-white border-light'
                                                }`}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className={`rounded-circle d-flex justify-content-center align-items-center fw-bold ${darkMode ? 'bg-secondary text-white' : 'bg-light text-primary'}`} style={{ width: '45px', height: '45px' }}>
                                                        {student.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-0">{student.username}</h6>
                                                        <small className="text-muted">{student.email}</small>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        onClick={() => markAttendance(student.id, 'present')}
                                                        className={`btn rounded-pill px-4 fw-bold ${student.status === 'present' ? 'btn-success shadow-sm' : darkMode ? 'btn-outline-secondary' : 'btn-outline-light text-dark border'}`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => markAttendance(student.id, 'absent')}
                                                        className={`btn rounded-pill px-4 fw-bold ${student.status === 'absent' ? 'btn-danger shadow-sm' : darkMode ? 'btn-outline-secondary' : 'btn-outline-light text-dark border'}`}
                                                    >
                                                        Absent
                                                    </button>
                                                    <button 
                                                        onClick={() => markAttendance(student.id, 'late')}
                                                        className={`btn rounded-pill px-4 fw-bold ${student.status === 'late' ? 'btn-warning text-dark shadow-sm' : darkMode ? 'btn-outline-secondary' : 'btn-outline-light text-dark border'}`}
                                                    >
                                                        Late
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .z-3000 { z-index: 3000 !important; }
                .shadow-primary-glow {
                    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
                }
                .bg-glass-dark {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                }
            `}</style>

        </motion.div>
    );
};

export default TeacherAttendance;
