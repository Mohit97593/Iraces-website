import React from "react";
import "../Contact/Contact.css"; // Using the same CSS as Contact page
import "./Disclaimer.css"; // Additional disclaimer-specific styles
import TopNav from "../../components/Navbar/TopNav";

export default function Disclaimer() {
  return (
    <div className="contact-page">
      <TopNav />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Disclaimer</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Disclaimer</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Content */}
      <section className="contact-content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="disclaimer-content">
                <h2 className="disclaimer-heading">
                  YOU EXPRESSLY UNDERSTAND AND AGREE THAT:
                </h2>

                <div className="disclaimer-text">
                  <p>
                    Your use of the service is at your sole risk. The service is
                    provided on an "as is" and "as available" basis. RACES - a
                    wholly-owned Division of YouTooCanRun Sports Management Pvt
                    Ltd and its subsidiaries, affiliates, officers, employees,
                    agents, partners and licensors expressly disclaim all
                    warranties of any kind, whether express or implied,
                    including, but not limited to the implied warranties of
                    merchantability, fitness for a particular purpose and
                    non-infringement.
                  </p>

                  <p>
                    RACES - a wholly-owned division of YouTooCanRun Sports
                    Management Pvt Ltd and its subsidiaries, affiliates,
                    officers, employees, agents, partners and licensors make no
                    warranty that (a) The service will meet your requirements;
                    (b) The service will be uninterrupted, timely, secure or
                    error-free; (c) The results that may be obtained from the
                    use of the service will be accurate or reliable; (d) The
                    quality of any products, services, information or other
                    material purchased or obtained by you through the service
                    will meet your expectations; and (e) Any errors in the
                    software will be corrected.
                  </p>

                  <p>
                    Any material downloaded or otherwise obtained through the
                    use of the service is accessed at your own discretion and
                    risk, and you will be solely responsible for any damage to
                    your computer system or loss of data that results from the
                    download of any such material.
                  </p>

                  <p>
                    No advice or information, whether oral or written, obtained
                    by you from RACES - a wholly-owned division of YouTooCanRun
                    Sports Management Pvt Ltd or through or from the service
                    shall create any warranty not expressly stated in the Terms
                    & Conditions.
                  </p>

                  <h3 className="disclaimer-subheading">
                    Without the legalese:
                  </h3>

                  <p>What we mean by the above in simple language is this</p>

                  <p>
                    - We will take every effort to provide you with the best
                    services and see that you are getting a fair deal when
                    dealing with us.
                  </p>

                  <p>
                    - While doing so, there may be some factors within our
                    control and many factors that may not be within our control.
                    We will ensure that we make a sincere effort to correct
                    everything within our control.
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
