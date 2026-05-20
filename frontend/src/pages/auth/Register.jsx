import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaUser, 
    FaEnvelope, 
    FaLock, 
    FaArrowRight, 
    FaUniversity, 
    FaEye, 
    FaEyeSlash,
    FaCheckCircle,
    FaArrowLeft,
    FaShieldAlt,
    FaChalkboardTeacher,
    FaUserGraduate
} from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        role: 'student',
        institution: ''
    });
    const [institutions, setInstitutions] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
    
    const videoRef = useRef(null);
    const navigate = useNavigate();

    const roleConfig = {
        admin: { color: '#2563eb', label: 'Admin', icon: <FaShieldAlt />, glow: 'rgba(37, 99, 235, 0.4)' },
        teacher: { color: '#7c3aed', label: 'Teacher', icon: <FaChalkboardTeacher />, glow: 'rgba(124, 58, 237, 0.4)' },
        student: { color: '#06b6d4', label: 'Student', icon: <FaUserGraduate />, glow: 'rgba(6, 182, 212, 0.4)' }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // Slow down the video
        }
        
        const fetchInstitutions = async () => {
            try {
                const res = await axiosInstance.get('auth/institutions/');
                const data = res.data.results || res.data;
                if (Array.isArray(data)) setInstitutions(data);
            } catch (err) {
                console.error('Could not load institutions');
            }
        };
        fetchInstitutions();
    }, []);

    const calculateStrength = (pass) => {
        let strength = 0;
        if (pass.length > 7) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const pass = e.target.value;
        setFormData({...formData, password: pass});
        calculateStrength(pass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const nameParts = formData.full_name.trim().split(' ');
        const payload = {
            email: formData.email,
            password: formData.password,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            role: formData.role,
            institution: formData.institution
        };

        try {
            await axiosInstance.post('auth/register/', payload);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-full-page">
            <video ref={videoRef} autoPlay muted loop playsInline className="auth-video-full">
                <source src="/bg_video1.mp4" type="video/mp4" />
            </video>
            <div className="auth-overlay-deep"></div>

            <div className="auth-split-container">
                {/* LEFT: 40% Content (Smaller for Register) */}
                <div className="auth-left-content" style={{ flex: '0 0 35%', padding: '5rem 3rem 5rem 5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="portal-title-huge" style={{ fontSize: '4.8rem' }}>
                            Join the <br />
                            Intelligent <br />
                            Ecosystem
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

                {/* RIGHT: 65% Form (Larger for Register fields) */}
                <div className="auth-right-form" style={{ flex: '0 0 65%', padding: '2rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="glass-card-ultra"
                        style={{ maxWidth: '580px', padding: '2rem' }}
                    >
                        <div className="text-center mb-4">
                            <h2 className="fw-900 mb-1 tracking-tight" style={{ color: '#0f172a' }}>Identity Registration</h2>
                            <p className="text-white opacity-40 smaller fw-600 uppercase tracking-widest">Security Protocol Required</p>
                        </div>

                        {/* ROLE SELECTOR */}
                        <div className="mb-4">
                            <div className="role-selector-pill p-1 rounded-pill d-flex border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                {Object.entries(roleConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormData({...formData, role: key})}
                                        className="role-item flex-fill py-2 rounded-pill border-0 position-relative d-flex align-items-center justify-content-center gap-2"
                                        style={{ cursor: 'pointer', background: 'transparent', outline: 'none' }}
                                    >
                                        {formData.role === key && (
                                            <motion.div 
                                                layoutId="activeRoleBgReg"
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
                                                color: formData.role === key ? '#ffffff' : '#0f172a',
                                                opacity: formData.role === key ? 1 : 0.8
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
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">Full Name</label>
                                        <div className="input-wrapper-standard">
                                            <FaUser className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="text" 
                                                className="form-control glass-input-dark"
                                                placeholder="Entity Name"
                                                value={formData.full_name} 
                                                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">Communication Node</label>
                                        <div className="input-wrapper-standard">
                                            <FaEnvelope className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type="email" 
                                                className="form-control glass-input-dark"
                                                placeholder="node@sync.com"
                                                value={formData.email} 
                                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-3">
                                        <label className="glass-label mb-1 d-block">Institutional Attachment</label>
                                        <div className="input-wrapper-standard">
                                            <FaUniversity className="input-icon-standard text-white opacity-70" />
                                            <select 
                                                className="form-control glass-input-dark"
                                                value={formData.institution} 
                                                onChange={e => setFormData({...formData, institution: e.target.value})} 
                                                required
                                            >
                                                <option value="" disabled>Select Institution</option>
                                                {institutions.map(inst => (
                                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="glass-label mb-1 d-block">Security Key</label>
                                        <div className="input-wrapper-standard">
                                            <FaLock className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="form-control glass-input-dark pe-5"
                                                placeholder="••••••••"
                                                value={formData.password} 
                                                onChange={handlePasswordChange} 
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
                                        <div className="mt-2 d-flex gap-1 px-1">
                                            {[1, 2, 3, 4].map(s => (
                                                <div key={s} className="flex-fill rounded-pill" style={{ height: '3px', background: passwordStrength >= s ? '#fff' : 'rgba(255,255,255,0.1)', opacity: passwordStrength >= s ? 0.8 : 0.2 }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="glass-label mb-1 d-block">Verify Key</label>
                                        <div className="input-wrapper-standard">
                                            <FaLock className="input-icon-standard text-white opacity-70" />
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                className="form-control glass-input-dark pe-5"
                                                placeholder="••••••••"
                                                value={formData.confirm_password} 
                                                onChange={e => setFormData({...formData, confirm_password: e.target.value})} 
                                                required 
                                            />
                                            <button 
                                                type="button" 
                                                className="password-toggle-btn-white text-white opacity-50" 
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="btn w-100 py-3 mt-2 rounded-pill fw-800 text-white"
                                style={{ 
                                    background: '#000000', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {isLoading ? 'INITIALIZING...' : 'INITIALIZE IDENTITY'}
                            </button>
                        </form>

                        <div className="text-center mt-2">
                            <Link to="/login" className="smaller fw-700 text-white opacity-40 text-decoration-none hover-opacity-100">
                                Existing Node? <span className="text-white opacity-100 border-bottom">Enter Portal</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .input-icon-standard { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 5; }
                .password-toggle-btn-white { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; z-index: 5; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .role-item { outline: none !important; }
                select.glass-input-dark option {
                    background: #000000;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default Register;
