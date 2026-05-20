import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaRobot } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions = [], aiInsight }) => {
    return (
        <div className="mb-5">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="mb-2">
                    <ol className="breadcrumb mb-0">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className={`breadcrumb-item small ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
                                {crumb.path ? (
                                    <Link to={crumb.path} className="text-decoration-none text-muted">{crumb.label}</Link>
                                ) : (
                                    <span className="text-muted">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="display-title mb-1 text-gradient-primary">{title}</h1>
                    <p className="text-secondary mb-0 fw-medium opacity-75">{subtitle}</p>
                </motion.div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {aiInsight && (
                        <button className="btn btn-premium bg-ai-gradient text-white border-0 shadow-sm me-2">
                            <FaRobot className="me-2" /> AI Insights
                        </button>
                    )}
                    {actions.map((action, index) => (
                        <button 
                            key={index}
                            onClick={action.onClick}
                            className={`btn ${action.variant === 'primary' ? 'btn-primary-premium' : 'btn-white'} d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm`}
                        >
                            <span className="d-flex align-items-center justify-content-center" style={{ marginTop: '1px' }}>{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
