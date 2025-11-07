import React, { useState, useEffect, useRef } from "react";
import TopNav from "../components/Navbar/TopNav";
import "./SearchEvents.css";
import { authAPI } from "../services/authAPI";

export default function SearchEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedDistance, setSelectedDistance] = useState("");
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
      // --- TOGGLE FILTER PARAM ---
      // Use only one of these at a time:
      // 1. Use type_id (uncomment below to test)
      if (selectedDistance) {
        params.type_id = eventTypes.find(
          (t) => t.name === selectedDistance
        )?.id;
      }
      // 2. Use distance (uncomment below to test)
      // if (selectedDistance) {
      //   params.distance = selectedDistance;
      // }

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
    fetchEvents();
    fetchCities();
    fetchEventTypes();
  }, []);

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

  // Handle filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchQuery,
    selectedCity,
    selectedDistance,
    regStartDate,
    regEndDate,
    dateFilter,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setCityInput("");
    setFilteredCities([]);
    setShowCitySuggestions(false);
    setSelectedDistance("");
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

                {/* Distance Filter */}
                <div className="form-group mb-3">
                  <label>By Distance</label>
                  <select
                    className="form-control"
                    value={selectedDistance}
                    onChange={(e) => {
                      console.log("Selected type value:", e.target.value);
                      setSelectedDistance(e.target.value);
                    }}
                  >
                    <option value="">Select Type</option>
                    {loadingTypes ? (
                      <option disabled>Loading types...</option>
                    ) : eventTypes && eventTypes.length > 0 ? (
                      eventTypes.map((type, index) => {
                        // Use name as value since backend expects distance name
                        const typeValue =
                          type.name || type.title || type.type_name || type.id;
                        const typeLabel =
                          type.name ||
                          type.title ||
                          type.type_name ||
                          `Type ${index + 1}`;
                        return (
                          <option key={type.id || index} value={typeValue}>
                            {typeLabel}
                          </option>
                        );
                      })
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
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x250/1565c0/ffffff?text=Event+Image";
                            }}
                          />
                          <span className="event-card-badge navi-mumbai-badge">
                            <i
                              className="fas fa-map-marker-alt"
                              style={{ marginRight: 4 }}
                            ></i>
                            {event.city_name || "City"}
                          </span>
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
                            <button className="btn btn-view">View</button>
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
