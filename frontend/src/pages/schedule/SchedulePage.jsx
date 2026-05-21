import React, { useState, useEffect, useContext } from 'react';
import { 
    FaCalendarAlt, FaClock, FaMagic, FaCheckCircle, 
    FaExclamationTriangle, FaFilter, FaRobot, FaDownload, 
    FaGripVertical, FaUserTie, FaSave, FaPlus, FaChevronRight,
    FaRegCalendarCheck, FaChartBar, FaTable
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmAction } from '../../utils/confirmAction';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import axios from 'axios';
import PageHeader from '../../components/common/PageHeader';
import PremiumCard from '../../components/common/PremiumCard';

const SchedulePage = () => {
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);
    const isStudent = user?.role === 'student';
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [events, setEvents] = useState([
        { id: '1', title: 'Data Structures (CS-201)', start: '2026-05-18T10:00:00', end: '2026-05-18T11:30:00', backgroundColor: '#2563eb' },
        { id: '2', title: 'Algorithms Lab', start: '2026-05-18T14:00:00', end: '2026-05-18T16:00:00', backgroundColor: '#10b981' },
        { id: '3', title: 'Database Systems', start: '2026-05-19T09:00:00', end: '2026-05-19T10:30:00', backgroundColor: '#8b5cf6' },
        { id: '4', title: 'Faculty Meeting', start: '2026-05-19T15:00:00', end: '2026-05-19T16:00:00', backgroundColor: '#f59e0b' },
    ]);

    const [config, setConfig] = useState({
        semester: '3',
        department: 'Computer Science',
        type: 'AI-Optimized'
    });

    const [allocationPool, setAllocationPool] = useState([
        { title: 'Operating Systems', color: '#2563eb' },
        { title: 'Neural Networks', color: '#7c3aed' },
        { title: 'Quantum Computing', color: '#06b6d4' }
    ]);

    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ title: '', color: '#2563eb' });

    useEffect(() => {
        if (!isStudent) {
            let draggableEl = document.getElementById('external-events');
            if (draggableEl) {
                new Draggable(draggableEl, {
                    itemSelector: '.fc-event',
                    eventData: function(eventEl) {
                        return {
                            title: eventEl.innerText,
                            backgroundColor: eventEl.dataset.color || '#2563eb',
                            duration: '01:30'
                        };
                    }
                });
            }
        }
    }, [isStudent, allocationPool]);

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (!newSubject.title) return toast.error("Subject title required");
        setAllocationPool([...allocationPool, newSubject]);
        setNewSubject({ title: '', color: '#2563eb' });
        setShowAddSubjectModal(false);
        toast.success(`${newSubject.title} added to allocation node.`);
    };

    const handleGenerateAI = () => {
        setIsGenerating(true);
        toast.info("AI Neural Engine is analyzing faculty workloads...", { icon: <FaRobot className="text-primary"/> });
        setTimeout(() => {
            const aiEvents = [
                ...events,
                { id: '5', title: 'AI: Machine Learning', start: '2026-05-20T10:00:00', end: '2026-05-20T11:30:00', backgroundColor: '#a855f7' },
                { id: '6', title: 'AI: Deep Learning Lab', start: '2026-05-20T13:30:00', end: '2026-05-20T16:30:00', backgroundColor: '#06b6d4' },
            ];
            setEvents(aiEvents);
            setIsGenerating(false);
            toast.success("Optimal timetable generated with 98% efficiency.");
        }, 2500);
    };

    const handleEventDragStop = (info) => {
        const trashEl = document.getElementById('allocation-card');
        if (trashEl) {
            const rect = trashEl.getBoundingClientRect();
            const x = info.jsEvent.clientX;
            const y = info.jsEvent.clientY;

            // If dropped inside the allocation card boundaries
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                info.event.remove();
                setEvents(prev => prev.filter(e => e.id !== info.event.id));
                toast.info(`${info.event.title} returned to pool.`);
            }
        }
    };

    const handleEventClick = async (clickInfo) => {
        if (!isStudent && await confirmAction(`Are you sure you want to de-allocate '${clickInfo.event.title}'?`)) {
            clickInfo.event.remove();
            setEvents(prev => prev.filter(e => e.id !== clickInfo.event.id));
            toast.info(`${clickInfo.event.title} returned to allocation node.`);
        }
    };

    const handleEventReceive = (info) => {
        // When an external event is dropped, we add it to our state
        const newEvent = {
            id: String(Date.now()),
            title: info.event.title,
            start: info.event.startStr,
            end: info.event.endStr,
            backgroundColor: info.event.backgroundColor
        };
        setEvents(prev => [...prev, newEvent]);
    };

    const handleExportTimetable = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/curriculum/schedules/export/', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Academic_Timetable.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Printable timetable downloaded!");
        } catch (error) {
            console.error("Error exporting schedule:", error);
            toast.error("Failed to export schedule.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-5 px-lg-4">
            <PageHeader 
                title="Enterprise Scheduler"
                subtitle="Smart timetable management and faculty resource allocation"
                breadcrumbs={[{ label: 'Main', path: '/' }, { label: 'Schedule' }]}
                actions={[
                    { label: 'Export Timetable', icon: <FaDownload size={12} />, variant: 'secondary', onClick: handleExportTimetable },
                    !isStudent && { label: 'AI Auto-Schedule', icon: <FaMagic size={12} />, variant: 'primary', onClick: handleGenerateAI }
                ].filter(Boolean)}
            />

            <div className="row g-4">
                {/* Left Controls */}
                {!isStudent && (
                    <div className="col-lg-3">
                        <PremiumCard title="Strategy Engine" icon={<FaFilter className="text-primary" />} className="mb-4">
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase letter-spacing-1">Target Department</label>
                                <select className={`form-select glass border-0 rounded-3 py-2 shadow-none small ${darkMode ? 'bg-dark bg-opacity-40 text-white' : 'bg-light'}`} value={config.department} onChange={e => setConfig({...config, department: e.target.value})}>
                                    <option>Computer Science</option>
                                    <option>Mechanical Engineering</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase letter-spacing-1">Strategy Focus</label>
                                <div className="d-grid gap-2">
                                    {['Balanced', 'Teacher-First', 'Lab-Utilization'].map(f => (
                                        <button key={f} className={`btn btn-sm text-start rounded-pill px-3 py-2 border-0 transition-all ${config.type === f ? 'btn-primary' : `${darkMode ? 'bg-dark bg-opacity-40 text-muted' : 'bg-light text-muted'}`}`} onClick={() => setConfig({...config, type: f})}>
                                            <FaCheckCircle className={`me-2 ${config.type === f ? 'text-white' : 'opacity-25'}`} size={10} /> {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </PremiumCard>

                        <div id="allocation-card">
                            <PremiumCard 
                                title="Allocation Node" 
                                icon={<FaRegCalendarCheck className="text-success" />} 
                                subtitle="Drag to timetable | Drag BACK to return"
                            >
                                <button 
                                    className="btn btn-sm btn-light-success rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3 shadow-sm border py-2"
                                    onClick={() => setShowAddSubjectModal(true)}
                                >
                                    <FaPlus size={10} /> Add New Subject
                                </button>
                                <div id="external-events" className="mt-2">
                                    {allocationPool.map((ev, i) => (
                                        <div 
                                            key={i} 
                                            className="fc-event d-flex align-items-center p-3 rounded-4 mb-2 cursor-pointer transition-all hover-lift shadow-sm border-0"
                                            style={{ backgroundColor: ev.color, color: 'white' }}
                                            data-color={ev.color}
                                        >
                                            <FaGripVertical className="opacity-50 me-3" />
                                            <span className="small fw-bold letter-spacing-1">{ev.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </PremiumCard>
                        </div>
                    </div>
                )}

                {/* Main Calendar View */}
                <div className={isStudent ? "col-12" : "col-lg-9"}>
                    <PremiumCard className={`p-0 border-0 shadow-lg h-100 overflow-hidden ${darkMode ? 'bg-glass-dark' : 'bg-glass-light'}`}>
                        <div className="p-4 bg-transparent">
                            <div className={`calendar-wrapper ${darkMode ? 'fc-theme-dark' : 'fc-theme-standard'}`}>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
                                    editable={!isStudent}
                                    droppable={!isStudent}
                                    selectable={!isStudent}
                                    weekends={false}
                                    allDaySlot={false}
                                    slotMinTime="08:00:00"
                                    slotMaxTime="18:00:00"
                                    height="600px"
                                    events={events}
                                    eventClassNames="rounded-3 border-0 shadow-sm px-2 py-1 cursor-pointer"
                                    eventClick={handleEventClick}
                                    eventReceive={handleEventReceive}
                                    eventDragStop={handleEventDragStop}
                                    eventResize={(info) => toast.success(`Updated duration for ${info.event.title}`)}
                                    eventDrop={(info) => toast.info(`Rescheduled to ${info.event.start.getHours()}:00`)}
                                />
                            </div>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Add Subject Modal */}
            <AnimatePresence>
                {showAddSubjectModal && (
                    <div className="modal d-block" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 rounded-5 shadow-2xl overflow-hidden">
                                <form onSubmit={handleAddSubject}>
                                    <div className="modal-header border-0 p-4 bg-success text-white">
                                        <h5 className="fw-bold mb-0">Add New Subject</h5>
                                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowAddSubjectModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="mb-4">
                                            <label className="form-label smaller fw-bold text-muted uppercase">Subject Title</label>
                                            <input type="text" className="form-control border-light py-3 rounded-4" placeholder="e.g. Distributed Systems" value={newSubject.title} onChange={e => setNewSubject({ ...newSubject, title: e.target.value })} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label smaller fw-bold text-muted uppercase">Allocation Color</label>
                                            <div className="d-flex gap-3">
                                                {['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                                                    <div 
                                                        key={c} 
                                                        className={`rounded-circle cursor-pointer border-3 ${newSubject.color === c ? 'border-dark' : 'border-white'}`}
                                                        style={{ backgroundColor: c, width: '32px', height: '32px' }}
                                                        onClick={() => setNewSubject({ ...newSubject, color: c })}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 p-4 pt-0">
                                        <button type="submit" className="btn btn-success w-100 py-3 rounded-pill fw-bold">Add to Pool</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-light-success { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
                .btn-light-success:hover { background-color: #10b981; color: white; }
                .fc .fc-toolbar-title { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; }
                .fc .fc-button-primary { background: var(--primary) !important; border: none !important; border-radius: 100px !important; padding: 0.4rem 1.1rem !important; font-weight: 600 !important; font-size: 0.75rem !important; text-transform: uppercase; letter-spacing: 0.05em; }
                .fc .fc-button-primary:hover { background: var(--primary-hover) !important; transform: translateY(-1px); }
                
                /* Dark Mode Calendar Fixes */
                .fc-theme-dark .fc-scrollgrid { border-color: rgba(255,255,255,0.1) !important; }
                .fc-theme-dark .fc-col-header-cell { background: #1e293b !important; color: #f8fafc !important; border-color: rgba(255,255,255,0.1) !important; }
                .fc-theme-dark .fc-timegrid-slot { border-color: rgba(255,255,255,0.05) !important; background: transparent !important; }
                .fc-theme-dark .fc-timegrid-slot-lane { background: transparent !important; }
                .fc-theme-dark .fc-timegrid-axis { color: #94a3b8 !important; }
                .fc-theme-dark .fc-timegrid-axis-cushion { color: #94a3b8 !important; }
                .fc-theme-dark .fc-daygrid-day-number { color: #f8fafc !important; }
                .fc-theme-dark .fc-list { background: #1e293b !important; }
                .fc-theme-dark .fc-list-day-cushion { background: #334155 !important; }
                .fc-theme-dark .fc-scrollgrid-section-header > * { background: #1e293b !important; }
                .fc-theme-dark .fc-view-harness { background: #1e293b !important; }
                .fc-theme-dark .fc-col-header-cell-cushion { color: #f8fafc !important; }
                
                .fc-event { border-radius: 100px !important; border: none !important; padding: 5px 15px !important; box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important; font-weight: 600 !important; font-size: 0.75rem !important; color: white !important; }
                .fc-v-event { background-color: var(--primary) !important; border: none !important; border-radius: 12px !important; }
            `}</style>
        </motion.div>
    );
};

export default SchedulePage;
