import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./SecureCheckout.css";

export default function SecureCheckout() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    checkUserLoginAndFetch();
  }, [eventId]);

  const checkUserLoginAndFetch = async () => {
    // Check if user has token/userData in localStorage
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      // No token or userData, redirect to login
      navigate("/login");
      return;
    }

    try {
      // Get user_id from localStorage if available
      let user_id = null;
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          user_id = parsed.ID || parsed.id || null;
        } catch (e) {
          console.error("Error parsing userData:", e);
        }
      }

      // Call last login check API
      const result = await authAPI.checkUserLastLoginDetails(user_id);

      if (result.data === 1) {
        // Not logged in or session expired, redirect to login
        navigate("/login");
        return;
      }

      // User is logged in, proceed to fetch event details
      fetchEventDetails();
    } catch (error) {
      console.error("Login check error:", error);
      // If API fails (404, etc.), but user has valid token, proceed anyway
      // This allows the page to work even if the API endpoint doesn't exist yet
      fetchEventDetails();
    }
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch event details from events API
      const eventsResponse = await authAPI.getEvents({ event_id: eventId });
      let eventData = null;
      if (
        eventsResponse &&
        eventsResponse.data &&
        eventsResponse.data.EventData &&
        eventsResponse.data.EventData.length > 0
      ) {
        eventData = eventsResponse.data.EventData[0];
        setEvent(eventData);
      }

      // Step 2: Fetch ticket details using get_event_ticket API
      const ticketResponse = await authAPI.getEventTicket(eventId);
      console.log("get_event_ticket response:", ticketResponse);

      if (ticketResponse && ticketResponse.data) {
        // Get event_tickets array from response
        const eventTickets = ticketResponse.data.event_tickets || [];
        setTickets(eventTickets);
        // If events API did not return event data, try to use EventData from ticket response
        if (
          !eventData &&
          ticketResponse.data.EventData &&
          ticketResponse.data.EventData.length > 0
        ) {
          setEvent(ticketResponse.data.EventData[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleAddTicket = (ticket) => {
    if (selectedTicket) {
      alert("Only single category selection is allowed.");
      return;
    }
    setSelectedTicket(ticket);
  };

  const handleRemoveTicket = () => {
    setSelectedTicket(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="secure-checkout-page">
        <TopNav />
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="secure-checkout-page">
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

  return (
    <div className="secure-checkout-page">
      <TopNav />

      {/* Blue Header Section */}
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">SECURE CHECKOUT</h1>
              <nav className="contact-breadcrumb">
                <span onClick={() => navigate("/")}>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Register Now</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container checkout-container">
        <div className="row">
          {/* Left Column - Event Details & Category Selection */}
          <div className="col-lg-8">
            {/* Event Info Box */}
            <div className="event-info-box">
              <button className="back-button" onClick={handleBack}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              {(() => {
                const eventInfo = `${event.name || ""} | ${formatDate(
                  event.start_time
                )} | ${event.city_name || "Noida"}`;
                localStorage.setItem("eventInfo", eventInfo);
                return (
                  <>
                    <h2 className="event-name">{event.name}</h2>
                    <p className="event-date-location">
                      {formatDate(event.start_time)} |{" "}
                      {event.city_name || "Noida"}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Warning Message */}
            {selectedTicket && (
              <div className="warning-message">
                <i className="fas fa-exclamation-circle"></i>
                Only single category selection is allowed.
              </div>
            )}

            {/* Category Selection */}
            <div className="category-selection-section">
              {tickets.length > 0 ? (
                tickets.map((ticket, index) => (
                  <div key={index} className="category-card1">
                    <div className="category-header">
                      <h3 className="category-title">
                        {ticket.ticket_name || ticket.display_ticket_name}
                      </h3>
                    </div>
                    <div className="category-content">
                      {/* Display dynamic ticket description from API */}
                      {ticket.ticket_description && (
                        <div className="ticket-description">
                          {ticket.ticket_description
                            .split("\n")
                            .map((line, idx) => {
                              const trimmed = line.trim();
                              const showTick =
                                trimmed.length > 0 && !line.startsWith(" ");
                              return (
                                <div key={idx} className="feature-item">
                                  {showTick && (
                                    <i className="fas fa-check-circle"></i>
                                  )}
                                  <span>{line}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Fallback if no description */}
                      {!ticket.ticket_description && (
                        <div className="category-features">
                          <div className="feature-item">
                            <i className="fas fa-user-friends"></i>
                            <span>Participant Entitlements</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-id-badge"></i>
                            <span>Timed Bib</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-medal"></i>
                            <span>Finisher Medal</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-tshirt"></i>
                            <span>Race Day T-shirt</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-utensils"></i>
                            <span>Breakfast after the run</span>
                          </div>
                        </div>
                      )}

                      <div className="category-footer">
                        <div className="category-price">
                          ₹{ticket.ticket_price}
                        </div>
                        {selectedTicket?.id === ticket.id ? (
                          <button
                            className="btn-remove"
                            onClick={handleRemoveTicket}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="btn-add"
                            onClick={() => handleAddTicket(ticket)}
                            disabled={selectedTicket !== null}
                          >
                            <i className="fas fa-plus"></i> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tickets-message">
                  <p>No tickets available for this event.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Registration Summary */}
          <div className="col-lg-4">
            <div className="registration-summary">
              {selectedTicket ? (
                <>
                  <div className="summary-box">
                    <h3 className="summary-heading">SUMMARY</h3>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Price (1 Registration)</span>
                        <span>
                          ₹
                          {selectedTicket.ticket_price?.toFixed(2) ||
                            selectedTicket.ticket_price}
                        </span>
                      </div>
                      <div className="summary-row total">
                        <span>Total Amount</span>
                        <span className="summary-total-amount">
                          ₹
                          {(() => {
                            const price =
                              selectedTicket.ticket_price?.toFixed(2) ||
                              selectedTicket.ticket_price;
                            localStorage.setItem("summaryTotalAmount", price);
                            return price;
                          })()}
                        </span>
                      </div>
                      <div className="summary-note">(Exclusive of Taxes)</div>
                    </div>
                    <button
                      className="btn-proceed"
                      onClick={() => {
                        // Store selected category title for next page
                        const title =
                          selectedTicket.ticket_name ||
                          selectedTicket.display_ticket_name ||
                          "";
                        localStorage.setItem("selectedCategoryTitle", title);
                        navigate(`/participant-details/${eventId}`);
                      }}
                    >
                      <i className="fas fa-users"></i>
                      <span className="proceed-count">1</span>
                      <span className="proceed-text">PROCEED</span>
                      <i className="fas fa-arrow-right proceed-arrow"></i>
                    </button>
                  </div>
                  <div className="coupon-box">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Enter coupon code"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="summary-header">
                    <img
                      src={require("../../assets/image/registraction.png")}
                      alt="No Registration"
                      className="summary-icon"
                    />
                  </div>
                  <h3 className="summary-title">No Registration Added</h3>
                  <p className="summary-text">Select a category to continue</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
