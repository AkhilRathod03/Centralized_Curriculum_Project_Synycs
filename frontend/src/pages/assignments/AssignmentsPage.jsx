import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AdminAssignments from './AdminAssignments';
import TeacherAssignments from './TeacherAssignments';
import StudentAssignments from './StudentAssignments';

const AssignmentsPage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);

    // Fallback if user is somehow null
    if (!user) {
        return <div className={`p-4 ${darkMode ? 'text-white' : 'text-dark'}`}>Loading assignment workspace...</div>;
    }

    return (
        <div className="assignments-container h-100">
            {user.role === 'admin' && <AdminAssignments />}
            {user.role === 'teacher' && <TeacherAssignments />}
            {user.role === 'student' && <StudentAssignments />}
        </div>
    );
};

export default AssignmentsPage;
