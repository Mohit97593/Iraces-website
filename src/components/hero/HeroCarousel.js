// Use base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toggleModal } from "../../slice/hero/heroSlice";
import { authAPI } from "../../services/authAPI";
import "./Hero.css";
// Font Awesome is provided via CDN in public/index.html; remove local import to avoid build errors
import Avatar1 from "../../assets/image/avatar1.jpg";
import Avatar2 from "../../assets/image/avatar2.jpg";
import Avatar3 from "../../assets/image/avatar3.jpg";
import Avatar4 from "../../assets/image/avatar4.jpg";
import logo from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";
import EventsPanel from "../EventsPanel/EventsPanel";
import TrainingPanel from "../TrainingPanel/TrainingPanel";
import WhyRunmatePanel from "../RunmatePanel/WhyRunmatePanel";
import RunUnintentionallyPanel from "../UnintentionallyPanel/RunUnintentionallyPanel";
import CoachesPanel from "../CoachesPanel/CoachesPanel";
import InstagramGrid from "../InstagramGrid/InstagramGrid";
import TestimonialsCarousel from "../TestimonialsCarousel/TestimonialsCarousel";
import BlogPanel from "../BlogPanel/BlogPanel";
import FAQPanel from "../FAQPanel/FAQPanel";
import Footer from "../Footer/Footer";
import YouCanRunBanner from "../YouCanRun";

