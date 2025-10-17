import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RunmateLogo from "../../assets/image/Runmate-Logo.png";
import "./TopNav.css";

export default function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      // Close mobile menu if clicking outside (but not on hamburger button or mobile menu)
      if (
        showMobileMenu &&
        !event.target.closest(".mobile-menu-container") &&
        !event.target.closest(".mobile-hamburger-btn")
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileMenu]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  const getUserName = () => {
    // Try to get full name first
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstname && user?.lastname) {
      return `${user.firstname} ${user.lastname}`;
    } else if (user?.name) {
      return user.name;
    }

    // If no name available, use email username part
    const email = user?.email || user?.loginEmail;
    if (email) {
      return email.split("@")[0];
    }

    // If no email, try mobile
    const mobile = user?.mobile || user?.loginMobile;
    if (mobile) {
      return `User-${mobile.slice(-4)}`;
    }

    return "User";
  };

  const getUserEmail = () => {
    return user?.email || user?.loginEmail || user?.Email || "user@example.com";
  };

  const getUserDisplayInfo = () => {
    const email = getUserEmail();
    const mobile = user?.mobile || user?.loginMobile;

    // Debug log to see user data
    console.log("User data in TopNav:", user);

    // Show the credential used for login
    if (user?.loginEmail && user?.loginEmail !== email) {
      return user.loginEmail;
    } else if (user?.loginMobile) {
      return `+${user.phoneCode || "91"} ${user.loginMobile}`;
    } else if (email !== "user@example.com") {
      return email;
    } else if (mobile) {
      return `+${user.phoneCode || "91"} ${mobile}`;
    }

    return email;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or handle search logic
      console.log("Searching for:", searchQuery);
      // You can implement navigation to search results page here
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  return (
    <header className="topbar">
      <nav className="navbar">
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
            className="btn d-lg-none mobile-hamburger-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileMenu(!showMobileMenu);
            }}
            style={{
              background: "#da251c",
              borderRadius: 12,
              width: 44,
              border: "none",
              color: "white",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              {showMobileMenu ? "×" : "≡"}
            </span>
          </button>

          {/* Desktop Search Bar Section */}
          <div className="d-none d-lg-flex justify-content-center flex-grow-1">
            <div className="search-container d-flex align-items-center">
              <div className="location-icon-container">
                <i className="fas fa-map-marker-alt text-muted"></i>
              </div>
              <form
                onSubmit={handleSearch}
                className="search-input-container flex-grow-1"
              >
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Explore Events..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  style={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: "16px",
                    fontWeight: "400",
                    color: "#666",
                    padding: "8px 12px",
                  }}
                />
              </form>
              <button
                type="button"
                className="search-btn"
                onClick={handleSearch}
                style={{
                  backgroundColor: "#da251c",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#b91e14";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#da251c";
                  e.target.style.transform = "scale(1)";
                }}
              >
                <i className="fas fa-search" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Menu */}
          {showMobileMenu && (
            <>
              {/* Overlay */}
              <div
                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                style={{ zIndex: 1040 }}
                onClick={() => setShowMobileMenu(false)}
              ></div>

              {/* Sidebar */}
              <div
                className="position-fixed top-0 start-0 h-100 bg-white d-lg-none mobile-menu-container"
                style={{
                  width: "280px",
                  zIndex: 1050,
                  boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
                  animation: "slideInLeft 0.3s ease-out",
                }}
              >
                {/* Header with Close Button */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <img src={RunmateLogo} alt="Runmate" style={{ height: 32 }} />
                  <button
                    className="btn btn-sm"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "24px",
                      color: "#666",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-bottom">
                  <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
                    <i
                      className="fas fa-map-marker-alt me-2"
                      style={{ color: "#da251c" }}
                    ></i>
                    <form onSubmit={handleSearch} className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control border-0 bg-transparent"
                        placeholder="Search for events..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        style={{
                          outline: "none",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      />
                    </form>
                    <button
                      type="button"
                      className="btn btn-sm ms-1"
                      onClick={handleSearch}
                      style={{
                        backgroundColor: "#da251c",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        color: "white",
                      }}
                    >
                      <i
                        className="fas fa-search"
                        style={{ fontSize: "12px" }}
                      ></i>
                    </button>
                  </div>
                </div>

                {/* User Profile Section */}
                {isAuthenticated && (
                  <div className="p-3 border-bottom">
                    <div
                      className="d-flex align-items-center p-3 rounded"
                      style={{ backgroundColor: "#2c3e50", color: "white" }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#34495e",
                          border: "3px solid white",
                        }}
                      >
                        <i
                          className="fas fa-user"
                          style={{ fontSize: "20px" }}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <div
                          className="fw-bold mb-1"
                          style={{ fontSize: "16px" }}
                        >
                          {getUserName()}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>
                          {getUserDisplayInfo()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="flex-grow-1 overflow-auto">
                  {isAuthenticated ? (
                    <div className="p-2">
                      <NavLink
                        to="/profile"
                        className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i
                          className="fas fa-user me-3"
                          style={{ width: "20px", color: "#666" }}
                        ></i>
                        <span>My Profile</span>
                      </NavLink>

                      <NavLink
                        to="/events"
                        className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i
                          className="fas fa-calendar-alt me-3"
                          style={{ width: "20px", color: "#666" }}
                        ></i>
                        <span>My Events</span>
                      </NavLink>

                      <NavLink
                        to="/organiser"
                        className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i
                          className="fas fa-cog me-3"
                          style={{ width: "20px", color: "#666" }}
                        ></i>
                        <span>Organiser Profile</span>
                      </NavLink>

                      <NavLink
                        to="/favourites"
                        className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i
                          className="fas fa-heart me-3"
                          style={{ width: "20px", color: "#666" }}
                        ></i>
                        <span>My Favourites</span>
                      </NavLink>

                      <NavLink
                        to="/tracker"
                        className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <i
                          className="fas fa-chart-line me-3"
                          style={{ width: "20px", color: "#666" }}
                        ></i>
                        <span>Registration Tracker</span>
                      </NavLink>

                      <button
                        onClick={handleLogoutClick}
                        className="d-flex align-items-center w-100 p-3 text-start text-decoration-none text-dark border-0 bg-transparent"
                      >
                        <i
                          className="fas fa-sign-out-alt me-3"
                          style={{ width: "20px", color: "#dc3545" }}
                        ></i>
                        <span style={{ color: "#dc3545" }}>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3">
                      <NavLink
                        to="/login"
                        className="btn btn-outline-primary w-100 mb-2"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/signup"
                        className="btn w-100"
                        style={{
                          backgroundColor: "#da251c",
                          color: "white",
                          border: "none",
                        }}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Sign Up
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* desktop login/signup buttons or profile dropdown */}
          <div className="d-none d-lg-block">
            {isAuthenticated ? (
              <div className="position-relative" ref={dropdownRef}>
                <div
                  className="profile-dropdown-trigger d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #e9ecef",
                    cursor: "pointer",
                    marginRight: "25px",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div
                    className="profile-avatar"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#da251c",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {getInitials(
                      user?.firstName || user?.firstname,
                      user?.lastName || user?.lastname
                    )}
                  </div>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {getUserName()}
                  </span>
                  <i
                    className={`fas fa-chevron-${
                      showProfileDropdown ? "up" : "down"
                    }`}
                    style={{ fontSize: "12px", color: "#666" }}
                  ></i>
                </div>

                {showProfileDropdown && (
                  <div
                    className="profile-dropdown-menu position-absolute"
                    style={{
                      top: "100%",
                      right: "25px",
                      marginTop: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                      minWidth: "200px",
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="px-3 py-2 border-bottom"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <div className="fw-bold text-dark">{getUserName()}</div>
                      <div className="text-muted small">
                        {getUserDisplayInfo()}
                      </div>
                    </div>

                    <NavLink
                      to="/profile"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i className="fas fa-user" style={{ width: "16px" }}></i>
                      My Profile
                    </NavLink>

                    <NavLink
                      to="/dashboard"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i
                        className="fas fa-tachometer-alt"
                        style={{ width: "16px" }}
                      ></i>
                      Dashboard
                    </NavLink>

                    <NavLink
                      to="/bookings"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i
                        className="fas fa-calendar-check"
                        style={{ width: "16px" }}
                      ></i>
                      My Bookings
                    </NavLink>

                    <NavLink
                      to="/settings"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i className="fas fa-cog" style={{ width: "16px" }}></i>
                      Settings
                    </NavLink>

                    <div className="dropdown-divider"></div>

                    <button
                      onClick={handleLogoutClick}
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent w-100 text-start"
                      style={{ color: "#dc3545" }}
                    >
                      <i
                        className="fas fa-sign-out-alt"
                        style={{ width: "16px" }}
                      ></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          {/* Modal Overlay */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
            style={{ zIndex: 1060 }}
            onClick={cancelLogout}
          >
            {/* Modal Content */}
            <div
              className="bg-white rounded-3 p-4 mx-3"
              style={{
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-3">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#fee2e2",
                    borderRadius: "50%",
                  }}
                >
                  <i
                    className="fas fa-sign-out-alt"
                    style={{
                      fontSize: "24px",
                      color: "#dc2626",
                    }}
                  ></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#1f2937" }}>
                  Confirm Logout
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Are you sure you want to logout from your account?
                </p>
              </div>

              {/* Modal Actions */}
              <div className="d-flex gap-2 justify-content-center">
                <button
                  onClick={cancelLogout}
                  className="btn btn-outline-secondary px-4"
                  style={{
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="btn px-4"
                  style={{
                    backgroundColor: "#dc2626",
                    borderColor: "#dc2626",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
