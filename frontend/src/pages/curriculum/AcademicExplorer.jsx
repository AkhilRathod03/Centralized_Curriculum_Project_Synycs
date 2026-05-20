import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaUniversity, FaGraduationCap, FaLayerGroup, FaBook, 
    FaChevronRight, FaArrowLeft, FaPlus, FaSearch, 
    FaMagic, FaChartLine, FaCheckCircle, FaExclamationTriangle,
    FaClock, FaUsers, FaArrowRight, FaBrain, FaRobot
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';
import EmptyState from '../../components/common/EmptyState';

const AcademicExplorer = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    
    const isStudent = user?.role === 'student';

    // Navigation State
    const [view, setView] = useState('degrees'); // degrees -> branches -> semesters -> courses
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    // Data State
    const [degrees, setDegrees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDegrees();
    }, []);

    const fetchDegrees = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/curriculums/');
            setDegrees(res.data.results || res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load degrees');
            setLoading(false);
        }
    };

    const fetchBranches = async (degreeId) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`curriculum/programs/?curriculum=${degreeId}`);
            setBranches(res.data.results || res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load branches');
            setLoading(false);
        }
    };

    const fetchCourses = async (branchId, semester) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`curriculum/courses/?program=${branchId}&semester=${semester}`);
            setCourses(res.data.results || res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const handleDegreeSelect = (degree) => {
        toast.info(`Accessing ${degree.short_name} branch registry...`, {
            icon: <FaBrain className="text-ai-accent" />,
            autoClose: 1000
        });
        setSelectedDegree(degree);
        fetchBranches(degree.id);
        setView('branches');
    };

    const handleBranchSelect = (branch) => {
        toast.info(`Accessing ${branch.name} semester index...`, {
            icon: <FaBrain className="text-ai-accent" />,
            autoClose: 1000
        });
        setSelectedBranch(branch);
        setView('semesters');
    };

    const handleSemesterSelect = (sem) => {
        setSelectedSemester(sem);
        fetchCourses(selectedBranch.id, sem);
        setView('courses');
    };

    const goBack = () => {
        if (view === 'courses') setView('semesters');
        else if (view === 'semesters') setView('branches');
        else if (view === 'branches') setView('degrees');
    };

    const resetSelection = () => {
        setSelectedDegree(null);
        setSelectedBranch(null);
        setSelectedSemester(null);
        setView('degrees');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    };

    return (
        <div className="pb-5 px-lg-4">
            <PageHeader 
                title="Institutional Academic Explorer"
                subtitle="Navigate through the academic hierarchy to view curriculums, programs, and semester-wise courses."
                breadcrumbs={[
                    !isStudent && { label: 'Curriculum', path: '/curriculum' },
                    { label: 'Academic Explorer' }
                ].filter(Boolean)}
                actions={[
                    !isStudent && { label: 'Add New Degree', icon: <FaPlus />, variant: 'primary', onClick: () => navigate('/curriculum') }
                ].filter(Boolean)}
            />

            {/* Breadcrumb Navigation */}
            <div className="card-modern p-3 mb-4 glass shadow-sm border-0 d-flex align-items-center gap-3">
                <button 
                    className={`btn btn-icon-sm rounded-circle ${view === 'degrees' ? 'invisible' : ''} ${darkMode ? 'btn-dark' : 'btn-light'}`}
                    onClick={goBack}
                >
                    <FaArrowLeft />
                </button>
                
                <div className="d-flex align-items-center gap-2 overflow-auto py-1">
                    <span 
                        className={`badge rounded-pill px-3 py-2 cursor-pointer transition-all ${view === 'degrees' ? 'bg-primary shadow-primary-glow' : 'bg-light text-muted'}`}
                        onClick={resetSelection}
                    >
                        Degrees
                    </span>
                    
                    {selectedDegree && (
                        <>
                            <FaChevronRight size={10} className="text-muted opacity-50" />
                            <span 
                                className={`badge rounded-pill px-3 py-2 cursor-pointer transition-all ${view === 'branches' ? 'bg-primary shadow-primary-glow' : 'bg-light text-muted'}`}
                                onClick={() => setView('branches')}
                            >
                                {selectedDegree.short_name}
                            </span>
                        </>
                    )}

                    {selectedBranch && (
                        <>
                            <FaChevronRight size={10} className="text-muted opacity-50" />
                            <span 
                                className={`badge rounded-pill px-3 py-2 cursor-pointer transition-all ${view === 'semesters' ? 'bg-primary shadow-primary-glow' : 'bg-light text-muted'}`}
                                onClick={() => setView('semesters')}
                            >
                                {selectedBranch.code}
                            </span>
                        </>
                    )}

                    {selectedSemester && (
                        <>
                            <FaChevronRight size={10} className="text-muted opacity-50" />
                            <span className="badge bg-primary shadow-primary-glow rounded-pill px-3 py-2">
                                Semester {selectedSemester}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* 1. DEGREES VIEW */}
                {view === 'degrees' && (
                    <motion.div 
                        key="degrees"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="row g-4"
                    >
                        {degrees.length > 0 ? degrees.map((deg) => (
                            <div key={deg.id} className="col-md-4 col-xl-3">
                                <PremiumCard 
                                    className="h-100 border-0 glass shadow-sm hover-lift text-center p-0 cursor-pointer overflow-hidden"
                                    onClick={() => handleDegreeSelect(deg)}
                                >
                                    <div className="p-4">
                                        <div className="d-flex justify-content-end mb-2">
                                            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-20 d-flex align-items-center gap-1" style={{ fontSize: '0.6rem' }}>
                                                <FaRobot size={10} /> AI Verified
                                            </span>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <FaUniversity size={32} />
                                        </div>
                                        <h4 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{deg.short_name}</h4>
                                        <p className="text-muted small mb-4">{deg.name}</p>
                                        
                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <div className="p-2 rounded-3 bg-light bg-opacity-50 border">
                                                    <div className="text-muted text-xs fw-bold uppercase opacity-50 mb-1">Programs</div>
                                                    <div className="fw-bold small">{deg.program_count || 0}</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 rounded-3 bg-light bg-opacity-50 border">
                                                    <div className="text-muted text-xs fw-bold uppercase opacity-50 mb-1">Health</div>
                                                    <div className="text-success fw-bold small">98%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-light bg-opacity-30 border-top mt-auto">
                                        <button 
                                            className="btn btn-primary btn-sm rounded-pill w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent double trigger
                                                handleDegreeSelect(deg);
                                            }}
                                        >
                                            {isStudent ? 'View Branches' : 'Explore Branches'} <FaChevronRight size={10} />
                                        </button>
                                    </div>
                                </PremiumCard>
                            </div>
                        )) : (
                            <div className="col-12">
                                <EmptyState 
                                    title="No Degrees Configured"
                                    description="Begin by adding high-level degrees like B.Tech, M.Tech, or MBA."
                                    actionLabel={!isStudent && "Add Curriculum"}
                                    onAction={!isStudent && (() => navigate('/curriculum'))}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 2. BRANCHES VIEW */}
                {view === 'branches' && (
                    <motion.div 
                        key="branches"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="row g-4"
                    >
                        {branches.length > 0 ? branches.map((branch) => (
                            <div key={branch.id} className="col-md-4 col-xl-3">
                                <PremiumCard 
                                    className="h-100 border-0 glass shadow-sm hover-lift p-0 cursor-pointer overflow-hidden"
                                    onClick={() => handleBranchSelect(branch)}
                                >
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="bg-ai-gradient text-white p-3 rounded-4 shadow-sm">
                                                <FaLayerGroup size={20} />
                                            </div>
                                            <span className="badge rounded-pill bg-light text-muted border px-2 py-1 fw-bold text-xs">{branch.code}</span>
                                        </div>
                                        <h5 className={`fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>{branch.name}</h5>
                                        <p className="text-muted smaller mb-4 line-clamp-2">{branch.description || "Core engineering program focused on foundational principles."}</p>
                                        
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="text-muted smaller fw-bold uppercase letter-spacing-1">{branch.duration_years} Year Program</div>
                                            <div className="text-primary fw-bold small d-flex align-items-center gap-1 opacity-50">
                                                Details <FaArrowRight size={10} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-light bg-opacity-30 border-top mt-auto">
                                        <button 
                                            className="btn btn-primary btn-sm rounded-pill w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBranchSelect(branch);
                                            }}
                                        >
                                            View Courses <FaArrowRight size={10} />
                                        </button>
                                    </div>
                                </PremiumCard>
                            </div>
                        )) : (
                            <div className="col-12">
                                <EmptyState 
                                    title={`No Branches in ${selectedDegree.short_name}`}
                                    description={`Add academic programs like CSE, ECE, or IT to the ${selectedDegree.short_name} curriculum.`}
                                    actionLabel={!isStudent && "Add Program"}
                                    onAction={!isStudent && (() => navigate('/curriculum'))}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 3. SEMESTERS VIEW */}
                {view === 'semesters' && (
                    <motion.div 
                        key="semesters"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-5"
                    >
                        <div className="mb-5">
                            <h2 className={`fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>Select Semester</h2>
                            <p className="text-muted">Choose a semester to view the curriculum and course delivery.</p>
                        </div>
                        
                        <div className="row g-4 justify-content-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, selectedBranch.duration_years * 2).map((sem) => (
                                <div key={sem} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                    <PremiumCard 
                                        className="border-0 glass shadow-sm hover-lift p-4 cursor-pointer text-center"
                                        onClick={() => handleSemesterSelect(sem)}
                                    >
                                        <div className={`h2 fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>{sem}</div>
                                        <div className="text-muted text-xs fw-bold uppercase letter-spacing-1">Semester</div>
                                        <div className="mt-3 p-2 rounded-circle bg-primary bg-opacity-10 text-primary d-inline-block">
                                            <FaBook size={14} />
                                        </div>
                                    </PremiumCard>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 4. COURSES VIEW */}
                {view === 'courses' && (
                    <motion.div 
                        key="courses"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>
                                    {selectedBranch.name} - Semester {selectedSemester}
                                </h4>
                                <p className="text-muted small">View subjects and curriculum nodes for this semester.</p>
                            </div>
                            {!isStudent && (
                                <button className="btn btn-primary rounded-pill d-flex align-items-center gap-2" onClick={() => navigate('/curriculum')}>
                                    <FaPlus size={12} /> Add Subject
                                </button>
                            )}
                        </div>

                        <div className="row g-4">
                            {courses.length > 0 ? courses.map((course) => (
                                <div key={course.id} className="col-lg-4 col-xl-3">
                                    <PremiumCard className="h-100 border-0 glass shadow-sm hover-lift p-4">
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                                                <FaBook size={20} />
                                            </div>
                                            <div>
                                                <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{course.name}</h6>
                                                <span className="text-muted text-xs fw-bold uppercase">{course.code}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted smaller fw-bold uppercase letter-spacing-1">Syllabus Progress</span>
                                                <span className="text-primary fw-bold smaller">85%</span>
                                            </div>
                                            <div className="progress rounded-pill bg-black bg-opacity-5" style={{ height: '6px' }}>
                                                <div className="progress-bar bg-primary" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>

                                        <div className="row g-2 pt-3 border-top border-light border-opacity-50 mt-auto">
                                            <div className="col-6">
                                                <div className="text-muted text-xs fw-bold uppercase opacity-50 mb-1">Credits</div>
                                                <div className="fw-bold small">{course.credits} CR</div>
                                            </div>
                                            <div className="col-6 text-end">
                                                {!isStudent && (
                                                    <button 
                                                        className="btn btn-link text-primary p-0 shadow-none fw-bold small"
                                                        onClick={() => navigate(`/curriculum`)}
                                                    >
                                                        Studio <FaArrowRight size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </PremiumCard>
                                </div>
                            )) : (
                                <div className="col-12 py-5">
                                    <EmptyState 
                                        title="No Subjects Found"
                                        description={isStudent ? "This semester's curriculum is currently being updated." : "This semester's curriculum is currently empty. Use the AI Assistant to generate a syllabus structure."}
                                        actionLabel={!isStudent && "AI Generate Subjects"}
                                        onAction={!isStudent && (() => navigate('/curriculum'))}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-2000 bg-white bg-opacity-50">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            )}

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .shadow-primary-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
                .letter-spacing-1 { letter-spacing: 1px; }
                .hover-lift:hover { transform: translateY(-5px); transition: transform 0.2s; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .z-2000 { z-index: 2000; }
            `}</style>
        </div>
    );
};

export default AcademicExplorer;
