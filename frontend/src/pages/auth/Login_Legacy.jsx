import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaArrowRight, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const roles = [
        { 
            id: 'admin', 
            title: 'Administrator', 
            desc: 'Management & Audit',
            icon: <FaUserShield size={32} />,
            inputIcon: <FaUserShield />,
            color: 'primary',
            themeColor: '#0d6efd',
            placeholder: 'Enter Admin Username'
        },
        { 
            id: 'teacher', 
            title: 'Teacher', 
            desc: 'Course Management',
            icon: <FaChalkboardTeacher size={32} />,
            inputIcon: <FaChalkboardTeacher />,
            color: 'success',
            themeColor: '#198754',
            placeholder: 'Enter Teacher Username'
        },
        { 
            id: 'student', 
            title: 'Student', 
            desc: 'Learning & Schedule',
            icon: <FaUserGraduate size={32} />,
            inputIcon: <FaUserGraduate />,
            color: 'indigo', // Custom class for Student
            themeColor: '#6610f2',
            placeholder: 'Enter Student Username'
        }
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

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setUsername('');
        setPassword('');
        setShowPassword(false);
    };

    return (
        <div className="login-wrapper min-vh-100 d-flex flex-column justify-content-center py-5 position-relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="bg-shape bg-primary opacity-10 position-absolute rounded-circle blur-3xl" style={{ width: '500px', height: '500px', top: '-150px', right: '-150px' }}></div>
            <div className="bg-shape bg-indigo opacity-10 position-absolute rounded-circle blur-3xl" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-100px' }}></div>

            <div className="container position-relative" style={{ zIndex: 1 }}>
                <div className="text-center mb-5 animate__animated animate__fadeInDown">
                    <h1 className="fw-bold text-dark display-5 mb-3 tracking-tight">Centralized Curriculum Management System</h1>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <span className="text-muted fs-5 fw-medium me-3">Powered by</span>
                        <img 
                            src="/SynycsImage.png" 
                            alt="SYNYCS Logo" 
                            className="logo-img shadow-sm"
                            style={{ height: '42px', objectFit: 'contain', backgroundColor: 'white', padding: '5px', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                {!selectedRole ? (
                    <div className="animate__animated animate__fadeInUp">
                        {/* Role Selection Cards */}
                        <div className="row justify-content-center g-4 mb-5">
                            {roles.map((role) => (
                                <div key={role.id} style={{ width: '310px' }}> {/* Increased width by 30px from 280px */}
                                    <div 
                                        className={`card role-card border-0 shadow-sm rounded-4 p-4 text-center h-100 transition-all`}
                                        onClick={() => handleRoleSelect(role.id)}
                                    >
                                        <div className={`icon-wrapper bg-${role.color} bg-opacity-10 text-${role.color} rounded-4 p-4 d-flex align-items-center justify-content-center mb-4 mx-auto`} style={{ width: '80px', height: '80px' }}>
                                            {role.icon}
                                        </div>
                                        <h4 className="fw-bold text-dark mb-2">{role.title}</h4>
                                        <p className="text-muted mb-4 px-2" style={{ fontSize: '0.9rem' }}>{role.desc}</p>
                                        <div className={`btn btn-login btn-outline-${role.color} rounded-pill px-4 fw-bold mt-auto`}>
                                            LOGIN <FaArrowRight className="ms-2" size={12} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center">
                            <span className="text-muted">New to the platform? </span>
                            <button 
                                type="button"
                                className="btn btn-link text-decoration-none fw-bold text-primary p-0" 
                                onClick={() => navigate('/register')}
                            >
                                Register your Institution
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Login Form for Selected Role */
                    <div className="row justify-content-center animate__animated animate__zoomIn">
                        <div style={{ width: '450px' }}> {/* Adjusted width for form */}
                            <button 
                                className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center hover-primary"
                                onClick={() => setSelectedRole(null)}
                            >
                                <FaArrowRight style={{ transform: 'rotate(180deg)' }} className="me-2" /> Back to selection
                            </button>
                            
                            <div className="card login-form-card border-0 shadow-lg rounded-4 overflow-hidden">
                                {roles.filter(r => r.id === selectedRole).map(role => (
                                    <div key={role.id}>
                                        <div className={`bg-${role.color} py-4 px-5 text-white text-center position-relative overflow-hidden`}>
                                            <div className="position-relative" style={{ zIndex: 2 }}>
                                                <div className="bg-white shadow-sm rounded-4 p-2 d-flex align-items-center justify-content-center mb-2 mx-auto" style={{ width: '60px', height: '60px' }}>
                                                    <span className={`text-${role.color} d-flex align-items-center justify-content-center`}>
                                                        {React.cloneElement(role.icon, { size: 24 })}
                                                    </span>
                                                </div>
                                                <h4 className="fw-bold mb-0">{role.title} Portal</h4>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 p-lg-5">
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-4">
                                                    <label className="form-label text-secondary small fw-bold text-uppercase tracking-wider">Username</label>
                                                    <div className="input-group custom-input-group shadow-sm rounded-3 overflow-hidden border">
                                                        <span className={`input-group-text bg-light border-0 text-${role.color}`}>{role.inputIcon}</span>
                                                        <input 
                                                            type="text" 
                                                            className="form-control border-0 bg-light ps-0" 
                                                            placeholder={role.placeholder}
                                                            value={username} 
                                                            onChange={e => setUsername(e.target.value)} 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-secondary small fw-bold text-uppercase tracking-wider">Password</label>
                                                    <div className="input-group custom-input-group shadow-sm rounded-3 overflow-hidden border">
                                                        <span className={`input-group-text bg-light border-0 text-${role.color}`}><FaLock /></span>
                                                        <input 
                                                            type={showPassword ? "text" : "password"} 
                                                            className="form-control border-0 bg-light ps-0" 
                                                            placeholder="Enter Password"
                                                            value={password} 
                                                            onChange={e => setPassword(e.target.value)} 
                                                            required 
                                                        />
                                                        <button 
                                                            className="input-group-text bg-light border-0 text-muted" 
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <button type="submit" className={`btn btn-${role.color} w-100 py-3 rounded-pill fw-bold shadow-sm mb-4 transform-active`}>
                                                    Sign In to Account
                                                </button>
                                                
                                                <div className="text-center">
                                                    <span className="text-muted small">Need an account? </span>
                                                    <button 
                                                        type="button"
                                                        className={`btn btn-link btn-sm text-decoration-none fw-bold text-${role.color}`} 
                                                        onClick={() => navigate('/register')}
                                                    >
                                                        Register
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .login-wrapper { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
                .bg-shape { filter: blur(60px); z-index: 0; }
                .bg-indigo { background-color: rgba(102, 16, 242, var(--bs-bg-opacity, 1)) !important; }
                .text-indigo { color: #6610f2 !important; }
                .btn-indigo { background-color: #6610f2 !important; border-color: #6610f2 !important; color: white !important; }
                .btn-outline-indigo { color: #6610f2 !important; border-color: #6610f2 !important; }
                .btn-outline-indigo:hover { background-color: #6610f2 !important; color: white !important; }
                .bg-opacity-10 { --bs-bg-opacity: 0.1; }
                
                .role-card { 
                    cursor: pointer; 
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    border: 1px solid rgba(0,0,0,0.05) !important;
                }
                .role-card:hover { 
                    transform: translateY(-10px); 
                    box-shadow: 0 1.5rem 3rem rgba(0,0,0,0.1) !important;
                    background-color: white !important;
                }
                .icon-wrapper { transition: transform 0.4s ease; }
                .role-card:hover .icon-wrapper { transform: scale(1.1) rotate(5deg); }
                
                .custom-input-group .form-control:focus { 
                    box-shadow: none; 
                    background-color: #fff !important;
                }
                .custom-input-group:focus-within {
                    ring: 2px solid rgba(13, 110, 253, 0.25);
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
                }
                
                .btn-login { border-width: 2px; }
                .backdrop-blur { backdrop-filter: blur(10px); }
                .transform-active:active { transform: scale(0.98); }
                .hover-primary:hover { color: #0d6efd !important; }
                
                @keyframes blur-fade {
                    from { opacity: 0; }
                    to { opacity: 0.1; }
                }
            `}</style>
        </div>
    );
};

export default Login;
