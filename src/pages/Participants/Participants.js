import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./Participants.css";

export default function Participants() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [eventName, setEventName] = useState(location.state?.eventName || "");
    const [loading, setLoading] = useState(false);
    const [downloadingAttendee, setDownloadingAttendee] = useState(false);
    const [downloadingRevenue, setDownloadingRevenue] = useState(false);
    const [participantData, setParticipantData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [ticketCategories, setTicketCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTypes, setEmailTypes] = useState([]);
    const [selectedEmailType, setSelectedEmailType] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [customSubject, setCustomSubject] = useState("");
    const [customMessage, setCustomMessage] = useState("");

    // WhatsApp states
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappTemplates, setWhatsappTemplates] = useState([]);
    const [selectedWhatsAppTemplate, setSelectedWhatsAppTemplate] = useState("");

    const [filters, setFilters] = useState({
        participantName: "",
        transactionStatus: "",
        registrationID: "",
        mobileNumber: "",
        email: "",
        category: "",
        dateFrom: "",
        dateTo: "",
        transactionID: ""
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 30
    });

    // Fetch participants
    const fetchParticipants = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching participants for event:", eventId);
            console.log("🎫 Coupon filter from location.state:", location.state?.coupon_used_flag);

            const payload = {
                event_id: eventId,
                page: pagination.page,
                limit: pagination.limit,
                coupon_used_flag: location.state?.coupon_used_flag || 0,
                include_pending: 1
            };

            // Add filters if provided
            if (filters.participantName) payload.participant_name = filters.participantName;
            if (filters.registrationID) payload.reg_id = filters.registrationID;
            if (filters.mobileNumber) payload.mobile_number = filters.mobileNumber;
            if (filters.email) payload.email = filters.email;
            if (filters.category) payload.ticket_id = filters.category;
            if (filters.transactionStatus) payload.TransactionStatus = filters.transactionStatus;
            if (filters.dateFrom) payload.from_date = filters.dateFrom;
            if (filters.dateTo) payload.to_date = filters.dateTo;
            if (filters.transactionID) payload.TransactionID = filters.transactionID;

            const response = await authAPI.getNetSales(payload);
            console.log("✅ getNetSales API Response:", response);

            if (response && response.data) {
                setParticipantData(response.data.AttendeeData || []);
                setTotalRecords(response.data.TotalRecord || 0);

                // Update ticket categories if available
                if (response.data.TicketData && Array.isArray(response.data.TicketData)) {
                    setTicketCategories(response.data.TicketData);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching participants:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch event and profile data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("📊 Fetching event data for:", eventId);

                // Call getEvents API
                const eventsResponse = await authAPI.getEvents({});
                console.log("✅ getEvents API Response:", eventsResponse);

                // Call getProfile API
                const profileResponse = await authAPI.getProfile();
                console.log("✅ getProfile API Response:", profileResponse);

                // Update event name from events response
                if (eventsResponse && eventsResponse.data) {
                    const event = eventsResponse.data.find(e => e.id == eventId);
                    if (event) setEventName(event.name);
                }

            } catch (error) {
                console.error("❌ Error fetching event data:", error);
            }
        };

        if (eventId) {
            fetchData();
            fetchParticipants();
            fetchEmailTypes();
            fetchWhatsAppTemplates();
        }
    }, [eventId]);

    // Refetch when pagination changes
    useEffect(() => {
        if (eventId) {
            fetchParticipants();
        }
    }, [pagination.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        fetchParticipants();
    };

    const handleClearFilters = async () => {
        try {
            setLoading(true);

            // Reset all filters to empty values
            setFilters({
                participantName: "",
                transactionStatus: "",
                registrationID: "",
                mobileNumber: "",
                email: "",
                category: "",
                dateFrom: "",
                dateTo: "",
                transactionID: ""
            });

            // Reset pagination to page 1
            setPagination({ ...pagination, page: 1 });

            // Call API directly with empty filters (don't wait for state update)
            console.log("🧹 Clearing filters and fetching all participants...");

            const payload = {
                event_id: eventId,
                page: 1,
                limit: pagination.limit,
                coupon_used_flag: location.state?.coupon_used_flag || 0,
                include_pending: 1
            };

            console.log("📤 Clear filters payload:", payload);

            const response = await authAPI.getNetSales(payload);
            console.log("✅ getNetSales API Response:", response);

            if (response && response.data) {
                setParticipantData(response.data.AttendeeData || []);
                setTotalRecords(response.data.TotalRecord || 0);

                // Update ticket categories if available
                if (response.data.TicketData && Array.isArray(response.data.TicketData)) {
                    setTicketCategories(response.data.TicketData);
                }
            }
        } catch (error) {
            console.error("❌ Error clearing filters:", error);
        } finally {
            setLoading(false);
        }
    };

    // Check if any filter is applied
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value !== "");
    };

    const handleBack = () => {
        navigate(`/event-analytics/${eventId}`, { state: { eventName } });
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
    };

    const handleViewDetails = async (participant) => {
        try {
            setLoadingModal(true);
            setShowModal(true);
            console.log("📊 Fetching booking details for participant:", participant);

            const payload = {
                event_id: eventId,
                BookingId: participant.aId,
                BookingDetailId: participant.booking_details_id
            };

            const response = await authAPI.getBookingDetails(payload);
            console.log("✅ getBookingDetails API Response:", response);

            if (response && response.data && response.data.BookingDetails && response.data.BookingDetails.length > 0) {
                setBookingDetails(response.data.BookingDetails[0]);
            }
        } catch (error) {
            console.error("❌ Error fetching booking details:", error);
        } finally {
            setLoadingModal(false);
        }
    };

    const fetchEmailTypes = async () => {
        try {
            console.log("📧 Fetching email types...");
            const response = await authAPI.getCommunicationMasterDetails();
            console.log("✅ getCommunicationMasterDetails API Response:", response);

            if (response && response.data) {
                let emailTypesList = [...response.data];

                // Check if Custom Email already exists
                const hasCustomEmail = emailTypesList.some(type => type.subject_name === "Custom Email");

                // If Custom Email doesn't exist, add it
                if (!hasCustomEmail) {
                    emailTypesList.push({
                        id: 5,
                        subject_name: "Custom Email"
                    });
                }

                setEmailTypes(emailTypesList);
                // Set first option as default if available
                if (emailTypesList.length > 0) {
                    setSelectedEmailType(emailTypesList[0].id);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching email types:", error);
        }
    };

    const fetchWhatsAppTemplates = async () => {
        try {
            console.log("📱 Fetching WhatsApp templates...");
            const response = await authAPI.getWhatsAppTemplates();
            console.log("✅ getWhatsAppTemplates API Response:", response);

            if (response && response.data) {
                setWhatsappTemplates(response.data);
                // Set first template as default if available
                if (response.data.length > 0) {
                    setSelectedWhatsAppTemplate(response.data[0].id);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching WhatsApp templates:", error);
        }
    };

    const handleSendEmail = () => {
        if (selectedParticipants.length === 0) {
            alert("Please select at least one participant before sending email.");
            return;
        }
        setShowEmailModal(true);
    };

    const handleSelectParticipant = (participantId) => {
        setSelectedParticipants(prev => {
            if (prev.includes(participantId)) {
                return prev.filter(id => id !== participantId);
            } else {
                return [...prev, participantId];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = participantData.map(p => p.aId);
            setSelectedParticipants(allIds);
        } else {
            setSelectedParticipants([]);
        }
    };

    const handleConfirmSendEmail = async () => {
        try {
            // Check if Custom Email is selected and validate fields
            const selectedEmail = emailTypes.find(type => type.id == selectedEmailType);
            const isCustomEmail = selectedEmail && selectedEmail.subject_name === "Custom Email";

            if (isCustomEmail) {
                if (!customSubject.trim()) {
                    alert("Please enter a subject name for custom email.");
                    return;
                }
                if (!customMessage.trim()) {
                    alert("Please enter a message for custom email.");
                    return;
                }
            }

            console.log("📧 Sending email with type:", selectedEmailType);
            console.log("📧 Selected participants:", selectedParticipants);

            // Get user data from localStorage
            const userData = JSON.parse(localStorage.getItem("userData") || "{}");
            const userId = userData.ID || userData.id || 0;

            // Prepare payload
            const payload = {
                event_id: eventId,
                user_id: userId,
                event_url: window.location.origin + `/e/${eventId}`,
                email_type: selectedEmailType,
                subject_name: isCustomEmail ? customSubject : "",
                message_content: isCustomEmail ? customMessage : "",
                participant_data: selectedParticipants
            };

            console.log("📧 Sending payload:", payload);

            const response = await authAPI.sendParticipantEmail(payload);
            console.log("✅ sendParticipantEmail API Response:", response);

            if (response && response.success === 200) {
                alert("Email sent successfully!");
                setShowEmailModal(false);
                // Clear selected participants and custom fields after successful send
                setSelectedParticipants([]);
                setCustomSubject("");
                setCustomMessage("");
            } else {
                alert(response.message || "Failed to send email");
            }
        } catch (error) {
            console.error("❌ Error sending email:", error);
            alert("Failed to send email. Please try again.");
        }
    };

    const handleSendWhatsApp = () => {
        if (selectedParticipants.length === 0) {
            alert("Please select at least one participant before sending WhatsApp.");
            return;
        }
        setShowWhatsAppModal(true);
    };

    const handleConfirmSendWhatsApp = async () => {
        try {
            console.log("📱 Sending WhatsApp with template:", selectedWhatsAppTemplate);
            console.log("📱 Selected participants:", selectedParticipants);

            const payload = {
                participant_data: selectedParticipants,
                template_id: selectedWhatsAppTemplate,
                params: [] // Add template params if needed
            };

            console.log("📱 Sending payload:", payload);

            const response = await authAPI.sendWhatsAppMultiple(payload);
            console.log("✅ sendWhatsAppMultiple API Response:", response);

            if (response && response.message) {
                alert(response.message);
                setShowWhatsAppModal(false);
                setSelectedParticipants([]);
            } else {
                alert("WhatsApp sent successfully!");
                setShowWhatsAppModal(false);
                setSelectedParticipants([]);
            }
        } catch (error) {
            console.error("❌ Error sending WhatsApp:", error);
            alert("Failed to send WhatsApp. Please try again.");
        }
    };

    // Handle Download Excel (Attendee)
    const handleDownloadExcel = async () => {
        try {
            setDownloadingAttendee(true);
            console.log("📥 Starting attendee Excel download...");
            console.log("Event ID:", eventId);

            const payload = {
                event_id: eventId,
                command: 'attendee',
                coupon_used_flag: location.state?.coupon_used_flag || 0,
                include_pending: 1
            };

            // Add filters if provided
            if (filters.participantName) payload.participant_name = filters.participantName;
            if (filters.registrationID) payload.reg_id = filters.registrationID;
            if (filters.mobileNumber) payload.mobile_number = filters.mobileNumber;
            if (filters.email) payload.email = filters.email;
            if (filters.category) payload.ticket_id = filters.category;
            if (filters.transactionStatus) payload.TransactionStatus = filters.transactionStatus;
            if (filters.dateFrom) payload.from_date = filters.dateFrom;
            if (filters.dateTo) payload.to_date = filters.dateTo;
            if (filters.transactionID) payload.TransactionID = filters.transactionID;

            console.log("📤 Sending payload:", payload);

            const response = await authAPI.attendeeNetsalesExcellData(payload);
            console.log("✅ Full API Response:", response);
            console.log("Response data:", response?.data);
            console.log("Excel URL:", response?.data?.attendee_details_excel);

            if (response && response.data && response.data.attendee_details_excel) {
                const excelUrl = response.data.attendee_details_excel;
                console.log("🎯 Downloading Excel from URL:", excelUrl);

                // Direct download using window.location or anchor tag
                // This bypasses CORS restrictions
                const link = document.createElement('a');
                link.href = excelUrl;
                link.download = ''; // Empty download attribute triggers download
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log("✅ Excel download initiated!");
                alert("Excel file download started! Check your downloads folder.");
            } else {
                console.warn("⚠️ No Excel URL in response");
                alert("No data available to download");
            }
        } catch (error) {
            console.error("❌ Error downloading Excel:");
            console.error("Error object:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response);
            alert("Failed to download Excel. Please check console for details.");
        } finally {
            setDownloadingAttendee(false);
        }
    };

    const handleDownloadRevenue = async () => {
        try {
            setDownloadingRevenue(true);
            console.log("💰 Starting revenue Excel download...");
            console.log("Event ID:", eventId);

            const payload = {
                event_id: eventId,
                command: 'revenue',
                coupon_used_flag: location.state?.coupon_used_flag || 0,
                include_pending: 1
            };

            // Add filters if provided
            if (filters.participantName) payload.participant_name = filters.participantName;
            if (filters.registrationID) payload.reg_id = filters.registrationID;
            if (filters.mobileNumber) payload.mobile_number = filters.mobileNumber;
            if (filters.email) payload.email = filters.email;
            if (filters.category) payload.ticket_id = filters.category;
            if (filters.transactionStatus) payload.TransactionStatus = filters.transactionStatus;
            if (filters.dateFrom) payload.from_date = filters.dateFrom;
            if (filters.dateTo) payload.to_date = filters.dateTo;
            if (filters.transactionID) payload.TransactionID = filters.transactionID;

            console.log("📤 Sending payload:", payload);

            const response = await authAPI.attendeeNetsalesExcellData(payload);
            console.log("✅ Full API Response:", response);
            console.log("Response data:", response?.data);
            console.log("Revenue Excel URL:", response?.data?.remittance_details_excel);

            if (response && response.data && response.data.remittance_details_excel) {
                const excelUrl = response.data.remittance_details_excel;
                console.log("🎯 Downloading Revenue Excel from URL:", excelUrl);

                // Direct download using window.location or anchor tag
                // This bypasses CORS restrictions
                const link = document.createElement('a');
                link.href = excelUrl;
                link.download = ''; // Empty download attribute triggers download
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log("✅ Revenue Excel download initiated!");
                alert("Revenue Excel file download started! Check your downloads folder.");
            } else {
                console.warn("⚠️ No Revenue Excel URL in response");
                alert("No revenue data available to download");
            }
        } catch (error) {
            console.error("❌ Error downloading revenue Excel:");
            console.error("Error object:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response);
            alert("Failed to download revenue Excel. Please check console for details.");
        } finally {
            setDownloadingRevenue(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / pagination.limit);

    return (
        <>
            <TopNav />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="contact-hero-title">{eventName || "Event"}</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>My Event</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>{eventName || "Event"}</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="participants-container">
                <div className="participants-header">
                    <h2>Participants</h2>
                    <div className="header-actions">
                        <button className="action-btn1 send-email-btn" onClick={handleSendEmail}>
                            <i className="fas fa-envelope"></i> Send Email
                        </button>
                        <button className="action-btn1 send-whatsapp-btn" onClick={handleSendWhatsApp} style={{ backgroundColor: '#25D366' }}>
                            <i className="fab fa-whatsapp"></i> Send WhatsApp
                        </button>
                        <button
                            className="action-btn1 download-btn"
                            onClick={handleDownloadExcel}
                            disabled={downloadingAttendee}
                        >
                            <i className="fas fa-download"></i> {downloadingAttendee ? 'Downloading...' : 'Download'}
                        </button>
                        <button
                            className="action-btn1 revenue-btn"
                            onClick={handleDownloadRevenue}
                            disabled={downloadingRevenue}
                        >
                            <i className="fas fa-rupee-sign"></i> {downloadingRevenue ? 'Downloading...' : 'Revenue'}
                        </button>
                        <button className="back-btn" onClick={handleBack}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                    </div>
                </div>

                {/* Search Filter Section */}
                <div className="filter-section">
                    <div className="filter-header">
                        <i className="fas fa-search"></i>
                        <span>Search Filter</span>
                    </div>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Participant Name</label>
                            <input
                                type="text"
                                name="participantName"
                                value={filters.participantName}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter participant name"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Transaction Status *</label>
                            <select
                                name="transactionStatus"
                                value={filters.transactionStatus}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">-- Select Transaction Status --</option>
                                <option value="2">Failure</option>
                                <option value="3">Free</option>
                                <option value="1">Success</option>
                                <option value="101">In Progress</option>
                                <option value="102">Success & Free</option>
                                <option value="5">Refund</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Registration ID</label>
                            <input
                                type="text"
                                name="registrationID"
                                value={filters.registrationID}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter registration ID"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Mobile Number</label>
                            <input
                                type="text"
                                name="mobileNumber"
                                value={filters.mobileNumber}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter mobile number"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Email</label>
                            <input
                                type="text"
                                name="email"
                                value={filters.email}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter email"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">-- Select Category --</option>
                                {ticketCategories.map((ticket) => (
                                    <option key={ticket.id} value={ticket.id}>
                                        {ticket.ticket_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date From</label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="dd-mm-yyyy"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Date To</label>
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="dd-mm-yyyy"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Transaction ID</label>
                            <input
                                type="text"
                                name="transactionID"
                                value={filters.transactionID}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter transaction ID"
                            />
                        </div>
                        <div className="filter-group">
                            <button className="search-btn" onClick={handleSearch}>
                                <i className="fas fa-search"></i> Search
                            </button>
                        </div>
                        {hasActiveFilters() && (
                            <div className="filter-group">
                                <button className="clear-btn" onClick={handleClearFilters}>
                                    <i className="fas fa-times"></i> Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading participants data...</p>
                    </div>
                )}

                {/* Data Table */}
                <div className="table-container">
                    <table className="participants-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={participantData.length > 0 && selectedParticipants.length === participantData.length}
                                    />
                                </th>
                                <th>Sr. No.</th>
                                <th>Participant Name</th>
                                <th>Email / Mobile Number</th>
                                <th>Category Name</th>
                                <th>Booking Date</th>
                                <th>Transaction ID</th>
                                <th>Registration ID</th>
                                <th>Total Amount</th>
                                <th>Transaction Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participantData.length > 0 ? (
                                participantData.map((participant, index) => (
                                    <tr key={participant.aId}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedParticipants.includes(participant.aId)}
                                                onChange={() => handleSelectParticipant(participant.aId)}
                                            />
                                        </td>
                                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                        <td>{participant.firstname} {participant.lastname}</td>
                                        <td>
                                            {participant.email && <div>{participant.email}</div>}
                                            {participant.mobile && <div>{participant.mobile}</div>}
                                        </td>
                                        <td>{participant.category_name || 'N/A'}</td>
                                        <td>{participant.booking_date}</td>
                                        <td>{participant.transaction_id || 'N/A'}</td>
                                        <td>{participant.registration_id || 'N/A'}</td>
                                        <td>₹ {participant.total_amount || '0.00'}</td>
                                        <td>
                                            <span className={`status-badge status-${participant.transaction_status}`}>
                                                {participant.transaction_status === 1 ? 'Success' :
                                                    participant.transaction_status === 3 ? 'Success' :
                                                        participant.transaction_status === 102 ? 'Success' :
                                                            participant.transaction_status === 101 ? 'In Progress' :
                                                                'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="action-icon-btn"
                                                title="View Details"
                                                onClick={() => handleViewDetails(participant)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                                        No participants found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalRecords > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalRecords)} of {totalRecords} entries
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </button>
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Booking Details Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Registration Details</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                {loadingModal ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p>Loading booking details...</p>
                                    </div>
                                ) : bookingDetails ? (
                                    <>
                                        {/* Registration Details Section */}
                                        <div className="details-section">
                                            <h3>Registration Details</h3>
                                            <table className="details-table">
                                                <thead>
                                                    <tr>
                                                        <th>Order Id</th>
                                                        <th>Registration Id</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Registration Date & Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{bookingDetails.OrderId || 'N/A'}</td>
                                                        <td>{bookingDetails.unique_ticket_id || 'N/A'}</td>
                                                        <td>{bookingDetails.firstname} {bookingDetails.lastname}</td>
                                                        <td>{bookingDetails.email || 'N/A'}</td>
                                                        <td>{bookingDetails.booking_start_date} {bookingDetails.booking_time}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Races Category Details Section */}
                                        <div className="details-section">
                                            <h3>Races Category Details</h3>
                                            <table className="details-table">
                                                <thead>
                                                    <tr>
                                                        <th>Category</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Discount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{bookingDetails.TicketName || 'N/A'}</td>
                                                        <td>1</td>
                                                        <td>{bookingDetails.ticket_price || '0'}</td>
                                                        <td>{bookingDetails.TicketDiscount || '0'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Additional Purchases Section */}
                                        <div className="details-section">
                                            <h3>Additional Purchases</h3>
                                            {bookingDetails.amount_details && bookingDetails.amount_details.length > 0 ? (
                                                <table className="details-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Other Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bookingDetails.amount_details.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {item.question_label}: {item.question_answer}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <table className="details-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Other Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ textAlign: 'center' }}>:</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>

                                        {/* Extra Details Section */}
                                        {bookingDetails.extra_details && bookingDetails.extra_details.length > 0 && (
                                            <div className="details-section">
                                                <h3>Extra Details</h3>
                                                <div className="extra-details-list">
                                                    {bookingDetails.extra_details.map((item, index) => (
                                                        <div key={index} className="extra-detail-item">
                                                            <strong>{item.question_label}:</strong> {item.question_answer}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p>No booking details available</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Send Email Modal */}
                {showEmailModal && (
                    <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
                        <div className="email-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2 className="email-modal-title">Are you sure you want to send this email to attendee?</h2>

                            <div className="email-type-group">
                                <label className="email-type-label">Email Type</label>
                                <select
                                    className="email-type-select"
                                    value={selectedEmailType}
                                    onChange={(e) => setSelectedEmailType(e.target.value)}
                                >
                                    {emailTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Email Fields - Show only when Custom Email is selected */}
                            {emailTypes.find(type => type.id == selectedEmailType)?.subject_name === "Custom Email" && (
                                <>
                                    <div className="email-type-group">
                                        <label className="email-type-label">
                                            Subject Name <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="email-type-input"
                                            value={customSubject}
                                            onChange={(e) => setCustomSubject(e.target.value)}
                                            placeholder="Enter subject name"
                                        />
                                    </div>

                                    <div className="email-type-group">
                                        <label className="email-type-label">
                                            Message <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <textarea
                                            className="email-type-textarea"
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            placeholder="Enter your message"
                                            rows="6"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="email-modal-actions">
                                <button className="email-cancel-btn" onClick={() => setShowEmailModal(false)}>
                                    Cancel
                                </button>
                                <button className="email-send-btn" onClick={handleConfirmSendEmail}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Send WhatsApp Modal */}
                {showWhatsAppModal && (
                    <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
                        <div className="email-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2 className="email-modal-title">Send WhatsApp Message to Participants</h2>

                            <div className="email-type-group">
                                <label className="email-type-label">WhatsApp Template</label>
                                <select
                                    className="email-type-select"
                                    value={selectedWhatsAppTemplate}
                                    onChange={(e) => setSelectedWhatsAppTemplate(e.target.value)}
                                >
                                    {whatsappTemplates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} {template.description && `- ${template.description}`}
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Selected participants: {selectedParticipants.length}
                                </small>
                            </div>

                            <div className="email-modal-actions">
                                <button className="email-cancel-btn" onClick={() => setShowWhatsAppModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="email-send-btn"
                                    onClick={handleConfirmSendWhatsApp}
                                    style={{ backgroundColor: '#25D366' }}
                                >
                                    <i className="fab fa-whatsapp"></i> Send WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
