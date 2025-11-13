import React, { useState } from "react";

export default function YouCanRunBanner({ logoSrc }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        background: "#fff",
        margin: "32px 0",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <img
        src={logoSrc}
        alt="You Too Can Run"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          border: "3px solid #da251c",
          borderRadius: "50%",
          width: 70,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Play Video"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle
            cx="20"
            cy="20"
            r="19"
            stroke="#da251c"
            strokeWidth="2"
            fill="#fff"
          />
          <polygon points="16,13 29,20 16,27" fill="#da251c" />
        </svg>
      </button>
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              background: "#000",
              borderRadius: "16px",
              padding: 0,
              width: "90vw",
              maxWidth: "700px",
              height: "50vw",
              maxHeight: "400px",
              boxShadow: "0 2px 24px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
              aria-label="Close"
            >
              <span style={{ fontSize: 22, color: "#da251c" }}>&times;</span>
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/lcgm4iKFM54?autoplay=1"
              title="You Too Can Run Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "16px" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
