import React from "react";
import "../Contact/Contact.css"; // Using the same CSS as Contact page
import "./CancellationPolicy.css"; // Additional cancellation policy-specific styles
import TopNav from "../../components/Navbar/TopNav";

export default function CancellationPolicy() {
  return (
    <div className="contact-page">
      <TopNav />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Cancellation Policy</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Cancellation Policy</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy Content */}
      <section className="contact-content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="cancellation-content">
                <h2 className="cancellation-heading">CANCELLATION POLICY</h2>

                <div className="cancellation-text">
                  <p>
                    Cancellations received after the stated deadline will not be
                    eligible for a refund.
                  </p>

                  <p>Cancellations will be accepted via Email only.</p>

                  <p>
                    All refund requests must be made by the attendee or credit
                    card holder.
                  </p>

                  <p>
                    Your refund will be processed within 7 working days from the
                    date of initiation. If you have any further questions or
                    concerns, please feel free to contact our customer support.
                  </p>

                  <p>
                    Refund requests must include the name of the attendee and/or
                    transaction number.
                  </p>

                  <p>
                    Refunds will be credited back to the source account used for
                    payment and will follow the norms as per the refund policy
                    of the Event Organizer.
                  </p>

                  <p>
                    Cancellation of the participant participating in an event is
                    subject to the event terms and conditions.
                  </p>

                  <p>
                    Refunds will not be made if the event is canceled/ postponed
                    due to 'force majeure' reasons and will be at the sole
                    discretion of the Event Organiser.
                  </p>

                  <p>
                    RACES - a wholly-owned division of YouTooCanRun is only a
                    collection agency and is in no way responsible for the
                    satisfactory conduct of the event. Similarly, except where
                    explicitly stated, RACES - a wholly-owned division of
                    YouTooCanRun is not responsible for the goods or services
                    traded/delivered through its website. We are thus not
                    responsible for cancellation/refund on behalf of third
                    parties.
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
