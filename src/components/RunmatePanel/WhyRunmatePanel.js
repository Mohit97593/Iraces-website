import React from "react";
import "./WhyRunmatePanel.css";

export default function WhyRunmatePanel() {
  return (
    <section className="why-runmate-section container my-5">
      {/* Header Section */}
      <div className="row align-items-center mb-5">
        <div className="col-md-3 d-none d-md-block">
          <div className="why-pill">- WHY RUNMATE -</div>
        </div>
        <div className="col-md-9">
          <h2 className="why-title">MORE THAN JUST A RUNNING CLUB</h2>
        </div>
      </div>

      {/* Content Grid */}
      <div className="why-content-grid">
        {/* Left Side Features */}
        <div className="left-features">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-running"></i>
            </div>
            <div className="feature-content">
              <h3>PROGRAMS FOR EVERY RUNNER</h3>
              <p>
                Whether you're a beginner or chasing a marathon PR, Runmate
                offers tailored training plans to match your pace.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="feature-content">
              <h3>EXPERT COACHES & REAL SUPPORT</h3>
              <p>
                Our certified coaches bring years of experience and are
                dedicated to helping you run smarter, stay injury-free.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="feature-content">
              <h3>SUPPORTIVE COMMUNITY</h3>
              <p>
                Join a tribe of runners who celebrate your milestones, push you
                through plateaus, and keep the good vibes.
              </p>
            </div>
          </div>
        </div>

        {/* Center Card */}
        <div className="center-card">
          <div className="center-card-content">
            <div className="center-pill">- WHY RUNMATE -</div>
            <h2>MORE THAN JUST A RUNNING CLUB</h2>
            <p>
              Runmate is your community, your coach, and your motivation partner
              in every stride. Vestibulum varius augue quis lacus fringilla
              suscipit. Duis varius dapibus odio a imperdiet.
            </p>
            <button className="explore-btn">EXPLORE MEMBERSHIP</button>
          </div>
        </div>

        {/* Right Side Features */}
        <div className="right-features">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="feature-content">
              <h3>TRACK YOUR PROGRESS LIKE A PRO</h3>
              <p>
                With digital tools, weekly insights, and Strava integration,
                you'll always know how far you've come.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <div className="feature-content">
              <h3>EVENTS & CHALLENGES THAT INSPIRE</h3>
              <p>
                From local meetups to virtual races, monthly challenges, and
                epic trail runs, there's always something exciting to train for.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <i className="fa-solid fa-mobile-screen-button"></i>
            </div>
            <div className="feature-content">
              <h3>FLEXIBLE & ACCESSIBLE ANYWHERE</h3>
              <p>
                Train wherever you are, whenever you can. Our mobile-friendly
                plans and virtual support make running fit into your real life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
