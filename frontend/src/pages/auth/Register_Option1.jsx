import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaUserTag, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        institution: '',
        phone: ''
    });
    const [institutions, setInstitutions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const res = await axiosInstance.get('auth/institutions/');
                const data = res.data.results || res.data;
                if (Array.isArray(data)) {
                    setInstitutions(data);
                } else {
                    setInstitutions([]);
                }
            } catch (err) {
                toast.error('Could not load institutions');
                setInstitutions([]);
            }
        };
        fetchInstitutions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('auth/register/', formData);
            toast.success('Registration successful! Please wait for admin approval before logging in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="login-container min-vh-100 d-flex align-items-center justify-content-center p-4">
            <div className="glass-portal-bg"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card-premium w-100 p-4 p-md-5"
                style={{ maxWidth: '650px' }}
            >
                {/* Header Section */}
                <div className="text-center mb-5">
                    <button 
                        onClick={() => navigate('/login')}
                        className="btn btn-link text-white-50 p-0 mb-4 text-decoration-none d-flex align-items-center justify-content-center hover-white mx-auto"
                    >
                        <FaArrowLeft className="me-2" /> Back to Login
                    </button>
                    <h1 className="auth-title mb-2">Create Account</h1>
                    <p className="auth-subtitle">Join CCMS Pro and start managing your curriculum</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="floating-label-group">
                                <input 
                                    type="text" 
                                    className="glass-input w-100" 
                                    placeholder=" "
                                    required
                                    onChange={e => setFormData({...formData, first_name: e.target.value})} 
                                />
                                <label><FaUser className="me-2" /> First Name</label>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="floating-label-group">
                                <input 
                                    type="text" 
                                    className="glass-input w-100" 
                                    placeholder=" "
                                    required
                                    onChange={e => setFormData({...formData, last_name: e.target.value})} 
                                />
                                <label><FaUser className="me-2" /> Last Name</label>
                            </div>
                        </div>
                    </div>

                    <div className="floating-label-group">
                        <input 
                            type="email" 
                            className="glass-input w-100" 
                            placeholder=" "
                            required
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                        <label><FaEnvelope className="me-2" /> Email Address</label>
                    </div>

                    <div className="floating-label-group">
                        <input 
                            type="password" 
                            className="glass-input w-100" 
                            placeholder=" "
                            required
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                        <label><FaLock className="me-2" /> Create Password</label>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-7">
                            <div className="mb-4">
                                <label className="text-white-50 small fw-bold text-uppercase mb-2 d-block ms-1">Institution</label>
                                <select 
                                    className="glass-input w-100" 
                                    required
                                    onChange={e => setFormData({...formData, institution: e.target.value})}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="" className="bg-dark">Select Institution</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id} className="bg-dark">{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="mb-4">
                                <label className="text-white-50 small fw-bold text-uppercase mb-2 d-block ms-1">Registration Role</label>
                                <select 
                                    className="glass-input w-100" 
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="student" className="bg-dark">Student</option>
                                    <option value="teacher" className="bg-dark">Teacher</option>
                                    <option value="admin" className="bg-dark">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-glass-primary w-100 d-flex align-items-center justify-content-center mt-4">
                        COMPLETE REGISTRATION <FaArrowRight className="ms-2" />
                    </button>
                </form>

                <div className="mt-5 text-center pt-3 border-top border-white border-opacity-10">
                    <p className="text-white-50 smaller mb-0">
                        Already have an account? <Link to="/login" className="text-white fw-bold text-decoration-none hover-primary">Sign In</Link>
                    </p>
                </div>
            </motion.div>

            <style>{`
                .hover-white:hover { color: white !important; }
                .hover-primary:hover { color: #6366f1 !important; }
                .login-container {
                    background: #0f172a;
                    overflow: hidden;
                    position: relative;
                }
                select.glass-input {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1em;
                }
            `}</style>
        </div>
    );
};

export default Register;
