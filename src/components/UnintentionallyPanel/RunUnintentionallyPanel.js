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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Class
              aptent taciti sociosqu ad litora torquent.
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
