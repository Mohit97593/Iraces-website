import React from "react";
import "../Contact/Contact.css"; // Using the same CSS as Contact page
import "./WhyChooseRaces.css"; // Additional styles
import TopNav from "../../components/Navbar/TopNav";

export default function WhyChooseRaces() {
  return (
    <div className="contact-page">
      <TopNav />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Why Choose RACES?</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Why Choose RACES</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RACES Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="section-title">Why Choose RACES?</h2>
            </div>
          </div>
          <div className="row">
            {/* Trusted Brand */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h4 className="feature-title">Trusted Brand</h4>
                <p className="feature-description">
                  We're a well-known name in the running events industry,
                  carefully selecting partnerships.
                </p>
              </div>
            </div>

            {/* Targeted Outreach */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <h4 className="feature-title">Targeted Outreach</h4>
                <p className="feature-description">
                  We offer comprehensive marketing solutions that enable
                  effective outreach, ensuring your event reaches the right
                  audience with precision and efficiency.
                </p>
              </div>
            </div>

            {/* Wide Recognition */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h4 className="feature-title">Wide Recognition</h4>
                <p className="feature-description">
                  With deep connections in the industry, we are widely
                  recognized within the running community.
                </p>
              </div>
            </div>

            {/* Effective Promotions */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4 className="feature-title">Effective Promotions</h4>
                <p className="feature-description">
                  Our pro team approach leads to better engagement and responses
                  to event promotions.
                </p>
              </div>
            </div>

            {/* Complete Services */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-cogs"></i>
                </div>
                <h4 className="feature-title">Complete Services</h4>
                <p className="feature-description">
                  Partnering with RACES gives you access to a full suite of
                  services for a successful running event.
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <p className="section-tagline">
                Let the professionals at RACES handle the expertise, so you can
                focus on making your event a success!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="how-we-work-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="section-title">How We works</h2>
            </div>
          </div>

          {/* Process Steps */}
          <div className="row process-steps">
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="process-step">
                <div className="process-icon">
                  <i className="fas fa-calendar-plus"></i>
                </div>
                <p className="process-label">CREATE YOUR EVENT</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="process-step">
                <div className="process-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <p className="process-label">CREATE YOUR REGISTRATION FORM</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="process-step">
                <div className="process-icon">
                  <i className="fas fa-paint-brush"></i>
                </div>
                <p className="process-label">PERSONALISE YOUR EVENT</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="process-step">
                <div className="process-icon">
                  <i className="fas fa-play-circle"></i>
                </div>
                <p className="process-label">GO LIVE!</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="process-step">
                <div className="process-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <p className="process-label">MANAGE YOUR REGISTRATIONS</p>
              </div>
            </div>
          </div>

          {/* Get Started Section */}
          <div className="row get-started-section">
            <div className="col-lg-6 col-md-6">
              <div className="get-started-illustration">
                <i className="fas fa-calendar-alt"></i>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="get-started-content">
                <h3 className="get-started-number">01</h3>
                <h4 className="get-started-title">
                  Get Started with Your Event
                </h4>
                <p className="get-started-description">
                  Sign up and create your event. It's fast and effortless!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RACES Features Section */}
      <section className="races-features-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="section-title">RACES FEATURES</h2>
            </div>
          </div>
          <div className="row">
            {/* Prompt Support */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="races-feature-card">
                <div className="races-feature-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <div className="races-feature-content">
                  <h4 className="races-feature-title">Prompt Support</h4>
                  <p className="races-feature-description">
                    Our team is here to help you with any questions or issues
                    during registration. We're available to make sure everything
                    goes smoothly.
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized Experience */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="races-feature-card">
                <div className="races-feature-icon">
                  <i className="fas fa-user-cog"></i>
                </div>
                <div className="races-feature-content">
                  <h4 className="races-feature-title">
                    Personalized Experience
                  </h4>
                  <p className="races-feature-description">
                    Tailor the registration process to fit your event's unique
                    needs. Customize forms and communications to create a
                    seamless and personal experience for participants.
                  </p>
                </div>
              </div>
            </div>

            {/* Promote your Event */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="races-feature-card">
                <div className="races-feature-icon">
                  <i className="fas fa-share-alt"></i>
                </div>
                <div className="races-feature-content">
                  <h4 className="races-feature-title">Promote your Event</h4>
                  <p className="races-feature-description">
                    Boost your event's visibility with our quick-sharing tools.
                    Easily share your event on social media and through other
                    digital mediums to attract more participants.
                  </p>
                </div>
              </div>
            </div>

            {/* Data-Driven Metrics */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="races-feature-card">
                <div className="races-feature-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="races-feature-content">
                  <h4 className="races-feature-title">Data-Driven Metrics</h4>
                  <p className="races-feature-description">
                    Use our platform to track registrations and other important
                    data. Get insights that help you understand your event's
                    performance and make improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
