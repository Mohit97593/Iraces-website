import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "../components/Navbar/TopNav";
import "./SearchEvents.css";
import { authAPI } from "../services/authAPI";

export default function SearchEvents() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Set searchQuery from event_name param on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventNameParam = params.get("event_name");
    if (eventNameParam) {
      setSearchQuery(eventNameParam);
    }
  }, [location.search]);
  const [selectedCity, setSelectedCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [regStartDate, setRegStartDate] = useState("");
  const [regEndDate, setRegEndDate] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // New state for date-based filtering

  // States for API data
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 6,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const cityInputRef = useRef(null);
  const hasAppliedUrlParams = useRef(false);

  // Like state for each event
  const [likedEvents, setLikedEvents] = useState({});

  // Helper function to get date range based on filter
  const getDateRange = (filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = null;
    let endDate = null;

    switch (filter) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "tomorrow":
        startDate = new Date(today);
        startDate.setDate(today.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        // Get start of week (Sunday)
        startDate = new Date(today);
        const dayOfWeek = today.getDay();
        startDate.setDate(today.getDate() - dayOfWeek);
        // Get end of week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_quarter":
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return { startDate: null, endDate: null };
    }

    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  // Fetch Events with filters
  const fetchEvents = async (page = 1, append = false) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 6, // Show 6 events per page
      };

      if (searchQuery) params.event_name = searchQuery;
      if (selectedCity) params.city = selectedCity;
      if (selectedCategoryId) params.category_id = selectedCategoryId;

      // Apply date filter if selected
      if (dateFilter) {
        const { startDate, endDate } = getDateRange(dateFilter);
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      } else {
        // Use manual date filters if no preset filter is selected
        if (regStartDate) params.start_date = regStartDate;
        if (regEndDate) params.end_date = regEndDate;
      }

      console.log("Fetching events with params:", params);
      const response = await authAPI.getEvents(params);
      console.log("Events API response:", response);
      if (response && response.data && response.data.EventData) {
        if (append) {
          setEvents((prevEvents) => [
            ...prevEvents,
            ...response.data.EventData,
          ]);
        } else {
          setEvents(response.data.EventData);
        }
        if (response.pagination) {
          setPagination({
            ...response.pagination,
            per_page: 6, // Always show 6 per page in UI
          });
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      if (!append) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Cities
  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const response = await authAPI.getCities({ search_flag: 1 });
      if (response && response.data && response.data.AllCities) {
        setCities(response.data.AllCities);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch Event Types
  const fetchEventTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await authAPI.getTypes();

      // Try different response structures
      let typesData = [];

      if (response?.data?.AllEventTypes) {
        typesData = response.data.AllEventTypes;
      } else if (response?.AllEventTypes) {
        typesData = response.AllEventTypes;
      } else if (response?.data && Array.isArray(response.data)) {
        typesData = response.data;
      } else if (Array.isArray(response)) {
        typesData = response;
      } else if (response?.types) {
        typesData = response.types;
      }

      // Log first type to check its structure
      if (typesData.length > 0) {
        console.log("Type object structure:", typesData[0]);
      }

      setEventTypes(typesData);
    } catch (error) {
      console.error("Error fetching event types:", error);
      setEventTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCities();
    fetchEventTypes();
  }, []);

  // Apply filter from URL query params (when coming from Choose By Distance or Quick Selection)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const distanceParam = params.get("distance");
    const dateFilterParam = params.get("dateFilter");

    // Handle distance filter
    if (
      distanceParam &&
      eventTypes.length > 0 &&
      !hasAppliedUrlParams.current
    ) {
      // Find the matching event type by name
      const matchingType = eventTypes.find(
        (type) => type.name.toLowerCase() === distanceParam.toLowerCase()
      );

      if (matchingType) {
        setSelectedCategoryId(matchingType.id.toString());
        hasAppliedUrlParams.current = true;
      }
    }

    // Handle date filter (This Week, This Month, This Quarter)
    if (dateFilterParam && !hasAppliedUrlParams.current) {
      setDateFilter(dateFilterParam);
      hasAppliedUrlParams.current = true;
    }
  }, [location.search, eventTypes]);

  // Fetch events when filters change or on initial load
  useEffect(() => {
    // Add a small delay to ensure state has updated
    const timer = setTimeout(() => {
      fetchEvents();
    }, 100);

    return () => clearTimeout(timer);
  }, [
    selectedCategoryId,
    searchQuery,
    selectedCity,
    regStartDate,
    regEndDate,
    dateFilter,
  ]);

  // Click outside to close city suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // When events change, initialize like state based on is_follow
  useEffect(() => {
    if (events && events.length > 0) {
      const initialLiked = {};
      events.forEach((ev) => {
        // If event has is_follow property, use it; otherwise default to false
        initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
      });
      setLikedEvents(initialLiked);
    }
  }, [events]);

  // Apply filters
  const handleApplyFilters = () => {
    fetchEvents(1);
  };

  // Handle city input change
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCityInput(value);

    if (value.trim() === "") {
      setSelectedCity("");
      setFilteredCities([]);
      setShowCitySuggestions(false);
    } else {
      // Filter cities based on input
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCitySuggestions(true);
    }
  };

  // Handle city selection from suggestions
  const handleCitySelect = (city) => {
    setCityInput(city.name);
    setSelectedCity(city.id);
    setShowCitySuggestions(false);
  };

  // Toggle like for an event with API call
  const handleToggleLike = async (eventId) => {
    const currentLikeStatus = likedEvents[eventId];
    const newLikeStatus = !currentLikeStatus;

    // Optimistically update UI
    setLikedEvents((prev) => ({ ...prev, [eventId]: newLikeStatus }));

    try {
      // Call follow/unfollow API
      // is_follow: 0 = follow (like), 1 = unfollow (unlike)
      const isFollow = newLikeStatus ? 0 : 1;
      await authAPI.followEvent(eventId, isFollow);

      // Refresh events to get updated is_follow status
      fetchEvents(pagination.current_page);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setLikedEvents((prev) => ({ ...prev, [eventId]: currentLikeStatus }));
      alert("Failed to update favourite. Please try again.");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setCityInput("");
    setFilteredCities([]);
    setShowCitySuggestions(false);
    setSelectedCategoryId("");
    setRegStartDate("");
    setRegEndDate("");
    setDateFilter("");
    fetchEvents(1);
  };

  // Format date for display
  const formatEventDate = (timestamp) => {
    if (!timestamp) return { month: "", day: "" };
    const date = new Date(timestamp * 1000);
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),
    };
  };

  // Format registration date
  const formatRegisterBy = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Check if registration is closed
  const isRegistrationClosed = (endTime) => {
    if (!endTime) return false;
    return endTime * 1000 < Date.now();
  };

  return (
    <div className="search-events-page">
      <TopNav />

      {/* Hero Section with Blue Background */}
      <section className="search-hero">
        <div className="search-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="search-hero-title">Explore Events</h1>
              <nav className="search-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Search Event</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="search-events-main container-fluid">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 col-md-4 col-12 mb-4">
            <div className="filters-card">
              <div className="filters-header">
                <i className="fas fa-sliders-h"></i>
                <h4 className="filters-title">Filters</h4>
              </div>

              <form className="filters-form">
                {/* Event Name Filter */}
                <div className="form-group mb-3">
                  <label>By Event Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by event name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* City Filter */}
                <div
                  className="form-group mb-3 position-relative"
                  ref={cityInputRef}
                >
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city name"
                    value={cityInput}
                    onChange={handleCityInputChange}
                    onFocus={() => {
                      if (filteredCities.length > 0) {
                        setShowCitySuggestions(true);
                      }
                    }}
                  />
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <div className="city-suggestions">
                      {filteredCities.map((city) => (
                        <div
                          key={city.id}
                          className="city-suggestion-item"
                          onClick={() => handleCitySelect(city)}
                        >
                          <i className="fas fa-map-marker-alt me-2"></i>
                          {city.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Types Filter */}
                <div className="form-group mb-3">
                  <label>By Type</label>
                  <select
                    className="form-control"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {loadingTypes ? (
                      <option disabled>Loading types...</option>
                    ) : eventTypes && eventTypes.length > 0 ? (
                      eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No types available</option>
                    )}
                  </select>
                </div>

                {/* Registration Start Date */}
                <div className="form-group mb-3">
                  <label>Registration Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    placeholder="dd-mm-yyyy"
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                  />
                </div>

                {/* Registration Closing Date */}
                <div className="form-group mb-3">
                  <label>Registration Closing on</label>
                  <input
                    type="date"
                    className="form-control"
                    placeholder="dd-mm-yyyy"
                    value={regEndDate}
                    onChange={(e) => setRegEndDate(e.target.value)}
                  />
                </div>

                {/* Clear Button */}
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 mt-2"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </form>
            </div>
          </div>

          {/* Events Grid */}
          <div className="col-lg-9 col-md-8 col-12">
            {/* Results Header */}
            <div className="results-header d-flex justify-content-between align-items-center mb-3">
              <div className="results-count">
                <i className="fas fa-home"></i>
                <span className="ms-2">
                  Showing {events.length > 0 ? 1 : 0}-{events.length} of{" "}
                  {pagination.total} results
                </span>
              </div>
              <div className="sort-dropdown">
                <select
                  className="form-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="">Sort by latest</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="this_quarter">This Quarter</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              // No Events Found
              <div className="text-center py-5">
                <i
                  className="fas fa-calendar-times"
                  style={{ fontSize: "4rem", color: "#ccc" }}
                ></i>
                <h4 className="mt-3">No Events Found</h4>
                <p className="text-muted">
                  Try adjusting your filters to find more events
                </p>
              </div>
            ) : (
              // Event Cards
              <div className="row g-4">
                {events.map((event) => {
                  const eventDate = formatEventDate(event.start_time);
                  const registerBy = formatRegisterBy(
                    event.registration_end_time
                  );
                  const registrationClosed = isRegistrationClosed(
                    event.registration_end_time
                  );

                  return (
                    <div className="col-lg-4 col-md-6 col-12" key={event.id}>
                      <div className="event-card1">
                        {/* Event Image */}
                        <div className="event-card-img-wrapper">
                          <img
                            src={event.banner_image || event.image}
                            alt={event.name}
                            className="event-card-img"
                          />
                          <span className="event-card-badge navi-mumbai-badge">
                            <i
                              className="fas fa-map-marker-alt"
                              style={{ marginRight: 4 }}
                            ></i>
                            {event.city_name || "City"}
                          </span>
                          <button
                            className={`search-like-btn${
                              likedEvents[event.id] ? " liked" : ""
                            }`}
                            onClick={() => handleToggleLike(event.id)}
                            aria-label="Like"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 17.5C9.7 17.5 9.4 17.4 9.2 17.2L3.1 11.5C1.2 9.7 1.2 6.7 3.1 4.9C4.1 3.9 5.4 3.4 6.7 3.4C7.8 3.4 8.9 3.8 9.8 4.6C10.7 3.8 11.8 3.4 12.9 3.4C14.2 3.4 15.5 3.9 16.5 4.9C18.4 6.7 18.4 9.7 16.5 11.5L10.8 17.2C10.6 17.4 10.3 17.5 10 17.5Z"
                                fill={
                                  likedEvents[event.id] ? "#da251c" : "#bbb"
                                }
                                stroke="#da251c"
                                strokeWidth="1.2"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Event Body */}
                        <div className="event-card-body">
                          <div className="event-header">
                            <div className="event-date-wrapper">
                              <div className="event-month">
                                {eventDate.month}
                              </div>
                              <div className="event-day">{eventDate.day}</div>
                            </div>
                            <div className="event-title-wrapper">
                              <h3 className="event-title">{event.name}</h3>
                            </div>
                          </div>

                          <hr className="event-divider" />

                          <div className="event-register-info">
                            Register By :{" "}
                            <span className="register-date">{registerBy}</span>
                          </div>

                          <div className="event-footer d-flex align-items-center justify-content-between">
                            {registrationClosed ? (
                              <span className="registration-status">
                                <i
                                  className="fas fa-ban"
                                  style={{ marginRight: 6 }}
                                ></i>
                                Registration Closed
                              </span>
                            ) : (
                              <span
                                className="registration-status"
                                style={{ color: "green" }}
                              >
                                <i
                                  className="fas fa-check-circle"
                                  style={{ marginRight: 6 }}
                                ></i>
                                Registration Open
                              </span>
                            )}
                            <button
                              className="btn btn-view"
                              onClick={() => navigate(`/event/${event.id}`)}
                            >
                              {registrationClosed ? "View" : "Register"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More / Pagination */}
            {!loading &&
              events.length > 0 &&
              pagination.current_page < pagination.last_page && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-load-more"
                    onClick={() =>
                      fetchEvents(pagination.current_page + 1, true)
                    }
                  >
                    Load more
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
