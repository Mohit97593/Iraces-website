import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const isSuccess = type === 'success';

    const containerStyle = {
        position: 'fixed',
        top: '24px',
        right: '24px',
        minWidth: '320px',
        maxWidth: '420px',
        padding: '14px 18px',
        borderRadius: '10px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 2147483647,
        background: isSuccess
            ? 'linear-gradient(135deg, #1a9e4a 0%, #27ae60 100%)'
            : 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
        color: '#fff',
        borderLeft: isSuccess ? '5px solid #0d7a38' : '5px solid #922b21',
        animation: 'none',
        fontFamily: 'inherit',
    };

    const messageStyle = {
        flex: 1,
        fontSize: '14px',
        fontWeight: '600',
        lineHeight: '1.4',
        color: '#fff',
    };

    const closeStyle = {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        lineHeight: 1,
        padding: 0,
    };

    const iconStyle = {
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
    };

    const toastContent = (
        <div style={containerStyle}>
            <div style={iconStyle}>
                {isSuccess ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white" />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white" />
                    </svg>
                )}
            </div>
            <div style={messageStyle}>{message}</div>
            <button style={closeStyle} onClick={() => onCloseRef.current()}>×</button>
        </div>
    );

    return ReactDOM.createPortal(toastContent, document.body);
};

export default Toast;
