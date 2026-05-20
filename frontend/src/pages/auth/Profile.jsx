import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaBuilding, FaGraduationCap, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, coursesRes] = await Promise.all([
                axiosInstance.get('auth/profile/'),
                axiosInstance.get('curriculum/courses/')
            ]);
            setProfile(profileRes.data);
            setFormData(profileRes.data);
            setCourses(coursesRes.data.results || coursesRes.data);
        } catch (err) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.patch('auth/profile/', formData);
            setProfile(res.data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Update failed');
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Profile...</div>;
    if (!profile) return <div className="p-5 text-center">User not found</div>;

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Profile Header Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary p-5 position-relative">
                            <div className="position-absolute translate-middle-y" style={{ top: '100%', left: '50px' }}>
                                <div className="position-relative">
                                    <img 
                                        src={profile.profile_picture || `https://ui-avatars.com/api/?name=${profile.username}&size=150&background=random`} 
                                        className="rounded-circle border border-4 border-white shadow"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover', backgroundColor: '#fff' }}
                                        alt="Profile"
                                    />
                                    {isEditing && (
                                        <button className="btn btn-dark btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 border border-2 border-white shadow">
                                            <FaCamera />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body pt-5 pb-4 px-5">
                            <div className="row mt-4 align-items-end">
                                <div className="col-md-8">
                                    <h2 className="fw-bold text-dark mb-1">
                                        {profile.first_name} {profile.last_name}
                                        <span className="ms-2 badge bg-primary-subtle text-primary fs-6 fw-normal rounded-pill">
                                            {profile.role.toUpperCase()}
                                        </span>
                                    </h2>
                                    <p className="text-muted mb-0 d-flex align-items-center">
                                        <FaIdCard className="me-2 text-primary" /> ID: {profile.unique_id || 'Generating...'}
                                    </p>
                                </div>
                                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                    {!isEditing ? (
                                        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setIsEditing(true)}>
                                            <FaEdit className="me-2" /> Edit Profile
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2 justify-content-md-end">
                                            <button className="btn btn-success rounded-pill px-4" onClick={handleUpdate}>
                                                <FaSave className="me-2" /> Save
                                            </button>
                                            <button className="btn btn-light rounded-pill px-4 border" onClick={() => { setIsEditing(false); setFormData(profile); }}>
                                                <FaTimes className="me-2" /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Info Column */}
                        <div className="col-md-7">
                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                <h5 className="fw-bold mb-4 border-bottom pb-2">About Me</h5>
                                {isEditing ? (
                                    <textarea 
                                        className="form-control mb-3 border-0 bg-light p-3 rounded-4" 
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                        value={formData.bio || ''}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    ></textarea>
                                ) : (
                                    <p className="text-secondary mb-4">
                                        {profile.bio || "No bio added yet."}
                                    </p>
                                )}

                                <div className="row g-3 mt-2">
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold d-block mb-1">Email</label>
                                        <div className="d-flex align-items-center text-dark">
                                            <FaEnvelope className="text-primary me-2" /> {profile.email}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold d-block mb-1">Phone</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm bg-light border-0" 
                                                value={formData.phone || ''}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center text-dark">
                                                <FaPhone className="text-primary me-2" /> {profile.phone || 'Not set'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-bold d-block mb-1">Institution</label>
                                        <div className="d-flex align-items-center text-dark fw-medium">
                                            <FaBuilding className="text-primary me-2" /> {profile.institution_detail?.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional/Academic Column */}
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                <h5 className="fw-bold mb-4 border-bottom pb-2">
                                    {profile.role === 'teacher' ? 'Portfolio Details' : 'Academic Status'}
                                </h5>

                                {profile.role === 'student' && (
                                    <div className="mb-4">
                                        <div className="p-3 bg-primary bg-opacity-10 rounded-4 mb-3 border border-primary border-opacity-10">
                                            <label className="text-primary small fw-bold d-block mb-1">Current Program</label>
                                            <div className="fw-bold d-flex align-items-center">
                                                <FaGraduationCap className="me-2" /> {profile.program_name || 'Not Assigned'}
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="text-muted small fw-bold d-block mb-1">Year of Study</label>
                                                {isEditing ? (
                                                    <select 
                                                        className="form-select form-select-sm bg-light border-0"
                                                        value={formData.year_of_study || ''}
                                                        onChange={e => setFormData({...formData, year_of_study: e.target.value})}
                                                    >
                                                        <option value="">Select Year</option>
                                                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                                    </select>
                                                ) : (
                                                    <div className="badge bg-light text-dark border px-3 py-2 fw-medium">
                                                        Year {profile.year_of_study || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profile.role === 'teacher' && (
                                    <div className="mb-4">
                                        <label className="text-muted small fw-bold d-block mb-2">Professional Experience</label>
                                        {isEditing ? (
                                            <textarea 
                                                className="form-control bg-light border-0" 
                                                rows="5"
                                                value={formData.experience || ''}
                                                onChange={e => setFormData({...formData, experience: e.target.value})}
                                            ></textarea>
                                        ) : (
                                            <p className="text-secondary small">
                                                {profile.experience || "Experience details not added yet."}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Subjects / Courses Section */}
                                <div className="mt-2">
                                    <label className="text-muted small fw-bold d-block mb-2">
                                        {profile.role === 'teacher' ? 'Teaching Subjects' : 'Enrolled Subjects'}
                                    </label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {courses.length > 0 ? courses.map(c => (
                                            <span key={c.id} className="badge bg-light text-primary border rounded-pill px-3 py-2">
                                                {c.name}
                                            </span>
                                        )) : (
                                            <span className="text-muted small">No subjects assigned.</span>
                                        )}
                                    </div>
                                    <small className="text-muted mt-2 d-block">* Managed by Academic Cell</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
