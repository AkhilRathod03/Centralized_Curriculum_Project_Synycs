import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaBell, FaMoon, FaSun, FaPlus, FaCalendarAlt, FaRobot, FaLayerGroup, FaBook, FaFileAlt, FaUniversity, FaChevronDown, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Curriculum Update",
            message: "New modules added to Computer Science - Sem 4",
            time: "2 mins ago",
            type: "update",
            unread: true,
            icon: <FaLayerGroup />
        },
        {
            id: 2,
            title: "AI Analysis Complete",
            message: "Course syllabus for Digital Electronics has been verified.",
            time: "1 hour ago",
            type: "ai",
            unread: true,
            icon: <FaRobot />
        },
        {
            id: 3,
            title: "System Alert",
            message: "Institutional database maintenance scheduled for tonight.",
            time: "3 hours ago",
            type: "alert",
            unread: false,
            icon: <FaExclamationTriangle />
        }
    ]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
        toast.success("All notifications marked as read");
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            
            // Intelligent Redirection Logic
            if (query.includes('student') || query.includes('teacher') || query.includes('admin') || query.includes('user') || query.includes('@')) {
                navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
                toast.success(`Locating identity records for: ${searchQuery}`);
            } else if (query.includes('pdf') || query.includes('file') || query.includes('material') || query.includes('resource') || query.includes('syllabus')) {
                navigate(`/resources?search=${encodeURIComponent(searchQuery)}`);
                toast.success(`Searching institutional cloud for: ${searchQuery}`);
            } else if (query.includes('course') || query.includes('sem') || query.includes('unit') || query.includes('credit')) {
                navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
                toast.success(`Analyzing course catalog for: ${searchQuery}`);
            } else {
                // Default: Try searching users/people first as it's the most common intent
                navigate(`/users?search=${encodeURIComponent(searchQuery)}`);
                toast.info(`Searching system for: ${searchQuery}`);
            }
            
            setSearchQuery('');
        }
    };

    return (
        <nav 
            className={`navbar navbar-expand-lg sticky-top ${darkMode ? 'bg-dark' : 'bg-white'}`} 
            style={{ 
                height: 'var(--navbar-height)',
                padding: '0 1.5rem',
                zIndex: 1030,
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(226, 232, 240, 0.8)',
                backdropFilter: 'blur(12px)',
                background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
            }}
        >
            <div className="container-fluid p-0 d-flex align-items-center">
                {/* Project Name (Replaces wide search bar) */}
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-3 p-1 shadow-primary-glow d-flex align-items-center justify-content-center" style={{ width: isCollapsed ? '38px' : '34px', height: isCollapsed ? '38px' : '34px', transition: 'all 0.3s ease' }}>
                        <FaUniversity className="text-white" size={isCollapsed ? 18 : 16} />
                    </div>
                    <span className={`fw-bold ${isCollapsed ? 'fs-4' : 'fs-5'} ${darkMode ? 'text-white' : 'text-dark'} transition-all`} style={{ letterSpacing: isCollapsed ? '-0.5px' : '-0.2px', transition: 'all 0.3s ease' }}>
                        Centralized <span className="text-primary">Curriculum Management Portal</span>
                    </span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill ms-2 d-none d-xl-inline-block" style={{ fontSize: isCollapsed ? '0.75rem' : '0.65rem' }}>v2.0</span>
                </div>

                <div className="d-flex align-items-center ms-auto gap-3">
                    {/* Compact but Functional Search (Moved to right with width) */}
                    <div className={`d-none d-sm-flex align-items-center rounded-pill px-3 py-2 border transition-all ${darkMode ? 'bg-black bg-opacity-25 border-secondary' : 'bg-light border-opacity-50'}`} style={{ width: '260px' }}>
                        <FaSearch className="text-muted me-2" size={14} />
                        <input 
                            type="text" 
                            className={`form-control bg-transparent border-0 shadow-none p-0 fw-medium ${darkMode ? 'text-white' : ''}`} 
                            placeholder="Neural search..." 
                            style={{ fontSize: '0.85rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearch}
                        />
                    </div>

                    {/* Academic Year & Session */}
                    <div className="d-none d-md-flex align-items-center gap-3 border-end pe-4 border-opacity-10">
                        <div className="d-flex flex-column align-items-end">
                            <span className={`fw-bold text-primary`} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>AY 2025-26</span>
                            <span className="text-muted text-xs fw-bold opacity-50 uppercase" style={{ fontSize: '0.55rem' }}>Active Session</span>
                        </div>
                    </div>
                    {/* Notification & Theme Toggles */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="position-relative" ref={notificationsRef}>
                            <button className="btn btn-icon rounded-circle hover-light position-relative" onClick={() => setShowNotif(!showNotif)}>
                                <FaBell className="text-muted" size={16} />
                                {notifications.some(n => n.unread) && (
                                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-2 border-white rounded-circle shadow-sm" style={{ marginTop: '8px', marginLeft: '-8px' }}></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotif && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-0 mt-2 show d-block position-absolute ${darkMode ? 'bg-dark border border-secondary' : 'bg-white'}`} 
                                        style={{ right: 0, width: '320px', overflow: 'hidden' }}
                                    >
                                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                            <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : ''}`}>Notifications</h6>
                                            <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none fw-bold" style={{ fontSize: '0.7rem' }} onClick={markAllAsRead}>
                                                Mark all as read
                                            </button>
                                        </div>
                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {notifications.length > 0 ? notifications.map((n) => (
                                                <div 
                                                    key={n.id} 
                                                    className={`p-3 border-bottom transition-all cursor-pointer ${n.unread ? (darkMode ? 'bg-primary bg-opacity-10' : 'bg-primary bg-opacity-5') : ''} ${darkMode ? 'hover-dark' : 'hover-light'}`}
                                                    onClick={() => {
                                                        setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, unread: false } : notif));
                                                    }}
                                                >
                                                    <div className="d-flex gap-3">
                                                        <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                                                            n.type === 'update' ? 'bg-info bg-opacity-10 text-info' : 
                                                            n.type === 'ai' ? 'bg-primary bg-opacity-10 text-primary' : 
                                                            'bg-warning bg-opacity-10 text-warning'
                                                        }`} style={{ width: '36px', height: '36px' }}>
                                                            {n.icon}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                                <span className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{n.title}</span>
                                                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>{n.time}</span>
                                                            </div>
                                                            <p className="text-muted mb-0 small line-clamp-2" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>{n.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-5 text-center">
                                                    <FaCheckCircle className="text-success mb-2 opacity-20" size={32} />
                                                    <p className="text-muted small mb-0">You're all caught up!</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 border-top text-center">
                                            <button className="btn btn-link btn-sm text-muted p-0 text-decoration-none small fw-bold">
                                                View All Activity
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button className="btn btn-icon rounded-circle hover-light" onClick={toggleDarkMode}>
                            {darkMode ? <FaSun className="text-warning" size={16} /> : <FaMoon className="text-muted" size={16} />}
                        </button>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="position-relative border-start ps-3 border-opacity-10" ref={dropdownRef}>
                        <button 
                            className="btn border-0 p-0 d-flex align-items-center transition-all gap-2" 
                            type="button" 
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="text-end d-none d-sm-block">
                                <div className={`fw-bold small mb-0 ${darkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.8rem' }}>{user?.username}</div>
                                <div className="text-muted text-uppercase fw-bold d-flex align-items-center justify-content-end gap-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                                    {user?.role} <FaChevronDown size={8} className={`opacity-50 transition-all ${showDropdown ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=2563eb&color=fff`} 
                                className="rounded-circle border border-2 border-white shadow-sm" 
                                alt="Profile" 
                                width="34" 
                                height="34"
                            />
                        </button>
                        
                        <AnimatePresence>
                            {showDropdown && (
                                <motion.ul 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2 show d-block position-absolute ${darkMode ? 'bg-dark border border-secondary' : ''}`} 
                                    style={{ right: 0, minWidth: '200px' }}
                                >
                                    <li>
                                        <Link 
                                            className={`dropdown-item rounded-3 mb-1 py-2 px-3 small d-flex align-items-center gap-2 ${darkMode ? 'text-white hover-dark' : ''}`} 
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-1">
                                                <FaUniversity size={12} />
                                            </div>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold">My Profile</span>
                                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>View personal details</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li><hr className={`dropdown-divider ${darkMode ? 'border-secondary opacity-10' : ''}`} /></li>
                                    <li>
                                        <button 
                                            onClick={() => {
                                                setShowDropdown(false);
                                                logout();
                                            }} 
                                            className="dropdown-item rounded-3 text-danger fw-bold py-2 px-3 small d-flex align-items-center gap-2 w-100 border-0 bg-transparent text-start"
                                        >
                                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-1">
                                                <FaPlus style={{ transform: 'rotate(45deg)' }} size={12} />
                                            </div>
                                            Logout
                                        </button>
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <style>{`
                .btn-icon { width: 36px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
                .hover-light:hover { background-color: rgba(0,0,0,0.05); }
                [data-bs-theme='dark'] .hover-light:hover { background-color: rgba(255,255,255,0.05); }
                .dropdown-item:active { background-color: var(--primary); }
                .rotate-180 { transform: rotate(180deg); }
                .dropdown-menu.show { display: block !important; }
            `}</style>
        </nav>
    );
};

export default Navbar;
