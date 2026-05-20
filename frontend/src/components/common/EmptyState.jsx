import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaPlus } from 'react-icons/fa';

const EmptyState = ({ title, description, icon, actionLabel, onAction, aiSuggestion }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-5 px-4"
        >
            <div className="mb-4 d-inline-flex p-4 rounded-circle bg-light border border-dashed border-2">
                {icon || <FaRobot size={48} className="text-muted opacity-25" />}
            </div>
            <h4 className="fw-bold mb-2">{title}</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '400px' }}>{description}</p>
            
            <div className="d-flex flex-column align-items-center gap-3">
                {onAction && (
                    <button onClick={onAction} className="btn btn-primary-premium">
                        <FaPlus size={12} /> {actionLabel}
                    </button>
                )}
                
                {aiSuggestion && (
                    <div className="p-3 rounded-4 bg-ai-gradient bg-opacity-10 border border-primary border-opacity-10 shadow-sm" style={{ maxWidth: '450px' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 justify-content-center">
                            <FaRobot className="text-primary" />
                            <span className="small fw-bold text-primary text-uppercase">AI Recommendation</span>
                        </div>
                        <p className="small mb-0 text-dark italic">"{aiSuggestion}"</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default EmptyState;
