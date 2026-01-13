import React, { useState } from "react";
import bannerImg from "../../assets/image/youcanrun-banner.png"; // Save the screenshot as youcanrun-banner.png in assets/image
import "./YouCanRunBanner.css";

const YouCanRunBanner = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoUrl = "https://www.youtube.com/embed/lcgm4iKFM54";

  const handlePlayClick = () => {
    setShowVideoModal(true);
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  return (
    <>
      <div className="youcanrun-banner-container">
        <img
          src={bannerImg}
          alt="You Too Can Run"
          className="youcanrun-banner-img"
        />
        <button className="youcanrun-play-btn" onClick={handlePlayClick}>
          <span className="play-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle
                cx="20"
                cy="20"
                r="19"
                stroke="#da251c"
                strokeWidth="2"
                fill="#fff"
              />
              <polygon points="16,13 28,20 16,27" fill="#da251c" />
            </svg>
          </span>
        </button>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div
          className="video-modal-overlay"
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              aspectRatio: "16/9",
              background: "#000",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "32px",
                cursor: "pointer",
                zIndex: 10001,
                padding: "0",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close video"
            >
              ×
            </button>
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="You Too Can Run"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default YouCanRunBanner;

