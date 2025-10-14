import React from "react";
import bannerImg from "../../assets/image/youcanrun-banner.png"; // Save the screenshot as youcanrun-banner.png in assets/image
import "./YouCanRunBanner.css";

const YouCanRunBanner = () => (
  <div className="youcanrun-banner-container">
    <img
      src={bannerImg}
      alt="You Too Can Run"
      className="youcanrun-banner-img"
    />
    <button className="youcanrun-play-btn">
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
);

export default YouCanRunBanner;
