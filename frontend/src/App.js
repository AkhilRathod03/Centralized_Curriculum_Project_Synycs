import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Programs from './pages/curriculum/Programs';
import AcademicExplorer from './pages/curriculum/AcademicExplorer';
import Courses from './pages/curriculum/Courses';
import CurriculumBuilder from './pages/curriculum/CurriculumBuilder';
import TopicDetail from './pages/curriculum/TopicDetail';
import SchedulePage from './pages/schedule/SchedulePage';
import UserManagement from './pages/users/UserManagement';
import StudentsPage from './pages/students/StudentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import MyFaculty from './pages/teachers/MyFaculty';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AuditLogPage from './pages/dashboard/AuditLogPage';
import AIAssistant from './pages/ai/AIAssistant';
import AILessonPlanner from './pages/ai/AILessonPlanner';
import AIQuizGenerator from './pages/ai/AIQuizGenerator';
import StudentAssistant from './pages/ai/StudentAssistant';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/auth/Profile';
import ResourceManager from './pages/dashboard/ResourceManager';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import ReportsPage from './pages/reports/ReportsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              
              {/* Neural AI Routes */}
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/student-assistant" element={<StudentAssistant />} />
              <Route path="/ai-lesson-planner" element={<AILessonPlanner />} />
              <Route path="/ai-quiz-gen" element={<AIQuizGenerator />} />
              
              <Route path="/audit-logs" element={<AuditLogPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/resources" element={<ResourceManager />} />
              
              {/* Restricted Curriculum Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
                <Route path="/curriculum" element={<CurriculumBuilder />} />
                <Route path="/curriculum/topic/:id" element={<TopicDetail />} />
              </Route>

              <Route path="/programs" element={<AcademicExplorer />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/my-faculty" element={<MyFaculty />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/unauthorized" element={<div className="text-center mt-5"><h1>403 - Unauthorized</h1></div>} />
        </Routes>
        <ToastContainer position="bottom-right" />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
