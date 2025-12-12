import React, { useState, useEffect } from "react";
import TopNav from "../../components/Navbar/TopNav";
import "./Favourites.css";
import { authAPI } from "../../services/authAPI";

export default function Favourites() {
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

  const handleRemoveFavourite = (eventId) => {
    // Remove from favourites - API call
    setFavouriteEvents(favouriteEvents.filter((event) => event.id !== eventId));
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
            <img
              src="https://cdn-icons-png.flaticon.com/512/2589/2589175.png"
              alt="No favourites"
              className="no-favourites-img"
            />
            <h2 className="no-favourites-title">No Favourite Events Yet</h2>
            <p className="no-favourites-desc">
              Start adding events to your favourites to see them here!
            </p>
          </div>
        ) : (
          <div className="favourites-grid">
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
                <div key={event.id} className="fav-event-card">
                  <div className="fav-card-image-wrapper">
                    <img
                      src={
                        event.banner_image || event.event_image || event.image
                      }
                      alt={event.name}
                      className="fav-card-image"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/350x200/4a90e2/ffffff?text=Event+Image";
                      }}
                    />
                    <div className="fav-location-badge">
                      <i className="fas fa-map-marker-alt"></i>{" "}
                      {event.city_name || event.city || "City"}
                    </div>
                    <button
                      className={`fav-like-btn${likedEvents[event.id] ? " liked" : ""
                        }`}
                      onClick={() => handleToggleLike(event.id)}
                      aria-label="Like"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 17.5C9.7 17.5 9.4 17.4 9.2 17.2L3.1 11.5C1.2 9.7 1.2 6.7 3.1 4.9C4.1 3.9 5.4 3.4 6.7 3.4C7.8 3.4 8.9 3.8 9.8 4.6C10.7 3.8 11.8 3.4 12.9 3.4C14.2 3.4 15.5 3.9 16.5 4.9C18.4 6.7 18.4 9.7 16.5 11.5L10.8 17.2C10.6 17.4 10.3 17.5 10 17.5Z"
                          fill={likedEvents[event.id] ? "#e53935" : "#bbb"}
                          stroke="#e53935"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="fav-card-body">
                    <div className="fav-date-section">
                      <span className="fav-month">
                        {eventDate.month.toUpperCase()}
                      </span>
                      <span className="fav-day">{eventDate.day}</span>
                    </div>
                    <div className="fav-content">
                      <h3 className="fav-event-title">{event.name}</h3>
                      <hr className="fav-divider" />
                      <p className="fav-register-by">
                        Register By :{" "}
                        <span className="fav-date-red">{registerBy}</span>
                      </p>
                      <div className="fav-footer">
                        {registrationClosed ? (
                          <div className="fav-status-badge">
                            <i className="fas fa-ban"></i> Registration Closed
                          </div>
                        ) : (
                          <div
                            className="fav-status-badge"
                            style={{ color: "green" }}
                          >
                            <i className="fas fa-check-circle"></i> Registration
                            Open
                          </div>
                        )}
                        <button className="fav-view-btn">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
