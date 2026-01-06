import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./PaymentLog.css";

export default function PaymentLog() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(30);

    // Search filter state
    const [filters, setFilters] = useState({
        user_name: "",
        email: "",
        TransactionID: "",
        TransactionStatus: "",
        from_date: "",
        to_date: ""
    });

    // Fetch payment log data
    const fetchPaymentLog = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching payment log for event:", eventId);

            const payload = {
                event_id: eventId,
                page: currentPage,
                limit: limit,
                ...filters
            };

            const response = await authAPI.getPaymentLog(payload);
            console.log("✅ getPaymentLog API Response:", response);

            if (response && response.data) {
                setPaymentData(response.data.PaymentData || []);
                setTotalRecords(response.data.TotalRecord || 0);
            }
        } catch (error) {
            console.error("❌ Error fetching payment log:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch event and profile data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("📊 Fetching data for event:", eventId);

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
                console.error("❌ Error fetching data:", error);
            }
        };

        if (eventId) {
            fetchData();
            fetchPaymentLog();
        }
    }, [eventId]);

    // Refetch when filters or page changes
    useEffect(() => {
        if (eventId) {
            fetchPaymentLog();
        }
    }, [currentPage, filters]);

    const handleBack = () => {
        navigate(`/event-analytics/${eventId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Calculate pagination
    const totalPages = Math.ceil(totalRecords / limit);

    // Get transaction status display text
    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'success': return 'Success';
            case 'initiate': return 'Initiate';
            case 'fail': return 'Fail';
            case 'free': return 'Free';
            default: return status || 'N/A';
        }
    };

    // Get status class for styling
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'success': return 'status-success';
            case 'initiate': return 'status-initiate';
            case 'fail': return 'status-fail';
            case 'free': return 'status-free';
            default: return '';
        }
    };

    return (
        <>
            <TopNav />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="contact-hero-title">{eventName || "Payment Log"}</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>My Event</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>{eventName || "Payment Log"}</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="payment-log-container">
                <div className="payment-log-header">
                    <h2>Payment Log</h2>
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
                            <label>User Name</label>
                            <input
                                type="text"
                                name="user_name"
                                value={filters.user_name}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter user name"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={filters.email}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter email"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Transaction ID</label>
                            <input
                                type="text"
                                name="TransactionID"
                                value={filters.TransactionID}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="Enter transaction ID"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Transaction Status *</label>
                            <select
                                name="TransactionStatus"
                                value={filters.TransactionStatus}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">-- Select Transaction Status --</option>
                                <option value="101">Initiate</option>
                                <option value="1">Success</option>
                                <option value="2">Fail</option>
                                <option value="3">Free</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date From</label>
                            <input
                                type="date"
                                name="from_date"
                                value={filters.from_date}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Date To</label>
                            <input
                                type="date"
                                name="to_date"
                                value={filters.to_date}
                                onChange={handleFilterChange}
                                className="filter-input"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading payment data...</p>
                    </div>
                )}

                {/* Data Table */}
                <div className="table-container">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Transaction ID</th>
                                <th>Pay ID</th>
                                <th>Total Amount</th>
                                <th>Payment Date</th>
                                <th>Transaction Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData.length > 0 ? (
                                paymentData.map((payment, index) => (
                                    <tr key={payment.paymentId || index}>
                                        <td>{(currentPage - 1) * limit + index + 1}</td>
                                        <td>{`${payment.firstname || ''} ${payment.lastname || ''}`.trim() || 'N/A'}</td>
                                        <td>{payment.email || 'N/A'}</td>
                                        <td>{payment.mobile || 'N/A'}</td>
                                        <td>{payment.txnid || 'N/A'}</td>
                                        <td>{payment.paymentId || 'N/A'}</td>
                                        <td>₹{payment.amount || '0.00'}</td>
                                        <td>{payment.created_datetime || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(payment.payment_status)}`}>
                                                {getStatusText(payment.payment_status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                        No payment records found
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
                            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="page-number">Page {currentPage} of {totalPages}</span>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
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
