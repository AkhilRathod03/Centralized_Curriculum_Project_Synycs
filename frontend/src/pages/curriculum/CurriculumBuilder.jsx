import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    DndContext, closestCenter, KeyboardSensor, 
    PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaBookOpen, FaLayerGroup, FaArrowRight, 
    FaMagic, FaCheckCircle, FaBrain, FaSearch,
    FaChevronDown, FaChevronRight, FaRobot,
    FaUniversity, FaClock, FaGraduationCap,
    FaRegFileAlt, FaCloudUploadAlt, FaArrowLeft,
    FaLightbulb, FaBook, FaEdit, FaTrash
} from 'react-icons/fa';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

import axiosInstance from '../../api/axiosInstance';
import { SortableItem } from '../../components/curriculum/SortableItem';
import CurriculumModal from '../../components/curriculum/CurriculumModal';
import AISuggestionsModal from '../../components/curriculum/AISuggestionsModal';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';
import EmptyState from '../../components/common/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const CurriculumBuilder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    
    // Role-based Access Control
    useEffect(() => {
        if (user && user.role === 'student') {
            toast.warning("Access Restricted: Curriculum Studio is for faculty only.");
            navigate('/student-dashboard');
        }
    }, [user, navigate]);

    // Hierarchy Navigation States
    const [view, setView] = useState('degrees'); // degrees -> branches -> semesters -> studio
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Data States
    const [degrees, setDegrees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // AI Suggestion States
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [addedInSession, setAddedInSession] = useState(new Set());
    
    // Node Intelligence States
    const [nodeIntel, setNodeIntelligence] = useState(null);
    const [isGeneratingIntel, setIsGeneratingIntel] = useState(false);

    // UI Toggles
// ...
    const handleGenerateNodeContent = async () => {
        if (!selectedItem) return;
        
        try {
            setIsGeneratingIntel(true);
            setNodeIntelligence(null);
            
            const contextName = selectedItem.type === 'topic' 
                ? modules.find(m => m.topics?.some(t => t.id === selectedItem.id))?.name 
                : courses.find(c => c.id === selectedCourse)?.name;

            const res = await axiosInstance.post('ai/node-intelligence/', {
                type: selectedItem.type,
                name: selectedItem.name,
                context_name: contextName
            });

            setNodeIntelligence(res.data);
            setIsGeneratingIntel(false);
            toast.success("Intelligence data generated.");
        } catch (err) {
            toast.error("Generation failed.");
            setIsGeneratingIntel(false);
        }
    };
    const [viewMode, setViewMode] = useState('tree'); // tree, flow, analytics
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', fields: [], type: '', parentId: null });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Initial Load & Direct Link Resolution
    useEffect(() => {
        const resolveDirectLink = async () => {
            const params = new URLSearchParams(location.search);
            const courseId = params.get('courseId') || location.state?.courseId;

            if (courseId) {
                try {
                    setLoading(true);
                    // Fetch course detail to get program and semester
                    const cRes = await axiosInstance.get(`curriculum/courses/${courseId}/`);
                    const course = cRes.data;
                    
                    // Fetch program detail to get curriculum (degree)
                    const pRes = await axiosInstance.get(`curriculum/programs/${course.program}/`);
                    const program = pRes.data;

                    // Fetch degree detail
                    const dRes = await axiosInstance.get(`curriculum/curriculums/${program.curriculum}/`);
                    const degree = dRes.data;

                    // Set hierarchy state
                    setSelectedDegree(degree);
                    setSelectedBranch(program);
                    setSelectedSemester(course.semester);
                    
                    // Resolve necessary lists
                    await fetchBranches(degree.id);
                    await fetchCourses(program.id, course.semester);
                    await fetchModules(course.id);
                    
                    setView('studio');
                } catch (err) {
                    console.error('Resolution error:', err);
                    toast.error('Failed to resolve course path.');
                    fetchDegrees();
                }
            } else {
                fetchDegrees();
            }
        };

        resolveDirectLink();
    }, [location.search, location.state]);

    const fetchDegrees = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('curriculum/curriculums/');
            setDegrees(res.data.results || res.data);
            setLoading(false);
        } catch (err) { 
            toast.error('Degrees sync failed.'); 
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
            toast.error('Programs sync failed.'); 
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
            toast.error('Course catalog failed.'); 
            setLoading(false);
        }
    };

    const fetchModules = async (courseId) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`curriculum/courses/${courseId}/modules/`);
            const modulesData = res.data.results || res.data;
            setModules(modulesData);
            setSelectedCourse(courseId);
            if (modulesData.length > 0) {
                setExpandedModules({ [modulesData[0].id]: true });
            }
            setLoading(false);
        } catch (err) { 
            toast.error('Syllabus node sync failed.'); 
            setLoading(false);
        }
    };

    const handleAiOptimize = async () => {
        try {
            setAddedInSession(new Set()); // Reset for new session
            setIsAnalyzing(true);
            toast.info("AI is analyzing your syllabus structure...", { icon: <FaBrain /> });
            const res = await axiosInstance.post(`ai/courses/${selectedCourse}/analyze-syllabus/`);
            setAiSuggestions(res.data);
            setShowAiSuggestions(true);
            setIsAnalyzing(false);
        } catch (err) {
            toast.error("AI Analysis failed.");
            setIsAnalyzing(false);
        }
    };

    const applyAiReorders = async () => {
        if (!aiSuggestions) return;
        
        try {
            setLoading(true);
            const { reorders = [] } = aiSuggestions;

            // 1. Handle Module Reordering
            const moduleReorders = reorders.filter(r => r.type === 'module');
            if (moduleReorders.length > 0) {
                const currentModules = [...modules];
                // Map suggestions ensuring ID types match
                const orderedIds = currentModules
                    .map(m => {
                        const suggestion = moduleReorders.find(r => String(r.id) === String(m.id));
                        return { id: m.id, order: suggestion ? suggestion.suggested_order : m.order };
                    })
                    .sort((a, b) => a.order - b.order)
                    .map(item => item.id);

                await axiosInstance.post('curriculum/reorder/module/', { ordered_ids: orderedIds });
                toast.success("Standard academic sequence applied.");
            } else {
                // If no reorders, just force a state refresh to ensure order matches DB
                toast.info("No structural reorders needed. Syncing view...");
            }

            setShowAiSuggestions(false);
            setAiSuggestions(null);
            await fetchModules(selectedCourse);
        } catch (err) {
            console.error('Apply AI Error:', err);
            toast.error("Failed to sync sequence.");
            setLoading(false);
        }
    };

    const handleAddMissingTopic = async (topicName) => {
        if (!modules.length) {
            toast.warning("Please create at least one module first.");
            return;
        }

        // Prevent adding if topic already exists
        const normalized = topicName.toLowerCase().trim();
        const exists = modules.some(m => m.topics?.some(t => t.name.toLowerCase().trim() === normalized));
        if (exists || addedInSession.has(normalized)) {
            toast.warning(`'${topicName}' already exists.`);
            return;
        }

        try {
            setLoading(true);
            const targetModuleId = modules[modules.length - 1].id;
            
            await axiosInstance.post(`curriculum/modules/${targetModuleId}/topics/`, {
                name: topicName,
                duration_hours: 2
            });

            toast.success(`'${topicName}' added.`);
            setAddedInSession(prev => new Set(prev).add(normalized));
            setAiSuggestions(prev => ({
                ...prev,
                missing_topics: prev.missing_topics.filter(t => t !== topicName)
            }));
            
            await fetchModules(selectedCourse);
        } catch (err) {
            toast.error("Failed to add topic.");
            setLoading(false);
        }
    };

    const handleAddMissingModule = async (moduleData) => {
        const normalized = moduleData.name.toLowerCase().trim();
        const exists = modules.some(m => m.name.toLowerCase().trim() === normalized);
        
        if (exists || addedInSession.has(normalized)) {
            toast.warning(`'${moduleData.name}' already exists.`);
            return;
        }

        try {
            setLoading(true);
            toast.info(`Standardizing: ${moduleData.name}...`);
            
            const modRes = await axiosInstance.post(`curriculum/courses/${selectedCourse}/modules/`, {
                name: moduleData.name,
                order: modules.length 
            });
            const newModule = modRes.data;

            for (const topicName of moduleData.topics) {
                await axiosInstance.post(`curriculum/modules/${newModule.id}/topics/`, {
                    name: topicName,
                    duration_hours: 2
                });
            }

            toast.success(`Standard Unit added.`);
            setAddedInSession(prev => new Set(prev).add(normalized));
            setAiSuggestions(prev => ({
                ...prev,
                new_modules: prev.new_modules.filter(m => m.name !== moduleData.name)
            }));

            await fetchModules(selectedCourse);
        } catch (err) {
            toast.error("Standardization failed.");
            setLoading(false);
        }
    };

    const handleDegreeSelect = (degree) => {
        setSelectedDegree(degree);
        fetchBranches(degree.id);
        setView('branches');
    };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        setView('semesters');
    };

    const handleSemesterSelect = (sem) => {
        setSelectedSemester(sem);
        fetchCourses(selectedBranch.id, sem);
        setView('studio');
    };

    const handleCourseSelect = (course) => {
        fetchModules(course.id);
    };

    const goBack = () => {
        if (view === 'studio') setView('semesters');
        else if (view === 'semesters') setView('branches');
        else if (view === 'branches') setView('degrees');
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to permanently delete this ${type}? This action cannot be undone.`)) return;

        try {
            setLoading(true);
            let url = '';
            if (type === 'degree') url = `curriculum/curriculums/${id}/`;
            else if (type === 'program') url = `curriculum/programs/${id}/`;
            else if (type === 'course') url = `curriculum/courses/${id}/`;
            else if (type === 'module') url = `curriculum/modules/${id}/`;
            else if (type === 'topic') url = `curriculum/topics/${id}/`;

            await axiosInstance.delete(url);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
            
            if (type === 'degree') fetchDegrees();
            else if (type === 'program') fetchBranches(selectedDegree.id);
            else if (type === 'course') fetchCourses(selectedBranch.id, selectedSemester);
            else fetchModules(selectedCourse);
        } catch (err) {
            toast.error(`Failed to delete ${type}.`);
            setLoading(false);
        }
    };

    const handleCreate = (type, parentId = null, existingData = null) => {
        const isEdit = !!existingData;
        let config = { type, parentId, id: existingData?.id };
        if (type === 'degree') {
            config = {
                ...config,
                title: isEdit ? 'Modify Degree' : 'Provision New Degree',
                fields: [
                    { name: 'name', label: 'Degree Name', required: true, initialValue: existingData?.name },
                    { name: 'short_name', label: 'Short Name', required: true, initialValue: existingData?.short_name },
                    { name: 'description', label: 'Description', type: 'textarea', initialValue: existingData?.description }
                ]
            };
        } else if (type === 'program') {
            config = {
                ...config,
                title: isEdit ? 'Modify Branch' : 'Provision New Branch',
                fields: [
                    { name: 'name', label: 'Branch Name', required: true, initialValue: existingData?.name },
                    { name: 'code', label: 'Branch Code', required: true, initialValue: existingData?.code },
                    { name: 'duration_years', label: 'Duration (Years)', type: 'number', required: true, initialValue: existingData?.duration_years }
                ]
            };
        } else if (type === 'course') {
            config = {
                ...config,
                title: isEdit ? 'Modify Subject' : 'Provision New Subject',
                fields: [
                    { name: 'name', label: 'Subject Title', required: true, initialValue: existingData?.name },
                    { name: 'code', label: 'Subject Code', required: true, initialValue: existingData?.code },
                    { name: 'credits', label: 'Credits', type: 'number', required: true, initialValue: existingData?.credits }
                ]
            };
        } else if (type === 'module') {
            config = {
                ...config,
                title: existingData ? 'Modify Module' : 'Initialize Module',
                fields: [{ name: 'name', label: 'Module Header', required: true, initialValue: existingData?.name }]
            };
        } else if (type === 'topic') {
            config = {
                ...config,
                title: existingData ? 'Modify Topic' : 'Define Topic',
                fields: [
                    { name: 'name', label: 'Topic Descriptor', required: true, initialValue: existingData?.name },
                    { name: 'duration_hours', label: 'Instructional Load (Hrs)', type: 'number', initialValue: existingData?.duration_hours }
                ]
            };
        }
        setModalConfig(config);
        setShowModal(true);
    };

    const handleModalSubmit = async (data) => {
        try {
            let url = '';
            let payload = { ...data };
            const isEdit = modalConfig.id ? true : false;

            if (modalConfig.type === 'degree') {
                url = isEdit ? `curriculum/curriculums/${modalConfig.id}/` : 'curriculum/curriculums/';
            } else if (modalConfig.type === 'program') {
                url = isEdit ? `curriculum/programs/${modalConfig.id}/` : 'curriculum/programs/';
                if (!isEdit) payload.curriculum = selectedDegree.id;
            } else if (modalConfig.type === 'course') {
                url = isEdit ? `curriculum/courses/${modalConfig.id}/` : 'curriculum/courses/';
                if (!isEdit) {
                    payload.program = selectedBranch.id;
                    payload.semester = selectedSemester;
                }
            } else if (modalConfig.type === 'module') {
                url = isEdit ? `curriculum/modules/${modalConfig.id}/` : `curriculum/courses/${selectedCourse}/modules/`;
            } else if (modalConfig.type === 'topic') {
                url = `curriculum/modules/${modalConfig.parentId}/topics/`;
            }

            if (isEdit) await axiosInstance.put(url, payload);
            else await axiosInstance.post(url, payload);

            toast.success('Protocol executed.');
            setShowModal(false);
            
            if (modalConfig.type === 'degree') fetchDegrees();
            else if (modalConfig.type === 'program') fetchBranches(selectedDegree.id);
            else if (modalConfig.type === 'course') fetchCourses(selectedBranch.id, selectedSemester);
            else fetchModules(selectedCourse);
        } catch (err) { toast.error('Execution failure.'); }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = modules.findIndex(m => m.id === active.id);
        const newIndex = modules.findIndex(m => m.id === over.id);
        const newOrder = arrayMove(modules, oldIndex, newIndex);
        setModules(newOrder);
        try {
            await axiosInstance.post('curriculum/reorder/module/', { ordered_ids: newOrder.map(m => m.id) });
        } catch (err) { fetchModules(selectedCourse); }
    };

    const flowElements = useMemo(() => {
        if (!modules.length) return { nodes: [], edges: [] };
        const nodes = [];
        const edges = [];
        modules.forEach((mod, idx) => {
            nodes.push({
                id: `mod-${mod.id}`,
                data: { label: mod.name },
                position: { x: 250, y: idx * 100 },
                style: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '11px', fontWeight: 'bold' }
            });
            if (idx > 0) {
                edges.push({ id: `e-${modules[idx-1].id}-${mod.id}`, source: `mod-${modules[idx-1].id}`, target: `mod-${mod.id}`, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }, style: { stroke: '#2563eb', strokeWidth: 2 } });
            }
        });
        return { nodes, edges };
    }, [modules]);

    const bloomData = [
        { name: 'Remember', value: 20, color: '#3b82f6' },
        { name: 'Understand', value: 35, color: '#10b981' },
        { name: 'Apply', value: 25, color: '#f59e0b' },
        { name: 'Analyze', value: 10, color: '#7c3aed' },
        { name: 'Create', value: 10, color: '#ec4899' },
    ];

    return (
        <div className="pb-5 px-lg-4">
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <PageHeader 
                    title="Curriculum Studio"
                    subtitle="Neural workspace for academic hierarchy & syllabus architecture."
                    breadcrumbs={[
                        { label: 'Curriculum', path: '/curriculum' },
                        { label: 'Studio' }
                    ]}
                />
                
                <div className="d-flex align-items-center gap-2 glass p-2 rounded-pill shadow-sm border-0">
                    <div className="btn-group btn-group-sm">
                        {['tree', 'flow', 'analytics'].map(mode => (
                            <button 
                                key={mode} 
                                className={`btn rounded-pill px-3 fw-bold uppercase transition-all ${viewMode === mode ? 'btn-primary shadow-primary-glow' : 'btn-link text-muted text-decoration-none hover-bg-light'}`} 
                                onClick={() => setViewMode(mode)} 
                                style={{ fontSize: '0.65rem' }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breadcrumb Navigation Bar */}
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
                        onClick={() => {
                            setSelectedDegree(null); setSelectedBranch(null); setSelectedSemester(null); setView('degrees');
                            if (viewMode !== 'tree') setViewMode('tree');
                        }}
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
                {viewMode === 'flow' ? (
                    <motion.div key="global-flow" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-100" style={{ minHeight: '600px' }}>
                        <PremiumCard className="h-100 border-0 glass shadow-lg p-0 overflow-hidden">
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0 uppercase text-primary small"><FaLayerGroup className="me-2" /> Curriculum Architecture Graph</h6>
                                <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold smaller">Interactive Mode</div>
                            </div>
                            <div style={{ height: '600px' }}>
                                <ReactFlow 
                                    nodes={view === 'studio' ? flowElements.nodes : degrees.map((d, i) => ({
                                        id: `deg-${d.id}`,
                                        data: { label: d.short_name },
                                        position: { x: 100 + (i * 200), y: 100 },
                                        style: { background: 'var(--primary)', color: '#fff', borderRadius: '12px', padding: '15px', fontWeight: '800' }
                                    }))} 
                                    edges={view === 'studio' ? flowElements.edges : []} 
                                    fitView
                                >
                                    <Background color={darkMode ? '#1e293b' : '#cbd5e1'} gap={20} size={1} />
                                    <Controls />
                                </ReactFlow>
                            </div>
                        </PremiumCard>
                    </motion.div>
                ) : viewMode === 'analytics' ? (
                    <motion.div key="global-analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <PremiumCard className="h-100 border-0 glass shadow-sm p-4">
                                    <h6 className="fw-bold mb-4 uppercase text-primary small">Curriculum Distribution Performance</h6>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={bloomData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                                            {bloomData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="col-md-6 d-flex flex-column justify-content-center">
                                            {bloomData.map(item => (
                                                <div key={item.name} className="d-flex align-items-center justify-content-between mb-3 p-3 rounded-4 bg-light bg-opacity-30 border">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: item.color }}></div>
                                                        <span className="fw-bold small">{item.name}</span>
                                                    </div>
                                                    <span className="fw-bold text-primary">{item.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PremiumCard>
                            </div>
                            <div className="col-lg-4">
                                <div className="row g-4 h-100">
                                    <div className="col-12">
                                        <PremiumCard className="h-100 border-0 glass shadow-sm p-4 bg-primary text-white border-0">
                                            <h6 className="fw-bold mb-4 uppercase text-white-50 small">Accreditation Score</h6>
                                            <div className="display-4 fw-bold mb-2 text-white">9.8<span className="fs-4 opacity-50">/10</span></div>
                                            <div className="progress rounded-pill bg-white bg-opacity-20 mb-3" style={{ height: '8px' }}>
                                                <div className="progress-bar bg-white" style={{ width: '98%' }}></div>
                                            </div>
                                            <p className="smaller opacity-80 mb-0">Highest compliance with international engineering standards (Tier-1).</p>
                                        </PremiumCard>
                                    </div>
                                    <div className="col-12">
                                        <PremiumCard className="h-100 border-0 glass shadow-sm p-4">
                                            <h6 className="fw-bold mb-3 uppercase text-primary small">Key Knowledge Pillars</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {['Logic', 'Algorithms', 'Data Systems', 'AI Ethics', 'Architecture'].map(tag => (
                                                    <span key={tag} className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-bold">{tag}</span>
                                                ))}
                                            </div>
                                        </PremiumCard>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* 1. DEGREES VIEW */}
                        {view === 'degrees' && (
                            <motion.div key="degrees" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="row g-4">
                                {degrees.map(deg => (
                                    <div key={deg.id} className="col-md-4 col-xl-4">
                                        <PremiumCard noPadding className="h-100 border-0 glass shadow-sm hover-lift text-center p-0 cursor-pointer overflow-hidden" onClick={() => handleDegreeSelect(deg)}>
                                            <div className="p-4 flex-grow-1">
                                                <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <FaUniversity size={32} />
                                                </div>
                                                <h4 className={`fw-bold mb-1 ${darkMode ? 'text-white' : 'text-dark'}`}>{deg.short_name}</h4>
                                                <p className="text-muted small mb-0">{deg.name}</p>
                                            </div>
                                            <div className="p-3 bg-light bg-opacity-30 border-top mt-auto">
                                                <button 
                                                    className="btn btn-primary btn-sm rounded-pill w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDegreeSelect(deg);
                                                    }}
                                                >
                                                    Select Degree <FaChevronRight size={10} />
                                                </button>
                                            </div>
                                        </PremiumCard>
                                    </div>
                                ))}
                                <div className="col-md-4 col-xl-4">
                                    <button className="btn btn-outline-primary border-dashed h-100 w-100 rounded-4 p-5 fw-bold d-flex flex-column align-items-center justify-content-center gap-3" onClick={() => handleCreate('degree')}>
                                        <FaPlus size={24} /> Add Degree
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. BRANCHES VIEW */}
                        {view === 'branches' && (
                            <motion.div key="branches" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="row g-4">
                                {branches.map(branch => (
                                    <div key={branch.id} className="col-md-4 col-xl-4">
                                        <PremiumCard noPadding className="h-100 border-0 glass shadow-sm hover-lift p-4 cursor-pointer" onClick={() => handleBranchSelect(branch)}>
                                            <div className="bg-ai-gradient text-white p-3 rounded-4 shadow-sm mb-4 d-inline-block"><FaLayerGroup size={20} /></div>
                                            <h5 className={`fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>{branch.name}</h5>
                                            <span className="badge rounded-pill bg-light text-muted border px-2 py-1 fw-bold text-xs">{branch.code}</span>
                                        </PremiumCard>
                                    </div>
                                ))}
                                <div className="col-md-4 col-xl-4">
                                    <button className="btn btn-outline-primary border-dashed h-100 w-100 rounded-4 p-5 fw-bold d-flex flex-column align-items-center justify-content-center gap-3" onClick={() => handleCreate('program')}>
                                        <FaPlus size={24} /> Add Branch
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. SEMESTERS VIEW */}
                        {view === 'semesters' && (
                            <motion.div key="semesters" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="row g-4 justify-content-center">
                                {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, selectedBranch.duration_years * 2).map((sem) => (
                                    <div key={sem} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <PremiumCard noPadding className="border-0 glass shadow-sm hover-lift p-4 cursor-pointer text-center" onClick={() => handleSemesterSelect(sem)}>
                                            <div className={`h2 fw-bold mb-2 ${darkMode ? 'text-white' : 'text-dark'}`}>{sem}</div>
                                            <div className="text-muted text-xs fw-bold uppercase letter-spacing-1">Semester</div>
                                        </PremiumCard>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* 4. STUDIO WORKSPACE */}
                        {view === 'studio' && (
                            <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4 workspace-root" style={{ height: 'calc(100vh - 160px)' }}>
                                {/* Subjects Sidebar */}
                                <div className="col-lg-3 h-100">
                                    <PremiumCard noPadding className="h-100 border-0 shadow-sm p-0 overflow-hidden d-flex flex-column">
                                        <div className={`p-4 border-bottom d-flex justify-content-between align-items-center ${darkMode ? 'border-secondary' : ''}`}>
                                            <h6 className="fw-bold mb-0 uppercase text-primary small"><FaBook className="me-2" /> Subjects</h6>
                                            <button className={`btn btn-icon-sm border rounded-circle ${darkMode ? 'btn-dark border-secondary text-white' : 'btn-light'}`} onClick={() => handleCreate('course')}><FaPlus size={10} /></button>
                                        </div>
                                        <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar">
                                            {courses.map(c => (
                                                <div 
                                                    key={c.id} 
                                                    className={`p-3 rounded-4 cursor-pointer mb-2 border transition-all ${selectedCourse === c.id ? 'bg-primary text-white border-primary shadow-primary-glow' : `${darkMode ? 'hover-bg-opacity-20 border-transparent text-white-50' : 'hover-light border-transparent text-secondary'}`}`}
                                                    onClick={() => handleCourseSelect(c)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className={`small fw-bold ${selectedCourse === c.id ? 'text-white' : darkMode ? 'text-white' : 'text-dark'}`}>{c.name}</span>
                                                        <FaChevronRight size={10} className="text-muted opacity-50" />
                                                    </div>
                                                    <span className={`text-xs uppercase fw-bold ${selectedCourse === c.id ? 'text-white-50' : 'text-muted'}`}>{c.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PremiumCard>
                                </div>

                                {/* Syllabus Builder */}
                                <div className="col-lg-6 h-100">
                                    <PremiumCard noPadding className={`h-100 border-0 shadow-lg p-0 overflow-hidden d-flex flex-column ${darkMode ? 'bg-card' : 'bg-white'}`}>
                                        {!selectedCourse ? (
                                            <div className="h-100 d-flex align-items-center justify-content-center text-center p-5">
                                                <EmptyState title="Syllabus Standby" description="Select a subject to activate neural builder." />
                                            </div>
                                        ) : (
                                            <div className="h-100 d-flex flex-column overflow-hidden">
                                                <div className={`p-4 border-bottom d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-light bg-opacity-30'}`}>
                                                    <div>
                                                        <h6 className={`fw-bold mb-0 ${darkMode ? 'text-white' : 'text-dark'}`}>{courses.find(c => c.id === selectedCourse)?.name}</h6>
                                                        <p className="text-muted smaller mb-0 uppercase fw-bold letter-spacing-1 opacity-70">Architecture Studio</p>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className={`input-group glass rounded-pill border shadow-sm px-2 ${darkMode ? 'border-secondary' : ''}`} style={{ maxWidth: '160px' }}>
                                                            <span className="input-group-text bg-transparent border-0 text-muted ps-2"><FaSearch size={10} /></span>
                                                            <input type="text" className={`form-control bg-transparent border-0 shadow-none py-1 smaller ${darkMode ? 'text-white' : ''}`} placeholder="Search tree..." />
                                                        </div>
                                                        <div className="vr opacity-10" style={{ height: '20px' }}></div>
                                                        <button 
                                                            className={`btn btn-sm rounded-pill px-4 fw-bold d-flex align-items-center gap-2 transition-all ${isAnalyzing ? 'btn-light disabled' : 'btn-ai-gradient text-white shadow-ai-glow'}`}
                                                            onClick={handleAiOptimize}
                                                            disabled={isAnalyzing}
                                                            style={{ fontSize: '0.7rem' }}
                                                        >
                                                            {isAnalyzing ? <span className="spinner-border spinner-border-sm"></span> : <FaMagic size={12} />} 
                                                            AI Optimize
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                                        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                                                            {modules.map((m, idx) => (
                                                                <div key={m.id} className="mb-4">
                                                                    <SortableItem 
                                                                        id={m.id} index={idx + 1} content={m.name}
                                                                        extraAction={
                                                                            <button className="btn btn-link text-muted p-0 me-2 shadow-none" onClick={() => setExpandedModules(prev => ({...prev, [m.id]: !prev[m.id]}))}>
                                                                                {expandedModules[m.id] ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                                                            </button>
                                                                        }
                                                                        onEdit={() => handleCreate('module', null, m)}
                                                                        onDelete={() => handleDelete('module', m.id)}
                                                                    />
                                                                    <AnimatePresence>
                                                                        {expandedModules[m.id] && (
                                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ms-5 ps-3 border-start border-2 border-primary border-opacity-10 mt-3">
                                                                                {m.topics?.map(topic => (
                                                                                    <div 
                                                                                        key={topic.id} 
                                                                                        className={`d-flex align-items-center p-3 rounded-4 border shadow-sm mb-2 hover-shadow-md transition-all cursor-pointer ${darkMode ? 'bg-dark bg-opacity-20 border-secondary' : 'bg-white border-light'}`}
                                                                                        onClick={() => setSelectedItem({ type: 'topic', ...topic })}
                                                                                    >
                                                                                        <div className="flex-grow-1 min-width-0">
                                                                                            <span className={`small fw-bold text-truncate d-block ${darkMode ? 'text-white' : 'text-dark'}`}>{topic.name}</span>
                                                                                            <span className="text-muted smaller fw-medium"><FaClock size={10} className="me-1 opacity-50"/> {topic.duration_hours}h</span>
                                                                                        </div>
                                                                                        <div className="d-flex gap-1 ms-3">
                                                                                            <button className="btn btn-icon-sm btn-light border rounded-circle" onClick={(e) => { e.stopPropagation(); handleCreate('topic', m.id, topic); }}>
                                                                                                <FaEdit size={10} className="text-primary" />
                                                                                            </button>
                                                                                            <button className="btn btn-icon-sm btn-light border rounded-circle" onClick={(e) => { e.stopPropagation(); handleDelete('topic', topic.id); }}>
                                                                                                <FaTrash size={10} className="text-danger" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                <button className="btn btn-link text-decoration-none text-primary smaller p-0 mt-2 fw-bold" onClick={() => handleCreate('topic', m.id)}>+ Define Topic</button>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            ))}
                                                        </SortableContext>
                                                    </DndContext>
                                                    <button className="btn w-100 rounded-4 py-3 border-dashed mt-4 fw-bold small btn-outline-primary" onClick={() => handleCreate('module')}>+ Initialize Syllabus Module</button>
                                                </div>
                                            </div>
                                        )}
                                    </PremiumCard>
                                </div>

                                {/* Neural Panel */}
                                <div className="col-lg-3 h-100">
                                    {selectedItem ? (
                                        <PremiumCard noPadding className="h-100 border-0 shadow-sm p-4 overflow-auto">
                                            <h6 className="text-primary fw-bold uppercase text-xs mb-3"><FaBrain className="me-2" /> Neural Intelligence</h6>
                                            <h5 className={`fw-bold mb-3 ${darkMode ? 'text-white' : 'text-dark'}`}>{selectedItem.name}</h5>
                                            
                                            {!nodeIntel && !isGeneratingIntel && (
                                                <div className="p-3 rounded-4 bg-ai-gradient text-white mb-4">
                                                    <h6 className="fw-bold mb-2 small d-flex align-items-center"><FaRobot className="me-2" /> AI Assistant</h6>
                                                    <p className="smaller mb-0 opacity-90">I can architect deep content for this {selectedItem.type}. Industrial relevance is high.</p>
                                                </div>
                                            )}

                                            {isGeneratingIntel && (
                                                <div className="text-center py-5">
                                                    <div className="spinner-border text-primary spinner-border-sm mb-3"></div>
                                                    <p className="text-muted smaller">Synthesizing educational data...</p>
                                                </div>
                                            )}

                                            {nodeIntel && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                    {nodeIntel.type === 'content' && (
                                                        <>
                                                            <div className="mb-4">
                                                                <h6 className="fw-bold text-primary small uppercase mb-2">Learning Objectives</h6>
                                                                <ul className="ps-3 mb-0">
                                                                    {nodeIntel.objectives.map((obj, i) => (
                                                                        <li key={i} className="smaller opacity-80 mb-1">{obj}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="mb-4">
                                                                <h6 className="fw-bold text-primary small uppercase mb-2">Conceptual Summary</h6>
                                                                <p className="smaller opacity-80 mb-0">{nodeIntel.summary}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {nodeIntel.type === 'topics' && (
                                                        <div className="mb-4">
                                                            <h6 className="fw-bold text-primary small uppercase mb-2">Recommended Topics</h6>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {nodeIntel.suggestions.map((t, i) => (
                                                                    <span key={i} className="badge bg-light text-primary border border-primary border-opacity-20 px-2 py-1 cursor-pointer hover-bg-primary hover-text-white transition-all" onClick={() => handleAddMissingTopic(t)}>
                                                                        + {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            <button 
                                                className={`btn btn-primary-premium w-100 rounded-pill py-2 fw-bold mt-2 ${isGeneratingIntel ? 'disabled' : ''}`}
                                                onClick={handleGenerateNodeContent}
                                                disabled={isGeneratingIntel}
                                            >
                                                {isGeneratingIntel ? 'Processing...' : nodeIntel ? 'Regenerate Content' : 'Generate Content'}
                                            </button>
                                        </PremiumCard>
                                    ) : (
                                        <PremiumCard noPadding className="h-100 border-0 shadow-sm border-dashed d-flex align-items-center justify-content-center text-center p-4">
                                            <div className="opacity-25"><FaLightbulb size={40} className="mb-3" /><h6 className="fw-bold uppercase text-xs">Studio Intelligence</h6></div>
                                        </PremiumCard>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>

            <CurriculumModal show={showModal} handleClose={() => setShowModal(false)} title={modalConfig.title} fields={modalConfig.fields} onSubmit={handleModalSubmit} />
            
            <AISuggestionsModal 
                show={showAiSuggestions} 
                handleClose={() => setShowAiSuggestions(false)} 
                suggestions={aiSuggestions} 
                onApply={applyAiReorders} 
                onAddTopic={handleAddMissingTopic}
                onAddModule={handleAddMissingModule}
            />

            <style>{`
                .workspace-root { min-height: 0; }
                .shadow-primary-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
                .hover-light:hover { background-color: rgba(0,0,0,0.03); }
                .border-dashed { border-style: dashed !important; }
                .shadow-ai-glow { box-shadow: 0 0 20px rgba(124, 58, 237, 0.4); }
                .btn-ai-gradient { background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); border: none; }
            `}</style>
        </div>
    );
};

export default CurriculumBuilder;
