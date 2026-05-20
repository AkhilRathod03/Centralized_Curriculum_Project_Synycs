import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaChalkboardTeacher, FaCheckCircle, FaUserTie } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const FacultyAssignModal = ({ show, handleClose, course, onSuccess }) => {
    const { darkMode } = useContext(ThemeContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningId, setAssigningId] = useState(null);

    useEffect(() => {
        if (show) {
            fetchTeachers();
        }
    }, [show]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('auth/institutions/users/');
            const allUsers = res.data.results || res.data;
            setTeachers(allUsers.filter(u => u.role === 'teacher' && u.is_approved));
        } catch (err) {
            toast.error('Failed to load faculty directory');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (teacherId) => {
        try {
            setAssigningId(teacherId);
            await axiosInstance.post(`curriculum/courses/${course.id}/assign-teacher/`, {
                teacher_id: teacherId
            });
            toast.success('Faculty assigned successfully!');
            onSuccess();
            handleClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Assignment protocol failed';
            toast.error(msg);
        } finally {
            setAssigningId(null);
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`modal-content border-0 rounded-4 overflow-hidden ${darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white shadow-2xl'}`}
                >
                    <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1">Assign Faculty</h4>
                            <p className="text-muted small mb-0">Course: <span className="text-primary fw-bold">{course?.name}</span></p>
                        </div>
                        <button onClick={handleClose} className={`btn-close ${darkMode ? 'btn-close-white' : ''}`}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className={`input-group glass rounded-pill border shadow-sm mb-4 ${darkMode ? 'border-secondary' : ''}`}>
                            <span className="input-group-text bg-transparent border-0 text-muted ps-3"><FaSearch size={14} /></span>
                            <input 
                                type="text" 
                                className={`form-control bg-transparent border-0 shadow-none py-2 small ${darkMode ? 'text-white' : ''}`} 
                                placeholder="Search faculty by name or email..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="faculty-list custom-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                                    <p className="text-muted smaller mt-2">Loading directory...</p>
                                </div>
                            ) : filteredTeachers.length > 0 ? filteredTeachers.map(teacher => (
                                <div 
                                    key={teacher.id} 
                                    className={`p-3 rounded-4 border mb-2 d-flex align-items-center transition-all ${darkMode ? 'hover-bg-opacity-10 border-secondary' : 'hover-light border-light'}`}
                                >
                                    <div className="position-relative me-3">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${teacher.username}&background=2563eb&color=fff`} 
                                            className="rounded-circle border border-2 border-white shadow-sm" 
                                            width="40" height="40" alt=""
                                        />
                                        <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" style={{ width: '10px', height: '12px' }}></div>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className={`fw-bold small ${darkMode ? 'text-white' : 'text-dark'}`}>{teacher.username}</div>
                                        <div className="text-muted text-xs">{teacher.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleAssign(teacher.id)}
                                        disabled={assigningId === teacher.id}
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${assigningId === teacher.id ? 'btn-light' : 'btn-primary-premium'}`}
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        {assigningId === teacher.id ? 'Assigning...' : 'Assign'}
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-5 opacity-50">
                                    <FaUserTie size={32} className="mb-2" />
                                    <p className="small fw-bold mb-0">No faculty found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default FacultyAssignModal;
