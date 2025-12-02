import React from "react";
import "./RunUnintentionallyPanel.css";
import group1 from "../../assets/image/group1.jpg";

export default function RunUnintentionallyPanel() {
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
            <button className="play-button" aria-label="Play video">
              <div className="play-icon">
                <i className="fas fa-play"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
