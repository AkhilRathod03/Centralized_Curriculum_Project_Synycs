import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AdminAttendance from './AdminAttendance';
import TeacherAttendance from './TeacherAttendance';
import StudentAttendance from './StudentAttendance';

const AttendancePage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);

    if (!user) {
        return <div className={`p-4 ${darkMode ? 'text-white' : 'text-dark'}`}>Loading attendance workspace...</div>;
    }

    return (
        <div className="attendance-container h-100">
            {user.role === 'admin' && <AdminAttendance />}
            {user.role === 'teacher' && <TeacherAttendance />}
            {user.role === 'student' && <StudentAttendance />}
        </div>
    );
};

export default AttendancePage;
