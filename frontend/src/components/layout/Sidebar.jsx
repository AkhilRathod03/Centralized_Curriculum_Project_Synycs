import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaThLarge, FaBook, FaLayerGroup, FaUniversity, FaFolderOpen, 
    FaLightbulb, FaCalendarAlt, FaFileAlt, FaUserShield, FaHistory, 
    FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUserGraduate, 
    FaCheckCircle, FaProjectDiagram, FaChalkboardTeacher, FaBrain, FaChartLine,
    FaMagic, FaRobot, FaGraduationCap
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);

    const mainItems = [
        { name: 'Dashboard', icon: <FaThLarge />, path: `/${user?.role}-dashboard` },
        { name: 'Curriculum', icon: <FaBook />, path: '/curriculum', roles: ['admin', 'teacher'] },
        { name: 'Academic Explorer', icon: <FaUniversity />, path: '/programs' },
        { name: 'Courses', icon: <FaLayerGroup />, path: '/courses' },
        { name: 'Schedule', icon: <FaCalendarAlt />, path: '/schedule' },
    ];

    const academicItems = [
        { name: 'Resources', icon: <FaFolderOpen />, path: '/resources' },
        { name: 'Assignments', icon: <FaFileAlt />, path: '/assignments' },
        { name: 'Students', icon: <FaUserGraduate />, path: '/students', roles: ['admin', 'teacher'] },
        { name: 'Teachers', icon: <FaChalkboardTeacher />, path: '/teachers', roles: ['admin'] },
        { name: 'My Faculty', icon: <FaUserGraduate />, path: '/my-faculty', roles: ['student'] },
        { name: 'Attendance', icon: <FaCheckCircle />, path: '/attendance' },
    ];

    const aiItems = [
        { 
            name: 'AI Assistant', 
            icon: <FaRobot />, 
            path: user?.role === 'student' ? '/student-assistant' : '/ai-assistant' 
        },
        { name: 'AI Lesson Planner', icon: <FaLightbulb />, path: '/ai-lesson-planner', roles: ['admin', 'teacher'] },
        { name: 'AI Quiz Gen', icon: <FaMagic />, path: '/ai-quiz-gen', roles: ['admin', 'teacher'] },
    ];

    const systemItems = [
        { name: 'User Management', icon: <FaUserShield />, path: '/users', roles: ['admin'] },
        { name: 'Audit Logs', icon: <FaHistory />, path: '/audit-logs', roles: ['admin'] },
        { name: 'Reports', icon: <FaChartLine />, path: '/reports' },
        { name: 'Settings', icon: <FaCog />, path: '/settings' },
    ];

    const renderMenuSection = (title, items) => {
        const visibleItems = items.filter(item => {
            if (item.roles && !item.roles.includes(user?.role)) return false;
            if (item.adminOnly && user?.role !== 'admin') return false;
            return true;
        });
        if (visibleItems.length === 0) return null;

        return (
            <div className="mb-4">
                <div className="px-4 mb-2">
                    {!isCollapsed && (
                        <small className="text-uppercase fw-bold text-muted ps-1 d-block" style={{ fontSize: '0.625rem', letterSpacing: '1.5px', opacity: 0.7 }}>
                            {title}
                        </small>
                    )}
                </div>
                {visibleItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={`nav-link-modern ${isCollapsed ? 'd-flex justify-content-center px-0' : ''}`}
                        title={isCollapsed ? item.name : ''}
                    >
                        <span className={`${isCollapsed ? 'me-0' : 'me-3'} fs-5 d-flex align-items-center opacity-80`}>{item.icon}</span>
                        {!isCollapsed && <span className="small fw-semibold">{item.name}</span>}
                    </NavLink>
                ))}
            </div>
        );
    };

    return (
        <motion.div 
            animate={{ width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`shadow-sm d-flex flex-column h-100 position-fixed top-0 left-0`} 
            style={{ 
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                zIndex: 1050 // Higher than Navbar (1030)
            }}
        >
            {/* Logo Section Removed (Redundant with Navbar) */}
            <div className="p-3"></div>

            {/* Menu Sections */}
            <div className={`flex-grow-1 overflow-x-hidden overflow-y-auto py-2 custom-scrollbar`}>
                {renderMenuSection('Operational HQ', mainItems)}
                {renderMenuSection('Academic Architecture', academicItems)}
                {renderMenuSection('Neural Intelligence', aiItems)}
                {renderMenuSection('Platform Security', systemItems)}
            </div>

            {/* Bottom Section */}
            <div className={`mt-auto ps-0 pe-0 py-3 border-top ${darkMode ? 'border-secondary' : 'border-light'} border-opacity-50 d-flex flex-column align-items-center`}>
                <button 
                    onClick={logout} 
                    className={`nav-link-modern border-0 bg-transparent text-danger mb-0 hover-bg-danger-subtle ${isCollapsed ? 'w-auto px-0 d-flex justify-content-center' : 'w-100 px-2'}`}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <span className={`${isCollapsed ? 'me-0' : 'me-3'} fs-5 d-flex align-items-center`}><FaSignOutAlt /></span>
                    {!isCollapsed && <span className="small fw-bold">Terminate Session</span>}
                </button>
            </div>
            
            {/* Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`btn btn-sm border shadow-lg rounded-circle position-absolute d-flex align-items-center justify-content-center transition-all ${darkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}
                style={{ 
                    top: 'calc(var(--navbar-height) / 2)', 
                    transform: 'translateY(-50%)',
                    right: '-16px', 
                    width: '32px', 
                    height: '32px',
                    zIndex: 1100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>
        </motion.div>
    );
};

export default Sidebar;
