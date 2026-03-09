import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";
import TopNav from "../components/Navbar/TopNav";
import { QRCodeCanvas } from "qrcode.react";
import "./TicketDetails.css";
export default function TicketDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTicketForQR, setSelectedTicketForQR] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedTicketForShare, setSelectedTicketForShare] = useState(null);
    const [sharingInProgress, setSharingInProgress] = useState(false);
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
    const handleDownloadTicket = async (ticket) => {
        try {
            console.log("?? Starting ticket download...");
            console.log("Ticket ID:", ticket.unique_ticket_id);
            const payload = {
                ticket: {
                    id: ticket.id,
                    booking_details_id: ticket.booking_details_id,
                    ticket_id: ticket.ticket_id,
                    attendee_details: ticket.attendee_details,
                    email: ticket.email || "",
                    mobile: ticket.mobile || "",
                    created_at: ticket.created_at,
                    registration_id: ticket.registration_id,
                    ticket_price: ticket.ticket_price,
                    final_ticket_price: ticket.final_ticket_price,
                    bulk_upload_flag: ticket.bulk_upload_flag || 0,
                    cart_detail: ticket.cart_detail || "",
                    category_change_flag: ticket.category_change_flag || 0,
                    category_change_date: ticket.category_change_date || 0,
                    booking_id: ticket.booking_id,
                    event_id: ticket.event_id,
                    user_id: ticket.user_id,
                    quantity: ticket.quantity || 1,
                    ticket_amount: ticket.ticket_amount,
                    ticket_discount: ticket.ticket_discount || 0,
                    booking_date: ticket.booking_date,
                    total_amount: ticket.total_amount,
                    total_discount: ticket.total_discount || 0,
                    utm_campaign: ticket.utm_campaign || "",
                    cart_details: ticket.cart_details,
                    transaction_status: ticket.transaction_status,
                    booking_pay_id: ticket.booking_pay_id,
                    attendeeId: ticket.attendeeId,
                    TicketName: ticket.TicketName,
                    TicketStatus: ticket.TicketStatus,
                    EventName: ticket.EventName,
                    EventStartDateTime: ticket.EventStartDateTime,
                    banner_image: ticket.banner_image,
                    event_start_date: ticket.event_start_date,
                    event_time: ticket.event_time,
                    strike_out_price: ticket.strike_out_price,
                    name: ticket.name,
                    display_name: ticket.display_name,
                    unique_ticket_id: ticket.unique_ticket_id,
                    attendee_name: ticket.attendee_name || " "
                },
                event_link: ticket.event_link || ""
            };
            console.log("?? Calling generatePDF API...");
            const response = await authAPI.generatePDF(payload);
            console.log("?? API Response:", response);
            if (response && response.data && response.data.pdf_link) {
                console.log("? PDF Link received:", response.data.pdf_link);
                // Create a temporary link element to trigger download
                const link = document.createElement('a');
                link.href = response.data.pdf_link;
                link.download = `Ticket_${ticket.unique_ticket_id}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log("? Ticket PDF download initiated successfully");
            } else if (response && response.message) {
                console.warn("?? API returned message:", response.message);
                alert(response.message);
            } else {
                console.error("? Invalid API response");
                alert("Failed to generate PDF");
            }
        } catch (error) {
            console.error("? Error downloading ticket:", error);
            console.error("Error details:", error.response || error.message);
            alert(error?.message || "Failed to download ticket. Please try again.");
        }
    };
    const handlePrintTicket = async (ticket) => {
        try {
            console.log("??? Starting ticket print...");
            console.log("Ticket ID:", ticket.unique_ticket_id);
            const payload = {
                ticket: {
                    id: ticket.id,
                    booking_details_id: ticket.booking_details_id,
                    ticket_id: ticket.ticket_id,
                    attendee_details: ticket.attendee_details,
                    email: ticket.email || "",
                    mobile: ticket.mobile || "",
                    created_at: ticket.created_at,
                    registration_id: ticket.registration_id,
                    ticket_price: ticket.ticket_price,
                    final_ticket_price: ticket.final_ticket_price,
                    bulk_upload_flag: ticket.bulk_upload_flag || 0,
                    cart_detail: ticket.cart_detail || "",
                    category_change_flag: ticket.category_change_flag || 0,
                    category_change_date: ticket.category_change_date || 0,
                    booking_id: ticket.booking_id,
                    event_id: ticket.event_id,
                    user_id: ticket.user_id,
                    quantity: ticket.quantity || 1,
                    ticket_amount: ticket.ticket_amount,
                    ticket_discount: ticket.ticket_discount || 0,
                    booking_date: ticket.booking_date,
                    total_amount: ticket.total_amount,
                    total_discount: ticket.total_discount || 0,
                    utm_campaign: ticket.utm_campaign || "",
                    cart_details: ticket.cart_details,
                    transaction_status: ticket.transaction_status,
                    booking_pay_id: ticket.booking_pay_id,
                    attendeeId: ticket.attendeeId,
                    TicketName: ticket.TicketName,
                    TicketStatus: ticket.TicketStatus,
                    EventName: ticket.EventName,
                    EventStartDateTime: ticket.EventStartDateTime,
                    banner_image: ticket.banner_image,
                    event_start_date: ticket.event_start_date,
                    event_time: ticket.event_time,
                    strike_out_price: ticket.strike_out_price,
                    name: ticket.name,
                    display_name: ticket.display_name,
                    unique_ticket_id: ticket.unique_ticket_id,
                    attendee_name: ticket.attendee_name || " "
                },
                event_link: ticket.event_link || ""
            };
            console.log("?? Calling generatePDF API for printing...");
            const response = await authAPI.generatePDF(payload);
            console.log("?? API Response:", response);
            if (response && response.data && response.data.pdf_link) {
                console.log("? PDF Link received:", response.data.pdf_link);
                // Open PDF in new window and trigger print dialog
                const printWindow = window.open(response.data.pdf_link, '_blank');
                if (printWindow) {
                    printWindow.onload = function () {
                        printWindow.print();
                    };
                }
                console.log("? Print dialog opened successfully");
            } else if (response && response.message) {
                console.warn("?? API returned message:", response.message);
                alert(response.message);
            } else {
                console.error("? Invalid API response");
                alert("Failed to generate PDF for printing");
            }
        } catch (error) {
            console.error("? Error printing ticket:", error);
            console.error("Error details:", error.response || error.message);
            alert(error?.message || "Failed to print ticket. Please try again.");
        }
    };
    const handleOpenShare = (ticket) => {
        setSelectedTicketForShare(ticket);
        setShowShareModal(true);
    };

    const handleCloseShare = () => {
        setShowShareModal(false);
        setSelectedTicketForShare(null);
        setSharingInProgress(false);
    };

    const handleShareViaWhatsApp = async (ticket) => {
        try {
            setSharingInProgress(true);
            const payload = {
                ticket: {
                    id: ticket.id,
                    booking_details_id: ticket.booking_details_id,
                    ticket_id: ticket.ticket_id,
                    attendee_details: ticket.attendee_details,
                    email: ticket.email || "",
                    mobile: ticket.mobile || "",
                    created_at: ticket.created_at,
                    registration_id: ticket.registration_id,
                    ticket_price: ticket.ticket_price,
                    final_ticket_price: ticket.final_ticket_price,
                    bulk_upload_flag: ticket.bulk_upload_flag || 0,
                    cart_detail: ticket.cart_detail || "",
                    category_change_flag: ticket.category_change_flag || 0,
                    category_change_date: ticket.category_change_date || 0,
                    booking_id: ticket.booking_id,
                    event_id: ticket.event_id,
                    user_id: ticket.user_id,
                    quantity: ticket.quantity || 1,
                    ticket_amount: ticket.ticket_amount,
                    ticket_discount: ticket.ticket_discount || 0,
                    booking_date: ticket.booking_date,
                    total_amount: ticket.total_amount,
                    total_discount: ticket.total_discount || 0,
                    utm_campaign: ticket.utm_campaign || "",
                    cart_details: ticket.cart_details,
                    transaction_status: ticket.transaction_status,
                    booking_pay_id: ticket.booking_pay_id,
                    attendeeId: ticket.attendeeId,
                    TicketName: ticket.TicketName,
                    TicketStatus: ticket.TicketStatus,
                    EventName: ticket.EventName,
                    EventStartDateTime: ticket.EventStartDateTime,
                    banner_image: ticket.banner_image,
                    event_start_date: ticket.event_start_date,
                    event_time: ticket.event_time,
                    strike_out_price: ticket.strike_out_price,
                    name: ticket.name,
                    display_name: ticket.display_name,
                    unique_ticket_id: ticket.unique_ticket_id,
                    attendee_name: ticket.attendee_name || " "
                },
                event_link: ticket.event_link || ""
            };

            const response = await authAPI.generatePDF(payload);
            if (response && response.data && response.data.pdf_link) {
                const text = `Check out my ticket for ${ticket.EventName}: ${response.data.pdf_link}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                handleCloseShare();
            } else {
                alert("Failed to generate PDF for sharing");
            }
        } catch (error) {
            console.error("Error sharing via WhatsApp:", error);
            alert("Failed to share via WhatsApp");
        } finally {
            setSharingInProgress(false);
        }
    };

    const handleShareViaEmail = async (ticket) => {
        try {
            console.log("?? Starting email share for ticket:", ticket.unique_ticket_id);
            setSharingInProgress(true);
            const payload = {
                ticket: {
                    id: ticket.id,
                    booking_details_id: ticket.booking_details_id,
                    ticket_id: ticket.ticket_id,
                    attendee_details: ticket.attendee_details,
                    email: ticket.email || "",
                    mobile: ticket.mobile || "",
                    created_at: ticket.created_at,
                    registration_id: ticket.registration_id,
                    ticket_price: ticket.ticket_price,
                    final_ticket_price: ticket.final_ticket_price,
                    bulk_upload_flag: ticket.bulk_upload_flag || 0,
                    cart_detail: ticket.cart_detail || "",
                    category_change_flag: ticket.category_change_flag || 0,
                    category_change_date: ticket.category_change_date || 0,
                    booking_id: ticket.booking_id,
                    event_id: ticket.event_id,
                    user_id: ticket.user_id,
                    quantity: ticket.quantity || 1,
                    ticket_amount: ticket.ticket_amount,
                    ticket_discount: ticket.ticket_discount || 0,
                    booking_date: ticket.booking_date,
                    total_amount: ticket.total_amount,
                    total_discount: ticket.total_discount || 0,
                    utm_campaign: ticket.utm_campaign || "",
                    cart_details: ticket.cart_details,
                    transaction_status: ticket.transaction_status,
                    booking_pay_id: ticket.booking_pay_id,
                    attendeeId: ticket.attendeeId,
                    TicketName: ticket.TicketName,
                    TicketStatus: ticket.TicketStatus,
                    EventName: ticket.EventName,
                    EventStartDateTime: ticket.EventStartDateTime,
                    banner_image: ticket.banner_image,
                    event_start_date: ticket.event_start_date,
                    event_time: ticket.event_time,
                    strike_out_price: ticket.strike_out_price,
                    name: ticket.name,
                    display_name: ticket.display_name,
                    unique_ticket_id: ticket.unique_ticket_id,
                    attendee_name: ticket.attendee_name || " "
                },
                event_link: ticket.event_link || ""
            };

            const response = await authAPI.generatePDF(payload);
            console.log("?? PDF API Response for Email:", response);

            if (response && response.data && response.data.pdf_link) {
                const pdfLink = response.data.pdf_link;
                console.log("? PDF Link received:", pdfLink);

                const eventName = ticket.EventName || "Your Ticket";
                const subject = encodeURIComponent(`Ticket for ${eventName}`);
                const body = encodeURIComponent(`Hi,\n\nPlease find the ticket for ${eventName} below:\n\n${pdfLink}\n\nRegistration ID: ${ticket.unique_ticket_id}`);
                const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

                console.log("?? Triggering mailto with window.open");
                window.open(mailtoLink, '_blank');

                setTimeout(() => {
                    handleCloseShare();
                }, 500);
            } else {
                console.error("? PDF generation failed - no link in response");
                alert(response?.message || "Failed to generate PDF for sharing");
            }
        } catch (error) {
            console.error("? Error sharing via Email:", error);
            alert("Failed to share via Email. Please ensure you have an email client configured.");
        } finally {
            setSharingInProgress(false);
        }
    };

    const handleCopyLink = async (ticket) => {
        try {
            console.log("?? Copying link for ticket:", ticket.unique_ticket_id);
            setSharingInProgress(true);
            const payload = {
                ticket: {
                    id: ticket.id,
                    booking_details_id: ticket.booking_details_id,
                    ticket_id: ticket.ticket_id,
                    attendee_details: ticket.attendee_details,
                    email: ticket.email || "",
                    mobile: ticket.mobile || "",
                    created_at: ticket.created_at,
                    registration_id: ticket.registration_id,
                    ticket_price: ticket.ticket_price,
                    final_ticket_price: ticket.final_ticket_price,
                    bulk_upload_flag: ticket.bulk_upload_flag || 0,
                    cart_detail: ticket.cart_detail || "",
                    category_change_flag: ticket.category_change_flag || 0,
                    category_change_date: ticket.category_change_date || 0,
                    booking_id: ticket.booking_id,
                    event_id: ticket.event_id,
                    user_id: ticket.user_id,
                    quantity: ticket.quantity || 1,
                    ticket_amount: ticket.ticket_amount,
                    ticket_discount: ticket.ticket_discount || 0,
                    booking_date: ticket.booking_date,
                    total_amount: ticket.total_amount,
                    total_discount: ticket.total_discount || 0,
                    utm_campaign: ticket.utm_campaign || "",
                    cart_details: ticket.cart_details,
                    transaction_status: ticket.transaction_status,
                    booking_pay_id: ticket.booking_pay_id,
                    attendeeId: ticket.attendeeId,
                    TicketName: ticket.TicketName,
                    TicketStatus: ticket.TicketStatus,
                    EventName: ticket.EventName,
                    EventStartDateTime: ticket.EventStartDateTime,
                    banner_image: ticket.banner_image,
                    event_start_date: ticket.event_start_date,
                    event_time: ticket.event_time,
                    strike_out_price: ticket.strike_out_price,
                    name: ticket.name,
                    display_name: ticket.display_name,
                    unique_ticket_id: ticket.unique_ticket_id,
                    attendee_name: ticket.attendee_name || " "
                },
                event_link: ticket.event_link || ""
            };

            const response = await authAPI.generatePDF(payload);
            if (response && response.data && response.data.pdf_link) {
                await navigator.clipboard.writeText(response.data.pdf_link);
                alert("Ticket link copied to clipboard!");
                handleCloseShare();
            } else {
                alert("Failed to generate PDF link");
            }
        } catch (error) {
            console.error("Error copying link:", error);
            alert("Failed to copy link");
        } finally {
            setSharingInProgress(false);
        }
    };

    const handleOpenQR = (ticket) => {
        setSelectedTicketForQR(ticket);
        setShowQRModal(true);
    };
    const handleCloseQR = () => {
        setShowQRModal(false);
        setSelectedTicketForQR(null);
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
                            <h1 className="contact-hero-title">Registration Details</h1>
                            <nav className="contact-breadcrumb">
                                <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span onClick={() => navigate("/registration-tracker")} style={{ cursor: "pointer" }}>Registration Tracker</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>Registration Details</span>
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
                                                <div
                                                    className="badge-item qr-badge"
                                                    onClick={() => handleOpenQR(ticket)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="View QR Code"
                                                >
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
                                                title="Download"
                                            >
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button
                                                className="action-btn share-btn"
                                                title="Share "
                                                onClick={() => handleOpenShare(ticket)}
                                            >
                                                <i className="fas fa-share-alt"></i>
                                            </button>
                                            <button
                                                className="action-btn print-btn"
                                                onClick={() => handlePrintTicket(ticket)}
                                                title="Print "
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
                {showQRModal && selectedTicketForQR && (
                    <div className="qr-modal-overlay" onClick={handleCloseQR}>
                        <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="qr-modal-close" onClick={handleCloseQR}>&times;</button>
                            <div className="qr-modal-header">
                                <h3>Ticket QR Code</h3>
                                <p>Scan for Registration Details</p>
                            </div>
                            <div className="qr-modal-body">
                                <div className="qr-canvas-container">
                                    <QRCodeCanvas
                                        value={selectedTicketForQR.unique_ticket_id || ""}
                                        size={256}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <div className="qr-ticket-info">
                                    <div className="qr-info-row">
                                        <span className="qr-info-label">Registration ID:</span>
                                        <span className="qr-info-value">{selectedTicketForQR.unique_ticket_id}</span>
                                    </div>
                                    <div className="qr-info-row">
                                        <span className="qr-info-label">Participant:</span>
                                        <span className="qr-info-value">{selectedTicketForQR.attendee_name}</span>
                                    </div>
                                    <div className="qr-info-row">
                                        <span className="qr-info-label">Category:</span>
                                        <span className="qr-info-value">{selectedTicketForQR.TicketName}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="qr-modal-footer">
                                <button className="qr-close-btn" onClick={handleCloseQR}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
                {showShareModal && selectedTicketForShare && (
                    <div className="share-modal-overlay" onClick={handleCloseShare}>
                        <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="share-modal-close" onClick={handleCloseShare}>&times;</button>
                            <div className="share-modal-header">
                                <h3>Registration Details</h3>
                                <p>Select a platform to share your ticket</p>
                            </div>
                            <div className="share-modal-body">
                                {sharingInProgress ? (
                                    <div className="sharing-loader">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>Generating PDF link...</p>
                                    </div>
                                ) : (
                                    <div className="share-options">
                                        <button
                                            className="share-option-btn whatsapp"
                                            onClick={() => handleShareViaWhatsApp(selectedTicketForShare)}
                                        >
                                            <i className="fab fa-whatsapp"></i>
                                            <span>WhatsApp</span>
                                        </button>
                                        <button
                                            className="share-option-btn email"
                                            onClick={() => handleShareViaEmail(selectedTicketForShare)}
                                        >
                                            <i className="fas fa-envelope"></i>
                                            <span>Email</span>
                                        </button>
                                        <button
                                            className="share-option-btn copy"
                                            onClick={() => handleCopyLink(selectedTicketForShare)}
                                        >
                                            <i className="fas fa-copy"></i>
                                            <span>Copy Link</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="share-modal-footer">
                                <button className="share-close-btn" onClick={handleCloseShare}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
