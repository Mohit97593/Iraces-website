import React, { useState } from 'react';
import HelpModal from './HelpModal';

const HelpIcon = ({ title, content, style }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Show info"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#da251c',
          cursor: 'pointer',
          padding: '0 8px',
          fontSize: '1.2rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          transition: 'transform 0.2s',
          ...style
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className="fas fa-info-circle"></i>
      </button>

      <HelpModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        content={content}
      />
    </>
  );
};

export default HelpIcon;
