import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import { authAPI } from "../../services/authAPI";
import "./OrganiserPublicProfile.css";
import "../../components/hero/Hero.css";

export default function OrganiserPublicProfile() {
    const { organiserId, organiserName: organiserNameParam } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [organiserData, setOrganiserData] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [likedEvents, setLikedEvents] = useState({});

    // Message Modal States
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageForm, setMessageForm] = useState({
        fullname: '',
        email: '',
        contact_no: '',
        message: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchOrganiserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organiserId, organiserNameParam]);

    const fetchOrganiserData = async () => {
        setLoading(true);
        try {
            // Get logged-in user data from session storage
            const userData = JSON.parse(localStorage.getItem("userData") || "{}");
            const loggedInUserId = userData.ID || userData.id || userData.user_id;

            // Replace underscores with spaces in organiser name
            const organiserName = organiserNameParam ? organiserNameParam.replace(/_/g, " ") : "";

            // Call allOrganizerData API to get all organizer information in one call
            const organizerResponse = await authAPI.allOrganizerData({
                user_id: organiserId,
                organiser_name: organiserName,
            });

            if (organizerResponse && organizerResponse.data) {
                const data = organizerResponse.data;

                // Set organizer data
                if (data.Organizer && data.Organizer.length > 0) {
                    const organizerInfo = data.Organizer[0];
                    setOrganiserData({
                        ...organizerInfo,
                        banner_image: organizerInfo.banner_image,
                        logo_image: organizerInfo.logo_image,
                        name: organizerInfo.name,
                        about: organizerInfo.about,
                        join_on: organizerInfo.join_on,
                        is_follow: organizerInfo.is_follow,
                    });
                    setIsFollowing(organizerInfo.is_follow === 1);
                }

                // Set upcoming events
                if (data.UpcomingEvents && data.UpcomingEvents.length > 0) {
                    setUpcomingEvents(data.UpcomingEvents);
                } else {
                    setUpcomingEvents([]);
                }

                // Set past events - filter to ensure only past events are shown
                if (data.PastEvents && data.PastEvents.length > 0) {
                    const now = Date.now();
                    // Filter to only show events where start_time has already passed
                    const actualPastEvents = data.PastEvents.filter(
                        (event) => event.start_time * 1000 < now
                    );
                    setPastEvents(actualPastEvents);
                } else {
                    setPastEvents([]);
                }
            }

            // Also call getProfile API for additional profile data
            try {
                const profileResponse = await authAPI.getProfile({
                    user_id: organiserId,
                });
                if (profileResponse && profileResponse.data) {
                    // Merge profile data with existing organiser data
                    setOrganiserData((prev) => ({
                        ...prev,
                        ...profileResponse.data,
                        // Keep the data from allOrganizerData if it exists
                        banner_image: prev?.banner_image || profileResponse.data.banner_image,
                        logo_image: prev?.logo_image || profileResponse.data.logo_image || profileResponse.data.profile_image,
                        name: prev?.name || profileResponse.data.name,
                        about: prev?.about || profileResponse.data.about || profileResponse.data.description,
                    }));
                }
            } catch (profileError) {
                console.error("Error fetching profile:", profileError);
            }

            // Also call getEvents API for additional event data
            try {
                const eventsResponse = await authAPI.getEvents({
                    organiser_id: organiserId,
                });
                if (eventsResponse && eventsResponse.data && eventsResponse.data.EventData) {
                    // This can be used as fallback if allOrganizerData doesn't return events
                    console.log("Events from getEvents API:", eventsResponse.data.EventData);
                }
            } catch (eventsError) {
                console.error("Error fetching events:", eventsError);
            }

        } catch (error) {
            console.error("Error fetching organiser data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
        // TODO: Add API call to follow/unfollow organiser when API is available
    };

    const handleToggleLike = (eventId) => {
        setLikedEvents((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
        // TODO: Add API call to like/unlike event
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Message Modal Handlers
    const handleMessageInputChange = (e) => {
        const { name, value } = e.target;
        setMessageForm(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateMessageForm = () => {
        const errors = {};

        if (!messageForm.fullname.trim()) {
            errors.fullname = 'Full name is required';
        }

        if (!messageForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(messageForm.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!messageForm.contact_no.trim()) {
            errors.contact_no = 'Contact number is required';
        } else if (!/^\d{10}$/.test(messageForm.contact_no.trim())) {
            errors.contact_no = 'Please enter a valid 10-digit number';
        }

        if (!messageForm.message.trim()) {
            errors.message = 'Message is required';
        }

        return errors;
    };

    const handleSendMessage = async () => {
        const errors = validateMessageForm();

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authAPI.sendOrgMail(messageForm);

            if (response.status === 200) {
                alert('Message sent successfully!');
                // Reset form and close modal
                setMessageForm({
                    fullname: '',
                    email: '',
                    contact_no: '',
                    message: ''
                });
                setFormErrors({});
                setShowMessageModal(false);
            } else {
                alert(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert(error.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseMessageModal = () => {
        setShowMessageModal(false);
        setMessageForm({
            fullname: '',
            email: '',
            contact_no: '',
            message: ''
        });
        setFormErrors({});
    };

    if (loading) {
        return (
            <div className="organiser-public-profile-page">
                <TopNav />
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading organiser profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="organiser-public-profile-page">
            <TopNav />

            {/* Header Section with Banner */}
            <div className="organiser-header">
                <div className="organiser-banner">
                    <img
                        src={
                            organiserData?.banner_image ||
                            "https://via.placeholder.com/1200x300/1e3a8a/ffffff?text=Organiser+Banner"
                        }
                        alt="Organiser Banner"
                        className="banner-img"
                    />
                </div>

                <div className="container">
                    <div className="organiser-profile-section">
                        <div className="profile-image-wrapper">
                            <img
                                src={
                                    organiserData?.logo_image ||
                                    organiserData?.profile_image ||
                                    organiserData?.logo ||
                                    "https://via.placeholder.com/150/cccccc/333333?text=Logo"
                                }
                                alt="Organiser Logo"
                                className="profile-img"
                            />
                        </div>
                        <div className="profile-info">
                            <h1 className="organiser-name">
                                {organiserData?.name ||
                                    organiserData?.organiser_name ||
                                    "Jagdamb Foundation"}
                            </h1>
                            <p className="join-date">
                                Joined on{" "}
                                {organiserData?.join_on || "December 12, 2024"}
                            </p>
                        </div>
                        <div className="profile-actions">
                            <button
                                className={`btn-follow ${isFollowing ? "following" : ""}`}
                                onClick={handleFollowToggle}
                            >
                                <i
                                    className={`fas fa-${isFollowing ? "check" : "heart"}`}
                                ></i>{" "}
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            <button className="btn-message" onClick={() => setShowMessageModal(true)}>
                                <i className="fas fa-envelope"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="container mt-4">
                <div className="about-section">
                    <h2 className="section-title">About</h2>
                    <p className="about-text">
                        {organiserData?.about ||
                            organiserData?.description ||
                            "At Jagdamb Foundation, we are dedicated to promoting health and unity through our exciting events. We are proud to host the 'Ajinkyatara Fort Run', the first-ever fort run in Raighari Satara. Scheduled on February 9th, 2025. This run offers runners of all ages to participate and celebrate the spirit of togetherness. Our team works tirelessly to ensure a memorable experience, from registration to race day, embodying our motto: 'One Run for Social Unity.' Join us as we run through history and beautiful landscapes!"}
                    </p>
                </div>

                {/* Upcoming Events Section */}
                <div className="events-section mt-5">
                    <h2 className="section-title">Upcoming Events</h2>
                    {upcomingEvents.length > 0 ? (
                        <div className="row g-4 mt-3">
                            {upcomingEvents.map((event) => {
                                const eventDate = new Date(event.start_time * 1000);
                                const day = eventDate.getDate();
                                const month = eventDate.toLocaleString("en-US", {
                                    month: "short",
                                });
                                const registerBy = new Date(
                                    event.registration_end_time * 1000
                                ).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                });
                                const isOpen =
                                    event.registration_end_time * 1000 > Date.now();

                                return (
                                    <div className="col-lg-3 col-md-6 col-12" key={event.id}>
                                        <div className="event-card1">
                                            {/* Event Image */}
                                            <div className="event-card-img-wrapper">
                                                <img
                                                    src={
                                                        event.banner_image ||
                                                        require("../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg")
                                                    }
                                                    alt={event.name}
                                                    className="event-card-img1"
                                                />
                                                <span className="event-card-badge navi-mumbai-badge">
                                                    <i
                                                        className="fas fa-map-marker-alt"
                                                        style={{ marginRight: 4 }}
                                                    ></i>
                                                    {event.city_name || "Location"}
                                                </span>
                                                <button
                                                    className={`search-like-btn${likedEvents[event.id] ? " liked" : ""
                                                        }`}
                                                    aria-label="Like"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleLike(event.id);
                                                    }}
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
                                                {/* Date Badge */}
                                                <div className="event-date-badge">
                                                    <div className="date-month">{month.toUpperCase()}</div>
                                                    <div className="date-day">{day}</div>
                                                </div>

                                                {/* Event Title */}
                                                <h3 className="event-card-title1">{event.name}</h3>

                                                {/* Register By */}
                                                <p className="event-register-by">
                                                    Register by : <span className="register-date-red">{registerBy}</span>
                                                </p>

                                                {/* Footer with Status and Button */}
                                                <div className="event-card-footer">
                                                    <div className={`registration-badge ${isOpen ? 'open' : 'closed'}`}>
                                                        <i className={`fas fa-${isOpen ? "check-circle" : "ban"}`}></i>
                                                        {isOpen ? "Registration Open" : "Registration Closed"}
                                                    </div>
                                                    <button
                                                        className="btn-register-card"
                                                        onClick={() => navigate(`/event/${event.id}`)}
                                                    >
                                                        {isOpen ? "Register" : "View"} <i className="fas fa-arrow-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-events-message">
                            <i className="fas fa-calendar-times"></i>
                            <p>No upcoming events found</p>
                        </div>
                    )}
                </div>

                {/* Past Events Section */}
                <div className="events-section mt-5 mb-5">
                    <h2 className="section-title">Past Events</h2>
                    {pastEvents.length > 0 ? (
                        <div className="row g-4 mt-3">
                            {pastEvents.map((event) => {
                                const eventDate = new Date(event.start_time * 1000);
                                const day = eventDate.getDate();
                                const month = eventDate.toLocaleString("en-US", {
                                    month: "short",
                                });

                                return (
                                    <div className="col-lg-3 col-md-6 col-12" key={event.id}>
                                        <div className="event-card1 past-event">
                                            {/* Event Image */}
                                            <div className="event-card-img-wrapper">
                                                <img
                                                    src={
                                                        event.banner_image ||
                                                        require("../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg")
                                                    }
                                                    alt={event.name}
                                                    className="event-card-img1"
                                                />
                                                <span className="event-card-badge navi-mumbai-badge">
                                                    <i
                                                        className="fas fa-map-marker-alt"
                                                        style={{ marginRight: 4 }}
                                                    ></i>
                                                    {event.city_name || "Location"}
                                                </span>
                                                <button
                                                    className={`search-like-btn${likedEvents[event.id] ? " liked" : ""
                                                        }`}
                                                    aria-label="Like"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleLike(event.id);
                                                    }}
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
                                                {/* Date Badge */}
                                                <div className="event-date-badge">
                                                    <div className="date-month">{month.toUpperCase()}</div>
                                                    <div className="date-day">{day}</div>
                                                </div>

                                                {/* Event Title */}
                                                <h3 className="event-card-title1">{event.name}</h3>

                                                {/* Footer with Status and Button */}
                                                <div className="event-card-footer" style={{ marginTop: '20px' }}>
                                                    <div className="registration-badge closed">
                                                        <i className="fas fa-calendar-check"></i>
                                                        Event Completed
                                                    </div>
                                                    <button
                                                        className="btn-register-card"
                                                        onClick={() => navigate(`/event/${event.id}`)}
                                                    >
                                                        View <i className="fas fa-arrow-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-events-message">
                            <div className="no-events-icon">
                                <svg
                                    width="150"
                                    height="150"
                                    viewBox="0 0 200 200"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        stroke="#e0e0e0"
                                        strokeWidth="3"
                                        strokeDasharray="10 5"
                                        fill="none"
                                    />
                                    <path
                                        d="M70 100 Q100 70 130 100"
                                        stroke="#ccc"
                                        strokeWidth="3"
                                        fill="none"
                                    />
                                    <circle cx="85" cy="85" r="5" fill="#ccc" />
                                    <circle cx="115" cy="85" r="5" fill="#ccc" />
                                </svg>
                            </div>
                            <p className="no-events-text">Sorry, We couldn't find past event.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Features Section */}
            <div className="features-section">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <h5 className="feature-title">Round The Clock Support</h5>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <i className="fas fa-user-check"></i>
                                </div>
                                <h5 className="feature-title">Personalized Experience</h5>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <h5 className="feature-title">Data Driven Metrics</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="modal-overlay" onClick={handleCloseMessageModal}>
                    <div className="message-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <i className="fas fa-comment-dots"></i> Send Message To Organiser
                            </h2>
                            <button className="modal-close-btn" onClick={handleCloseMessageModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Full Name */}
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="fullname"
                                    className={`form-input ${formErrors.fullname ? 'error' : ''}`}
                                    placeholder="Your Full Name*"
                                    value={messageForm.fullname}
                                    onChange={handleMessageInputChange}
                                />
                                {formErrors.fullname && (
                                    <span className="error-message">{formErrors.fullname}</span>
                                )}
                            </div>

                            {/* Email and Contact Number */}
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                                        placeholder="Your Email Address*"
                                        value={messageForm.email}
                                        onChange={handleMessageInputChange}
                                    />
                                    {formErrors.email && (
                                        <span className="error-message">{formErrors.email}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="tel"
                                        name="contact_no"
                                        className={`form-input ${formErrors.contact_no ? 'error' : ''}`}
                                        placeholder="Your Contact number*"
                                        value={messageForm.contact_no}
                                        onChange={handleMessageInputChange}
                                        maxLength="10"
                                    />
                                    {formErrors.contact_no && (
                                        <span className="error-message">{formErrors.contact_no}</span>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="form-group">
                                <textarea
                                    name="message"
                                    className={`form-textarea ${formErrors.message ? 'error' : ''}`}
                                    placeholder="Your Message*"
                                    value={messageForm.message}
                                    onChange={handleMessageInputChange}
                                    rows="5"
                                ></textarea>
                                {formErrors.message && (
                                    <span className="error-message">{formErrors.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={handleCloseMessageModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-send"
                                onClick={handleSendMessage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            <Footer />
        </div >
    );
}
