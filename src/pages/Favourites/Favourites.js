import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import "./Favourites.css";
import { authAPI } from "../../services/authAPI";

export default function Favourites() {
  const navigate = useNavigate();
  const [favouriteEvents, setFavouriteEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch APIs in sequence: events -> profile -> userfollowevent
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch all events first
      console.log("Step 1: Fetching all events...");
      const eventsResponse = await authAPI.getEvents({});
      console.log("Events API response:", eventsResponse);

      // Step 2: Fetch user profile
      console.log("Step 2: Fetching user profile...");
      const profileResponse = await authAPI.getProfile();
      console.log("Profile API response:", profileResponse);

      // Step 3: Fetch user followed events
      console.log("Step 3: Fetching user followed events...");
      const followedResponse = await authAPI.getUserFollowedEvents();
      console.log("User followed events response:", followedResponse);
      console.log("User followed events data:", followedResponse?.data);
      console.log(
        "User followed events array:",
        followedResponse?.data?.userfollowevent
      );

      // Extract followed events data - API returns userfollowevent array
      if (
        followedResponse &&
        followedResponse.data &&
        followedResponse.data.userfollowevent &&
        Array.isArray(followedResponse.data.userfollowevent)
      ) {
        const events = followedResponse.data.userfollowevent;
        console.log("Extracted events:", events);
        console.log("Events count:", events.length);

        setFavouriteEvents(events);

        // Initialize liked state for each event (all are liked since they're in favourites)
        const initialLiked = {};
        events.forEach((ev) => {
          initialLiked[ev.id] = true; // All events here are followed
        });
        setLikedEvents(initialLiked);
      } else {
        console.log("No events found or invalid structure");
        setFavouriteEvents([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFavouriteEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (eventId) => {
    const currentLikeStatus = likedEvents[eventId];
    const newLikeStatus = !currentLikeStatus;

    // Optimistically update UI
    setLikedEvents((prev) => ({ ...prev, [eventId]: newLikeStatus }));

    try {
      // If unliking from favourites page, call unfollow API
      const isFollow = newLikeStatus ? 0 : 1; // 0 = follow, 1 = unfollow
      await authAPI.followEvent(eventId, isFollow);

      // If unliked, remove from list after a short delay
      if (!newLikeStatus) {
        setTimeout(() => {
          setFavouriteEvents((prev) => prev.filter((ev) => ev.id !== eventId));
        }, 300);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setLikedEvents((prev) => ({ ...prev, [eventId]: currentLikeStatus }));
      alert("Failed to update favourite. Please try again.");
    }
  };



  return (
    <>
      <TopNav />

      {/* Hero Section - Blue Background like other pages */}
      <section className="favourites-hero">
        <div className="favourites-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="favourites-hero-title">Favourites</h1>
              <nav className="favourites-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Favourites</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Favourites Content */}
      <div className="favourites-container">
        <div className="container-fluid">
          <div className="favourites-header">
            <p className="favourites-count">
              Showing 1-{favouriteEvents.length} of {favouriteEvents.length}{" "}
              results
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Loading your favourite events...</p>
            </div>
          ) : favouriteEvents.length === 0 ? (
            <div className="no-favourites">
              <h2 className="no-favourites-title">No Favourite Events Yet</h2>
              <p className="no-favourites-desc">
                Start adding events to your favourites to see them here!
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {favouriteEvents.map((event) => {
                // Format date from timestamp
                const formatEventDate = (timestamp) => {
                  if (!timestamp) return { month: "", day: "" };
                  const date = new Date(timestamp * 1000);
                  return {
                    month: date.toLocaleString("en-US", { month: "short" }),
                    day: date.getDate(),
                  };
                };

                const formatRegisterBy = (timestamp) => {
                  if (!timestamp) return "N/A";
                  const date = new Date(timestamp * 1000);
                  return date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                };

                const isRegistrationClosed = (endTime) => {
                  if (!endTime) return false;
                  return endTime * 1000 < Date.now();
                };

                const eventDate = formatEventDate(event.start_time);
                const registerBy = formatRegisterBy(event.registration_end_time);
                const registrationClosed = isRegistrationClosed(
                  event.registration_end_time
                );

                return (
                  <div key={event.id} className="col-lg-3 col-md-6 col-12">
                    <div className="event-card1">
                      <div className="event-card-img-wrapper">
                        <img
                          src={
                            event.banner_image || event.event_image || event.image
                          }
                          alt={event.name}
                          className="event-card-img"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/350x200/4a90e2/ffffff?text=Event+Image";
                          }}
                        />
                        <span className="event-card-badge navi-mumbai-badge">
                          <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                          {event.city_name || event.city || "City"}
                        </span>
                        <button
                          className={`search-like-btn${likedEvents[event.id] ? " liked" : ""
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
                              fill={likedEvents[event.id] ? "#da251c" : "#bbb"}
                              stroke="#da251c"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="event-card-body">
                        {/* Date Badge - Red/White Split Design */}
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "stretch",
                            width: "fit-content",
                            marginBottom: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: "#da251c",
                              color: "#fff",
                              padding: "8px 16px",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              letterSpacing: "0.5px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {eventDate.month.toUpperCase()}
                          </div>
                          <div
                            style={{
                              background: "#fff",
                              color: "#333",
                              padding: "8px 16px",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              border: "1px solid #e0e0e0",
                              borderLeft: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "45px",
                            }}
                          >
                            {eventDate.day}
                          </div>
                        </div>

                        {/* Event Title */}
                        <h3
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: "#2c3e50",
                            marginBottom: "10px",
                            lineHeight: "1.3",
                            margin: "0 0 10px 0",
                          }}
                        >
                          {event.name}
                        </h3>

                        {/* Register By */}
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#7f8c8d",
                            marginBottom: "12px",
                          }}
                        >
                          Register by :{" "}
                          <span
                            style={{
                              color: "#da251c",
                              fontWeight: 700,
                            }}
                          >
                            {registerBy}
                          </span>
                        </div>

                        {/* Registration Status and Button */}
                        <div className="event-footer d-flex align-items-center justify-content-between">
                          {registrationClosed ? (
                            <span
                              style={{
                                color: "#dc3545",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i
                                className="fas fa-ban"
                                style={{ fontSize: "1rem" }}
                              ></i>
                              Registration Closed
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "#27ae60",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i
                                className="fas fa-check-circle"
                                style={{ fontSize: "1rem" }}
                              ></i>
                              Registration Open
                            </span>
                          )}
                          <button
                            style={{
                              background: "#fff",
                              border: "2px solid #da251c",
                              color: "#da251c",
                              borderRadius: "24px",
                              padding: "8px 20px",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              transition: "all 0.3s",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 8px rgba(218, 37, 28, 0.2)",
                            }}
                            onClick={() => navigate(`/event/${event.id}`)}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#da251c";
                              e.target.style.color = "#fff";
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#fff";
                              e.target.style.color = "#da251c";
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 2px 8px rgba(218, 37, 28, 0.2)";
                            }}
                          >
                            {registrationClosed ? "View" : "Register"}
                            <i className="fas fa-arrow-right" style={{ fontSize: "0.8rem" }}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
