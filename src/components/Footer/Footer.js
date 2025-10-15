import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import runmateLogo from "../../assets/image/Runmate-Logo.png";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section - Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={runmateLogo}
                alt="Runmate"
                className="footer-logo-img"
              />
            </div>
            <p className="footer-description">
              More than your regular running platform; We are the biggest and
              complete running events back-office service provider.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link linkedin">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link reddit">
                <i className="fab fa-reddit-alien"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/disclaimer">Disclaimer</Link>
              </li>
              <li>
                <Link to="/terms-conditions">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-policy">Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/why-choose-races">How It Works?</Link>
              </li>
            </ul>
          </div>

          {/* Products & Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Products & Services</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Races</a>
              </li>
              <li>
                <a href="#">Race Management</a>
              </li>
              <li>
                <a href="#">Treasured moments</a>
              </li>
              <li>
                <a href="#">Racemart</a>
              </li>
              <li>
                <a href="#">Corporate Wellness</a>
              </li>
            </ul>
          </div>

          {/* Additional Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Additional Services</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Celebration Lounge</a>
              </li>
              <li>
                <a href="#">RASE</a>
              </li>
              <li>
                <a href="#">Athlete Id Card</a>
              </li>
              <li>
                <a href="#">Pace Calculator</a>
              </li>
              <li>
                <a href="#">Pacing Team & Kits</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              Copyright © 2024 <strong>YooTooCanRun</strong>. All Rights
              Reserved. Design By{" "}
              <strong>StandardWings Technologies Pvt. Ltd.</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
