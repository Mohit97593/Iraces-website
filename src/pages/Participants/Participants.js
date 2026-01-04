import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./Participants.css";

export default function Participants() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(false);
    const [participantData, setParticipantData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [ticketCategories, setTicketCategories] = useState([]);

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

            const payload = {
                event_id: eventId,
                page: pagination.page,
                limit: pagination.limit,
                coupon_used_flag: 0
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

    const handleBack = () => {
        navigate(`/analytics/${eventId}`);
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
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
                        <button className="action-btn send-email-btn">
                            <i className="fas fa-envelope"></i> Send Email
                        </button>
                        <button className="action-btn download-btn">
                            <i className="fas fa-download"></i> Download
                        </button>
                        <button className="action-btn revenue-btn">
                            <i className="fas fa-rupee-sign"></i> Revenue
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
                                <option value="101">Pending</option>
                                <option value="1">Success</option>
                                <option value="3">In Progress</option>
                                <option value="102">Success & In Progress</option>
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
                                <th><input type="checkbox" /></th>
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
                                        <td><input type="checkbox" /></td>
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
                                                    participant.transaction_status === 3 ? 'In Progress' :
                                                        'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-icon-btn" title="View Details">
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
            </div>
        </>
    );
}
