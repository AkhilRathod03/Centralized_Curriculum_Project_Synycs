import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        institution: '',
        phone: ''
    });
    const [institutions, setInstitutions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const res = await axiosInstance.get('auth/institutions/');
                // Handle both paginated and non-paginated responses
                const data = res.data.results || res.data;
                if (Array.isArray(data)) {
                    setInstitutions(data);
                } else {
                    setInstitutions([]);
                }
            } catch (err) {
                toast.error('Could not load institutions');
                setInstitutions([]);
            }
        };
        fetchInstitutions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('auth/register/', formData);
            toast.success('Registration successful! Please wait for admin approval before logging in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center my-5">
            <div className="card p-4 shadow-lg border-0" style={{ width: '500px' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">CREATE ACCOUNT</h2>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">First Name</label>
                            <input type="text" className="form-control" required
                                onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Last Name</label>
                            <input type="text" className="form-control" required
                                onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-control" required
                            onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" required
                            onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Institution</label>
                        <select className="form-select" required
                            onChange={e => setFormData({...formData, institution: e.target.value})}>
                            <option value="">Select Institution</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-3">Register</button>
                    <div className="text-center mt-3">
                        <small>Already have an account? <Link to="/login">Login</Link></small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
