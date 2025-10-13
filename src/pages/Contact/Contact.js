import React, { useState } from "react";
import "./Contact.css";
import TopNav from "../../components/Navbar/TopNav";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <TopNav />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Contact Us</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Contact Us</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="contact-content">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="contact-company-name">
                YouTooCanRun Sports Management Pvt Ltd.
              </h2>
            </div>
          </div>

          <div className="row">
            {/* Contact Information Cards */}
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="row">
                {/* Email Card */}
                <div className="col-12 mb-4">
                  <div className="contact-info-card">
                    <div className="contact-info-icon email-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-info-content">
                      <h4>Email</h4>
                      <p>support@youtoocanrun.com</p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="col-12 mb-4">
                  <div className="contact-info-card">
                    <div className="contact-info-icon phone-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-info-content">
                      <h4>Phone</h4>
                      <p>+91 9920142195</p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="col-12 mb-4">
                  <div className="contact-info-card">
                    <div className="contact-info-icon address-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-info-content">
                      <h4>Address</h4>
                      <p>
                        3A, Valmiki, Next to Pharmacy College, Behind Kalina
                        Municipal School, Sunder Nagar, Kalina, Mumbai 400098
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="contact-form-container">
                <h3 className="form-title">Let's chat, Reach out to us</h3>
                <p className="form-subtitle">
                  Need help or have feedback? Message us and we'll respond
                  within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name *"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name *"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email ID *"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        placeholder="Contact Number *"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message *"
                      className="form-control message-textarea"
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8745741994744!2d72.86614897592394!3d19.074297151966056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8d4e4c4b7b3%3A0x1e3f4e5e6e7e8e9e!2sKalina%2C%20Santacruz%20East%2C%20Mumbai%2C%20Maharashtra%20400098!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
