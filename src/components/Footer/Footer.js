import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import runmateLogo from "../../assets/image/Runmate-Logo.png";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              <a
                href="https://www.linkedin.com/company/youtoocanrun/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link linkedin"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="https://www.facebook.com/youtoocanrunsmpl"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/youtoocanrun/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://x.com/youtoocanrun"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.youtube.com/user/YouTooCanRun"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link youtube"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/disclaimer" onClick={scrollToTop}>Disclaimer</Link>
              </li>
              <li>
                <Link to="/terms-conditions" onClick={scrollToTop}>Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy" onClick={scrollToTop}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-policy" onClick={scrollToTop}>Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop}>Contact Us</Link>
              </li>
              <li>
                <Link to="/why-choose-races" onClick={scrollToTop}>How It Works?</Link>
              </li>
            </ul>
          </div>

          {/* Products & Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Products & Services</h3>
            <ul className="footer-links">
              <li>
                <a href="https://youtoocanrun.com/races" target="_blank" >Races</a>
              </li>
              <li>
                <a href="https://youtoocanrun.com/race-management" target="_blank">Race Management</a>
              </li>
              <li>
                <a href="https://youtoocanrun.com/treasured-moments" target="_blank">Treasured moments</a>
              </li>
              <li>
                <a href=" https://racemart.in/" target="_blank">Racemart</a>
              </li>
              <li>
                <a href=" https://youtoocanrun.com/race-kit-management" target="_blank">Bib Expo Management</a>
              </li>
            </ul>
          </div>

          {/* Additional Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Additional Services</h3>
            <ul className="footer-links">
              <li>
                <a href="https://youtoocanrun.com/activeaura" target="_blank">Active Aura</a>
              </li>
              <li>
                <a href="https://youtoocanrun.com/rase" target="_blank">RASE</a>
              </li>
              <li>
                <a href="#">Athlete Id Card</a>
              </li>
              <li>
                <a href=" https://youtoocanrun.com/pace-calculator" target="_blank">Pace Calculator</a>
              </li>
              <li>
                <a href="https://youtoocanrun.com/trump" target="_blank">TRUMP </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              Copyright © 2024 <strong>YouTooCanRun</strong>. All Rights Reserved.
              {/* Reserved. Design By <strong>Testriq QA LAB LLP.</strong> */}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
