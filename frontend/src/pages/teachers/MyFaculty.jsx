import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaChalkboardTeacher, FaSearch, FaEnvelope, FaClock, FaCalendarAlt,
    FaRobot, FaStar, FaLightbulb, FaChevronRight, FaComments
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PremiumCard from '../../components/common/PremiumCard';
import PageHeader from '../../components/common/PageHeader';

const MyFaculty = () => {
    const { darkMode } = useContext(ThemeContext);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyFaculty();
    }, []);

    const fetchMyFaculty = async () => {
        try {
            setLoading(true);
            // Mocking faculty teaching the student
            const res = await axiosInstance.get('auth/institutions/users/');
            const allUsers = res.data.results || res.data;
            setFaculty(allUsers.filter(u => u.role === 'teacher').slice(0, 3));
        } catch (err) {
            toast.error('Failed to load faculty directory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-5 px-lg-4">
            <PageHeader 
                title="My Faculty"
                subtitle="Connect with your professors and access academic guidance"
            />

            {/* Quick Guidance AI Widget */}
            <div className="card-modern bg-ai-gradient p-4 mb-4 text-white rounded-5 shadow-lg border-0">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-circle shadow-lg">
                        <FaRobot size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold mb-1">Academic Guidance AI</h5>
                        <p className="small mb-0 opacity-80">Based on your performance in Data Structures, Prof. Akhil suggests focusing on "Graph Theory" module this week.</p>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {faculty.map((prof, i) => (
                    <div key={prof.id} className="col-lg-4 col-md-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <PremiumCard className="h-100 border-0 shadow-lg p-0 overflow-hidden hover-lift transition-all">
                                <div className="p-4 text-center border-bottom bg-light bg-opacity-30">
                                    <div className="position-relative d-inline-block mb-3">
                                        <img src={`https://ui-avatars.com/api/?name=${prof.username}&background=7c3aed&color=fff`} className="rounded-circle border border-4 border-white shadow-lg" width="80" height="80" alt="" />
                                        <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: '15px', height: '15px' }}></div>
                                    </div>
                                    <h5 className="fw-bold mb-1">{prof.username}</h5>
                                    <p className="text-muted small fw-bold uppercase mb-0 letter-spacing-1">Senior Professor</p>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <div className="text-muted smaller fw-bold uppercase mb-2">Subject Handled</div>
                                        <div className={`p-2 px-3 rounded-3 border ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'} d-flex align-items-center justify-content-between`}>
                                            <span className="small fw-bold">Data Structures & Algo</span>
                                            <FaChevronRight size={10} className="text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <FaClock className="text-muted" size={12} />
                                            <span className="small">Office Hours: 2PM - 4PM (Mon, Wed)</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <FaEnvelope className="text-muted" size={12} />
                                            <span className="small">{prof.email}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 text-warning">
                                            <FaStar size={12} />
                                            <span className="small fw-bold">4.9/5.0 Student Rating</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary-premium flex-grow-1 rounded-pill small fw-bold py-2"><FaComments className="me-2" /> Message</button>
                                        <button className={`btn ${darkMode ? 'btn-dark' : 'btn-light'} border-secondary rounded-pill small fw-bold px-3`} title="View Schedule"><FaCalendarAlt /></button>
                                    </div>
                                </div>
                            </PremiumCard>
                        </motion.div>
                    </div>
                ))}
            </div>

            <style>{`
                .bg-ai-gradient { background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%); }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default MyFaculty;
