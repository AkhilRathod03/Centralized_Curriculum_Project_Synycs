import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
    FaFolder, FaFilePdf, FaFileVideo, FaLink, FaFileAlt, FaFileImage, 
    FaSearch, FaDownload, FaUpload, FaChevronRight, FaChevronDown,
    FaBook, FaLayerGroup, FaHistory, FaTrash, FaFolderOpen, FaPlus,
    FaFilter, FaList, FaThLarge, FaCloudUploadAlt, FaChartPie, FaExternalLinkAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmAction } from '../../utils/confirmAction';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';
import EmptyState from '../../components/common/EmptyState';

const ResourceManager = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [generalResources, setGeneralResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [expandedFolders, setExpandedFolders] = useState({ 'general': true });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', resource_type: 'syllabus', file: null });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) setSearchTerm(search);
        fetchCourses();
    }, [location.search]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/courses/');
            const coursesData = res.data.results || res.data;
            setCourses(coursesData);
            if (coursesData.length > 0) {
                handleSelectCourse(coursesData[0]);
            }
        } catch (err) {
            toast.error('Failed to access resource cloud');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        try {
            setLoading(true);
            const resGeneral = await axiosInstance.get(`files/resources/?course=${course.id}`);
            setGeneralResources(resGeneral.data.results || resGeneral.data);

            const res = await axiosInstance.get(`curriculum/courses/${course.id}/modules/`);
            const modulesWithTopics = res.data.results || res.data;
            
            const fullModules = await Promise.all(modulesWithTopics.map(async (mod) => {
                const topicsRes = await axiosInstance.get(`curriculum/modules/${mod.id}/topics/`);
                return { ...mod, topics: topicsRes.data.results || topicsRes.data };
            }));
            
            setModules(fullModules);
        } catch (err) {
            toast.error('Material retrieval protocol failed');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type) => {
        const t = type?.toLowerCase();
        if (t?.includes('pdf') || t === 'syllabus') return <FaFilePdf className="text-danger" />;
        if (t?.includes('video')) return <FaFileVideo className="text-primary" />;
        if (t === 'link') return <FaExternalLinkAlt className="text-info" />;
        if (t?.includes('image')) return <FaFileImage className="text-warning" />;
        if (t === 'reference') return <FaBook className="text-success" />;
        return <FaFileAlt className="text-secondary" />;
    };

    const handleGeneralUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file) return toast.error('Selection required');

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('title', uploadData.title || uploadData.file.name);
        formData.append('resource_type', uploadData.resource_type);
        formData.append('course', selectedCourse.id);

        try {
            toast.info('Encrypting and uploading...');
            await axiosInstance.post('files/resources/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Resource synchronized to cloud!');
            setShowUploadModal(false);
            setUploadData({ title: '', resource_type: 'syllabus', file: null });
            handleSelectCourse(selectedCourse);
        } catch (err) {
            toast.error('Cloud transmission failed');
        }
    };

    const handleDelete = async (id) => {
        if (!(await confirmAction('Are you sure you want to delete this resource?'))) return;
        try {
            await axiosInstance.delete(`files/resources/${id}/`);
            toast.success('Resource purged from cloud');
            handleSelectCourse(selectedCourse);
        } catch (err) {
            toast.error('Deletion protocol failed');
        }
    };

    const totalFiles = generalResources.length + modules.reduce((acc, m) => acc + (m.topics ? m.topics.reduce((acc2, t) => acc2 + (t.materials ? t.materials.length : 0), 0) : 0), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-5 px-lg-4">
            <PageHeader 
                title="Resource Hub"
                subtitle="Institutional cloud storage and academic document management"
                breadcrumbs={[{ label: 'Main', path: '/' }, { label: 'Resources' }]}
                actions={user?.role !== 'student' ? [
                    { label: 'Cloud Upload', icon: <FaCloudUploadAlt size={14} />, variant: 'primary', onClick: () => setShowUploadModal(true) },
                    { label: 'File Analytics', icon: <FaChartPie size={12} />, variant: 'secondary' }
                ] : []}
            />

            <div className="row g-4">
                {/* Left Panel: Course Directory */}
                <div className="col-lg-5">
                    <PremiumCard title="Course Directory" icon={<FaFolderOpen className="text-primary" />} className="h-100 p-0">
                        <div className="p-2">
                            {courses.map(c => (
                                <button 
                                    key={c.id} 
                                    className={`w-100 text-start border-0 mb-1 rounded-3 px-3 py-3 transition-all d-flex align-items-center gap-3 ${selectedCourse?.id === c.id ? 'bg-primary text-white shadow-primary-glow' : 'btn-light bg-transparent text-dark hover-light'}`}
                                    onClick={() => handleSelectCourse(c)}
                                >
                                    <FaBook size={14} className={selectedCourse?.id === c.id ? 'text-white' : 'text-primary'} />
                                    <div className="text-truncate">
                                        <div className="fw-bold small">{c.name}</div>
                                        <div className={`smaller opacity-75 fw-medium uppercase ${selectedCourse?.id === c.id ? 'text-white' : 'text-muted'}`} style={{ fontSize: '0.6rem' }}>{c.code}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </PremiumCard>
                </div>

                {/* Right Panel: Explorer */}
                <div className="col-lg-7">
                    <PremiumCard 
                        className="h-100 p-0"
                        title={selectedCourse?.name || 'Loading Directory...'}
                        subtitle={`${totalFiles} secure documents identified`}
                        actions={
                            <div className="d-flex gap-2">
                                <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                    <button className={`btn btn-sm px-3 border-0 ${viewMode === 'grid' ? 'btn-primary' : 'btn-light'}`} onClick={() => setViewMode('grid')}><FaThLarge size={12} /></button>
                                    <button className={`btn btn-sm px-3 border-0 ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`} onClick={() => setViewMode('list')}><FaList size={12} /></button>
                                </div>
                                <div className="input-group glass rounded-pill border shadow-sm px-2" style={{ maxWidth: '250px' }}>
                                    <span className="input-group-text bg-transparent border-0 text-muted ps-2 pe-1"><FaSearch size={12} /></span>
                                    <input type="text" className="form-control bg-transparent border-0 shadow-none py-1 small" placeholder="Search cloud..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        }
                    >
                        <div className="p-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <p className="mt-3 text-muted small letter-spacing-1">SYNCHRONIZING WITH CLOUD STORAGE...</p>
                                </div>
                            ) : (
                                <div className="file-explorer">
                                    {/* General Resources */}
                                    <div className="mb-5">
                                        <div 
                                            className="d-flex align-items-center p-3 rounded-4 cursor-pointer mb-3 border-start border-4 border-primary transition-all hover-light"
                                            style={{ backgroundColor: darkMode ? 'rgba(37,99,235,0.05)' : '#f8fafc' }}
                                            onClick={() => setExpandedFolders(prev => ({...prev, general: !prev.general}))}
                                        >
                                            <FaFolderOpen className="text-primary me-3" />
                                            <span className="fw-bold text-dark me-auto small uppercase letter-spacing-1">Common Course Assets</span>
                                            {expandedFolders.general ? <FaChevronDown size={10} className="text-muted" /> : <FaChevronRight size={10} className="text-muted" />}
                                        </div>

                                        <AnimatePresence>
                                            {expandedFolders.general && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ps-3 overflow-hidden">
                                                    <div className="row g-3">
                                                        {generalResources.map(res => (
                                                            <div key={res.id} className={viewMode === 'grid' ? "col-md-4 col-xl-3" : "col-12"}>
                                                                <div className={`p-3 rounded-4 border transition-all hover-lift h-100 d-flex ${viewMode === 'grid' ? 'flex-column text-center' : 'align-items-center'}`}>
                                                                    <div className={`fs-3 ${viewMode === 'grid' ? 'mb-3' : 'me-3'}`}>{getFileIcon(res.resource_type)}</div>
                                                                    <div className="flex-grow-1 min-width-0">
                                                                        <div className="text-dark fw-bold text-truncate small">{res.title}</div>
                                                                        <div className="text-muted smaller d-flex align-items-center justify-content-center gap-2">
                                                                            <span className="badge bg-light text-muted fw-normal">{res.resource_type}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`d-flex gap-2 ${viewMode === 'grid' ? 'mt-3 justify-content-center' : 'ms-3'}`}>
                                                                        <a href={res.file} target="_blank" rel="noreferrer" className="btn btn-icon-sm btn-light border rounded-circle"><FaDownload size={12} /></a>
                                                                        {user?.role !== 'student' && <button className="btn btn-icon-sm btn-light border rounded-circle text-danger" onClick={() => handleDelete(res.id)}><FaTrash size={12} /></button>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {generalResources.length === 0 && <p className="text-muted smaller italic ps-3 py-3 border-start border-light ms-2">Empty folder</p>}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Modules */}
                                    {modules.map(mod => (
                                        <div key={mod.id} className="mb-4">
                                             <div 
                                                className="d-flex align-items-center p-3 rounded-4 cursor-pointer mb-2 border hover-light transition-all shadow-sm"
                                                onClick={() => setExpandedFolders(prev => ({...prev, [mod.id]: !prev[mod.id]}))}
                                            >
                                                <FaFolder className="text-warning me-3" />
                                                <span className="fw-bold text-dark me-auto small">{mod.name}</span>
                                                
                                                {user?.role !== 'student' && (
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm btn-primary-premium rounded-pill px-3 me-3 d-flex align-items-center gap-2 shadow-sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setUploadData({ title: `${mod.name} - `, resource_type: 'syllabus', file: null });
                                                            setShowUploadModal(true);
                                                        }}
                                                    >
                                                        <FaCloudUploadAlt size={12} />
                                                        <span style={{ fontSize: '0.65rem' }} className="fw-bold uppercase letter-spacing-1">Upload to Unit</span>
                                                    </button>
                                                )}

                                                {expandedFolders[mod.id] ? <FaChevronDown size={10} className="text-muted" /> : <FaChevronRight size={10} className="text-muted" />}
                                            </div>
                                            
                                            <AnimatePresence>
                                                {expandedFolders[mod.id] && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }} 
                                                        animate={{ height: 'auto', opacity: 1 }} 
                                                        exit={{ height: 0, opacity: 0 }} 
                                                        className="ps-4 overflow-hidden"
                                                    >
                                                        {mod.topics?.map(topic => (
                                                            <div key={topic.id} className="mb-4 mt-2">
                                                                <div className="d-flex align-items-center mb-3 opacity-75">
                                                                    <div className="bg-light p-1 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                                                                        <FaLayerGroup size={10} className="text-primary" />
                                                                    </div>
                                                                    <span className="smaller fw-bold text-muted uppercase letter-spacing-1">{topic.name}</span>
                                                                    <div className="flex-grow-1 ms-3 border-top opacity-10"></div>
                                                                </div>
                                                                <div className="row g-3 ps-2">
                                                                    {topic.materials?.map(mat => (
                                                                        <div key={mat.id} className={viewMode === 'grid' ? "col-md-6 col-xl-4" : "col-12"}>
                                                                            <div className="p-3 rounded-4 border bg-white shadow-sm d-flex align-items-center hover-lift transition-all">
                                                                                <div className="me-3 fs-5">{getFileIcon(mat.material_type)}</div>
                                                                                <div className="flex-grow-1 min-width-0">
                                                                                    <div className="text-dark fw-bold text-truncate small">{mat.title}</div>
                                                                                    <div className="text-muted smaller opacity-75 uppercase" style={{ fontSize: '0.6rem' }}>{mat.material_type} • Cloud Sync</div>
                                                                                </div>
                                                                                <div className="d-flex gap-2 ms-2">
                                                                                    <a href={mat.file || mat.url} target="_blank" rel="noreferrer" className="btn btn-icon-sm btn-light border rounded-circle"><FaDownload size={12} /></a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(!topic.materials || topic.materials.length === 0) && (
                                                                        <div className="col-12">
                                                                            <div className="p-3 rounded-4 border border-dashed text-center opacity-40">
                                                                                <span className="smaller italic">No specific materials for this topic</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!mod.topics || mod.topics.length === 0) && (
                                                            <div className="p-4 text-center border rounded-4 border-dashed bg-light bg-opacity-50 mt-2">
                                                                <FaHistory className="text-muted opacity-25 mb-2" size={24} />
                                                                <p className="smaller text-muted italic mb-0">Synchronizing curriculum structure...</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Simple Upload Modal Refined */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="modal d-block" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 rounded-5 shadow-2xl overflow-hidden">
                                <form onSubmit={handleGeneralUpload}>
                                    <div className="modal-header border-0 p-4 bg-primary text-white">
                                        <h5 className="fw-bold mb-0">Synchronize to Cloud</h5>
                                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowUploadModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="mb-4">
                                            <label className="form-label smaller fw-bold text-muted uppercase">Protocol Target</label>
                                            <input type="text" className="form-control border-light py-3 rounded-4" placeholder="Resource Title" value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} required />
                                        </div>
                                        {/* ... other fields ... */}
                                        <div className="p-5 rounded-5 border-dashed border-2 border-primary border-opacity-25 text-center bg-light bg-opacity-50">
                                            <FaCloudUploadAlt size={48} className="text-primary opacity-25 mb-3" />
                                            <input type="file" className="form-control" onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })} required />
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 p-4 pt-0">
                                        <button type="submit" className="btn btn-primary-premium w-100 py-3">Begin Synchronization</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ResourceManager;
