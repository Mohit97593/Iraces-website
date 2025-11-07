import React from "react";

import { useEffect } from "react";
import TopNav from "../components/Navbar/TopNav";
import "./MyEvents.css";

export default function MyEvents() {
  useEffect(() => {
    import("../services/authAPI").then(({ authAPI }) => {
      authAPI.getProfile().then((res) => {
        console.log("MyEvents getProfile API result:", res);
      });
    });
  }, []);

  return (
    <>
      <TopNav />
      {/* Hero Section - copied from Contact page for exact blue section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">My Events</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">–</span>
                <span>My Events</span>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <div className="my-events-section">
        <div className="my-events-type-group">
          <button className="my-events-type-btn public">🔓 Public</button>
          <button className="my-events-type-btn private">🔒 Private</button>
          <button className="my-events-type-btn draft">📝 Draft</button>
        </div>
        <div className="my-events-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="No events"
            className="my-events-empty-img"
          />
          <h2 className="my-events-empty-title">No events found</h2>
          <p className="my-events-empty-desc">
            Sorry, There are no events added yet. Please design your event now!
          </p>
        </div>
      </div>
    </>
  );
}
