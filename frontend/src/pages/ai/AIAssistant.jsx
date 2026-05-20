import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBrain, FaRobot, FaMagic, FaPaperPlane, FaUndo, FaUserGraduate, 
    FaTrashAlt, FaLightbulb, FaExpand, FaCompress
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosInstance';

const AIAssistant = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isGenerating]);

    const handleGenerate = async (e, customPrompt = null) => {
        if (e) e.preventDefault();
        const activePrompt = customPrompt || prompt;
        if (!activePrompt.trim()) return;
        
        setIsGenerating(true);
        
        // Add user message to history
        const userMsg = { role: 'user', content: activePrompt };
        setChatHistory(prev => [...prev, userMsg]);
        const currentPrompt = activePrompt;
        if (!customPrompt) setPrompt('');

        try {
            const res = await axiosInstance.post('ai/chat/', { prompt: currentPrompt });
            const aiResponse = res.data.response;
            setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error("Neural Core Connection Error:", error);
            let errorMessage = "Synchronization Error";
            let detail = "Could not reach the AI server.";
            
            if (error.response) {
                const status = error.response.status;
                errorMessage = `Server Error (${status})`;
                detail = error.response.data.error || "Please check backend logs.";
            }

            toast.error(`${errorMessage}: ${detail}`);
            setChatHistory(prev => [...prev, { role: 'ai', content: `❌ ${errorMessage}: ${detail}` }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const clearChat = () => {
        if (window.confirm("Clear all conversation history?")) {
            setChatHistory([]);
        }
    };

    return (
        <div className={`px-lg-4 ai-chat-portal d-flex align-items-center justify-content-center ${isFullScreen ? 'fullscreen-mode' : 'vh-85'}`} style={{ minHeight: isFullScreen ? '100vh' : 'calc(100vh - 100px)' }}>
            <div className={`mx-auto chat-wrapper ${isFullScreen ? 'w-100 vh-100' : 'w-100 max-w-1000'}`}>
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`chat-container shadow-2xl overflow-hidden d-flex flex-column rounded-5 border ${
                        darkMode 
                        ? 'bg-slate-900 border-white border-opacity-10' 
                        : 'bg-glass-light border-azure-soft shadow-azure-glow'
                    }`}
                    style={{ height: isFullScreen ? '100vh' : '85vh' }}
                >
                    {/* Header */}
                    <div className="p-4 bg-ai-gradient d-flex align-items-center justify-content-between text-white">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white bg-opacity-20 rounded-circle p-2 shadow-inner">
                                <FaRobot size={22} />
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0">CCMS Neural Assistant</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="pulse-green rounded-circle" style={{width: '8px', height: '8px', backgroundColor: '#10b981'}}></div>
                                    <span className="text-white-50 text-xs uppercase letter-spacing-1 fw-bold">Online & Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-icon-glass text-white" onClick={() => setIsFullScreen(!isFullScreen)} title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
                                {isFullScreen ? <FaCompress /> : <FaExpand />}
                            </button>
                            <button className="btn btn-icon-glass text-white" onClick={clearChat} title="Clear Chat">
                                <FaTrashAlt />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-4 bg-ai-mesh custom-scrollbar ${
                        darkMode ? '' : 'bg-azure-subtle'
                    }`}>
                        {chatHistory.length === 0 && (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-75">
                                <h2 className={`fw-bold mb-3 ${darkMode ? 'text-white' : 'text-primary'}`}>How can I help you, {user?.username || 'Teacher'}?</h2>
                                <p className={`max-w-500 mb-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`}>
                                    Ask me to design a course, explain a complex topic, generate a quiz, or help with academic planning.
                                </p>
                                
                                <div className="d-flex flex-wrap justify-content-center gap-3">
                                    {[
                                        { label: "Design a Python Course", prompt: "Design a 5-module course for Python Programming basics." },
                                        { label: "Explain Bloom's Taxonomy", prompt: "Explain Bloom's Taxonomy and its importance in curriculum design." },
                                        { label: "Emerging Tech 2026", prompt: "What are the top 5 emerging technologies to include in a CSE curriculum for 2026?" }
                                    ].map((suggest, i) => (
                                        <button 
                                            key={i} 
                                            className={`btn glass-button rounded-pill px-4 py-2 text-sm fw-bold border transition-all ${
                                                darkMode 
                                                ? 'text-white-50 border-white border-opacity-10 hover-bg-white-10' 
                                                : 'text-primary border-primary border-opacity-20 hover-bg-primary-opacity'
                                            }`}
                                            onClick={() => handleGenerate(null, suggest.prompt)}
                                        >
                                            <FaLightbulb className="me-2 text-warning" /> {suggest.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div className={`chat-bubble p-4 rounded-5 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none user-bubble' 
                                    : darkMode 
                                        ? 'bg-slate-800 text-white rounded-tl-none border border-white border-opacity-5' 
                                        : 'bg-white border border-azure-light text-dark rounded-tl-none ai-bubble-azure'
                                }`}>
                                    <div className="d-flex align-items-center gap-2 mb-3 opacity-75">
                                        <div className={`p-1 rounded-circle ${msg.role === 'user' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                            {msg.role === 'user' ? <FaUserGraduate size={10} /> : <FaRobot size={10} />}
                                        </div>
                                        <span className={`text-xs fw-bold uppercase letter-spacing-1 ${!darkMode && msg.role === 'ai' ? 'text-primary' : ''}`}>
                                            {msg.role === 'user' ? 'You' : 'CCMS AI'}
                                        </span>
                                    </div>
                                    <div className="chat-text markdown-content" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.6' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        
                        {isGenerating && (
                            <div className="d-flex justify-content-start">
                                <div className={`chat-bubble p-4 rounded-5 shadow-sm ${
                                    darkMode ? 'bg-slate-800 text-white' : 'bg-white border border-azure-light'
                                }`}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-1 rounded-circle bg-primary text-white">
                                            <FaRobot size={10} />
                                        </div>
                                        <span className={`text-sm fw-bold animate-pulse ${!darkMode ? 'text-primary' : ''}`}>Neural Core is processing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`p-4 border-top ${
                        darkMode ? 'bg-slate-900 border-white border-opacity-10' : 'bg-white border-azure-soft'
                    }`}>
                        <form onSubmit={handleGenerate} className="d-flex gap-3 max-w-1000 mx-auto">
                            <div className="flex-grow-1 position-relative">
                                <input 
                                    type="text" 
                                    className={`form-control rounded-pill px-5 py-4 shadow-lg border-2 ${
                                        darkMode 
                                        ? 'bg-slate-800 border-white border-opacity-5 text-white' 
                                        : 'bg-light border-azure-light text-dark'
                                    } focus-primary`}
                                    placeholder="Type your academic doubt or curriculum request..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isGenerating}
                                    style={{ fontSize: '1.05rem' }}
                                />
                                <div className="position-absolute left-20 top-50 translate-middle-y opacity-50">
                                    <FaMagic className="text-primary" />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="btn bg-ai-gradient text-white rounded-circle shadow-2xl d-flex align-items-center justify-content-center hover-lift transition-all" 
                                style={{ width: '64px', height: '64px' }}
                                disabled={isGenerating || !prompt.trim()}
                            >
                                <FaPaperPlane size={24} />
                            </button>
                        </form>
                        <p className="text-center text-xs text-muted mt-3 mb-0 opacity-50">
                            CCMS AI may provide inaccurate info about people, places, or facts. Verify important curriculum data.
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .ai-chat-portal { font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
                .fullscreen-mode { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2000; padding: 0 !important; }
                
                .max-w-1000 { max-width: 1000px; }
                .max-w-500 { max-width: 500px; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .uppercase { text-transform: uppercase; }
                
                .chat-container { height: 85vh; }
                .bg-slate-900 { background-color: #020617; }
                .bg-slate-800 { background-color: #0f172a; }
                .bg-slate-50 { background-color: #f8fafc; }
                
                .bg-ai-mesh {
                    background-image: radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.05) 1px, transparent 0);
                    background-size: 32px 32px;
                }
                
                .chat-bubble { max-width: 85%; transition: all 0.2s ease; }
                .user-bubble { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; }
                .ai-bubble-light { background-color: #ffffff; border: 1px solid rgba(0,0,0,0.05) !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important; }
                .border-light-darker { border-color: #e2e8f0 !important; }
                .rounded-tr-none { border-top-right-radius: 0 !important; }
                .rounded-tl-none { border-top-left-radius: 0 !important; }
                
                .left-20 { left: 24px; }
                .btn-icon-glass { 
                    background: rgba(255, 255, 255, 0.1); 
                    border: 1px solid rgba(255, 255, 255, 0.1); 
                    border-radius: 12px;
                    padding: 8px 12px;
                    transition: all 0.2s;
                }
                .btn-icon-glass:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.1); }
                
                .glass-button:hover { background: rgba(37, 99, 235, 0.05); transform: translateY(-2px); }
                
                .pulse-green { animation: pulseGreen 2s infinite; }
                @keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.2); }
                
                .focus-primary:focus { border-color: #2563eb !important; background: ${darkMode ? '#1e293b' : '#fff'} !important; }
                .ai-neon-glow { filter: drop-shadow(0 0 15px rgba(37, 99, 235, 0.4)); }
                
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
};

export default AIAssistant;
