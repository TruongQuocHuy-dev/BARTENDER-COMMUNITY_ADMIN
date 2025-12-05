import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/components/modal.css';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', // small, medium, large, or auto
  showCloseButton = true,
  subtitle,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{subtitle}</div>}
          </div>
          {showCloseButton && (
            <button onClick={onClose} className="modal-close">
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
