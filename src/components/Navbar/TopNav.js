import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RunmateLogo from "../../assets/image/Runmate-Logo.png";
import { authAPI } from "../../services/authAPI";
import "./TopNav.css";

export default function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationOverlay, setShowLocationOverlay] = useState(false);
  const [popularCities, setPopularCities] = useState([]);
  const [searchCities, setSearchCities] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [showEventSuggestions, setShowEventSuggestions] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      // Close event suggestions if clicking outside
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowEventSuggestions(false);
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
    // Navigate to search events page with query
    if (searchQuery.trim()) {
      navigate(
        `/search-events?event_name=${encodeURIComponent(searchQuery.trim())}`
      );
      setShowEventSuggestions(false);
    } else {
      navigate("/search-events");
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      try {
        const response = await authAPI.getEvents({ event_name: value.trim() });
        if (response && response.data && response.data.EventData) {
          setEventSuggestions(response.data.EventData.slice(0, 5)); // Show max 5 suggestions
          setShowEventSuggestions(true);
        } else {
          setEventSuggestions([]);
          setShowEventSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching event suggestions:", error);
        setEventSuggestions([]);
        setShowEventSuggestions(false);
      }
    } else {
      setEventSuggestions([]);
      setShowEventSuggestions(false);
    }
  };

  const handleEventSuggestionClick = (eventName) => {
    setSearchQuery(eventName);
    setShowEventSuggestions(false);
    navigate(`/search-events?event_name=${encodeURIComponent(eventName)}`);
  };

  // Fetch Popular Cities when overlay opens
  const fetchPopularCities = async () => {
    try {
      setIsLoadingCities(true);
      const response = await authAPI.getPopularCities();
      if (response.data && response.data.CityArr) {
        setPopularCities(response.data.CityArr);
      }
    } catch (error) {
      console.error("Error fetching popular cities:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Fetch all cities with country code
  const fetchAllCities = async () => {
    try {
      const response = await authAPI.getLocationCity({
        country_code: "in",
      });
      if (response.data && response.data.AllCities) {
        setSearchCities(response.data.AllCities);
      }
    } catch (error) {
      console.error("Error fetching all cities:", error);
    }
  };

  // Fetch cities based on search query
  const fetchSearchCities = async (query) => {
    try {
      setIsLoadingCities(true);
      const response = await authAPI.getLocationCity({
        search_city: query,
        country_code: "in",
      });
      if (response.data && response.data.AllCities) {
        setSearchCities(response.data.AllCities);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Handle opening location overlay
  const handleOpenLocationOverlay = async () => {
    setShowLocationOverlay(true);
    setIsLoadingCities(true);
    try {
      // Fetch popular cities
      const popRes = await authAPI.getPopularCities();
      if (popRes.data && popRes.data.CityArr) {
        setPopularCities(popRes.data.CityArr);
      }
      // Fetch all cities with country code
      const locRes = await authAPI.getLocationCity({
        country_code: "in",
      });
      if (locRes.data && locRes.data.AllCities) {
        setSearchCities(locRes.data.AllCities);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Handle city search input change
  const handleCitySearchChange = (e) => {
    const query = e.target.value;
    setCitySearchQuery(query);

    if (query.trim().length > 0) {
      fetchSearchCities(query);
    } else {
      // Reset to all cities when search is cleared
      fetchAllCities();
    }
  };

  // Handle city search submit
  const handleCitySearch = (e) => {
    e.preventDefault();
    if (citySearchQuery.trim()) {
      fetchSearchCities(citySearchQuery);
    }
  };

  // Handle city card click
  const handleCityClick = (
    cityId,
    cityType,
    cityName,
    stateId = null,
    countryId = null
  ) => {
    setShowLocationOverlay(false);

    // Generate URL-friendly slug from city name
    const citySlug = cityName
      ? cityName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
      : "";

    // Store selected city in localStorage for homepage
    if (cityType === "city") {
      localStorage.setItem("selectedCityId", cityId);
      localStorage.setItem("selectedCityName", cityName || "");
      localStorage.setItem("selectedCitySlug", citySlug);
      if (stateId) localStorage.setItem("selectedStateId", stateId);
      if (countryId) localStorage.setItem("selectedCountryId", countryId);
      if (!stateId) localStorage.removeItem("selectedStateId");

      // Dispatch custom event for homepage to listen
      window.dispatchEvent(
        new CustomEvent("citySelected", {
          detail: {
            cityId,
            cityType: "city",
            cityName,
            citySlug,
            stateId,
            countryId,
          },
        })
      );
    } else {
      localStorage.setItem("selectedStateId", cityId);
      localStorage.setItem("selectedCityName", cityName || "");
      if (countryId) localStorage.setItem("selectedCountryId", countryId);
      localStorage.removeItem("selectedCityId");
      localStorage.removeItem("selectedCitySlug");

      window.dispatchEvent(
        new CustomEvent("citySelected", {
          detail: { cityId, cityType: "state", cityName, countryId },
        })
      );
    }

    // Navigate based on current page
    const currentPath = window.location.pathname;

    // If on home page or already on /in/* route, navigate to /in/city-slug
    if (currentPath === "/" || currentPath.startsWith("/in/")) {
      // Navigate if we have a city slug (regardless of cityType value)
      if (citySlug) {
        navigate(`/in/${citySlug}`);
      }
    } else {
      // If on other pages, navigate to search-events
      if (cityType === "city" || cityId) {
        navigate(`/search-events?city_id=${cityId}`);
      } else {
        navigate(`/search-events?state_id=${cityId}`);
      }
    }
  };

  // Handle detect my location using Geolocation API
  const handleDetectLocation = async () => {
    // Check if Geolocation API is supported
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Using IP-based location instead.");
      await handleIPBasedLocation();
      return;
    }

    // Request location permission and get coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Detected coordinates:", latitude, longitude);

        try {
          // Use reverse geocoding to get city name from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'iRaces-Website/1.0'
              }
            }
          );
          const data = await response.json();

          const detectedCityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "India";

          const detectedCitySlug = detectedCityName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          // Store detected city
          localStorage.setItem("detectedCity", detectedCityName);
          localStorage.setItem("detectedCitySlug", detectedCitySlug);

          // Clear previous selections
          localStorage.removeItem("selectedCityId");
          localStorage.removeItem("selectedCityName");
          localStorage.removeItem("selectedCitySlug");
          localStorage.removeItem("selectedStateId");
          localStorage.removeItem("selectedCountryId");

          // Close the overlay
          setShowLocationOverlay(false);

          // Dispatch event to update homepage
          window.dispatchEvent(
            new CustomEvent("locationDetected", {
              detail: {
                cityName: detectedCityName,
                citySlug: detectedCitySlug,
                latitude,
                longitude
              },
            })
          );

          // Navigate to detected location
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath.startsWith("/in/")) {
            navigate(`/in/${detectedCitySlug}`);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          // Fallback to IP-based location
          await handleIPBasedLocation();
        }
      },
      async (error) => {
        console.error("Geolocation error:", error);

        // Handle different error cases
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location permission denied. Using IP-based location instead.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable. Using IP-based location instead.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Using IP-based location instead.");
            break;
          default:
            alert("An unknown error occurred. Using IP-based location instead.");
        }

        // Fallback to IP-based location
        await handleIPBasedLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Fallback: IP-based location detection
  const handleIPBasedLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const detectedCityName = data.city || "India";
      const detectedCitySlug = detectedCityName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      // Store detected city
      localStorage.setItem("detectedCity", detectedCityName);
      localStorage.setItem("detectedCitySlug", detectedCitySlug);

      // Clear previous selections
      localStorage.removeItem("selectedCityId");
      localStorage.removeItem("selectedCityName");
      localStorage.removeItem("selectedCitySlug");
      localStorage.removeItem("selectedStateId");
      localStorage.removeItem("selectedCountryId");

      // Close the overlay
      setShowLocationOverlay(false);

      // Dispatch event to update homepage
      window.dispatchEvent(
        new CustomEvent("locationDetected", {
          detail: { cityName: detectedCityName, citySlug: detectedCitySlug },
        })
      );

      // Navigate to detected location
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath.startsWith("/in/")) {
        navigate(`/in/${detectedCitySlug}`);
      }
    } catch (error) {
      console.error("Error detecting location via IP:", error);
      // Fallback to default location
      window.dispatchEvent(
        new CustomEvent("locationDetected", {
          detail: { cityName: "India", citySlug: "india" },
        })
      );

      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath.startsWith("/in/")) {
        navigate("/in/india");
      }
    }
  };

  // Auto-detect location on component mount (for mobile devices)
  useEffect(() => {
    const hasDetectedLocation = localStorage.getItem("detectedCity");
    const hasSelectedLocation = localStorage.getItem("selectedCityId") || localStorage.getItem("selectedStateId");

    // Only auto-detect if no location has been set before
    if (!hasDetectedLocation && !hasSelectedLocation) {
      // Check if it's a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.geolocation) {
        // Auto-request location permission on mobile
        handleDetectLocation();
      }
    }
  }, []); // Run only once on mount

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
          <div
            className="d-flex align-items-center"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
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

          {/* Desktop Search Bar Section - Show on all pages */}
          <div className="d-none d-lg-flex justify-content-center flex-grow-1 align-items-center gap-3">
            <button
              className="location-icon-btn"
              onClick={handleOpenLocationOverlay}
              style={{
                background: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "18px",
                padding: "13px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#da251c",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              <i
                className="fas fa-map-marker-alt"
                style={{ fontSize: "18px" }}
              ></i>
              {/* <span>Detect my location</span> */}
            </button>
            <div
              className="search-container d-flex align-items-center"
              style={{ position: "relative" }}
            >
              <div
                style={{ flexGrow: 1, position: "relative" }}
                ref={searchInputRef}
              >
                <form
                  onSubmit={handleSearch}
                  className="search-input-container"
                >
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search Here"
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
                {/* Event Suggestions Dropdown for Desktop */}
                {showEventSuggestions && eventSuggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      marginTop: "5px",
                      maxHeight: "250px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {eventSuggestions.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventSuggestionClick(event.name)}
                        style={{
                          padding: "12px 15px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "14px",
                          color: "#333",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        <i
                          className="fas fa-calendar-alt me-2"
                          style={{ color: "#da251c" }}
                        ></i>
                        {event.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

          {/* Popular Cities Overlay */}
          {showLocationOverlay && (
            <div className="location-overlay-wrapper">
              <div className="location-overlay">
                <button
                  className="close-overlay-btn"
                  onClick={() => setShowLocationOverlay(false)}
                >
                  <i className="fas fa-times"></i>
                </button>

                <div className="overlay-top-section">
                  <form
                    onSubmit={handleCitySearch}
                    className="overlay-search-bar"
                  >
                    <input
                      type="text"
                      placeholder="Search Here"
                      className="city-search-input"
                      value={citySearchQuery}
                      onChange={handleCitySearchChange}
                    />
                    <button type="submit" className="search-btn-overlay">
                      <i className="fas fa-search"></i>
                    </button>
                  </form>
                  {/* <button className="detect-location-btn-top">
                    <i className="fas fa-crosshairs"></i>
                    <span>Detect my location</span>
                  </button> */}
                  <button
                    className="delete-location-btn-top"
                    onClick={handleDetectLocation}
                  >
                    <i className="fas fa-crosshairs"></i>
                    <span>Detect my location</span>
                  </button>
                </div>

                <div className="overlay-divider"></div>

                {isLoadingCities ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ fontSize: "32px", color: "#da251c" }}
                    ></i>
                  </div>
                ) : citySearchQuery.trim() && searchCities.length > 0 ? (
                  <>
                    <h2 className="overlay-title">Search Results</h2>
                    <div className="cities-grid">
                      {searchCities.map((city) => (
                        <div
                          key={city.id}
                          className="city-card"
                          onClick={() =>
                            handleCityClick(
                              city.id,
                              "city",
                              city.name,
                              city.state_id,
                              city.country_id
                            )
                          }
                        >
                          <div className="city-icon-wrapper">
                            <i
                              className="fas fa-city"
                              style={{ fontSize: "60px", color: "#da251c" }}
                            ></i>
                          </div>
                          <h4>{city.name}</h4>
                          <p>{city.state_name || "India"}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : citySearchQuery.trim() &&
                  searchCities.length === 0 &&
                  !isLoadingCities ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "18px", color: "#666" }}>
                      No cities found
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="overlay-title">Popular Cities</h2>
                    <div className="cities-grid">
                      {popularCities.map((city) => (
                        <div
                          key={city.id}
                          className="city-card"
                          onClick={() =>
                            handleCityClick(
                              city.id,
                              city.type,
                              city.city,
                              city.state_id,
                              city.country_id
                            )
                          }
                        >
                          <div className="city-icon-wrapper">
                            <img
                              src={city.image}
                              alt={city.city}
                              className="city-landmark-icon"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML =
                                  '<i class="fas fa-building" style="font-size: 60px; color: #da251c;"></i>';
                              }}
                            />
                          </div>
                          <h4>{city.city}</h4>
                          <p>{city.event_count} Events</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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
                  <div
                    className="d-flex align-items-center bg-light rounded-pill px-3 py-2"
                    ref={searchInputRef}
                    style={{ position: "relative" }}
                  >
                    <button
                      type="button"
                      aria-label="Choose location"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLocationOverlay();
                        setShowMobileMenu(false);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        marginRight: 8,
                        color: "#da251c",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className="fas fa-map-marker-alt"
                        style={{ color: "#da251c" }}
                      ></i>
                    </button>
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
                    {/* Event Suggestions Dropdown */}
                    {showEventSuggestions && eventSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          marginTop: "5px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 1000,
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {eventSuggestions.map((event) => (
                          <div
                            key={event.id}
                            onClick={() =>
                              handleEventSuggestionClick(event.name)
                            }
                            style={{
                              padding: "10px 15px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f0f0f0",
                              fontSize: "14px",
                              color: "#333",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                            }}
                          >
                            <i
                              className="fas fa-calendar-alt me-2"
                              style={{ color: "#da251c" }}
                            ></i>
                            {event.name}
                          </div>
                        ))}
                      </div>
                    )}
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
          <div className="d-none d-lg-flex align-items-center gap-3">
            {/* Design Your Event Button */}
            <button
              onClick={() => setShowEventTypeModal(true)}
              style={{
                backgroundColor: "#da251c",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "10px 24px",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
              <i className="fas fa-calendar-plus"></i>
              Design Your Event
            </button>

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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "10px",
                      overflow: "hidden",
                      border: "2px solid #e9ecef"
                    }}
                  >
                    {(() => {
                      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
                      if (userData?.profile_pic) {
                        const profilePicUrl = userData.profile_pic.startsWith('http')
                          ? userData.profile_pic
                          : `https://api.iraces.in/uploads/profile_images/${userData.profile_pic}`;
                        return (
                          <img
                            src={profilePicUrl}
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                            onError={(e) => {
                              e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            }}
                          />
                        );
                      } else {
                        return (
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        );
                      }
                    })()}
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
                    className={`fas fa-chevron-${showProfileDropdown ? "up" : "down"
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
                      to="/myevents"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i
                        className="fas fa-tachometer-alt"
                        style={{ width: "16px" }}
                      ></i>
                      My Events
                    </NavLink>

                    <NavLink
                      to="/organiser-profile"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i
                        className="fas fa-calendar-check"
                        style={{ width: "16px" }}
                      ></i>
                      Organiser Profile
                    </NavLink>

                    <NavLink
                      to="/favourites"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i className="fas fa-cog" style={{ width: "16px" }}></i>
                      My Favourites
                    </NavLink>

                    <NavLink
                      to="/registration-tracker"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                      style={{ textDecoration: "none", color: "#333" }}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <i className="fas fa-list-alt" style={{ width: "16px" }}></i>
                      Registration Tracker
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

      {/* Event Type Selection Modal */}
      {showEventTypeModal && (
        <>
          {/* Modal Overlay */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
            style={{ zIndex: 1060 }}
            onClick={() => setShowEventTypeModal(false)}
          >
            {/* Modal Content */}
            <div
              className="bg-white rounded-3 p-4 mx-3"
              style={{
                maxWidth: "960px",
                width: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowEventTypeModal(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#666",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                }}
              >
                <i className="fas fa-times"></i>
              </button>

              {/* Modal Header */}
              <div className="text-start mb-4">
                <h2 className="fw-bold mb-2" style={{ color: "#1f2937", fontSize: "28px" }}>
                  Select Event Type
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "16px" }}>
                  Pick the type of event you want to host
                </p>
              </div>

              {/* Event Type Cards */}
              <div className="row g-4">
                {/* On Ground Event */}
                <div className="col-md-4">
                  <div
                    onClick={() => {
                      setShowEventTypeModal(false);
                      navigate("/create-event");
                    }}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "30px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      height: "100%",
                      backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#da251c";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.1)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="mb-3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/3176/3176366.png"
                        alt="On Ground Event"
                        style={{ width: "120px", height: "120px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/120/da251c/FFFFFF?text=Event";
                        }}
                      />
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: "20px", color: "#1f2937" }}>
                      On Ground Event
                    </h4>
                    <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                      Host an in-person on ground event using our event management platform.
                    </p>
                  </div>
                </div>

                {/* Virtual Run */}
                <div className="col-md-4">
                  <div
                    onClick={() => {
                      setShowEventTypeModal(false);
                      navigate("/create-event");
                    }}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "30px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      height: "100%",
                      backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#da251c";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.1)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="mb-3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/2920/2920277.png"
                        alt="Virtual Run"
                        style={{ width: "120px", height: "120px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/120/da251c/FFFFFF?text=Virtual";
                        }}
                      />
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: "20px", color: "#1f2937" }}>
                      Virtual Run
                    </h4>
                    <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                      Host virtual challenges like walking, running, cycling etc
                    </p>
                  </div>
                </div>

                {/* Hybrid Event */}
                <div className="col-md-4">
                  <div
                    onClick={() => {
                      setShowEventTypeModal(false);
                      navigate("/create-event");
                    }}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "30px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      height: "100%",
                      backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#da251c";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.1)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="mb-3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/3588/3588435.png"
                        alt="Hybrid Event"
                        style={{ width: "120px", height: "120px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/120/da251c/FFFFFF?text=Hybrid";
                        }}
                      />
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: "20px", color: "#1f2937" }}>
                      Hybrid Event
                    </h4>
                    <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                      Seamlessly blend in-person and virtual experiences using our event management platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
