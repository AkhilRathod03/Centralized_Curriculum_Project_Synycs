import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaUser, FaLock, FaBell, FaGlobe, FaPalette, 
    FaShieldAlt, FaSave, FaTrashAlt, FaHistory,
    FaKey, FaUserTag, FaEnvelope, FaClock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(true);

    const tabs = [
        { id: 'account', label: 'Account', icon: <FaUser /> },
        { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'system', label: 'System', icon: <FaGlobe /> },
    ];

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Settings synchronized successfully!");
        }, 1500);
    };

    const handlePasswordUpdate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Credentials updated successfully!");
        }, 1500);
    };

    const renderAccountTab = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row g-4">
            <div className="col-12">
                <div className={`p-4 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <FaUserTag className="text-primary" /> Profile Identification
                    </h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Username</label>
                            <input type="text" className={`form-control rounded-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} defaultValue={user?.username} disabled />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Role</label>
                            <input type="text" className={`form-control rounded-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} defaultValue={user?.role} disabled />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label small fw-bold text-muted">Email Address</label>
                            <div className="input-group">
                                <span className={`input-group-text rounded-start-3 ${darkMode ? 'bg-black border-secondary' : 'bg-light'}`}><FaEnvelope className="text-muted" /></span>
                                <input type="email" className={`form-control rounded-end-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} defaultValue={user?.email || 'akhil@synycs.com'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderSecurityTab = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row g-4">
            <div className="col-12">
                <div className={`p-4 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <FaKey className="text-primary" /> Credentials Update
                    </h5>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label small fw-bold text-muted">Current Password</label>
                            <div className="position-relative">
                                <input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    className={`form-control rounded-3 pe-5 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} 
                                    defaultValue="synycs@password"
                                    autoComplete="current-password"
                                />
                                <button 
                                    type="button"
                                    className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">New Password</label>
                            <input type="password" className={`form-control rounded-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} autoComplete="new-password" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                            <input type="password" className={`form-control rounded-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`} autoComplete="new-password" />
                        </div>
                        <div className="col-12 mt-4 text-end">
                            <button 
                                onClick={handlePasswordUpdate}
                                disabled={loading}
                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                            >
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaSave className="me-2" />}
                                Update Credentials
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className={`p-4 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <FaHistory className="text-primary" /> Active Sessions
                    </h5>
                    <div className="list-group list-group-flush">
                        <div className={`list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 ${darkMode ? 'border-secondary border-opacity-20' : ''}`}>
                            <div>
                                <div className={`fw-bold small ${darkMode ? 'text-white' : ''}`}>Windows PC - Chrome Browser</div>
                                <div className="text-muted text-xs">Hyderabad, India • Active Now</div>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Current</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderNotificationsTab = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row g-4">
            <div className="col-12">
                <div className={`p-4 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <FaBell className="text-primary" /> Channel Preferences
                    </h5>
                    {[
                        { title: "Email Notifications", desc: "Receive updates about academic sessions via email", checked: true },
                        { title: "Browser Alerts", desc: "Get real-time push notifications in your browser", checked: true },
                        { title: "AI Assistant Updates", desc: "Weekly summaries from your Neural Assistant", checked: false },
                        { title: "Security Alerts", desc: "Important notices about account security and logins", checked: true }
                    ].map((item, i) => (
                        <div key={i} className={`d-flex justify-content-between align-items-center py-3 ${i !== 3 ? 'border-bottom' : ''} ${darkMode ? 'border-secondary border-opacity-20' : ''}`}>
                            <div>
                                <div className={`fw-bold ${darkMode ? 'text-white' : ''}`}>{item.title}</div>
                                <div className="text-muted small">{item.desc}</div>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" defaultChecked={item.checked} style={{ width: '40px', height: '20px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderSystemTab = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row g-4">
            <div className="col-12">
                <div className={`p-4 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <FaGlobe className="text-primary" /> Regionalization
                    </h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Primary Language</label>
                            <select className={`form-select rounded-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`}>
                                <option>English (United States)</option>
                                <option>English (India)</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Timezone</label>
                            <div className="input-group">
                                <span className={`input-group-text rounded-start-3 ${darkMode ? 'bg-black border-secondary' : 'bg-light'}`}><FaClock className="text-muted" /></span>
                                <select className={`form-select rounded-end-3 ${darkMode ? 'bg-black text-white border-secondary' : 'bg-light'}`}>
                                    <option>(GMT+05:30) India Standard Time</option>
                                    <option>(GMT-08:00) Pacific Time</option>
                                    <option>(GMT+00:00) Universal Time</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className={`p-4 rounded-4 border border-primary border-opacity-20 ${darkMode ? 'bg-dark' : 'bg-primary bg-opacity-5'}`}>
                    <h5 className="fw-bold mb-2 text-primary d-flex align-items-center gap-2">
                        <FaShieldAlt /> Enterprise Compliance
                    </h5>
                    <p className="text-muted small mb-4">Manage institutional data privacy, archival settings, and academic account deactivation.</p>
                    <button className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm">Manage Account Status</button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>Settings Portal</h2>
                    <p className="text-muted mb-0">Configure your personal and system preferences</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-primary-glow"
                >
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <FaSave />}
                    <span className="fw-bold">Synchronize Changes</span>
                </button>
            </div>

            <div className="row g-4">
                {/* Sidebar Navigation */}
                <div className="col-lg-3">
                    <div className={`p-2 rounded-4 border ${darkMode ? 'bg-dark border-secondary border-opacity-20' : 'bg-white shadow-sm'}`}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-100 border-0 rounded-3 p-3 mb-1 text-start d-flex align-items-center gap-3 transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-primary-glow' 
                                    : `bg-transparent ${darkMode ? 'text-white-50 hover-bg-white-5' : 'text-secondary hover-bg-light'}`
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'text-white' : 'text-primary'}>{tab.icon}</span>
                                <span className="fw-bold small">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="col-lg-9">
                    <AnimatePresence mode="wait">
                        {activeTab === 'account' && renderAccountTab()}
                        {activeTab === 'security' && renderSecurityTab()}
                        {activeTab === 'notifications' && renderNotificationsTab()}
                        {activeTab === 'system' && renderSystemTab()}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .shadow-primary-glow { box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
                .text-xs { font-size: 0.7rem; }
                .hover-bg-white-5:hover { background-color: rgba(255,255,255,0.05); }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .form-switch .form-check-input:checked { background-color: #2563eb; border-color: #2563eb; }
                .form-control:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
            `}</style>
        </div>
    );
};

export default Settings;
