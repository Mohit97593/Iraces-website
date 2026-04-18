import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import runmateLogo from "../../assets/image/Runmate-Logo.png";
import { authAPI } from "../../services/authAPI";

export default function Footer() {
  const [footerButtons, setFooterButtons] = useState([]);

  useEffect(() => {
    const fetchFooterButtons = async () => {
      try {
        const response = await authAPI.getFooterButtons();
        if (response && response.data && response.data.footer_buttons) {
          // Sort or filter if needed, but here we take them as they are
          const activeButtons = response.data.footer_buttons
            .filter(btn => btn.is_active === 1)
            .sort((a, b) => a.index - b.index);
          setFooterButtons(activeButtons);
        }
      } catch (error) {
        console.error("Error fetching footer buttons:", error);
      }
    };

    fetchFooterButtons();
  }, []);

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

          {/* Column 1 - Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              {footerButtons.slice(0, 5).map((btn) => (
                <li key={btn.id}>
                  {btn.type === "link" ? (
                    <a 
                      href={btn.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={scrollToTop}
                    >
                      {btn.name}
                    </a>
                  ) : (
                    <Link to={`/p/${btn.id}`} onClick={scrollToTop}>
                      {btn.name}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link to="/contact" onClick={scrollToTop}>Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Products & Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Products & Services</h3>
            <ul className="footer-links">
              {footerButtons.slice(5, 10).map((btn) => (
                <li key={btn.id}>
                  {btn.type === "link" ? (
                    <a 
                      href={btn.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={scrollToTop}
                    >
                      {btn.name}
                    </a>
                  ) : (
                    <Link to={`/p/${btn.id}`} onClick={scrollToTop}>
                      {btn.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Additional Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Additional Services</h3>
            <ul className="footer-links">
              {footerButtons.slice(10, 15).map((btn) => (
                <li key={btn.id}>
                  {btn.type === "link" ? (
                    <a 
                      href={btn.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={scrollToTop}
                    >
                      {btn.name}
                    </a>
                  ) : (
                    <Link to={`/p/${btn.id}`} onClick={scrollToTop}>
                      {btn.name}
                    </Link>
                  )}
                </li>
              ))}
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
