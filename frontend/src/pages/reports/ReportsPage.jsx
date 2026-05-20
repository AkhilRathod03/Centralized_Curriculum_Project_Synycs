import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AdminReports from './AdminReports';
import TeacherReports from './TeacherReports';
import StudentReports from './StudentReports';
import ReportBuilder from './ReportBuilder';
import { FaPlus } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';

const ReportsPage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [showBuilder, setShowBuilder] = useState(false);

    if (!user) {
        return (
            <div className={`d-flex align-items-center justify-content-center h-100 ${darkMode ? 'text-white' : 'text-dark'}`}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="fw-bold">Authenticating Academic Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-workspace h-100 overflow-hidden position-relative">
            {user.role === 'admin' && <AdminReports />}
            {user.role === 'teacher' && <TeacherReports />}
            {user.role === 'student' && <StudentReports />}

            {/* Global Floating Action Button for Report Builder (Admin/Teacher only) */}
            {(user.role === 'admin' || user.role === 'teacher') && (
                <button 
                    onClick={() => setShowBuilder(true)}
                    className="btn btn-primary btn-icon rounded-circle shadow-lg position-absolute" 
                    style={{ bottom: '30px', right: '30px', width: '55px', height: '55px', zIndex: 1000 }}
                    title="Open Report Builder"
                >
                    <FaPlus size={24} />
                </button>
            )}

            <AnimatePresence>
                {showBuilder && <ReportBuilder onClose={() => setShowBuilder(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default ReportsPage;
