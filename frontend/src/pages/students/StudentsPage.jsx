import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AdminStudents from './AdminStudents';
import TeacherStudents from './TeacherStudents';

const StudentsPage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);

    if (!user) return null;

    return (
        <div className={`students-workspace h-100 ${darkMode ? 'bg-dark' : 'bg-main'}`}>
            {user.role === 'admin' && <AdminStudents />}
            {user.role === 'teacher' && <TeacherStudents />}
            {(user.role !== 'admin' && user.role !== 'teacher') && (
                <div className="p-5 text-center">
                    <h1 className="display-4 fw-bold text-danger">403</h1>
                    <p className="lead">You do not have permission to access the Student Management terminal.</p>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;