export default function HeroCarousel() {
  // Local state for API banners
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { citySlug } = useParams(); // Get city from URL params

  // Animation state
  const [animate, setAnimate] = useState(false);
  const numbersRef = useRef(null);

  // Location-based events state
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [cityName, setCityName] = useState("Bengaluru");
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasLocalEvents, setHasLocalEvents] = useState(true); // Track if selected city has events

  // Like state for events
  const [likedEvents, setLikedEvents] = useState({});

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
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setLikedEvents((prev) => ({ ...prev, [eventId]: currentLikeStatus }));
      alert("Failed to update favourite. Please try again.");
    }
  };

  // Fetch banners from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          setSlides(data.data);
        }
      });
  }, []);

  // Fetch city data from city name (returns id, state_id, country_id)
  const fetchCityIdByName = async (cityName) => {
    try {
      const response = await authAPI.getLocationCity({
        search_city: cityName,
        country_code: "in",
      });
      if (
        response.data &&
        response.data.AllCities &&
        response.data.AllCities.length > 0
      ) {
        const city = response.data.AllCities[0];
        return {
          id: city.id,
          state_id: city.state_id,
          country_id: city.country_id,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching city ID:", error);
      return null;
    }
  };

  // Fetch location-based events data using authAPI
  const fetchLocationEvents = async (
    cityId = null,
    stateId = null,
    cityNameFromSlug = null
  ) => {
    try {
      setIsLoadingEvents(true);

      const params = {
        home_flag: 1,
        search_flag: "HeaderInputCity",
      };

      // If we have cityNameFromSlug but no cityId, fetch the city data
      if (
        !cityId &&
        !stateId &&
        cityNameFromSlug &&
        cityNameFromSlug.toLowerCase() !== "india"
      ) {
        const fetchedCityData = await fetchCityIdByName(cityNameFromSlug);
        if (fetchedCityData) {
          params.city = fetchedCityData.id;
          params.scity = fetchedCityData.id;
          params.state = fetchedCityData.state_id;
          params.country = fetchedCityData.country_id;

          // Generate and store slug from city name
          const citySlug = cityNameFromSlug
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          // Store for future use
          localStorage.setItem("selectedCityId", fetchedCityData.id);
          localStorage.setItem("selectedCityName", cityNameFromSlug);
          localStorage.setItem("selectedCitySlug", citySlug);
          localStorage.setItem("selectedStateId", fetchedCityData.state_id);
          localStorage.setItem("selectedCountryId", fetchedCityData.country_id);

          // Always update city name from the slug, even if no events
          setCityName(cityNameFromSlug);
        }
      } else if (cityId) {
        params.city = cityId;
        params.scity = cityId;

        // Try to get state and country from localStorage
        let storedStateId = localStorage.getItem("selectedStateId");
        const storedCountryId = localStorage.getItem("selectedCountryId");

        console.log("📍 City ID:", cityId);
        console.log("📍 Stored State ID:", storedStateId);
        console.log("📍 Stored Country ID:", storedCountryId);

        // If state is not in localStorage, try to fetch it from city name
        if (!storedStateId) {
          const storedCityName = localStorage.getItem("selectedCityName");
          if (storedCityName) {
            console.log("🔍 State not found, fetching city data for:", storedCityName);
            const fetchedCityData = await fetchCityIdByName(storedCityName);
            if (fetchedCityData && fetchedCityData.state_id) {
              storedStateId = fetchedCityData.state_id;
              localStorage.setItem("selectedStateId", fetchedCityData.state_id);
              localStorage.setItem("selectedCountryId", fetchedCityData.country_id);
              console.log("✅ Fetched State ID:", fetchedCityData.state_id);
            }
          }
        }

        if (storedStateId) params.state = parseInt(storedStateId);
        if (storedCountryId) params.country = parseInt(storedCountryId);

        // Update city name if available from localStorage
        const storedCityName = localStorage.getItem("selectedCityName");
        if (storedCityName) {
          setCityName(storedCityName);
        }
      } else if (stateId) {
        params.state = stateId;
        // For state-level search, try to get country from localStorage
        const storedCountryId = localStorage.getItem("selectedCountryId");
        if (storedCountryId) params.country = parseInt(storedCountryId);

        // Update city name if available
        const storedCityName = localStorage.getItem("selectedCityName");
        if (storedCityName) {
          setCityName(storedCityName);
        }
      }

      console.log("🚀 Final API Payload:", params);

      const data = await authAPI.getDataLocationWise(params);

      if (data.status === "success" && data.data) {
        // Update city name from API if available, otherwise keep the one we set
        if (data.data.CityName) {
          setCityName(data.data.CityName);
        }

        // Set trending events (eventData from API) - show only ACTIVE events from selected city
        if (data.data.eventData && data.data.eventData.length > 0) {
          console.log("📊 Total events from API:", data.data.eventData.length);
          console.log("📝 Sample event:", data.data.eventData[0]);

          const currentCityName =
            data.data.CityName || cityNameFromSlug || cityName;

          // Filter local events (from selected city)
          const localEvents = data.data.eventData.filter(
            (event) =>
              event.city_name &&
              event.city_name.toLowerCase() === currentCityName.toLowerCase() &&
              // Only show active events (status = 1 or "1" or "active"), exclude closed events
              (event.status === 1 || event.status === "1" || event.status === "active")
          );

          // Sort by creation date (latest first) to show trending events
          const sortedLocalEvents = localEvents.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });

          // If no local events, show all active events from other cities as suggestions
          if (sortedLocalEvents.length === 0) {
            console.log("🔍 No local events, showing suggestions from all cities");
            const allActiveEvents = data.data.eventData.filter(
              (event) =>
                // More lenient - show all events that are NOT explicitly closed
                event.status !== 0 &&
                event.status !== "0" &&
                event.status !== "closed" &&
                event.status !== "Closed"
            );

            console.log("✅ Suggestion events found:", allActiveEvents.length);

            // Sort suggestions by creation date
            const sortedSuggestions = allActiveEvents.sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
              const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
              return dateB - dateA;
            });

            setTrendingEvents(sortedSuggestions);
            setHasLocalEvents(false); // No local events, showing suggestions

            // Initialize like state for suggestion events
            const initialLiked = {};
            sortedSuggestions.forEach((ev) => {
              initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
            });
            setLikedEvents((prev) => ({ ...prev, ...initialLiked }));
          } else {
            // Show local events
            setTrendingEvents(sortedLocalEvents);
            setHasLocalEvents(true);

            // Initialize like state for trending events
            const initialLiked = {};
            sortedLocalEvents.forEach((ev) => {
              initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
            });
            setLikedEvents((prev) => ({ ...prev, ...initialLiked }));
          }
        } else {
          // No events at all
          setTrendingEvents([]);
          setHasLocalEvents(false);
        }

        // Set upcoming events (UpcomingEventData from API) - show only ACTIVE events sorted by date
        if (
          data.data.UpcomingEventData &&
          data.data.UpcomingEventData.length > 0
        ) {
          // Filter to exclude closed events and events with closed registration
          const activeUpcomingEvents = data.data.UpcomingEventData.filter(
            (event) => {
              // Check if registration is still open (registration_end_time is in the future)
              const isRegistrationOpen = event.registration_end_time * 1000 > Date.now();

              // Exclude closed events and events with closed registration
              const isNotClosed = event.status !== 0 &&
                event.status !== "0" &&
                event.status !== "closed" &&
                event.status !== "Closed";

              return isRegistrationOpen && isNotClosed;
            }
          );

          // Sort upcoming events by start_time (earliest first)
          const sortedUpcomingEvents = activeUpcomingEvents.sort((a, b) => {
            const dateA = a.start_time ? new Date(a.start_time * 1000) : new Date(0);
            const dateB = b.start_time ? new Date(b.start_time * 1000) : new Date(0);
            return dateA - dateB; // Ascending order (earliest first)
          });

          setUpcomingEvents(sortedUpcomingEvents);

          // Initialize like state for upcoming events
          const initialLiked = {};
          sortedUpcomingEvents.forEach((ev) => {
            initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
          });
          setLikedEvents((prev) => ({ ...prev, ...initialLiked }));
        } else {
          setUpcomingEvents([]);
        }
      } else {
        // If API doesn't return success, still keep the city name from slug
        if (cityNameFromSlug) {
          setCityName(cityNameFromSlug);
        }
        setTrendingEvents([]);
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error("Error fetching location events:", error);
      // Even on error, keep the city name and UI visible
      if (cityNameFromSlug) {
        setCityName(cityNameFromSlug);
      }
      setTrendingEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Initial load - fetch data based on URL citySlug
  useEffect(() => {
    let cityNameFromUrl = null;
    let cityIdToFetch = null;
    let stateIdToFetch = null;

    if (citySlug) {
      // Convert slug to readable city name (e.g., 'meerut' -> 'Meerut', 'new-delhi' -> 'New Delhi')
      cityNameFromUrl = citySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Set the city name immediately for better UX
      setCityName(cityNameFromUrl);

      // Check if we have stored city ID for this slug
      const storedCityId = localStorage.getItem("selectedCityId");
      const storedCitySlug = localStorage.getItem("selectedCitySlug");

      if (storedCitySlug === citySlug && storedCityId) {
        cityIdToFetch = storedCityId;
      }
    }

    // Fetch events with the city information
    fetchLocationEvents(cityIdToFetch, stateIdToFetch, cityNameFromUrl);
  }, [citySlug]);

  // Listen for city selection from navbar
  useEffect(() => {
    const handleCitySelected = (event) => {
      const { cityId, cityType, cityName, citySlug, stateId, countryId } =
        event.detail;

      // Always update city name immediately for better UX
      if (cityName) {
        setCityName(cityName);
      }

      // Store state and country IDs if provided
      if (stateId) {
        localStorage.setItem("selectedStateId", stateId);
      }
      if (countryId) {
        localStorage.setItem("selectedCountryId", countryId);
      }

      if (cityType === "city") {
        setSelectedCityId(cityId);

        // TopNav already handles URL navigation, just fetch events
        fetchLocationEvents(cityId, null, cityName);
      } else if (cityType === "state") {
        setSelectedCityId(null);
        fetchLocationEvents(null, cityId, cityName);
      }
    };

    const handleLocationDeleted = (event) => {
      const { cityName, citySlug } = event.detail;

      // Reset to detected/default location
      setCityName(cityName);
      setSelectedCityId(null);

      // Fetch events for the detected location
      fetchLocationEvents(null, null, cityName);
    };

    window.addEventListener("citySelected", handleCitySelected);
    window.addEventListener("locationDeleted", handleLocationDeleted);

    return () => {
      window.removeEventListener("citySelected", handleCitySelected);
      window.removeEventListener("locationDeleted", handleLocationDeleted);
    };
  }, [navigate]);

  // Carousel auto-slide
  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slides]);

  // Animation trigger
  useEffect(() => {
    const id = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(id);
  }, []);

  // Numbers section animation (unchanged)
  const countUp = (el, target, duration = 2000) => {
    const start = performance.now();
    const from = 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t;
      const current = Math.round(from + (target - from) * eased);
      el.textContent = `${current}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = `${target}${suffix}`;
    };
    requestAnimationFrame(step);
  };
  useEffect(() => {
    if (!numbersRef.current) return;
    const node = numbersRef.current;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = node.querySelectorAll(".number-card");
            cards.forEach((c, i) => {
              setTimeout(() => c.classList.add("visible"), i * 120);
            });
            const counters = node.querySelectorAll("[data-target]");
            counters.forEach((el) => {
              const target = parseInt(el.getAttribute("data-target"), 10) || 0;
              const idx = Array.from(counters).indexOf(el);
              setTimeout(() => countUp(el, target, 1600), idx * 140);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  console.log("Number of slides:", slides);
  if (!slides || slides.length === 0) return null;

  const active = slides[currentIndex];
  const staticTitle = "RUN TOGETHER, ACHIEVE MORE";
  const staticSubtitle =
    "Join our vibrant running club and conquer every mile – from weekend jogs to marathon triumphs.";

  // Pick the nearest upcoming event (by start_time) if available
  const nextUpcomingEvent =
    Array.isArray(upcomingEvents) && upcomingEvents.length > 0
      ? upcomingEvents.reduce((a, b) => (a.start_time < b.start_time ? a : b))
      : null;

  // Handle distance card click
  const handleDistanceClick = (distanceName) => {
    // Navigate to search events page with distance filter as query param
    navigate(`/search-events?distance=${encodeURIComponent(distanceName)}`);
  };

  // Handle quick selection card click
  const handleQuickSelectionClick = (timePeriod) => {
    // Navigate to search events page with date filter as query param
    navigate(`/search-events?dateFilter=${encodeURIComponent(timePeriod)}`);
  };

  return (
    <>
      <section className="hero-viewport">
        <div className="hero-slide">
          {/* Banner image with static test image for debugging */}
          <div
            className="hero-bg"
            style={{ backgroundImage: `url(${active.banner_image_url})` }}
          />
          <div className="hero-overlay">
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                {/* <div
                  className={`col-lg-7 text-white position-relative`}
                  style={{ marginBottom: "80px" }}
                >
                  <div className="avatar-row mb-3">
                    <img src={Avatar1} className="avatar" alt="a" />
                    <img src={Avatar2} className="avatar" alt="b" />
                    <img src={Avatar3} className="avatar" alt="c" />
                    <img src={Avatar4} className="avatar" alt="d" />
                    <div className="active-count ms-3">
                      1.200+
                      <br />
                      <small>Active Members</small>
                    </div>
                  </div> */}

                {/* <h4
                    className={`display-1 hero-title ${animate ? "animated slide-in-left" : ""
                      }`}
                    style={{
                      fontSize: "90px",
                      lineHeight: "100px",
                      // marginBottom: "1rem",
                    }}
                  >
                    {staticTitle}
                  </h4> */}
                {/* <p className="lead hero-sub">{staticSubtitle}</p> */}
                {/* ✅ Modal Open Button */}
                {/* <button
                    className="btn btn-success mt-3"
                    onClick={() => dispatch(toggleModal())}
                  >
                    Learn More
                  </button> */}
                {/* </div> */}

                {/* <div className="col-lg-5 d-flex justify-content-end align-items-center">
                  <div className={animate ? "animated slide-in-right" : ""}>
                    {nextUpcomingEvent ? (
                      <div className="upcoming-card">
                        <img
                          src={
                            nextUpcomingEvent.banner_image
                              ? nextUpcomingEvent.banner_image
                              : logo
                          }
                          alt={nextUpcomingEvent.name}
                          className="upcoming-image"
                        />
                        <div className="upcoming-content">
                          <div className="upcoming-header">
                            <div className="badge">- UPCOMING RACES -</div>
                            <h4>{nextUpcomingEvent.name}</h4>
                          </div>
                          <div className="info-box mt-3 p-3">
                            <div className="info-row">
                              <i
                                className="info-icon fa-regular fa-calendar"
                                aria-hidden="true"
                              ></i>
                              <span>
                                <strong>
                                  {nextUpcomingEvent.start_date ||
                                    new Date(
                                      nextUpcomingEvent.start_time * 1000
                                    ).toLocaleDateString("en-US", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                </strong>
                              </span>
                            </div>
                            <div className="info-row">
                              <i
                                className="info-icon fa-regular fa-clock"
                                aria-hidden="true"
                              ></i>
                              <span>
                                {nextUpcomingEvent.start_time_event ||
                                  new Date(
                                    nextUpcomingEvent.start_time * 1000
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                -{" "}
                                {nextUpcomingEvent.end_date_event ||
                                  (nextUpcomingEvent.end_time
                                    ? new Date(
                                      nextUpcomingEvent.end_time * 1000
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    : "")}
                              </span>
                            </div>
                            <div className="info-row">
                              <i
                                className="info-icon fa-solid fa-location-dot"
                                aria-hidden="true"
                              ></i>
                              <span>
                                {nextUpcomingEvent.city_name || cityName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="upcoming-card">
                        <img
                          src={logo}
                          alt="event"
                          className="upcoming-image"
                        />
                        <div className="upcoming-content">
                          <div className="upcoming-header">
                            <div className="badge">- UPCOMING RACES -</div>
                            <h4>
                              RACES CITY
                              <br />
                              SPRINT 10K
                            </h4>
                          </div>
                          <div className="info-box mt-3 p-3">
                            <div className="info-row">
                              <i
                                className="info-icon fa-regular fa-calendar"
                                aria-hidden="true"
                              ></i>
                              <span>
                                <strong>September 20, 2025</strong>
                              </span>
                            </div>
                            <div className="info-row">
                              <i
                                className="info-icon fa-regular fa-clock"
                                aria-hidden="true"
                              ></i>
                              <span>Start 05:00 AM - Finish 10:00 AM</span>
                            </div>
                            <div className="info-row">
                              <i
                                className="info-icon fa-solid fa-location-dot"
                                aria-hidden="true"
                              ></i>
                              <span>South Jekardah</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="social-vertical">
          {/* <a
            className="social-btn"
            href=" https://www.facebook.com/youtoocanrunsmpl"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f" aria-hidden="true" />
          </a> */}

          {/* <a
            className="social-btn"
            href="https://www.instagram.com/youtoocanrun/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" aria-hidden="true" />
          </a> */}

          {/* <a
            className="social-btn"
            href="https://www.linkedin.com/company/youtoocanrun/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          > */}
          {/* Font Awesome may not include an official Threads icon depending on version; using 'fa-x' (or update FA) */}
          {/* <i className="fab fa-linkedin-in" aria-hidden="true" />
          </a> */}

          {/* <a
            className="social-btn"
            href=" https://x.com/youtoocanrun"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter" aria-hidden="true" />
          </a> */}
        </div>

        <div className="hero-controls container">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              className={`dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        {/* --- Numbers / Stats section (matches provided screenshot) --- */}
        {/* <section ref={numbersRef} className="numbers-section container mt-5">
          <div className="row align-items-start">
            <div className="col-md-3 d-none d-md-block">
              <div className="numbers-pill">- RACES IN NUMBERS -</div>
            </div>

            <div className="col-12 col-md-9">
              <p className="numbers-intro">
                RACES is India’s first fully integrated registration platform
                for running events. Beside being a registration platform for
                running events, we also provide technology solutions, back
                office service and go-to-market offerings to grow your running
                event.
              </p>

              <div className="row number-cards mt-4">
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="85"
                      data-suffix="+"
                    >
                      0
                    </div>
                    <div className="number-title">COMMUNITY EVENTS</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="98"
                      data-suffix="%"
                    >
                      0
                    </div>
                    <div className="number-title">MEMBER COMPLETION RATE</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="320"
                      data-suffix="+"
                    >
                      0
                    </div>
                    <div className="number-title">PERSONAL BESTS ACHIEVED</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* --- Feature / About section (images left/center, text right) --- */}
        {/* <section className="feature-section my-5">
          <div className="row align-items-start">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="feature-image-wrap">
                <img
                  src={require("../../assets/image/run1.jpg")}
                  alt="run1"
                  className="feature-image rounded-xl"
                />
              </div>
              <div className="mt-4">
                <button className="about-btn">ABOUT US</button>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
              <div className="feature-image-wrap center-card">
                <img
                  src={require("../../assets/image/run2.jpg")}
                  alt="run2"
                  className="feature-image tall rounded-xl"
                />
              </div>
            </div>

            <div className="col-lg-5 col-md-12">
              <h2 className="feature-title" style={{ fontSize: "42px" }}>
                STRONGER WITH EVERY STRIDE.
              </h2>
              <p className="feature-copy">
                Races is more than just a running club—it’s a thriving,
                inclusive community where runners of all levels come together to
                train, race, and grow. Founded in 2018, we’ve helped over 1,200
                runners across 12 cities reach their goals—whether it’s a
                couch-to-5K transformation or a Boston-qualifier dream.
              </p>

              <div className="feature-pills mt-4">
                <div className="pill">
                  <i
                    className="fa-regular fa-flag me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Weekly Community Runs
                </div>
                <div className="pill">
                  <i
                    className="fa-regular fa-bullseye me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Personalized Training Support
                </div>
                <div className="pill">
                  <i
                    className="fa-regular fa-users-line me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Open to All Ages & Skill Levels
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* --- Trending Events Section --- */}
        <section className="trending-events-section my-5">
          <div className="container">
            <h2 className="section-title mb-4 text-start">
              Trending Events <span className="text-muted">in {cityName}</span>
            </h2>
            {isLoadingEvents ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : trendingEvents.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ marginBottom: "20px" }}>
                  <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ margin: "0 auto", display: "block" }}
                  >
                    {/* Location pin icon with dashed circle */}
                    <circle
                      cx="100"
                      cy="90"
                      r="40"
                      stroke="#ddd"
                      strokeWidth="3"
                      strokeDasharray="8 5"
                      fill="none"
                    />
                    {/* Clouds */}
                    <ellipse cx="60" cy="50" rx="18" ry="12" fill="#e0e0e0" />
                    <ellipse cx="72" cy="48" rx="15" ry="10" fill="#e0e0e0" />
                    <ellipse cx="140" cy="55" rx="20" ry="13" fill="#e0e0e0" />
                    <ellipse cx="155" cy="52" rx="18" ry="11" fill="#e0e0e0" />
                    <ellipse cx="40" cy="140" rx="15" ry="10" fill="#e0e0e0" />
                    {/* Location pin */}
                    <path
                      d="M100 70 C90 70 82 78 82 88 C82 98 100 110 100 110 C100 110 118 98 118 88 C118 78 110 70 100 70 Z"
                      fill="#ccc"
                    />
                    <circle cx="100" cy="88" r="5" fill="white" />
                    {/* Rain lines */}
                    <line
                      x1="145"
                      y1="65"
                      x2="150"
                      y2="75"
                      stroke="#ddd"
                      strokeWidth="2"
                    />
                    <line
                      x1="152"
                      y1="65"
                      x2="157"
                      y2="75"
                      stroke="#ddd"
                      strokeWidth="2"
                    />
                    <line
                      x1="159"
                      y1="68"
                      x2="164"
                      y2="78"
                      stroke="#ddd"
                      strokeWidth="2"
                    />
                    <line
                      x1="166"
                      y1="65"
                      x2="171"
                      y2="75"
                      stroke="#ddd"
                      strokeWidth="2"
                    />
                    {/* Shadow */}
                    <ellipse cx="100" cy="165" rx="35" ry="5" fill="#f0f0f0" />
                  </svg>
                </div>
                <h4
                  className="mt-3"
                  style={{ color: "#333", fontWeight: "600" }}
                >
                  No events found
                </h4>
                <p className="text-muted" style={{ fontSize: "15px" }}>
                  Sorry, We couldn't find any events that match your search, but
                  here are some suggestions!
                </p>
              </div>
            ) : (
              <>
                {/* Show "No local events" message if selected city has no events but API returns suggestions */}
                {!hasLocalEvents && (
                  <div className="text-center py-3 mb-3">
                    <div style={{ marginBottom: "12px" }}>
                      <svg
                        width="120"
                        height="120"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ margin: "0 auto", display: "block" }}
                      >
                        <circle
                          cx="100"
                          cy="90"
                          r="40"
                          stroke="#ddd"
                          strokeWidth="3"
                          strokeDasharray="8 5"
                          fill="none"
                        />
                        <ellipse
                          cx="60"
                          cy="50"
                          rx="18"
                          ry="12"
                          fill="#e0e0e0"
                        />
                        <ellipse
                          cx="72"
                          cy="48"
                          rx="15"
                          ry="10"
                          fill="#e0e0e0"
                        />
                        <ellipse
                          cx="140"
                          cy="55"
                          rx="20"
                          ry="13"
                          fill="#e0e0e0"
                        />
                        <ellipse
                          cx="155"
                          cy="52"
                          rx="18"
                          ry="11"
                          fill="#e0e0e0"
                        />
                        <ellipse
                          cx="40"
                          cy="140"
                          rx="15"
                          ry="10"
                          fill="#e0e0e0"
                        />
                        <path
                          d="M100 70 C90 70 82 78 82 88 C82 98 100 110 100 110 C100 110 118 98 118 88 C118 78 110 70 100 70 Z"
                          fill="#ccc"
                        />
                        <circle cx="100" cy="88" r="5" fill="white" />
                        <line
                          x1="145"
                          y1="65"
                          x2="150"
                          y2="75"
                          stroke="#ddd"
                          strokeWidth="2"
                        />
                        <line
                          x1="152"
                          y1="65"
                          x2="157"
                          y2="75"
                          stroke="#ddd"
                          strokeWidth="2"
                        />
                        <line
                          x1="159"
                          y1="68"
                          x2="164"
                          y2="78"
                          stroke="#ddd"
                          strokeWidth="2"
                        />
                        <line
                          x1="166"
                          y1="65"
                          x2="171"
                          y2="75"
                          stroke="#ddd"
                          strokeWidth="2"
                        />
                        <ellipse
                          cx="100"
                          cy="165"
                          rx="35"
                          ry="5"
                          fill="#f0f0f0"
                        />
                      </svg>
                    </div>
                    <h5
                      style={{
                        color: "#333",
                        fontWeight: "600",
                        fontSize: "16px",
                        marginBottom: "8px",
                      }}
                    >
                      No events found
                    </h5>
                    <p
                      className="text-muted"
                      style={{ fontSize: "13px", marginBottom: "15px" }}
                    >
                      Sorry, We couldn't find any events that match your search,
                      but here are some suggestions!
                    </p>
                  </div>
                )}

                <div
                  id="trendingEventsCarousel"
                  className="carousel slide"
                  data-bs-ride="false"
                >
                  <div className="carousel-inner">
                    {Array.from(
                      { length: Math.ceil(trendingEvents.length / 4) },
                      (_, slideIndex) => {
                        const startIdx = slideIndex * 4;
                        const slideEvents = trendingEvents.slice(
                          startIdx,
                          startIdx + 4
                        );
                        return (
                          <div
                            className={`carousel-item ${slideIndex === 0 ? "active" : ""
                              }`}
                            key={slideIndex}
                          >
                            <div className="row justify-content-center">
                              {slideEvents.map((event) => {
                                const eventDate = new Date(
                                  event.start_time * 1000
                                );
                                const month = eventDate.toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                  }
                                );
                                const day = eventDate.getDate();
                                const registerByDate = new Date(
                                  event.registration_end_time * 1000
                                );
                                const registerBy =
                                  registerByDate.toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  });
                                const isOpen =
                                  event.registration_end_time * 1000 >
                                  Date.now();

                                return (
                                  <div
                                    className="col-lg-3 col-md-6 col-12"
                                    key={event.id}
                                  >
                                    <div className="event-card1">
                                      {/* Event Image */}
                                      <div className="event-card-img-wrapper">
                                        <img
                                          src={
                                            event.banner_image ||
                                            require("../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg")
                                          }
                                          alt={event.name}
                                          className="event-card-img"
                                        />
                                        <span className="event-card-badge navi-mumbai-badge">
                                          <i
                                            className="fas fa-map-marker-alt"
                                            style={{ marginRight: 4 }}
                                          ></i>
                                          {event.city_name || cityName}
                                        </span>
                                        <button
                                          className={`search-like-btn${likedEvents[event.id]
                                            ? " liked"
                                            : ""
                                            }`}
                                          aria-label="Like"
                                          onClick={() =>
                                            handleToggleLike(event.id)
                                          }
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
                                                likedEvents[event.id]
                                                  ? "#da251c"
                                                  : "#bbb"
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
                                              {month}
                                            </div>
                                            <div className="event-day">
                                              {day}
                                            </div>
                                          </div>
                                          <div className="event-title-wrapper">
                                            <h3 className="event-title">
                                              {event.name}
                                            </h3>
                                          </div>
                                        </div>

                                        <hr className="event-divider" />

                                        <div className="event-register-info">
                                          Register By :{" "}
                                          <span className="register-date">
                                            {registerBy}
                                          </span>
                                        </div>

                                        <div className="event-footer d-flex align-items-center justify-content-between">
                                          <span
                                            className="registration-status"
                                            style={{
                                              color: isOpen
                                                ? "green"
                                                : "#dc3545",
                                            }}
                                          >
                                            <i
                                              className={`fas fa-${isOpen ? "check-circle" : "ban"
                                                }`}
                                              style={{ marginRight: 6 }}
                                            ></i>
                                            {isOpen
                                              ? "Registration Open"
                                              : "Registration Closed"}
                                          </span>
                                          <button
                                            className="btn btn-view"
                                            onClick={() =>
                                              navigate(`/event/${event.id}`)
                                            }
                                          >
                                            {isOpen ? "Register" : "View"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Carousel Indicators (Dots) */}
                  {trendingEvents.length > 4 && (
                    <div className="carousel-indicators">
                      {Array.from(
                        { length: Math.ceil(trendingEvents.length / 4) },
                        (_, index) => (
                          <button
                            key={index}
                            type="button"
                            data-bs-target="#trendingEventsCarousel"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                            aria-current={index === 0 ? "true" : "false"}
                            aria-label={`Slide ${index + 1}`}
                          ></button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Events listing added below the About/Feature section */}
        <EventsPanel
          upcomingEvents={upcomingEvents}
          cityName={cityName}
          isLoading={isLoadingEvents}
          likedEvents={likedEvents}
          onToggleLike={handleToggleLike}
        />

        {/* --- Choose By Distance Section --- */}
        <section className="choose-distance-section my-5">
          <div className="container">
            <h2 className="section-title mb-4">Choose By Distance</h2>
            <div className="row g-3">
              <div className="col-lg col-md-4 col-sm-6">
                <div
                  className="distance-card"
                  onClick={() => handleDistanceClick("5 Km")}
                >
                  <img
                    src={require("../../assets/image/run1.jpg")}
                    alt="5 Km"
                    className="distance-card-img"
                  />
                  <div className="distance-overlay">
                    <h3 className="distance-title">5 Km</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg col-md-4 col-sm-6">
                <div
                  className="distance-card"
                  onClick={() => handleDistanceClick("10K Run")}
                >
                  <img
                    src={require("../../assets/image/run2.jpg")}
                    alt="10K Run"
                    className="distance-card-img"
                  />
                  <div className="distance-overlay">
                    <h3 className="distance-title">10K Run</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg col-md-4 col-sm-6">
                <div
                  className="distance-card"
                  onClick={() => handleDistanceClick("Half Marathon")}
                >
                  <img
                    src={require("../../assets/image/run1.jpg")}
                    alt="Half Marathon"
                    className="distance-card-img"
                  />
                  <div className="distance-overlay">
                    <h3 className="distance-title">Half Marathon</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg col-md-4 col-sm-6">
                <div
                  className="distance-card"
                  onClick={() => handleDistanceClick("Marathon")}
                >
                  <img
                    src={require("../../assets/image/run2.jpg")}
                    alt="Marathon"
                    className="distance-card-img"
                  />
                  <div className="distance-overlay">
                    <h3 className="distance-title">Marathon</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg col-md-4 col-sm-6">
                <div
                  className="distance-card"
                  onClick={() => handleDistanceClick("Ultra Run")}
                >
                  <img
                    src={require("../../assets/image/run1.jpg")}
                    alt="Ultra Run"
                    className="distance-card-img"
                  />
                  <div className="distance-overlay">
                    <h3 className="distance-title">Ultra Run</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Quick Selection Section --- */}
        <section className="quick-selection-section my-5">
          <div className="container">
            <h2 className="section-title mb-4">Quick Selection</h2>
            <div className="row g-3">
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div
                  className="quick-card"
                  onClick={() => handleQuickSelectionClick("this_week")}
                >
                  <div className="quick-icon-wrapper">
                    <i className="fas fa-calendar-week quick-icon"></i>
                  </div>
                  <h3 className="quick-title">This Week</h3>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div
                  className="quick-card"
                  onClick={() => handleQuickSelectionClick("this_month")}
                >
                  <div className="quick-icon-wrapper">
                    <i className="fas fa-calendar-alt quick-icon"></i>
                  </div>
                  <h3 className="quick-title">This Month</h3>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div
                  className="quick-card"
                  onClick={() => handleQuickSelectionClick("this_quarter")}
                >
                  <div className="quick-icon-wrapper">
                    <i className="fas fa-calendar quick-icon"></i>
                  </div>
                  <h3 className="quick-title">This Quarter</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Training Programs section (matches screenshot) */}
        {/* <TrainingPanel /> */}

        {/* Why Runmate section */}
        {/* <WhyRunmatePanel /> */}

        {/* Run Unintentionally section */}
        <RunUnintentionallyPanel />

        {/* Coaches section */}
        {/* <CoachesPanel /> */}

        <InstagramGrid />

        {/* {Testimonials} */}
        <TestimonialsCarousel />

        {/* Blog Section */}
        {/* <BlogPanel /> */}

        {/* FAQ Section */}
        {/* <FAQPanel /> */}

        <YouCanRunBanner
          logoSrc={require("../../assets/image/youcanrun-banner.png")}
        />
      </section>

      <Footer />
    </>
  );
}
