import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaUserTag, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Register_V2 = () => {
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
            toast.success('Registration successful! Please wait for admin approval.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
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
                    <p className="fs-4 text-white-50 px-5">Join our global network of institutions</p>
                </div>

                {/* Powered By at Bottom */}
                <div className="position-absolute bottom-0 mb-5 text-white-50 text-center w-100">
                    <p className="small text-uppercase tracking-widest mb-0">Powered by</p>
                    <h5 className="fw-bold text-white">SYNYCS</h5>
                </div>
            </div>

            {/* Right Side - 40% Registration Form */}
            <div className="col-12 col-lg-5 d-flex flex-column justify-content-center px-4 px-md-5 bg-white overflow-auto py-5">
                <div className="mx-auto w-100" style={{ maxWidth: '450px' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        className="btn btn-link p-0 mb-4 text-decoration-none d-flex align-items-center text-muted hover-primary"
                    >
                        <FaArrowLeft className="me-2" /> Back to Login
                    </button>
                    
                    <h2 className="fw-bold text-dark mb-2">Register</h2>
                    <p className="text-muted mb-4">Complete the form to create your account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">First Name</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2" 
                                    required
                                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Last Name</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2" 
                                    required
                                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                            <input 
                                type="email" 
                                className="form-control bg-light border-0 py-2" 
                                required
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Password</label>
                            <input 
                                type="password" 
                                className="form-control bg-light border-0 py-2" 
                                required
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Institution</label>
                            <select 
                                className="form-select bg-light border-0 py-2" 
                                required
                                onChange={e => setFormData({...formData, institution: e.target.value})}
                            >
                                <option value="">Select Institution</option>
                                {institutions.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted text-uppercase">Role</label>
                            <select 
                                className="form-select bg-light border-0 py-2" 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-4">
                            CREATE ACCOUNT <FaArrowRight className="ms-2" />
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-muted small">
                            Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .tracking-widest { letter-spacing: 0.2em; }
                .btn-primary { background-color: #312e81; border-color: #312e81; }
                .btn-primary:hover { background-color: #1e1b4b; border-color: #1e1b4b; }
                .text-primary { color: #312e81 !important; }
                .hover-primary:hover { color: #312e81 !important; }
            `}</style>
        </div>
    );
};

export default Register_V2;
