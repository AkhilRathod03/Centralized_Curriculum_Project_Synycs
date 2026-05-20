import React from 'react';
import { motion } from 'framer-motion';

const PremiumCard = ({ children, title, subtitle, icon, color, actions, className = '', isAI = false, noPadding = false, onClick }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`glass-card ${isAI ? 'ai-neon-card' : ''} ${className}`}
            onClick={onClick}
        >
            {(title || icon) && (
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center border-opacity-10">
                    <div className="d-flex align-items-center gap-3">
                        {icon && (
                            <div className={`p-2 rounded-3 ${isAI ? 'bg-ai-gradient' : ''}`} style={!isAI ? { backgroundColor: `${color}15`, color: color } : {}}>
                                {icon}
                            </div>
                        )}
                        <div>
                            <h6 className={`section-title mb-0 ${isAI ? 'text-ai-theme' : ''}`}>{title}</h6>
                            {subtitle && <small className="text-muted d-block">{subtitle}</small>}
                        </div>
                    </div>
                    {actions && <div className="d-flex gap-2">{actions}</div>}
                </div>
            )}
            <div className={`${noPadding ? '' : 'p-4'} ${isAI ? 'text-ai-theme' : ''} h-100 d-flex flex-column`}>
                {children}
            </div>
        </motion.div>
    );
};

export default PremiumCard;
