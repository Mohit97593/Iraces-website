import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./Registrations.css";

export default function Registrations() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [eventName, setEventName] = useState(location.state?.eventName || "");
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);

    const [filters, setFilters] = useState({
        userName: "",
        transactionStatus: "",
        dateFrom: location.state?.filterData?.dateFrom || "",
        dateTo: location.state?.filterData?.dateTo || "",
        transactionID: ""
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 30
    });

    // Fetch registered users
    const fetchRegisteredUsers = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching registered users for event:", eventId);

            const payload = {
                event_id: eventId,
                page: pagination.page,
                limit: pagination.limit
            };

            // Add filters if provided
            if (filters.userName) payload.user_name = filters.userName;
            if (filters.transactionStatus) payload.TransactionStatus = filters.transactionStatus;
            if (filters.dateFrom) payload.from_date = filters.dateFrom;
            if (filters.dateTo) payload.to_date = filters.dateTo;
            if (filters.transactionID) payload.TransactionID = filters.transactionID;

            const response = await authAPI.getRegisteredUsers(payload);
            console.log("✅ getRegisteredUsers API Response:", response);

            if (response && response.data) {
                setUserData(response.data.UserData || []);
                setTotalRecords(response.data.TotalRecord || 0);
            }
        } catch (error) {
            console.error("❌ Error fetching registered users:", error);
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
            fetchRegisteredUsers();
        }
    }, [eventId]);

    // Refetch when pagination changes
    useEffect(() => {
        if (eventId) {
            fetchRegisteredUsers();
        }
    }, [pagination.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        fetchRegisteredUsers();
    };

    const handleBack = () => {
        navigate(`/event-analytics/${eventId}`, { state: { eventName } });
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
            <div className="registrations-container">
                <div className="registrations-header">
                    <h2>Registrations</h2>
                    <button className="back-btn" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                </div>

                {/* Search Filter Section */}
                <div className="filter-section">
                    <div className="filter-header">
                        <i className="fas fa-search"></i>
                        <span>Search Filter</span>
                    </div>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>User Name *</label>
                            <input
                                type="text"
                                name="userName"
                                value={filters.userName}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter user name"
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
                                <option value="101">Pending</option>
                                <option value="102">Success & Free</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date From *</label>
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
                            <label>Date To *</label>
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
                        <p>Loading registrations data...</p>
                    </div>
                )}

                {/* Data Table */}
                <div className="table-container">
                    <table className="registrations-table">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Number of tickets</th>
                                <th>Total Amount</th>
                                <th>Booking Date</th>
                                <th>Transaction ID</th>
                                <th>Transaction Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.length > 0 ? (
                                userData.map((user, index) => (
                                    <tr key={user.EventBookingId}>
                                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                        <td>{user.firstname} {user.lastname}</td>
                                        <td>{user.email}</td>
                                        <td>{user.mobile}</td>
                                        <td>{user.TotalTickets}</td>
                                        <td>₹{user.TotalAmount}</td>
                                        <td>{user.booking_date}</td>
                                        <td>{user.transaction_id || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge status-${user.transaction_status}`}>
                                                {user.transaction_status === 1 ? 'Success' :
                                                    user.transaction_status === 3 ? 'Free' :
                                                        user.transaction_status === 102 ? 'Free' :
                                                            user.transaction_status === 101 ? 'In Progress' :
                                                                'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                        No registrations found
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
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
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
