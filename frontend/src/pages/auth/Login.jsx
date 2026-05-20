import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence as MotionPresence } from 'framer-motion';
import { 
    FaEnvelope, 
    FaLock, 
    FaEye, 
    FaEyeSlash, 
    FaShieldAlt, 
    FaChalkboardTeacher, 
    FaUserGraduate
} from 'react-icons/fa';

const Login = () => {
    console.log("AnimatePresence check:", typeof AnimatePresence);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot Password States: 'login', 'forgot', 'reset'
    const [authMode, setAuthMode] = useState('login');
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const videoRef = useRef(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const roleConfig = {
        admin: { label: 'Admin', icon: <FaShieldAlt /> },
        teacher: { label: 'Teacher', icon: <FaChalkboardTeacher /> },
        student: { label: 'Student', icon: <FaUserGraduate /> }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5;
        }
    }, []);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(username, password);
            toast.success(`Welcome back!`);
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            toast.error('Invalid Credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate checking email
        setTimeout(() => {
            setIsLoading(false);
            setAuthMode('reset');
            toast.info("Identity Verified. Initialize Security Update.");
        }, 1000);
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error("Security Keys do not match.");
            return;
        }
        setIsLoading(true);
        // Simulate password change
        setTimeout(() => {
            setIsLoading(false);
            setAuthMode('login');
            toast.success("Security Protocol Updated. Access Restored.");
        }, 1500);
    };

    return (
        <div className="auth-full-page">
            <video ref={videoRef} autoPlay muted loop playsInline className="auth-video-full">
                <source src="/bg_video1.mp4" type="video/mp4" />
            </video>
            <div className="auth-overlay-deep"></div>

            <div className="auth-split-container">
                {/* LEFT: 60% Content */}
                <div className="auth-left-content">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="portal-title-huge">
                            Centralized <br />
                            Curriculum <br />
                            Management <br />
                            System
                        </h1>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="powered-by-box"
                    >
                        <span className="smaller uppercase fw-700 tracking-widest text-white opacity-50">Powered By</span>
                        <img src="/SynycsImage.png" alt="Synycs" style={{ height: '40px' }} />
                    </motion.div>
                </div>

                {/* RIGHT: 40% Form */}
                <div className="auth-right-form">
                    <MotionPresence mode="wait">
                        {authMode === 'login' && (
                            <motion.div 
                                key="login"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="glass-card-ultra"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="fw-900 mb-1 tracking-tight" style={{ color: '#0f172a' }}>Access Portal</h2>
                                    <p className="text-white opacity-40 smaller fw-600 uppercase tracking-widest">Security Protocol Required</p>
                                </div>

                                {/* ROLE SELECTOR */}
                                <div className="mb-4">
                                    <div className="role-selector-pill p-1 rounded-pill d-flex border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                        {Object.entries(roleConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => handleRoleSelect(key)}
                                                className="role-item flex-fill py-2 rounded-pill border-0 position-relative d-flex align-items-center justify-content-center gap-2"
                                                style={{ cursor: 'pointer', background: 'transparent', outline: 'none' }}
                                            >
                                                {selectedRole === key && (
                                                    <motion.div 
                                                        layoutId="activeRoleBg"
                                                        className="position-absolute inset-0 rounded-pill"
                                                        style={{ 
                                                            background: '#000000',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                                            zIndex: 0,
                                                            width: '100%',
                                                            height: '100%'
                                                        }}
                                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    />
                                                )}
                                                <span 
                                                    className="position-relative d-flex align-items-center gap-2 fw-800" 
                                                    style={{ 
                                                        zIndex: 1, 
                                                        transition: 'all 0.3s ease',
                                                        color: selectedRole === key ? '#ffffff' : '#0f172a',
                                                        opacity: selectedRole === key ? 1 : 0.8
                                                    }}
                                                >
                                                    {config.icon}
                                                    <span className="smaller uppercase tracking-wide d-none d-md-inline">{config.label}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">Credential</label>
                                        <div className="input-wrapper-standard">
                                            <FaEnvelope className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="text" 
                                                className="form-control glass-input-dark"
                                                placeholder="Username"
                                                value={username} 
                                                onChange={e => setUsername(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">Secret</label>
                                        <div className="input-wrapper-standard">
                                            <FaLock className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="form-control glass-input-dark"
                                                placeholder="••••••••"
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)} 
                                                required 
                                            />
                                            <button 
                                                type="button" 
                                                className="password-toggle-btn-white text-white opacity-50" 
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <div className="text-end mt-2">
                                            <button 
                                                type="button"
                                                onClick={() => setAuthMode('forgot')}
                                                className="btn btn-link p-0 smaller fw-700 text-white opacity-40 text-decoration-none hover-opacity-100 shadow-none"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn w-100 py-2 mt-3 rounded-pill fw-800 text-white"
                                        style={{ 
                                            background: '#000000', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                        }}
                                    >
                                        {isLoading ? 'AUTHORIZING...' : 'ENTER PORTAL'}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <Link to="/register" className="smaller fw-700 text-white opacity-40 text-decoration-none hover-opacity-100">
                                        Request Access Identity
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {authMode === 'forgot' && (
                            <motion.div 
                                key="forgot"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="glass-card-ultra"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="fw-900 mb-1 tracking-tight" style={{ color: '#0f172a' }}>Identity Recovery</h2>
                                    <p className="text-white opacity-40 smaller fw-600 uppercase tracking-widest">Enter Communication Node (Email)</p>
                                </div>

                                <form onSubmit={handleForgotSubmit}>
                                    <div className="mb-4">
                                        <label className="glass-label mb-1 d-block">Registered Email</label>
                                        <div className="input-wrapper-standard">
                                            <FaEnvelope className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="email" 
                                                className="form-control glass-input-dark"
                                                placeholder="node@sync.com"
                                                value={resetEmail} 
                                                onChange={e => setResetEmail(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn w-100 py-2 rounded-pill fw-800 text-white"
                                        style={{ 
                                            background: '#000000', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                        }}
                                    >
                                        {isLoading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className="btn btn-link w-100 mt-3 smaller fw-700 text-white opacity-40 text-decoration-none hover-opacity-100 shadow-none"
                                    >
                                        Return to Access Portal
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {authMode === 'reset' && (
                            <motion.div 
                                key="reset"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="glass-card-ultra"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="fw-900 mb-1 tracking-tight" style={{ color: '#0f172a' }}>Security Update</h2>
                                    <p className="text-white opacity-40 smaller fw-600 uppercase tracking-widest">Set New Access Secret</p>
                                </div>

                                <form onSubmit={handleResetSubmit}>
                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">New Security Key</label>
                                        <div className="input-wrapper-standard">
                                            <FaLock className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="password" 
                                                className="form-control glass-input-dark"
                                                placeholder="••••••••"
                                                value={newPassword} 
                                                onChange={e => setNewPassword(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="glass-label mb-1 d-block">Confirm Security Key</label>
                                        <div className="input-wrapper-standard">
                                            <FaLock className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="password" 
                                                className="form-control glass-input-dark"
                                                placeholder="••••••••"
                                                value={confirmNewPassword} 
                                                onChange={e => setConfirmNewPassword(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn w-100 py-2 rounded-pill fw-800 text-white"
                                        style={{ 
                                            background: '#000000', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                        }}
                                    >
                                        {isLoading ? 'UPDATING...' : 'UPDATE SECURITY KEY'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </MotionPresence>
                </div>
            </div>

            <style>{`
                .input-icon-standard { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 5; }
                .password-toggle-btn-white { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; z-index: 5; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .role-item { outline: none !important; }
            `}</style>
        </div>
    );
};

export default Login;
