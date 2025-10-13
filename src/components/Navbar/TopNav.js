import React from "react";
import { NavLink } from "react-router-dom";
import RunmateLogo from "../../assets/image/Runmate-Logo.png";
import "./TopNav.css";

export default function TopNav() {
  return (
    <header className="topbar">
      <nav className="navbar navbar-expand-lg">
        <div
          className="container d-flex align-items-center justify-content-between"
          style={{
            maxWidth: 1490,
            padding: "17px 12px",
            borderRadius: "20px",
            backgroundColor: "rgb(233 233 236)",
          }}
        >
          {/* logo */}
          <div className="d-flex align-items-center">
            <img
              src={RunmateLogo}
              alt="Runmate"
              style={{ height: 36, paddingLeft: "25px" }}
            />
          </div>

          {/* mobile toggler - visible only on small screens */}
          <button
            className="navbar-toggler btn d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{
              background: "#da251c",
              borderRadius: 12,
              width: 44,
              border: "none",
              color: "white",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>≡</span>
          </button>

          {/* collapsed nav (keeps desktop UI identical) */}
          <div
            className="collapse navbar-collapse justify-content-center"
            id="mainNavbar"
            style={{ fontSize: "20px", fontWeight: "700", gap: "20px" }}
          >
            <ul
              className="navbar-nav mb-2 mb-lg-0 align-items-lg-center"
              style={{ gap: "24px" }}
            >
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/hero">
                  Programs
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <span
                  className="nav-link dropdown-toggle"
                  role="button"
                  aria-expanded="false"
                >
                  Page
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink className="dropdown-item" to="/other">
                      About
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/other">
                      Services
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/other">
                      Contact
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* login/signup buttons inside collapse for mobile */}
            <div className="d-lg-none mt-3 d-flex gap-2">
              <NavLink
                to="/login"
                className="btn btn-outline-primary flex-fill"
              >
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-success flex-fill">
                Sign Up
              </NavLink>
            </div>
          </div>

          {/* desktop login/signup buttons (visible on large screens) */}
          <div className="d-none d-lg-block">
            <div className="d-flex gap-2">
              <NavLink
                to="/login"
                className="btn login-btn"
                style={{
                  backgroundColor: "transparent",
                  color: "black",
                  fontWeight: "600",
                  fontSize: "16px",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  border: "2px solid #333",
                  marginRight: "8px",
                }}
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="btn signup-btn"
                style={{
                  backgroundColor: "#da251c",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  marginRight: "25px",
                  border: "none",
                }}
              >
                Sign Up
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
