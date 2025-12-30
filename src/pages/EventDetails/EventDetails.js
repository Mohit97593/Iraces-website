import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import Footer from "../../components/Footer/Footer";
import "./EventDetails.css";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [faq, setFaq] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [organiserName, setOrganiserName] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // First call events API
      const eventsResponse = await authAPI.getEvents({ event_id: eventId });
      if (
        eventsResponse &&
        eventsResponse.data &&
        eventsResponse.data.EventData &&
        eventsResponse.data.EventData.length > 0
      ) {
        const eventData = eventsResponse.data.EventData[0];
        setEvent(eventData);
        setIsLiked(eventData.is_follow === 1 || eventData.is_follow === "1");
      }

      // Then call event details page API
      const detailsResponse = await authAPI.getEventDetailsPage({
        event_id: eventId,
      });
      console.log("Event Details Page API Response:", detailsResponse);

      if (detailsResponse && detailsResponse.data) {
        setEventDetails(detailsResponse.data);
        setFaq(detailsResponse.data.FAQ || []);
        setTickets(detailsResponse.data.AllTickets || []);
        setOrganiserName(detailsResponse.data.OrganiserName || "");

        // Update event data with details page data if available
        if (
          detailsResponse.data.EventData &&
          detailsResponse.data.EventData.length > 0
        ) {
          const detailedEventData = detailsResponse.data.EventData[0];
          setEvent(detailedEventData);
          setIsLiked(
            detailedEventData.is_follow === 1 ||
            detailedEventData.is_follow === "1"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);

    try {
      const isFollow = newLikeStatus ? 0 : 1;
      await authAPI.followEvent(eventId, isFollow);
      fetchEventDetails();
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(!newLikeStatus);
      alert("Failed to update favourite. Please try again.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: `Check out this event: ${event?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isRegistrationClosed = (endTime) => {
    if (!endTime) return false;
    return endTime * 1000 < Date.now();
  };

  const isRegistrationNotStarted = (startTime) => {
    if (!startTime) return false;
    return startTime * 1000 > Date.now();
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <TopNav />
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <TopNav />
        <div className="error-container">
          <i
            className="fas fa-exclamation-circle"
            style={{ fontSize: "4rem", color: "#dc3545" }}
          ></i>
          <h4 className="mt-3">Event Not Found</h4>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/search-events")}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const registrationClosed = isRegistrationClosed(event.registration_end_time);
  const registrationNotStarted = isRegistrationNotStarted(event.registration_start_time);

  return (
    <div className="event-details-page">
      <TopNav />

      {/* Event Banner */}
      <div className="event-banner-section">
        <img
          src={event.banner_image || event.image}
          alt={event.name}
          className="event-banner-img"
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            background: event.banner_bg_color || event.background_color || "#fff",
          }}
        />
      </div>

      {/* Event Header */}
      <div className="container event-header-container">
        <div className="event-header-content">
          <div className="event-title-section">
            <h1 className="event-detail-title">{event.name}</h1>
            <div className="event-breadcrumb">
              <span onClick={() => navigate("/")}>Home</span>
              <span className="breadcrumb-separator">→</span>
              <span onClick={() => navigate("/search-events")}>Events</span>
            </div>
          </div>
          <div className="event-action-buttons">
            <button
              className={`event-action-btn ${isLiked ? "liked" : ""}`}
              onClick={handleToggleLike}
              aria-label="Like"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 17.5C9.7 17.5 9.4 17.4 9.2 17.2L3.1 11.5C1.2 9.7 1.2 6.7 3.1 4.9C4.1 3.9 5.4 3.4 6.7 3.4C7.8 3.4 8.9 3.8 9.8 4.6C10.7 3.8 11.8 3.4 12.9 3.4C14.2 3.4 15.5 3.9 16.5 4.9C18.4 6.7 18.4 9.7 16.5 11.5L10.8 17.2C10.6 17.4 10.3 17.5 10 17.5Z"
                  fill={isLiked ? "#da251c" : "transparent"}
                  stroke="#da251c"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              className="event-action-btn"
              onClick={handleShare}
              aria-label="Share"
            >
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container event-content-container">
        <div className="row">
          {/* Left Column - Event Details */}
          <div className="col-lg-8 col-md-7">
            {/* Description Section */}
            <div className="event-section">
              <h3 className="section-title">
                <i className="fas fa-align-left"></i> Description
              </h3>
              <div className="section-content">
                {event.event_description ? (
                  <div
                    className="event-description"
                    dangerouslySetInnerHTML={{
                      __html: event.event_description,
                    }}
                  />
                ) : event.description ? (
                  <div
                    className="event-description"
                    dangerouslySetInnerHTML={{
                      __html: event.description,
                    }}
                  />
                ) : null}
              </div>
            </div>

            {/* Location Section */}
            <div className="event-section">
              <h3 className="section-title">
                <i className="fas fa-map-marker-alt"></i> Location
              </h3>
              <div className="section-content">
                <div className="location-map">
                  {event.google_map_link ? (
                    <iframe
                      src={event.google_map_link}
                      width="100%"
                      height="350"
                      style={{ border: 0, borderRadius: "8px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : event.latitude && event.longitude ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${event.latitude},${event.longitude}&hl=en&z=14&output=embed`}
                      width="100%"
                      height="350"
                      style={{ border: 0, borderRadius: "8px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : event.venue || event.address ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        event.venue || event.address
                      )}&hl=en&z=14&output=embed`}
                      width="100%"
                      height="350"
                      style={{ border: 0, borderRadius: "8px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : (
                    <div className="map-placeholder">
                      <i
                        className="fas fa-map"
                        style={{ fontSize: "3rem", color: "#ccc" }}
                      ></i>
                      <p>Location map not available</p>
                    </div>
                  )}
                </div>
                <div className="location-details mt-3">
                  <h5>
                    <i className="fas fa-map-pin"></i> Venue
                  </h5>
                  <p>
                    {event.venue ||
                      event.address ||
                      `${event.city_name}, ${event.state_name}, ${event.country_name}, India.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Organiser Section */}
            <div className="event-section">
              <h3 className="section-title">
                <i className="fas fa-user-tie"></i> Organiser
              </h3>
              <div className="section-content">
                <div className="organiser-info">
                  <h5
                    onClick={() => {
                      // Navigate to organiser public profile
                      const organiserId = event.organiser_id || event.user_id || event.created_by || "1";
                      const organiserNameValue = organiserName || event.organiser_name || eventDetails?.OrganiserName || "Organiser";
                      // Replace spaces with underscores for URL
                      const organiserNameForUrl = organiserNameValue.replace(/ /g, "_");
                      navigate(`/organiser/${organiserId}/${organiserNameForUrl}`);
                    }}
                    style={{
                      cursor: "pointer",
                      color: "#da251c",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#b91e16")}
                    onMouseLeave={(e) => (e.target.style.color = "#da251c")}
                  >
                    {organiserName ||
                      event.organiser_name ||
                      eventDetails?.OrganiserName ||
                      "Sai Dwarkamai Foundation"}
                  </h5>
                  {event.organiser_description && (
                    <p>{event.organiser_description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            {faq && faq.length > 0 && (
              <div className="event-section">
                <h3 className="section-title">
                  <i className="fas fa-question-circle"></i> FAQ
                </h3>
                <div className="section-content">
                  <div className="faq-list">
                    {faq.map((item, index) => (
                      <div key={index} className="faq-item">
                        <h5 className="faq-question">{item.question}</h5>
                        <p className="faq-answer">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Info Card */}
          <div className="col-lg-4 col-md-5">
            <div className="event-info-card">
              {/* Registration Fee Box */}
              {Array.isArray(event.TicketDetails) &&
                event.TicketDetails.length > 0 &&
                (() => {
                  const prices = event.TicketDetails.map((t) =>
                    Number(t.ticket_price)
                  ).filter(Boolean);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <div className="registration-fee-box">
                      <span className="fee-label">Registration Fee</span>
                      <span className="fee-amount">
                        ₹{minPrice}
                        {minPrice !== maxPrice ? ` - ₹${maxPrice}` : ""}
                      </span>
                    </div>
                  );
                })()}

              <div className="registration-status-section">
                {registrationClosed ? (
                  <div className="status-badge closed">
                    <i className="fas fa-ban"></i> Registration Closed
                  </div>
                ) : registrationNotStarted ? (
                  <div className="status-badge soon" style={{ backgroundColor: '#ffc107', color: '#000' }}>
                    <i className="fas fa-clock"></i> Registration Soon
                  </div>
                ) : (
                  <div className="status-badge open">
                    <i className="fas fa-check-circle"></i> Registration Open
                  </div>
                )}
              </div>
              <div className="event-info-details">
                <div className="info-item">
                  <i className="fas fa-calendar-day"></i>
                  <div>
                    <span className="info-label1">Starts On</span>
                    <span className="info-value">
                      {formatDate(event.start_time)}{" "}
                      {formatTime(event.start_time)}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-calendar-times"></i>
                  <div>
                    <span className="info-label1">Ends On</span>
                    <span className="info-value">
                      {formatDate(event.end_time)} {formatTime(event.end_time)}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="info-label1">
                      Registration starting at
                    </span>
                    <span className="info-value">
                      {formatDate(event.registration_start_time)}{" "}
                      {formatTime(event.registration_start_time)}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="info-label1">Registration ending on</span>
                    <span className="info-value">
                      {formatDate(event.registration_end_time)}{" "}
                      {formatTime(event.registration_end_time)}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-flag"></i>
                  <div>
                    <span className="info-label1">Race Category</span>
                    <span className="info-value">
                      {tickets && tickets.length > 0
                        ? tickets.map((t) => t.ticket_name).join(", ")
                        : event.type_name || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-tag"></i>
                  <div>
                    <span className="info-label1">Category</span>
                    <span className="info-value">
                      {Array.isArray(event.category) &&
                        event.category.length > 0
                        ? event.category.map((cat) => cat.name).join(", ")
                        : event.category?.name || ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              {!registrationClosed && !registrationNotStarted && (
                <button
                  className="btn-register"
                  onClick={() => navigate(`/checkout/${eventId}`)}
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
