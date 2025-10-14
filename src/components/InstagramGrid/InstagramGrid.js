import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./InstagramGrid.css";

import leftImage from "../../assets/image/run1.jpg";
import runnerStart from "../../assets/image/01035cddb88c6a3ae846c091b77afdc3.jpg";
import forestRun from "../../assets/image/465571268966080c5e4503a418030270.jpg";
import groupCelebration from "../../assets/image/group1.jpg";
import groupTrail from "../../assets/image/d1817cd0f9345612000ed1f4ab950149.jpg";

const InstagramGrid = () => (
  <div className="container py-5">
    <div className="row g-4">
      {/* LEFT BIG IMAGE */}
      <div className="col-lg-4">
        <div className="custom-card h-100">
          <img
            src={leftImage}
            alt="Running group"
            className="img-fluid rounded-4 w-100 h-100 object-fit-cover"
          />
        </div>
      </div>
      {/* RIGHT SIDE GRID */}
      <div className="col-lg-8">
        <div className="row g-4">
          {/* Top Row */}
          <div className="col-md-6">
            <div className="custom-card">
              <img
                src={runnerStart}
                alt="Runner start"
                className="img-fluid rounded-4 w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="custom-card">
              <img
                src={forestRun}
                alt="Forest runners"
                className="img-fluid rounded-4 w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          {/* Bottom Row */}
          <div className="col-md-6">
            <div className="custom-card">
              <img
                src={groupCelebration}
                alt="Group running"
                className="img-fluid rounded-4 w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="text-card d-flex flex-column justify-content-center h-100 rounded-4 p-4">
              <h4 className="fw-bold text-uppercase mb-3">
                Follow Our Instagram
              </h4>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
                tellus, luctus nec ullamcorper mattis.
              </p>
              <button className="btn-follow">Follow Us</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InstagramGrid;
