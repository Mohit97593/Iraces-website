import React from "react";
import "./TrainingPanel.css";
import tranning from "../assets/image/tranning1.png";
import run1 from "../assets/image/run1.jpg";
import run2 from "../assets/image/run2.jpg";
import event2 from "../assets/image/event2.jpg";

export default function TrainingPanel() {
  return (
    <section className="training-section container my-5">
      <div className="row align-items-center" style={{ marginBottom: "5rem" }}>
        <div className="col-md-3 d-none d-md-block">
          <div className="training-pill">- TRAINING PROGRAMS -</div>
        </div>

        <div className="col-6 col-md-6 text-center text-md-start">
          <h2 className="training-title">
            TAILORED TRAINING PLANS FOR
            <br /> EVERY RUNNER
          </h2>
        </div>

        <div className="col-6 col-md-3 text-md-end mt-3 mt-md-0">
          <button className="btn-all">ALL PROGRAMS</button>
        </div>
      </div>

      <div className="training-grid">
        <div className="left-col">
          <div className="big-card">
            <div className="big-card-content">
              <h3>BEST PROGRAMS</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>
              <button className="btn-ghost">LEARN MORE</button>
            </div>

            <img src={tranning} alt="trainer" className="big-card-image" />
          </div>

          <div className="small-cards">
            <div className="small-card">
              <img src={run1} alt="couch" />
              <h4>COUCH TO 5K</h4>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                tellus, luctus nec ullamcorper.
              </p>
              <button className="btn-join">JOIN PROGRAM</button>
            </div>

            <div className="small-card">
              <img src={run2} alt="trail" />
              <h4>TRAIL TRAINING CAMP</h4>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                tellus, luctus nec ullamcorper.
              </p>
              <button className="btn-join">JOIN PROGRAM</button>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="tall-card">
            <div className="tall-header">
              <h3>SHOOT UP ENDURANCE</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

              <div className="avatar-row small">
                <img src={run1} alt="a" />
                <img src={run2} alt="b" />
                <img src={tranning} alt="c" />
                <img src={event2} alt="d" />
              </div>
            </div>

            <div className="tall-image-wrap">
              <img src={event2} alt="runner" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
