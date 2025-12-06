import React, { useState } from "react";
import "./RunUnintentionallyPanel.css";
import group1 from "../../assets/image/group1.jpg";

export default function RunUnintentionallyPanel() {
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <section className="run-unintentionally-section">
      <div className="run-container">
        <div className="run-background">
          <img src={group1} alt="Group of runners" className="run-bg-image" />
          <div className="run-overlay"></div>
        </div>

        <div className="run-content">
          <div className="run-text-content">
            <h1 className="run-title">
              RUN UNINTENTIONALLY, AND
              <br />
              FEEL THE DIFFERENCE
            </h1>
            <p className="run-description">
              RACES (YouTooCanRun) brings runners together — find local races,
              manage registrations easily, and access training tips from
              experienced coaches. Join our community to stay motivated,
              discover events near you, and celebrate every milestone.
            </p>
          </div>

          <div className="play-button-container">
            <button
              className="play-button"
              aria-label="Play video"
              onClick={handlePlayClick}
            >
              <div className="play-icon">
                <i className="fas fa-play"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={handleCloseVideo}
        >
          <div
            style={{
              position: "relative",
              width: "70%",
              maxWidth: "800px",
              aspectRatio: "16/9",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseVideo}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "2rem",
                cursor: "pointer",
                zIndex: 10000,
              }}
              aria-label="Close video"
            >
              <i className="fas fa-times"></i>
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/lcgm4iKFM54?autoplay=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: 8,
              }}
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
