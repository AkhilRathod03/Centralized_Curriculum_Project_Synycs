import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaSave, FaTrash, FaChartBar, FaTable, FaRobot, 
    FaFileExport, FaLayerGroup, FaGripVertical, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReportBuilder = ({ onClose }) => {
    const { darkMode } = useContext(ThemeContext);
    const [selectedWidgets, setSelectedWidgets] = useState([]);
    const [reportName, setReportName] = useState('New Custom Report');

    const availableWidgets = [
        { id: 'kpi-attendance', name: 'Attendance KPI', icon: <FaChartBar />, type: 'kpi' },
        { id: 'kpi-performance', name: 'Performance KPI', icon: <FaChartBar />, type: 'kpi' },
        { id: 'chart-trends', name: 'Monthly Trends Chart', icon: <FaChartBar />, type: 'chart' },
        { id: 'table-dept', name: 'Department Comparison Table', icon: <FaTable />, type: 'table' },
        { id: 'ai-summary', name: 'AI Executive Summary', icon: <FaRobot />, type: 'ai' },
        { id: 'audit-log', name: 'Audit Activity Feed', icon: <FaLayerGroup />, type: 'table' },
    ];

    const addWidget = (widget) => {
        if (selectedWidgets.find(w => w.id === widget.id)) {
            toast.warning('Widget already added to report.');
            return;
        }
        setSelectedWidgets([...selectedWidgets, widget]);
        toast.success(`${widget.name} added.`);
    };

    const removeWidget = (id) => {
        setSelectedWidgets(selectedWidgets.filter(w => w.id !== id));
    };

    const handleExport = (format) => {
        if (selectedWidgets.length === 0) {
            toast.error('Please add widgets to your report before exporting.');
            return;
        }
        toast.info(`Generating ${format.toUpperCase()} export for "${reportName}"...`);
        setTimeout(() => {
            toast.success('Custom report exported successfully!');
        }, 2000);
    };

    const handleSave = () => {
        if (selectedWidgets.length === 0) {
            toast.error('Please add at least one widget.');
            return;
        }
        toast.success(`Report "${reportName}" saved to templates!`);
        onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000 }}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`card border-0 rounded-4 shadow-2xl overflow-hidden ${darkMode ? 'bg-dark text-white' : 'bg-white'}`}
                style={{ width: '900px', maxWidth: '95%', height: '80vh' }}
            >
                <div className="d-flex h-100">
                    {/* Sidebar: Available Widgets */}
                    <div className={`p-4 border-end ${darkMode ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light'}`} style={{ width: '280px' }}>
                        <h6 className="fw-bold mb-4 small text-uppercase text-muted letter-spacing-1">Available Widgets</h6>
                        <div className="space-y-2">
                            {availableWidgets.map(widget => (
                                <button 
                                    key={widget.id}
                                    onClick={() => addWidget(widget)}
                                    className={`btn w-100 text-start d-flex align-items-center gap-3 p-3 mb-2 rounded-3 transition-all ${darkMode ? 'btn-dark border-secondary' : 'btn-white bg-white'}`}
                                >
                                    <span className="text-primary">{widget.icon}</span>
                                    <span className="small fw-semibold">{widget.name}</span>
                                    <FaPlus className="ms-auto smaller opacity-50" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Report Canvas */}
                    <div className="flex-grow-1 p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <input 
                                type="text" 
                                className={`form-control-lg fw-bold bg-transparent border-0 p-0 ${darkMode ? 'text-white' : 'text-dark'}`} 
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                style={{ boxShadow: 'none' }}
                            />
                            <button onClick={onClose} className={`btn btn-icon-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}><FaTimes /></button>
                        </div>

                        <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar">
                            {selectedWidgets.length === 0 ? (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-50">
                                    <FaLayerGroup size={60} className="mb-3 text-muted" />
                                    <h5>Your report canvas is empty</h5>
                                    <p className="small">Drag or click widgets from the sidebar to start building.</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {selectedWidgets.map((widget, idx) => (
                                        <div key={widget.id} className={widget.type === 'kpi' ? 'col-md-6' : 'col-12'}>
                                            <div className={`p-3 rounded-4 border d-flex align-items-center gap-3 ${darkMode ? 'bg-glass-dark border-secondary' : 'bg-white border-light'} shadow-sm`}>
                                                <FaGripVertical className="text-muted cursor-move" />
                                                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                                                    {widget.icon}
                                                </div>
                                                <div className="fw-bold small">{widget.name}</div>
                                                <button onClick={() => removeWidget(widget.id)} className="btn btn-link text-danger ms-auto p-0"><FaTrash /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-top d-flex gap-2">
                            <button onClick={handleSave} className="btn btn-primary rounded-pill px-4 shadow-primary-glow d-flex align-items-center gap-2">
                                <FaSave /> Save Template
                            </button>
                            <button onClick={() => handleExport('pdf')} className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-pill px-4`}>
                                <FaFileExport className="me-2" /> Live Export
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReportBuilder;
