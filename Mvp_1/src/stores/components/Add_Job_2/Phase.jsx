import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Phase = ({ id, phase, removePhase }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)'),
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removePhase(phase);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
      className={`phase-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="phase-content">
        <span className="phase-text">{phase}</span>
        <button 
          className="delete-btn" 
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          title="Remove phase"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Phase;