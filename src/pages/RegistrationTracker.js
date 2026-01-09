import React, { useState, useEffect } from "react";
import { authAPI } from "../services/authAPI";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./RegistrationTracker.css";
import TopNav from "../components/Navbar/TopNav";

export default function RegistrationTracker() {
    const [activeEvents, setActiveEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Handle PayU callback on component mount
    useEffect(() => {
        handlePayUCallback();
        fetchBookings();
    }, []);

    const handlePayUCallback = () => {
        // PayU sends payment response in URL parameters
        const status = searchParams.get('status');
        const txnid = searchParams.get('txnid');
        const mihpayid = searchParams.get('mihpayid'); // PayU transaction ID
        const amount = searchParams.get('amount');
        const hash = searchParams.get('hash');

        console.log("🔍 PayU Callback Parameters:", {
            status,
            txnid,
            mihpayid,
            amount,
            hash
        });

        if (status) {
            // Clear URL parameters after reading them
            setSearchParams({});

            if (status === 'success') {
                // Payment successful
                console.log("✅ Payment successful!");
                console.log("Transaction ID:", txnid);
                console.log("PayU Payment ID:", mihpayid);

                // TODO: Call booking confirmation API with payment details
                // Example: await authAPI.confirmBooking({ txnid, mihpayid, amount, status });

                alert(`🎉 Payment Successful!\n\nTransaction ID: ${txnid}\nAmount: ₹${amount}\n\nYour booking has been confirmed!`);
            } else if (status === 'failure') {
                // Payment failed
                console.log("❌ Payment failed!");
                console.log("Transaction ID:", txnid);

                alert(`❌ Payment Failed\n\nTransaction ID: ${txnid}\n\nPlease try again or contact support.`);
            } else {
                // Unknown status
                console.log("⚠️ Unknown payment status:", status);
            }
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getBookings();
            if (response && response.data) {
                setActiveEvents(response.data.activeEvents || []);
                setPastEvents(response.data.pastEvents || []);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderEventCard = (event) => (
        <div key={event.event_id} className="tracker-event-card">
            <div className="event-card-image">
                <img
                    src={event.banner_image || "https://via.placeholder.com/120x120"}
                    alt={event.name}
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/120x120?text=Event";
                    }}
                />
            </div>
            <div className="event-card-content">
                <h3 className="event-card-title">{event.display_name || event.name}</h3>
                <div className="event-card-info">
                    <div className="info-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>{event.start_date}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-clock"></i>
                        <span>{event.start_time_event}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.city_name}</span>
                    </div>
                </div>
                <div className="event-card-footer">
                    <span className="registration-count">{event.TotalCount} REGISTRATION</span>
                    <span className="separator">|</span>
                    <button
                        className="view-details-btn"
                        onClick={() => navigate(`/ticket-details/${event.event_id}`)}
                    >
                        VIEW DETAILS
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="registration-tracker-page">
            {/* Blue Header */}
            <TopNav />
            {/* Hero Section - copied from Contact page for exact blue section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="contact-hero-title">Registration Tracker</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>Registration Tracker</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="tracker-main-content">
                <div className="content-container">
                    {loading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading your registrations...</p>
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Events Section */}
                            <section className="events-section">
                                <h2 className="section-title">Upcoming Events</h2>
                                {activeEvents.length > 0 ? (
                                    <div className="events-list">
                                        {activeEvents.map(renderEventCard)}
                                    </div>
                                ) : (
                                    <div className="no-events">
                                        <p>No upcoming events</p>
                                    </div>
                                )}
                            </section>

                            {/* Past Events Section */}
                            <section className="events-section">
                                <h2 className="section-title">Past Events</h2>
                                {pastEvents.length > 0 ? (
                                    <div className="events-list">
                                        {pastEvents.map(renderEventCard)}
                                    </div>
                                ) : (
                                    <div className="no-events-illustration">
                                        <div className="clouds-illustration">
                                            <svg width="150" height="100" viewBox="0 0 150 100">
                                                <ellipse cx="50" cy="60" rx="30" ry="20" fill="#e0e0e0" opacity="0.6" />
                                                <ellipse cx="100" cy="50" rx="35" ry="25" fill="#d0d0d0" opacity="0.5" />
                                                <ellipse cx="75" cy="70" rx="25" ry="15" fill="#c0c0c0" opacity="0.4" />
                                                <path d="M 30 60 Q 50 40 70 60 Q 90 40 110 60" stroke="#b0b0b0" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.5" />
                                            </svg>
                                        </div>
                                        <p className="no-events-text">No registration booked yet.</p>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
