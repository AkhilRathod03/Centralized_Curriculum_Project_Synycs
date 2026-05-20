import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaChalkboardTeacher, FaUserGraduate, FaArrowRight, FaLock, FaUser, FaEnvelope } from 'react-icons/fa';

const Login_V2 = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('admin');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(username, password);
            toast.success(`Welcome back, ${user.username}!`);
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid Credentials');
        }
    };

    return (
        <div className="vh-100 d-flex overflow-hidden bg-white">
            {/* Left Side - 60% Branding */}
            <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-center align-items-center position-relative" 
                 style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                
                <div className="text-center animate__animated animate__fadeIn">
                    <div className="bg-white p-4 rounded-circle shadow-lg mb-4 d-inline-block">
                        <img src="/SynycsImage.png" alt="CCMS Logo" style={{ height: '80px' }} />
                    </div>
                    <h1 className="display-4 fw-bold text-white mb-3">CCMS PRO</h1>
                    <p className="fs-4 text-white-50 px-5">The Future of Curriculum Management</p>
                </div>

                {/* Powered By at Bottom */}
                <div className="position-absolute bottom-0 mb-5 text-white-50 text-center w-100">
                    <p className="small text-uppercase tracking-widest mb-0">Powered by</p>
                    <h5 className="fw-bold text-white">SYNYCS</h5>
                </div>
            </div>

            {/* Right Side - 40% Login Form */}
            <div className="col-12 col-lg-5 d-flex flex-column justify-content-center px-4 px-md-5 bg-white">
                <div className="mx-auto w-100" style={{ maxWidth: '400px' }}>
                    <h2 className="fw-bold text-dark mb-2">Login</h2>
                    <p className="text-muted mb-5">Select your role and enter credentials</p>

                    {/* Role Selector Buttons */}
                    <div className="d-flex gap-2 mb-4">
                        {[
                            { id: 'admin', icon: <FaShieldAlt />, label: 'Admin' },
                            { id: 'teacher', icon: <FaChalkboardTeacher />, label: 'Teacher' },
                            { id: 'student', icon: <FaUserGraduate />, label: 'Student' }
                        ].map(role => (
                            <button 
                                key={role.id}
                                className={`btn flex-fill d-flex flex-column align-items-center py-3 border-2 ${selectedRole === role.id ? 'btn-primary border-primary' : 'btn-outline-light text-muted border-light'}`}
                                onClick={() => setSelectedRole(role.id)}
                            >
                                <span className="mb-1">{role.icon}</span>
                                <span className="small fw-bold">{role.label}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Username or Email</label>
                            <div className="input-group border rounded-3 p-1">
                                <span className="input-group-text bg-transparent border-0 text-muted"><FaUser /></span>
                                <input 
                                    type="text" 
                                    className="form-control border-0 shadow-none" 
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted text-uppercase">Password</label>
                            <div className="input-group border rounded-3 p-1">
                                <span className="input-group-text bg-transparent border-0 text-muted"><FaLock /></span>
                                <input 
                                    type="password" 
                                    className="form-control border-0 shadow-none" 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mb-4">
                            <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold text-primary">
                                Forgot username/password?
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-4">
                            LOG IN <FaArrowRight className="ms-2" />
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-muted small mb-3">Want to join us?</p>
                        <button 
                            className="btn btn-outline-primary w-100 py-2 fw-bold"
                            onClick={() => navigate('/register')}
                        >
                            Register your institution
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .tracking-widest { letter-spacing: 0.2em; }
                .btn-primary { background-color: #312e81; border-color: #312e81; }
                .btn-primary:hover { background-color: #1e1b4b; border-color: #1e1b4b; }
                .text-primary { color: #312e81 !important; }
                .btn-outline-primary { color: #312e81; border-color: #312e81; }
                .btn-outline-primary:hover { background-color: #312e81; color: white; }
            `}</style>
        </div>
    );
};

export default Login_V2;
