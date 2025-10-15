import React from "react";
import "./BlogPanel.css";
import Avatar1 from "../../assets/image/465571268966080c5e4503a418030270.jpg";
import Avatar2 from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";
import Avatar3 from "../../assets/image/d1817cd0f9345612000ed1f4ab950149.jpg";

export default function BlogPanel() {
  return (
    <section className="blog-section">
      <div className="blog-container">
        <div className="blog-content">
          <div className="blog-left-section">
            <div className="blog-featured">
              <img
                src={Avatar1}
                alt="Beginner to Runner"
                className="blog-featured-img"
              />
              <div className="blog-featured-meta">
                <span className="blog-date">📅 July 17, 2025</span>
                <span className="blog-category">🏷️ Uncategorized</span>
              </div>
              <h3 className="blog-featured-title">
                BEGINNER TO RUNNER: HOW TO START YOUR RUNNING JOURNEY
              </h3>
              <p className="blog-featured-desc">
                Starting your first run can feel overwhelming. Here's how to
                ease in, stay consistent, and enjoy every mile.
              </p>
            </div>
            <button className="blog-btn">VIEW BLOG</button>
          </div>
          <div className="blog-right-section">
            <div className="blog-header">
              <span className="blog-badge">– OUR BLOG –</span>
              <h2 className="blog-title">
                INSIGHTS, INSPIRATION, AND EXPERT TIPS
              </h2>
            </div>
            <div className="blog-list">
              <div className="blog-card">
                <img
                  src={Avatar2}
                  alt="Running Mistakes"
                  className="blog-card-img"
                />
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-date">📅 July 17, 2025</span>
                    <span className="blog-category">🏷️ Uncategorized</span>
                  </div>
                  <h4 className="blog-card-title">
                    5 COMMON RUNNING MISTAKES AND HOW TO AVOID THEM
                  </h4>
                  <p className="blog-card-desc">
                    Overstriding? Skipping warm-ups? Learn the most common
                    errors runners make and how to fix them for good.
                  </p>
                </div>
              </div>
              <div className="blog-card">
                <img
                  src={Avatar3}
                  alt="Hydration for Runners"
                  className="blog-card-img"
                />
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-date">📅 July 17, 2025</span>
                    <span className="blog-category">🏷️ Uncategorized</span>
                  </div>
                  <h4 className="blog-card-title">
                    HYDRATION FOR RUNNERS: WHAT, WHEN, AND HOW MUCH
                  </h4>
                  <p className="blog-card-desc">
                    Hydration isn't just about drinking water. Discover the
                    right strategy to fuel your performance on race day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
