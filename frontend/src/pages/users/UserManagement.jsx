import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { 
    FaUserPlus, FaSearch, FaTrash, FaEdit, FaUserShield, FaChalkboardTeacher, 
    FaUserGraduate, FaFilter, FaFileExport, FaCheckCircle, FaTimesCircle, 
    FaEllipsisV, FaClock, FaSort
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../context/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';
import EmptyState from '../../components/common/EmptyState';

const UserManagement = () => {
    const { darkMode } = useContext(ThemeContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const role = params.get('role');
        const search = params.get('search');
        if (role) setActiveTab(role);
        if (search) setSearchTerm(search);
        fetchUsers();
    }, [location.search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('auth/institutions/users/');
            setUsers(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to load user records');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (userId, currentStatus) => {
        try {
            const action = currentStatus ? 'REVOKING' : 'APPROVING';
            toast.info(`${action} access...`);
            await axiosInstance.post(`auth/users/${userId}/approve/`);
            toast.success(`User access ${currentStatus ? 'revoked' : 'granted'} successfully!`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: !currentStatus } : u));
        } catch (err) {
            toast.error('Identity protocol update failed');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesTab = activeTab === 'all' || u.role === activeTab;
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="pb-5 px-lg-4">
            <PageHeader 
                title="Identity & Access"
                subtitle="Enterprise user management and security provisioning"
                breadcrumbs={[{ label: 'System', path: '#' }, { label: 'User Management' }]}
                actions={[
                    { label: 'Bulk Import', icon: <FaFileExport size={12} />, variant: 'secondary' },
                    { label: 'Provision User', icon: <FaUserPlus size={12} />, variant: 'primary' }
                ]}
            />

            <div className="row g-4 mb-4">
                {/* Stats Summary */}
                {[
                    { label: 'Total Entities', count: users.length, icon: <FaUserShield />, color: '#2563eb' },
                    { label: 'Approved', count: users.filter(u => u.is_approved).length, icon: <FaCheckCircle />, color: '#10b981' },
                    { label: 'Pending Audit', count: users.filter(u => !u.is_approved).length, icon: <FaClock />, color: '#f59e0b' }
                ].map((stat, i) => (
                    <div key={i} className="col-md-4">
                        <PremiumCard className="border-0 shadow-sm">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-3 rounded-4" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0">{stat.count}</h4>
                                    <p className="text-muted small mb-0 fw-bold uppercase letter-spacing-1">{stat.label}</p>
                                </div>
                            </div>
                        </PremiumCard>
                    </div>
                ))}
            </div>

            <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden">
                {/* Table Toolbar */}
                <div className={`p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-30'}`}>
                    <div className={`d-flex gap-2 p-1 border rounded-pill shadow-sm max-w-fit ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
                        {['all', 'admin', 'teacher', 'student'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`btn btn-sm rounded-pill px-4 py-2 fw-bold text-uppercase transition-all ${activeTab === tab ? 'btn-primary shadow-primary-glow' : `btn-link ${darkMode ? 'text-white-50' : 'text-muted'} text-decoration-none`}`}
                                style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                            >
                                {tab}s
                            </button>
                        ))}
                    </div>

                    <div className={`input-group glass rounded-pill border shadow-sm ${darkMode ? 'border-secondary' : ''}`} style={{ maxWidth: '350px' }}>
                        <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={14} /></span>
                        <input 
                            type="text" 
                            className={`form-control bg-transparent border-0 shadow-none py-2 small ${darkMode ? 'text-white' : ''}`} 
                            placeholder={`Search identified ${activeTab}s...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-responsive">
                    <table className={`table table-hover align-middle mb-0 custom-enterprise-table ${darkMode ? 'table-dark' : ''}`}>
                        <thead className={`${darkMode ? 'bg-dark bg-opacity-40' : 'bg-light bg-opacity-50'}`}>
                            <tr>
                                <th className="ps-4 py-3 border-0 text-muted small uppercase letter-spacing-1">Security Entity <FaSort size={10} className="ms-1 opacity-25" /></th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Role Profile</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Access Status</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Last Active</th>
                                <th className="pe-4 py-3 border-0 text-end text-muted small uppercase letter-spacing-1">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`}>
                                            <td colSpan="5" className="p-4"><div className="ai-shimmer rounded-pill py-3 w-100 opacity-50"></div></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                    <motion.tr 
                                        key={u.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`${darkMode ? 'border-secondary border-opacity-20' : 'border-light border-opacity-50'}`}
                                    >
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="position-relative me-3">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${u.username}&background=2563eb&color=fff`} 
                                                        className="rounded-circle border border-2 border-white shadow-sm" 
                                                        width="40" height="40" alt=""
                                                    />
                                                    <div className={`position-absolute bottom-0 end-0 p-1 rounded-circle border border-white shadow-sm ${u.is_approved ? 'bg-success' : 'bg-warning'}`} style={{ width: '12px', height: '12px' }}></div>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{u.username}</span>
                                                        {u.role === 'student' && u.program_name && (
                                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-2 py-0" style={{ fontSize: '0.55rem' }}>
                                                                {u.program_name} | SEM {u.current_semester}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-muted text-xs fw-medium">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-1 fw-bold text-uppercase border ${u.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-10' : u.role === 'teacher' ? 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-10' : 'bg-info bg-opacity-10 text-info border-info border-opacity-10'}`} style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                {u.role === 'admin' ? <FaUserShield className="me-1" /> : u.role === 'teacher' ? <FaChalkboardTeacher className="me-1" /> : <FaUserGraduate className="me-1" />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={`d-inline-flex align-items-center rounded-pill px-3 py-1 ${u.is_approved ? 'text-success bg-success bg-opacity-10' : 'text-warning bg-warning bg-opacity-10'}`}>
                                                {u.is_approved ? <FaCheckCircle className="me-2" size={12} /> : <FaClock className="me-2" size={12} />}
                                                <span className="small fw-bold uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>{u.is_approved ? 'Authorized' : 'Pending'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-muted small d-flex align-items-center fw-medium">
                                                <FaClock className="me-2 opacity-50" size={12} />
                                                <span>{u.last_login ? formatDate(u.last_login) : u.is_approved ? 'Awaiting Access' : 'Locked'}</span>
                                            </div>
                                        </td>
                                        <td className="pe-4 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className={`btn btn-sm rounded-pill px-3 fw-bold shadow-sm border-0 transition-all ${u.is_approved ? 'btn-outline-danger' : 'btn-primary-premium'}`}
                                                    onClick={() => handleToggleApproval(u.id, u.is_approved)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {u.is_approved ? 'Revoke' : 'Authorize'}
                                                </button>
                                                <button className={`btn btn-icon-sm border rounded-circle transition-all ${darkMode ? 'btn-dark border-secondary text-white-50' : 'btn-light'}`}><FaEdit size={12} /></button>
                                                <button className={`btn btn-icon-sm border rounded-circle text-danger transition-all ${darkMode ? 'btn-dark border-secondary' : 'btn-light'}`}><FaTrash size={12} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="border-0">
                                            <div className="py-5">
                                                <EmptyState 
                                                    title={`No ${activeTab} Records`}
                                                    description={searchTerm ? `Search for "${searchTerm}" returned zero protocol matches.` : `The institutional database contains no records for this identity class.`}
                                                    onAction={fetchUsers}
                                                    actionLabel="Refresh Directory"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </PremiumCard>

            <style>{`
                .custom-enterprise-table th { font-weight: 700; letter-spacing: 0.5px; }
                .btn-icon-sm { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
                .hover-opacity-75:hover { opacity: 0.75; }
                .uppercase { text-transform: uppercase; }
            `}</style>
        </motion.div>
    );
};

export default UserManagement;
