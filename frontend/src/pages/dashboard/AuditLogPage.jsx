import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { FaClock, FaHistory, FaUser, FaTag, FaDatabase, FaArrowLeft, FaSync, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';

const AuditLogPage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('audit/logs/');
            setAuditLogs(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-5 px-lg-4">
            <PageHeader 
                title="System Audit Vault"
                subtitle="Immutable ledger of all institutional operations and security events"
                breadcrumbs={[{ label: 'System', path: '#' }, { label: 'Audit Logs' }]}
                actions={[
                    { label: 'Refresh Ledger', icon: <FaSync size={11} className={loading ? 'fa-spin' : ''} />, variant: 'primary', onClick: fetchAuditLogs }
                ]}
            />

            <PremiumCard className="border-0 shadow-lg p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className={`table table-hover align-middle mb-0 custom-enterprise-table ${darkMode ? 'table-dark' : ''}`}>
                        <thead className={`${darkMode ? 'bg-dark bg-opacity-40' : 'bg-light bg-opacity-50'}`}>
                            <tr>
                                <th className="ps-4 py-3 border-0 text-muted small uppercase letter-spacing-1">Temporal Node</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Operator</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Action Profile</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">Resource</th>
                                <th className="py-3 border-0 text-muted small uppercase letter-spacing-1">IP Protocol</th>
                                <th className="pe-4 py-3 border-0 text-muted small uppercase letter-spacing-1">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}><td colSpan="6" className="p-4"><div className="ai-shimmer rounded-pill py-3 w-100 opacity-50"></div></td></tr>
                                ))
                            ) : auditLogs.length > 0 ? (
                                auditLogs.map((log, i) => (
                                    <tr key={i} className={`${darkMode ? 'border-secondary border-opacity-20' : 'border-light border-opacity-50'}`}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center text-muted smaller fw-bold">
                                                <FaClock className="me-2 text-primary opacity-50" /> {formatDate(log.timestamp)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${darkMode ? 'bg-dark bg-opacity-40' : 'bg-light'}`} style={{ width: '32px', height: '32px' }}>
                                                    <FaUser className="text-primary opacity-80" size={12} />
                                                </div>
                                                <span className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{log.user_detail?.username || 'System Engine'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-1 fw-bold text-uppercase border ${
                                                log.action === 'CREATE' ? 'bg-success bg-opacity-10 text-success border-success border-opacity-10' :
                                                log.action === 'UPDATE' ? 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-10' :
                                                'bg-danger bg-opacity-10 text-danger border-danger border-opacity-10'
                                            }`} style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaDatabase className="me-2 text-info opacity-70" size={12} />
                                                <span className={`fw-bold small ${darkMode ? 'text-white-50' : 'text-muted'}`}>{log.model_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-2 py-1 fw-medium border ${darkMode ? 'bg-dark bg-opacity-40 border-secondary text-muted' : 'bg-light border-light text-muted'}`} style={{ fontSize: '0.6rem' }}>
                                                {log.ip_address || '127.0.0.1'}
                                            </span>
                                        </td>
                                        <td className="pe-4">
                                            <div className={`p-2 rounded-3 smaller font-monospace border ${darkMode ? 'bg-dark bg-opacity-40 border-secondary text-white-50' : 'bg-light border-light text-muted'}`} style={{ fontSize: '0.65rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {JSON.stringify(log.changes)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 border-0"><p className="text-muted small mb-0">No operational records identified in the current vault session.</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </motion.div>
    );
};

export default AuditLogPage;
