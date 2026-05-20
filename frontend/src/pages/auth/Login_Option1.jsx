import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaUser, FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const roles = [
        { id: 'admin', label: 'Admin', icon: <FaShieldAlt />, color: '#6366f1' },
        { id: 'teacher', label: 'Teacher', icon: <FaChalkboardTeacher />, color: '#a855f7' },
        { id: 'student', label: 'Student', icon: <FaUserGraduate />, color: '#ec4899' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(username, password);
            toast.success(`Welcome back, ${user.username}!`);
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Invalid Credentials. Please try again.';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="login-container min-vh-100 d-flex align-items-center justify-content-center p-4">
            <div className="glass-portal-bg"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card-premium w-100 p-4 p-md-5"
                style={{ maxWidth: '500px' }}
            >
                {/* Header Section */}
                <div className="text-center mb-5">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="mb-4 d-inline-block p-3 bg-white rounded-4 shadow-lg"
                    >
                        <img src="/SynycsImage.png" alt="Logo" style={{ height: '40px' }} />
                    </motion.div>
                    <h1 className="auth-title mb-2">Welcome Back</h1>
                    <p className="auth-subtitle">Login to your CCMS Pro account</p>
                </div>

                {/* Role Selection Pill */}
                <div className="text-center mb-5">
                    <div className="role-selector-pill">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                className={`role-pill-btn ${selectedRole === role.id ? 'active' : ''}`}
                                onClick={() => setSelectedRole(role.id)}
                            >
                                <span className="me-2">{role.icon}</span>
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedRole}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="floating-label-group">
                                <input 
                                    type="text" 
                                    className="glass-input w-100" 
                                    placeholder=" "
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    required 
                                />
                                <label><FaUser className="me-2" /> {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Username</label>
                            </div>

                            <div className="floating-label-group">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="glass-input w-100" 
                                    placeholder=" "
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                                <label><FaLock className="me-2" /> Password</label>
                                <button 
                                    type="button"
                                    className="position-absolute border-0 bg-transparent text-white-50"
                                    style={{ right: '16px', top: '14px' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                        <button type="button" className="btn btn-link p-0 text-white-50 text-decoration-none smaller fw-bold hover-white">
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="btn-glass-primary w-100 d-flex align-items-center justify-content-center">
                        SIGN IN <FaArrowRight className="ms-2" />
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-white-50 mb-4">Don't have an account?</p>
                    <button 
                        onClick={() => navigate('/register')}
                        className="btn-glass-secondary w-100 fw-bold"
                    >
                        Register your Institution
                    </button>
                </div>

                <div className="mt-5 text-center pt-3 border-top border-white border-opacity-10">
                    <span className="text-white-50 smaller uppercase letter-spacing-1">Powered by </span>
                    <span className="fw-bold text-white smaller uppercase letter-spacing-1">SYNYCS</span>
                </div>
            </motion.div>

            <style>{`
                .hover-white:hover { color: white !important; }
                .login-container {
                    background: #0f172a;
                    overflow: hidden;
                    position: relative;
                }
            `}</style>
        </div>
    );
};

export default Login;
