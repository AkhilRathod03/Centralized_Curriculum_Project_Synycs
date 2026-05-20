import React, { useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripLines, FaEdit, FaTrash } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';

export const SortableItem = ({ id, content, onEdit, onDelete, index, extraAction }) => {
    const { darkMode } = useContext(ThemeContext);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`p-3 rounded-4 d-flex align-items-center transition-all ${isDragging ? 'shadow-lg border-primary' : 'shadow-sm border'} ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'}`}
        >
            <div {...attributes} {...listeners} className="me-3 text-muted cursor-grab hover-primary">
                <FaGripLines size={14} />
            </div>
            <div className="flex-grow-1 min-width-0">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>MOD {index}</span>
                    <span className={`fw-bold text-truncate ${darkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>{content}</span>
                </div>
            </div>
            <div className="d-flex align-items-center gap-1 ms-3">
                {extraAction}
                {onEdit && (
                    <button className="btn btn-icon-sm btn-light border rounded-circle" onClick={(e) => { e.stopPropagation(); onEdit(id); }}>
                        <FaEdit size={12} className="text-primary" />
                    </button>
                )}
                {onDelete && (
                    <button className="btn btn-icon-sm btn-light border rounded-circle" onClick={(e) => { e.stopPropagation(); onDelete(id); }}>
                        <FaTrash size={12} className="text-danger" />
                    </button>
                )}
            </div>
        </div>
    );
};
