import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";
import TopNav from "../components/Navbar/TopNav";
import "./TicketDetails.css";

export default function TicketDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, [eventId]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.getEventBookingTickets(eventId);

            if (response && response.data && response.data.BookingData) {
                setTickets(response.data.BookingData);
            } else {
                setTickets([]);
            }
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError("Failed to load tickets. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = (ticket) => {
        // TODO: Implement ticket download functionality
        console.log("Download ticket:", ticket.unique_ticket_id);
        alert(`Downloading ticket: ${ticket.unique_ticket_id}`);
    };

    const formatPrice = (price) => {
        return `₹${parseFloat(price).toFixed(2)}`;
    };

    return (
        <div className="ticket-details-page">
            <TopNav />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="contact-hero-title">Ticket Details</h1>
                            <nav className="contact-breadcrumb">
                                <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span onClick={() => navigate("/registration-tracker")} style={{ cursor: "pointer" }}>Registration Tracker</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>Ticket Details</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="ticket-details-content">
                <div className="content-container">
                    {/* Back Button */}
                    <button className="back-button" onClick={() => navigate("/registration-tracker")}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>

                    {loading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading tickets...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                            <button onClick={fetchTickets} className="retry-button">
                                Try Again
                            </button>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="no-tickets">
                            <i className="fas fa-ticket-alt"></i>
                            <p>No tickets found for this event.</p>
                        </div>
                    ) : (
                        <div className="tickets-grid">
                            {tickets.map((ticket, index) => (
                                <div key={index} className="ticket-card">
                                    {/* Left Section - Event Image */}
                                    <div className="ticket-left">
                                        <img
                                            src={ticket.banner_image || "https://via.placeholder.com/300x400"}
                                            alt={ticket.name}
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/300x400?text=Event";
                                            }}
                                        />
                                    </div>

                                    {/* Right Section - Ticket Details */}
                                    <div className="ticket-right">
                                        {/* Top Section with Badges */}
                                        <div className="ticket-top-section">
                                            <div className="ticket-badges">
                                                <div className="badge-item date-badge">
                                                    <i className="fas fa-calendar-alt"></i>
                                                    <span>{ticket.event_start_date}</span>
                                                </div>
                                                <div className="badge-item time-badge">
                                                    <i className="fas fa-clock"></i>
                                                    <span>{ticket.event_time}</span>
                                                </div>
                                                <div className="badge-item qr-badge">
                                                    QR
                                                </div>
                                            </div>
                                            <div className="registration-id-badge">
                                                <div className="reg-id-label">REGISTRATION ID</div>
                                                <div className="reg-id-value">{ticket.unique_ticket_id}</div>
                                            </div>
                                        </div>

                                        {/* Event Title */}
                                        <h2 className="ticket-event-title">{ticket.EventName}</h2>

                                        {/* Participant Name */}
                                        <div className="ticket-participant-name">{ticket.attendee_name}</div>

                                        {/* Price */}
                                        <div className="ticket-price-display">
                                            {formatPrice(ticket.strike_out_price)}
                                        </div>

                                        {/* Race Category Box */}
                                        <div className="ticket-race-category">
                                            <span className="category-label">Race Category :</span>
                                            <span className="category-value">{ticket.TicketName}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="ticket-actions">
                                            <button
                                                className="action-btn download-btn"
                                                onClick={() => handleDownloadTicket(ticket)}
                                                title="Download Ticket"
                                            >
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button
                                                className="action-btn share-btn"
                                                title="Share Ticket"
                                            >
                                                <i className="fas fa-share-alt"></i>
                                            </button>
                                            <button
                                                className="action-btn print-btn"
                                                title="Print Ticket"
                                            >
                                                <i className="fas fa-print"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
