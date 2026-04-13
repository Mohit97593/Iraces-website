import React, { useEffect } from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose, title, content }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3>
            <i className="fas fa-info-circle"></i> {title}
          </h3>
          <button className="help-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: content }} />
        <div className="help-modal-footer">
          <button className="help-modal-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
