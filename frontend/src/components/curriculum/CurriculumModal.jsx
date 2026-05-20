import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CurriculumModal = ({ show, handleClose, title, fields, onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        if (show) setFormData(initialData);
    }, [show, initialData]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({});
    };

    return (
        <div className="modal show d-block glass" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2050 }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-dialog modal-dialog-centered"
            >
                <div className="modal-content border-0 shadow-2xl rounded-5 overflow-hidden">
                    <div className="modal-header bg-primary text-white p-4 border-0">
                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={handleClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 bg-white">
                            {fields.map((field) => (
                                <div className="mb-4" key={field.name}>
                                    <label className="form-label smaller fw-bold text-muted uppercase letter-spacing-1">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="form-control border-light rounded-4 shadow-sm py-2"
                                            rows="4"
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            style={{ fontSize: '0.9rem' }}
                                        ></textarea>
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            className="form-control border-light rounded-4 shadow-sm py-3 px-3"
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            style={{ fontSize: '0.9rem' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0 bg-white">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={handleClose}>Discard</button>
                            <button type="submit" className="btn btn-primary-premium px-5 py-2 shadow-lg">Execute Protocol</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CurriculumModal;
