import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaFileUpload, FaPlus, FaTrash, FaCheckCircle, FaMagic, FaFileDownload } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';

const TopicDetail = () => {
    const { darkMode } = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [content, setContent] = useState('');
    const [objectives, setObjectives] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('AI is generating objectives...');
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [numQuestions, setNumQuestions] = useState(25);
    const [quizPdf, setQuizPdf] = useState(null);

    const handleGenerateQuiz = async () => {
        setLoadingText(`AI is analyzing materials and generating ${numQuestions} questions...`);
        setIsAiLoading(true);
        try {
            const formData = new FormData();
            formData.append('num_questions', numQuestions);
            if (quizPdf) formData.append('pdf_file', quizPdf);

            const res = await axiosInstance.post(`ai/topics/${id}/generate-quiz/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setQuizQuestions(res.data.quiz);
            setShowQuizModal(true);
            toast.success(`Generated ${res.data.quiz.length} questions!`);
        } catch (err) {
            toast.error('AI Quiz Generation failed');
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        fetchTopicData();
    }, [id]);

    const fetchTopicData = async () => {
        try {
            const res = await axiosInstance.get(`curriculum/topics/${id}/`);
            setTopic(res.data);
            setContent(res.data.description || '');
            setObjectives(res.data.objectives || []);
            setMaterials(res.data.materials || []);
        } catch (err) {
            toast.error('Failed to load topic details');
        }
    };

    const handleSaveContent = async () => {
        try {
            await axiosInstance.patch(`curriculum/topics/${id}/`, { description: content });
            toast.success('Lesson content saved');
        } catch (err) {
            toast.error('Failed to save content');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('material_type', 'pdf');

        try {
            await axiosInstance.post(`curriculum/topics/${id}/materials/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded');
            fetchTopicData();
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    const handleAISuggestObjectives = async () => {
        setLoadingText('AI is crafting learning objectives based on your notes...');
        setIsAiLoading(true);
        try {
            const res = await axiosInstance.post('ai/suggest-objectives/', {
                name: topic.name,
                description: content
            });
            
            const newObjectives = res.data.objectives;
            
            // For each suggested objective, save it to the backend
            for (const objText of newObjectives) {
                await axiosInstance.post(`curriculum/topics/${id}/objectives/`, {
                    description: objText,
                    bloom_level: 'AI Generated'
                });
            }
            
            toast.success(`AI suggested ${newObjectives.length} objectives!`);
            fetchTopicData();
        } catch (err) {
            toast.error('AI Suggestion failed');
        } finally {
            setIsAiLoading(false);
        }
    };

    if (!topic) return <div className="text-center mt-5">Loading Lesson Content...</div>;

    return (
        <div className="container-fluid pb-5">
            {isAiLoading && (
                <div className={`position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${darkMode ? 'bg-dark bg-opacity-75' : 'bg-white bg-opacity-75'}`} style={{ zIndex: 1050 }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className={`fw-bold h5 ${darkMode ? 'text-white' : 'text-primary'}`}>{loadingText}</p>
                    </div>
                </div>
            )}
            
            {/* Quiz Modal */}
            {showQuizModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className={`modal-content border-0 shadow-lg rounded-5 overflow-hidden ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                            <div className="modal-header bg-primary text-white border-0 p-4">
                                <h5 className="modal-title fw-bold">AI Generated Quiz - {topic.name}</h5>
                                <button type="button" className={`btn-close ${darkMode ? 'btn-close-white' : ''}`} onClick={() => setShowQuizModal(false)}></button>
                            </div>
                            <div className={`modal-body p-4 ${darkMode ? 'bg-dark bg-opacity-50' : 'bg-light bg-opacity-30'}`}>
                                {quizQuestions.map((q, i) => (
                                    <div key={i} className={`card border-0 shadow-sm rounded-4 mb-4 p-4 ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-white'}`}>
                                        <p className="fw-bold mb-3 fs-5">Q{i+1}: {q.question}</p>
                                        <div className="row g-2 mb-3">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx} className="col-md-6">
                                                    <div className={`p-3 border rounded-4 small fw-medium ${q.answer === opt ? 'bg-success bg-opacity-10 border-success text-success' : darkMode ? 'bg-dark bg-opacity-20 border-secondary text-white-50' : 'bg-white border-light'}`}>
                                                        {opt}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`p-3 rounded-4 small border-start border-4 border-success ${darkMode ? 'bg-success bg-opacity-5 text-white-50' : 'bg-light text-muted'}`}>
                                            <strong className="text-success uppercase text-xs d-block mb-1">Neural Verification</strong>
                                            <strong>Correct Key:</strong> {q.answer}
                                            <p className="mb-0 mt-1 italic"><strong>Rationale:</strong> {q.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={`modal-footer border-0 p-4 ${darkMode ? 'bg-dark' : 'bg-light bg-opacity-50'}`}>
                                <button type="button" className="btn btn-white px-4" onClick={() => setShowQuizModal(false)}>Close Vault</button>
                                <button type="button" className="btn btn-primary-premium px-4 shadow-sm" onClick={() => window.print()}><FaFileDownload className="me-2" /> Export to PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
                <FaArrowLeft className="me-2" /> Back to Curriculum
            </button>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">{topic.name}</h2>
                    <p className="text-muted small">Topic Content Management</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary px-4 py-2 fw-bold" onClick={handleSaveContent}>
                        <FaSave className="me-2" /> Save All Changes
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column: Rich Text Editor */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">Lesson Notes & Instructions</h5>
                            <button className="btn btn-sm btn-info text-white rounded-pill px-3" onClick={handleGenerateQuiz}>
                                <FaMagic className="me-1" /> Generate {numQuestions} Qs Quiz
                            </button>
                        </div>
                        <ReactQuill 
                            theme="snow" 
                            value={content} 
                            onChange={setContent}
                            style={{ height: '400px', marginBottom: '50px' }}
                        />
                    </div>
                </div>

                {/* Right Column: Objectives & Materials */}
                <div className="col-lg-4">
                    {/* Quiz Controls */}
                    <div className="card border-0 shadow-sm p-4 mb-4 bg-primary bg-opacity-10">
                        <h5 className="fw-bold mb-3 text-primary"><FaMagic className="me-2" /> Quiz Generator</h5>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Questions Count</label>
                            <select className="form-select rounded-3 border-0 shadow-sm" value={numQuestions} onChange={e => setNumQuestions(e.target.value)}>
                                <option value="5">5 Questions</option>
                                <option value="10">10 Questions</option>
                                <option value="25">25 Questions (Full Exam)</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Analysis Source (Optional PDF)</label>
                            <input type="file" className="form-control form-control-sm rounded-3 border-0 shadow-sm" onChange={e => setQuizPdf(e.target.files[0])} />
                        </div>
                        <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" onClick={handleGenerateQuiz}>
                            AI Generate Quiz
                        </button>
                    </div>

                    {/* Learning Objectives */}
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">Objectives</h5>
                            <div className="btn-group">
                                <button 
                                    className="btn btn-sm btn-outline-warning" 
                                    onClick={handleAISuggestObjectives}
                                    title="AI Suggest Objectives"
                                >
                                    <FaMagic className="me-1" /> AI Suggest
                                </button>
                                <button className="btn btn-sm btn-outline-primary"><FaPlus /></button>
                            </div>
                        </div>
                        <ul className="list-group list-group-flush">
                            {objectives.map(obj => (
                                <li key={obj.id} className="list-group-item d-flex align-items-start px-0 border-0">
                                    <FaCheckCircle className="text-success mt-1 me-2" />
                                    <span>{obj.description}</span>
                                </li>
                            ))}
                            {objectives.length === 0 && <p className="text-muted small">No objectives defined yet.</p>}
                        </ul>
                    </div>

                    {/* Study Materials */}
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">Study Materials</h5>
                        <div className="mb-3">
                            <label className="btn btn-outline-secondary w-100 py-2 border-dashed">
                                <FaFileUpload className="me-2" /> Upload PDF/Resource
                                <input type="file" hidden onChange={handleFileUpload} />
                            </label>
                        </div>
                        <div className="list-group list-group-flush">
                            {materials.map(mat => (
                                <div key={mat.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                        <small className="fw-bold">{mat.title}</small>
                                    </div>
                                    <button className="btn btn-sm text-danger"><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicDetail;
