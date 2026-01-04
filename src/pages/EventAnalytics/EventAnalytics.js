import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./EventAnalytics.css";

export default function EventAnalytics() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ticketCategories, setTicketCategories] = useState([]);
    const [filterData, setFilterData] = useState({
        filter: "",
        category: "",
        dateFrom: "",
        dateTo: ""
    });

    // Statistics data
    const [stats, setStats] = useState({
        registrations: 0,
        participants: 0,
        netSales: 0,
        totalAmountCollected: "0.00",
        conversionRate: 0,
        registrationLimit: 0,
        pageViews: 0,
        remittanceAmount: "0.00",
        receivableToOrganiser: "0.00",
        totalPaymentGateway: "0.00",
        totalConvenienceFee: "0.00"
    });

    // Category-wise data for charts
    const [categoryData, setCategoryData] = useState({
        bookingData: [],
        barChartData: [],
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        ageCategory: [],
        utmCode: [],
        couponCodes: [],
        customQuestions: {}
    });

    // Fetch insights data
    const fetchInsights = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching insights for event:", eventId);

            const payload = {
                event_id: eventId
            };

            // Add filter if selected
            if (filterData.filter) {
                payload.filter = filterData.filter;
            }

            // Add date range if provided
            if (filterData.dateFrom) {
                payload.from_date = filterData.dateFrom;
            }
            if (filterData.dateTo) {
                payload.to_date = filterData.dateTo;
            }

            // Add ticket category if selected
            if (filterData.category) {
                payload.Ticket = filterData.category;
            }

            const response = await authAPI.getInsights(payload);
            console.log("✅ getInsights API Response:", response);

            if (response && response.data) {
                const data = response.data;

                // Parse currency values (remove ₹ and commas)
                const parseCurrency = (value) => {
                    if (!value) return "0.00";
                    if (typeof value === 'string') {
                        return value.replace(/[₹,]/g, '').trim();
                    }
                    return value.toString();
                };

                // Update statistics
                setStats({
                    registrations: data.TotalRegistration || 0,
                    participants: data.TotalParticipant || 0,
                    netSales: data.NetSales || 0,
                    totalAmountCollected: parseCurrency(data.TotalAmount),
                    conversionRate: data.SuccessPercentage || 0,
                    registrationLimit: data.TotalTickets || 0,
                    pageViews: data.TotalPageViews || 0,
                    remittanceAmount: parseCurrency(data.RemittanceAmount),
                    receivableToOrganiser: parseCurrency(data.OrganiserAmount),
                    totalPaymentGateway: parseCurrency(data.TotalPaymentGateway),
                    totalConvenienceFee: parseCurrency(data.TotalConvenience)
                });

                // Update ticket categories for dropdown
                if (data.TicketData && Array.isArray(data.TicketData)) {
                    setTicketCategories(data.TicketData);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching insights:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch category-wise data
    const fetchCategoryWiseData = async () => {
        try {
            console.log("📊 Fetching category-wise data for event:", eventId);

            const payload = {
                event_id: eventId
            };

            // Add filter if selected
            if (filterData.filter) {
                payload.filter = filterData.filter;
            }

            // Add date range if provided
            if (filterData.dateFrom) {
                payload.from_date = filterData.dateFrom;
            }
            if (filterData.dateTo) {
                payload.to_date = filterData.dateTo;
            }

            // Add ticket category if selected
            if (filterData.category) {
                payload.Ticket = filterData.category;
            }

            const response = await authAPI.getCategoryWiseData(payload);
            console.log("✅ getCategoryWiseData API Response:", response);

            if (response && response.data) {
                const data = response.data;

                // Update category data
                setCategoryData({
                    bookingData: data.BookingData || [],
                    barChartData: data.FinalBarChartData || [],
                    maleCount: data.maleCount || 0,
                    femaleCount: data.femaleCount || 0,
                    otherCount: data.otherCount || 0,
                    ageCategory: data.ageCategory || [],
                    utmCode: data.utmCode || [],
                    couponCodes: data.CouponCodes || [],
                    customQuestions: data.CountArray || {}
                });
            }
        } catch (error) {
            console.error("❌ Error fetching category-wise data:", error);
        }
    };

    // Fetch event and profile data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("📊 Fetching analytics data for event:", eventId);

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
                console.error("❌ Error fetching analytics data:", error);
            }
        };

        if (eventId) {
            fetchData();
            fetchInsights();
            fetchCategoryWiseData();
        }
    }, [eventId]);

    // Refetch insights and category data when filters change
    useEffect(() => {
        if (eventId && (filterData.filter || filterData.category || filterData.dateFrom || filterData.dateTo)) {
            fetchInsights();
            fetchCategoryWiseData();
        }
    }, [filterData.filter, filterData.category, filterData.dateFrom, filterData.dateTo]);

    const handleBack = () => {
        navigate("/myevents");
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    // Format currency for display
    const formatCurrency = (value) => {
        if (!value || value === "0.00") return "0.00";
        const numValue = parseFloat(value);
        return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
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
                            <h1 className="contact-hero-title">{eventName || "Event Analytics"}</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>My Event</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>{eventName || "Analytics"}</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="analytics-container">
                {/* Search Filter Section */}
                <div className="filter-section">
                    <div className="filter-header">
                        <i className="fas fa-search"></i>
                        <span>Search Filter</span>
                    </div>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Filter</label>
                            <select
                                name="filter"
                                value={filterData.filter}
                                onChange={handleFilterChange}
                                className="filter-select"
                            >
                                <option value="">-- Select Filter --</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={filterData.category}
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
                            <label>Date From *</label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={filterData.dateFrom}
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
                                value={filterData.dateTo}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="dd-mm-yyyy"
                            />
                        </div>
                        <button className="back-btn" onClick={handleBack}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading analytics data...</p>
                    </div>
                )}

                {/* Statistics Cards Grid */}
                <div className="stats-grid">
                    {/* Registrations */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Registrations</h3>
                                <div className="stat-value">{stats.registrations}</div>
                                <Link to={`/registrations/${eventId}`} className="view-details">View Details</Link>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Registrations" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Participants */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Participants</h3>
                                <div className="stat-value">{stats.participants}</div>
                                <Link to={`/participants/${eventId}`} className="view-details">View Details</Link>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/681/681494.png" alt="Participants" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Net Sales */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Net Sales</h3>
                                <div className="stat-value">{stats.netSales}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/3176/3176366.png" alt="Net Sales" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Total Amount Collected */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Total Amount Collected</h3>
                                <div className="stat-value">₹ {formatCurrency(stats.totalAmountCollected)}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2331/2331966.png" alt="Amount" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Conversion Rate */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Conversion Rate</h3>
                                <div className="stat-value">{stats.conversionRate} %</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2769/2769339.png" alt="Conversion" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Registration Limit */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Registration Limit</h3>
                                <div className="stat-value">{stats.registrationLimit}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2920/2920277.png" alt="Limit" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Page Views */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Page Views</h3>
                                <div className="stat-value">{stats.pageViews}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png" alt="Page Views" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Remittance Amount */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Remittance Amount</h3>
                                <div className="stat-value">₹ {formatCurrency(stats.remittanceAmount)}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" alt="Remittance" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Receivable to Organiser */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Receivable to Organiser</h3>
                                <div className="stat-value">₹ {formatCurrency(stats.receivableToOrganiser)}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Receivable" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Total Payment Gateway */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Total Payment Gateway</h3>
                                <div className="stat-value">₹ {formatCurrency(stats.totalPaymentGateway)}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png" alt="Gateway" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Total Convenience Fee */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Total Convenience Fee</h3>
                                <div className="stat-value">₹ {formatCurrency(stats.totalConvenienceFee)}</div>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="Fee" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="row g-4">
                        {/* Registration Per Day Chart */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Registration Per Day</h3>
                                <p className="chart-subtitle">Daily Category Count</p>
                                <div className="chart-placeholder">
                                    <p>Chart will be displayed here</p>
                                </div>
                            </div>
                        </div>

                        {/* Number of Categories Sold */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Number of Categories Sold</h3>
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No Data Found</p>
                                </div>
                            </div>
                        </div>

                        {/* Category Wise Data */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Category Wise Data</h3>
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No Data Found</p>
                                </div>
                            </div>
                        </div>

                        {/* UTM Campaigns Data */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">UTM Campaigns Data</h3>
                                <table className="utm-table">
                                    <thead>
                                        <tr>
                                            <th>UTM Code</th>
                                            <th>Total Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Races Website</td>
                                            <td>0</td>
                                        </tr>
                                        <tr className="total-row">
                                            <td><strong>Total</strong></td>
                                            <td><strong>0</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Coupons */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Coupons</h3>
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No Data Found</p>
                                </div>
                            </div>
                        </div>

                        {/* Age Category */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Age Category</h3>
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No Data Found</p>
                                </div>
                            </div>
                        </div>

                        {/* Gender Wise */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Gender Wise</h3>
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No Data Found</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
