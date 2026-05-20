import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaCheckCircle, FaExclamationTriangle, FaArrowDown, FaPlus, FaMagic } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';

const AISuggestionsModal = ({ show, handleClose, suggestions, onApply, onAddTopic, onAddModule }) => {
    const { darkMode } = useContext(ThemeContext);

    if (!show || !suggestions) return null;

    const { reorders = [], missing_topics = [], new_modules = [], reasoning = "" } = suggestions;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`modal-content border-0 rounded-4 overflow-hidden ${darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white shadow-2xl'}`}
                >
                    <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-ai-gradient p-2 rounded-3 text-white shadow-ai-glow">
                                <FaRobot size={20} />
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">Neural Curriculum Standards</h4>
                                <p className="text-muted small mb-0">Analyzing course alignment (5-Unit Standard)</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                    </div>

                    <div className="modal-body p-4 custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {/* Reasoning */}
                        <div className={`p-3 rounded-4 mb-4 ${darkMode ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20' : 'bg-light border'}`}>
                            <h6 className="fw-bold text-primary small uppercase mb-2">AI Reasoning & Academic Standards</h6>
                            <p className="small mb-0 opacity-80">{reasoning || "Standardizing your curriculum to 5 logical units for industrial and academic completeness."}</p>
                        </div>

                        <div className="row g-4">
                            {/* Missing Modules (To reach 5) */}
                            {new_modules.length > 0 && (
                                <div className="col-12 mb-2">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                                        <FaPlus /> Suggested Lessons (Standardization)
                                    </h6>
                                    <div className="row g-3">
                                        {new_modules.map((mod, i) => (
                                            <div key={i} className="col-md-6">
                                                <div className={`p-3 rounded-4 border h-100 transition-all ${darkMode ? 'bg-dark bg-opacity-40 border-secondary' : 'bg-white'}`}>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="fw-bold mb-0 small">{mod.name}</h6>
                                                        <button 
                                                            className="btn btn-xs btn-primary rounded-pill px-2 py-1 fw-bold uppercase" 
                                                            style={{ fontSize: '0.55rem' }}
                                                            onClick={() => onAddModule(mod)}
                                                        >
                                                            Initialize
                                                        </button>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {mod.topics.map((t, ti) => (
                                                            <span key={ti} className="badge bg-light text-muted border fw-medium" style={{ fontSize: '0.6rem' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reordering Suggestions */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaArrowDown className="text-warning" /> Logic Sequence Fixes
                                </h6>
                                {reorders.length > 0 ? (
                                    <div className="space-y-2">
                                        {reorders.map((r, i) => (
                                            <div key={i} className={`p-3 rounded-3 border ${darkMode ? 'border-secondary bg-dark bg-opacity-40' : 'bg-white'}`}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="badge bg-warning bg-opacity-10 text-warning smaller fw-bold uppercase">{r.type}</span>
                                                    <span className="text-muted smaller">Order: {r.suggested_order + 1}</span>
                                                </div>
                                                <p className="small fw-bold mb-0">Node ID: {r.id}</p>
                                                <p className="smaller text-muted mb-0 mt-1">AI suggests moving this node for better logical flow.</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 border rounded-3 border-dashed opacity-50 h-100 d-flex flex-column align-items-center justify-content-center">
                                        <FaCheckCircle className="text-success mb-2" size={24} />
                                        <p className="smaller mb-0">Sequence is optimal.</p>
                                    </div>
                                )}
                            </div>

                            {/* Missing Topics */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaPlus className="text-success" /> Key Topic Recommendations
                                </h6>
                                <div className="space-y-2">
                                    {missing_topics.map((topic, i) => (
                                        <div 
                                            key={i} 
                                            className={`p-3 rounded-3 border cursor-pointer transition-all ${darkMode ? 'border-secondary bg-dark bg-opacity-40 hover-bg-opacity-20' : 'bg-white hover-light'}`}
                                            onClick={() => onAddTopic(topic)}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <FaPlus size={10} className="text-success" />
                                                    <span className="small fw-bold">{topic}</span>
                                                </div>
                                                <span className="text-primary smaller fw-bold uppercase" style={{ fontSize: '0.6rem' }}>Add</span>
                                            </div>
                                        </div>
                                    ))}
                                    {missing_topics.length === 0 && (
                                        <div className="text-center py-4 border rounded-3 border-dashed opacity-50">
                                            <p className="smaller mb-0 text-muted">No major gaps identified.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`modal-footer border-0 p-4 pt-0 d-flex gap-3`}>
                        <button className="btn btn-light rounded-pill px-4 fw-bold small flex-grow-1" onClick={handleClose}>Dismiss</button>
                        <button 
                            className="btn btn-ai-gradient text-white rounded-pill px-5 fw-bold shadow-ai-glow flex-grow-1" 
                            onClick={onApply}
                        >
                            <FaMagic className="me-2" /> Apply All Reorders
                        </button>
                    </div>
                </motion.div>
            </div>
            <style>{`
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .shadow-ai-glow { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
                .hover-bg-opacity-20:hover { background-color: rgba(255,255,255,0.05) !important; }
                .btn-xs { padding: 0.1rem 0.4rem; font-size: 0.65rem; }
            `}</style>
        </div>
    );
};

export default AISuggestionsModal;
