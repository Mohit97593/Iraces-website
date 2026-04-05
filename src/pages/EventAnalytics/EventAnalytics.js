import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./EventAnalytics.css";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function EventAnalytics() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [eventName, setEventName] = useState(location.state?.eventName || "");
    const isOrgEvent = location.state?.isOrgEvent || false;
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

    const [marketingData, setMarketingData] = useState([]);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    const [marketingLoading, setMarketingLoading] = useState(false);

    // Fetch insights data
    const fetchInsights = async () => {
        try {
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

            console.log("📤 Sending payload to getInsights API:", payload);

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

            console.log("📤 Sending payload to getCategoryWiseData API:", payload);

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
            fetchMarketingData();
        }
    }, [eventId]);

    const fetchMarketingData = async () => {
        try {
            setMarketingLoading(true);
            const response = await authAPI.getMarketingByEvent({ event_id: eventId });
            if (response && response.status) {
                setMarketingData(response.data?.campaigns || []);
            }
        } catch (error) {
            console.error("❌ Error fetching marketing data:", error);
        } finally {
            setMarketingLoading(false);
        }
    };

    // Refetch insights and category data when filters change
    useEffect(() => {
        // Skip on initial mount (eventId dependency handles that)
        // Only run when filters actually change
        const hasAnyFilter = filterData.filter || filterData.category || filterData.dateFrom || filterData.dateTo;

        if (eventId && hasAnyFilter) {
            console.log("🔄 Filters changed, refetching data with filters:", filterData);

            // Call both APIs together
            const fetchBothAPIs = async () => {
                try {
                    setLoading(true);
                    console.log("🚀 Starting both API calls...");

                    console.log("📞 Calling fetchInsights...");
                    const insightsPromise = fetchInsights();

                    console.log("📞 Calling fetchCategoryWiseData...");
                    const categoryPromise = fetchCategoryWiseData();

                    await Promise.all([insightsPromise, categoryPromise]);
                    console.log("✅ Both API calls completed successfully");
                } catch (error) {
                    console.error("❌ Error fetching filtered data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchBothAPIs();
        }
    }, [filterData.filter, filterData.category, filterData.dateFrom, filterData.dateTo, eventId]);

    const handleViewMarketingDetails = async () => {
        console.log("🖱️ Marketing View Details clicked");
        setShowMarketingModal(true);
        if (marketingData.length === 0) {
            console.log("🔄 No marketing data found, fetching...");
            await fetchMarketingData();
        }
    };

    const handleBack = () => {
        navigate("/myevents");
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        if (name === "filter") {
            const today = new Date();
            const formatDate = (date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            let dateFrom = "";
            let dateTo = formatDate(today);

            if (value === "today") {
                dateFrom = formatDate(today);
            } else if (value === "week") {
                // Get Monday of current week
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(new Date().setDate(diff));
                dateFrom = formatDate(monday);
            } else if (value === "month") {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                dateFrom = formatDate(firstDay);
            }

            setFilterData(prev => ({
                ...prev,
                filter: value,
                dateFrom: dateFrom,
                dateTo: dateTo
            }));
        } else {
            setFilterData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleClearFilters = async () => {
        // Reset filter state
        setFilterData({
            filter: "",
            category: "",
            dateFrom: "",
            dateTo: ""
        });

        // Call APIs with only event_id (no filters)
        try {
            setLoading(true);

            const payload = {
                event_id: eventId
            };

            // Call both APIs with clean payload
            await Promise.all([
                authAPI.getInsights(payload),
                authAPI.getCategoryWiseData(payload)
            ]).then(([insightsResponse, categoryResponse]) => {
                // Update insights data
                if (insightsResponse && insightsResponse.data) {
                    const data = insightsResponse.data;

                    const parseCurrency = (value) => {
                        if (!value) return "0.00";
                        if (typeof value === 'string') {
                            return value.replace(/[₹,]/g, '').trim();
                        }
                        return value.toString();
                    };

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

                    if (data.TicketData && Array.isArray(data.TicketData)) {
                        setTicketCategories(data.TicketData);
                    }
                }

                // Update category data
                if (categoryResponse && categoryResponse.data) {
                    const data = categoryResponse.data;

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
            });
        } catch (error) {
            console.error("❌ Error clearing filters:", error);
        } finally {
            setLoading(false);
        }
    };

    // Check if any filter is applied
    const isFilterApplied = filterData.filter || filterData.category || filterData.dateFrom || filterData.dateTo;

    // Prepare Chart Options
    const chartOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Daily Category Count'
        },
        xAxis: {
            categories: categoryData.barChartData.map(item => item.date || item.Date || item.label || ''),
            crosshair: true,
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Category Count'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                color: '#3bb1f6' // Light blue color from screenshot
            }
        },
        series: [{
            name: 'Categories',
            data: categoryData.barChartData.map(item => item.count || item.Count || item.value || 0)
        }],
        credits: {
            enabled: true,
            text: 'Highcharts.com',
            href: 'https://www.highcharts.com'
        }
    };

    // Number of Categories Sold Chart Options
    const pieChartOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Category Booking Data'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b> ({point.y})',
                    style: {
                        color: 'black'
                    }
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Bookings',
            colorByPoint: true,
            data: categoryData.bookingData.map(item => ({
                name: item.ticket_name || item.name || item.TicketName || 'Unknown',
                y: item.TicketCount || item.total_booking || item.count || item.Total || 0,
                color: (item.ticket_name || '').includes('testo') ? '#5c5cff' : undefined // Attempt to match some colors if hinted
            }))
        }],
        credits: {
            enabled: true,
            text: 'Highcharts.com',
            href: 'https://www.highcharts.com'
        }
    };

    // Gender Distribution Pie Chart Options
    const genderChartOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Gender Distribution'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical',
            itemStyle: {
                fontSize: '14px'
            }
        },
        series: [{
            name: 'Count',
            colorByPoint: true,
            data: [
                {
                    name: `Male (${categoryData.maleCount})`,
                    y: categoryData.maleCount,
                    color: '#87CEEB' // Light blue
                },
                {
                    name: `Female (${categoryData.femaleCount})`,
                    y: categoryData.femaleCount,
                    color: '#9370DB' // Purple
                },
                {
                    name: `Other (${categoryData.otherCount})`,
                    y: categoryData.otherCount,
                    color: '#90EE90' // Light green
                }
            ]
        }],
        credits: {
            enabled: true,
            text: 'Highcharts.com',
            href: 'https://www.highcharts.com'
        }
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
                        {isFilterApplied && (
                            <button className="back-btn" onClick={handleClearFilters} style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}>
                                <i className="fas fa-times"></i> Clear Filters
                            </button>
                        )}
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
                                <Link to={`/registrations/${eventId}`} state={{ eventName, filterData, isOrgEvent }} className="view-details">View Details</Link>
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
                                <Link to={`/participants/${eventId}`} state={{ eventName, filterData, isOrgEvent }} className="view-details">View Details</Link>
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

                    {/* Payment History */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Payment History</h3>
                                {/* <div className="stat-value">{stats.pageViews}</div> */}
                                <Link to={`/payment-log/${eventId}`} state={{ eventName, filterData, isOrgEvent }} className="view-details">View Details</Link>
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

                    {/* Remittance Details */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Remittance Details</h3>
                                <Link to={`/remittance-details/${eventId}`} state={{ eventName, filterData }} className="view-details">View Details</Link>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/2331/2331978.png" alt="Remittance" />
                            </div>
                        </div>
                        <i className="info-icon fas fa-info-circle"></i>
                    </div>

                    {/* Marketing Card */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Marketing</h3>
                                <div className="stat-value">{marketingData.length} Campaigns</div>
                                <button
                                    className="view-details"
                                    onClick={handleViewMarketingDetails}
                                    style={{ border: 'none', background: 'none', padding: 0, color: '#3498db', cursor: 'pointer', textAlign: 'left', display: 'block' }}
                                >
                                    View Details
                                </button>
                            </div>
                            <div className="stat-icon">
                                <img src="https://cdn-icons-png.flaticon.com/512/1998/1998087.png" alt="Marketing" />
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
                                {/* <p className="chart-subtitle">Daily Category Count</p> */}
                                <div className="chart-container">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Number of Categories Sold */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Number of Categories Sold</h3>
                                <div className="chart-container">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={pieChartOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Wise Data */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Category Wise Data</h3>
                                <table className="utm-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Total</th>
                                            <th>Used</th>
                                            <th>Pending</th>
                                            <th>Total Collection</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryData.bookingData && categoryData.bookingData.length > 0 ? (
                                            <>
                                                {categoryData.bookingData.map((category, index) => (
                                                    <tr key={index}>
                                                        <td>{category.TicketName || category.ticket_name || 'Unknown'}</td>
                                                        <td>{category.total_quantity || 0}</td>
                                                        <td>{category.TicketCount || 0}</td>
                                                        <td>{category.PendingCount || 0}</td>
                                                        <td>₹ {formatCurrency(category.TotalAmount || 0)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="total-row">
                                                    <td><strong>Total</strong></td>
                                                    <td>
                                                        <strong>
                                                            {categoryData.bookingData.reduce((sum, cat) =>
                                                                sum + (cat.total_quantity || 0), 0
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {categoryData.bookingData.reduce((sum, cat) =>
                                                                sum + (cat.TicketCount || 0), 0
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {categoryData.bookingData.reduce((sum, cat) =>
                                                                sum + (cat.PendingCount || 0), 0
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            ₹ {formatCurrency(
                                                                categoryData.bookingData.reduce((sum, cat) =>
                                                                    sum + parseFloat(cat.TotalAmount || 0), 0
                                                                )
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No Data Found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
                                        {categoryData.utmCode && categoryData.utmCode.length > 0 ? (
                                            <>
                                                {categoryData.utmCode.map((utm, index) => (
                                                    <tr key={index}>
                                                        <td>{utm.utm_campaign || 'Unknown'}</td>
                                                        <td>{utm.total_quantity || 0}</td>
                                                    </tr>
                                                ))}
                                                <tr className="total-row">
                                                    <td><strong>Total</strong></td>
                                                    <td>
                                                        <strong>
                                                            {categoryData.utmCode.reduce((sum, utm) =>
                                                                sum + (utm.total_quantity || 0), 0
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <>
                                                <tr>
                                                    <td>Races Website</td>
                                                    <td>0</td>
                                                </tr>
                                                <tr className="total-row">
                                                    <td><strong>Total</strong></td>
                                                    <td><strong>0</strong></td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Coupons */}
                        <div className="col-lg-6">
                            <div className="chart-card">
                                <h3 className="chart-title">Coupons</h3>
                                {categoryData.couponCodes && categoryData.couponCodes.length > 0 ? (
                                    <table className="utm-table">
                                        <thead>
                                            <tr>
                                                <th>Coupon Code</th>
                                                <th>Total</th>
                                                <th>Used</th>
                                                <th>Pending</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryData.couponCodes.map((coupon, index) => {
                                                const total = coupon.TotalDiscountCode || 0;
                                                const used = coupon.CouponCount || 0;
                                                const pending = total - used;

                                                // Extract the coupon code for display
                                                let couponCode = 'Unknown';

                                                // Check each field and only use it if it's a string and not a number
                                                const possibleFields = [
                                                    coupon.DiscountCode,
                                                    coupon.DiscountName,
                                                    coupon.discount_code,
                                                    coupon.discount_name,
                                                    coupon.coupon_code,
                                                    coupon.code,
                                                    coupon.CouponCode,
                                                    coupon.CouponName
                                                ];

                                                for (const field of possibleFields) {
                                                    if (field && typeof field === 'string' && field !== 'Unknown' && isNaN(field)) {
                                                        couponCode = field;
                                                        break;
                                                    }
                                                }

                                                // Get coupon ID for API (this is what the API expects)
                                                const couponId = coupon.coupon_id || coupon.id || 0;

                                                console.log('🎫 Coupon data:', {
                                                    index,
                                                    coupon,
                                                    displayCode: couponCode,
                                                    couponId: couponId,
                                                    used
                                                });

                                                return (
                                                    <tr key={index}>
                                                        <td>{couponCode}</td>
                                                        <td>{total}</td>
                                                        <td>
                                                            {used > 0 ? (
                                                                <Link
                                                                    to={`/participants/${eventId}`}
                                                                    state={{
                                                                        coupon_used_flag: couponId,
                                                                        event_id: eventId,
                                                                        limit: 30,
                                                                        page: 1
                                                                    }}
                                                                    onClick={() => {
                                                                        console.log('🔗 Coupon link clicked!', {
                                                                            displayCode: couponCode,
                                                                            couponId: couponId,
                                                                            stateBeingSent: {
                                                                                coupon_used_flag: couponId,
                                                                                event_id: eventId,
                                                                                limit: 30,
                                                                                page: 1
                                                                            }
                                                                        });
                                                                    }}
                                                                    style={{
                                                                        color: '#3498db',
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer',
                                                                        fontWeight: '500'
                                                                    }}
                                                                >
                                                                    {used}
                                                                </Link>
                                                            ) : (
                                                                used
                                                            )}
                                                        </td>
                                                        <td>{pending}</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="total-row">
                                                <td><strong>Total</strong></td>
                                                <td>
                                                    <strong>
                                                        {categoryData.couponCodes.reduce((sum, coupon) =>
                                                            sum + (coupon.TotalDiscountCode || 0), 0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {categoryData.couponCodes.reduce((sum, coupon) =>
                                                            sum + (coupon.CouponCount || 0), 0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {categoryData.couponCodes.reduce((sum, coupon) => {
                                                            const total = coupon.TotalDiscountCode || 0;
                                                            const used = coupon.CouponCount || 0;
                                                            return sum + (total - used);
                                                        }, 0)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-data-placeholder">
                                        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                        <p>No Data Found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Custom Questions (CountArray) */}
                        {categoryData.customQuestions && Object.keys(categoryData.customQuestions).length > 0 && (
                            <>
                                {Object.entries(categoryData.customQuestions).map(([questionId, questionData]) => {
                                    // Extract question label
                                    const questionLabel = questionData.question_label || `Question ${questionId}`;

                                    // Extract options data (all keys except 'question_label')
                                    const optionsData = Object.entries(questionData)
                                        .filter(([key]) => key !== 'question_label')
                                        .map(([optionId, optionData]) => ({
                                            id: optionId,
                                            label: optionData.label || 'Unknown',
                                            count: optionData.count || 0,
                                            limit: optionData.limit || 0,
                                            initialLimit: optionData.initial_limit || 0
                                        }));

                                    // Calculate totals
                                    const totalCount = optionsData.reduce((sum, opt) => sum + parseInt(opt.count || 0), 0);
                                    const totalLimit = optionsData.reduce((sum, opt) => sum + parseInt(opt.limit || 0), 0);
                                    const totalInitialLimit = optionsData.reduce((sum, opt) => sum + parseInt(opt.initialLimit || 0), 0);

                                    return (
                                        <div className="col-lg-6" key={questionId}>
                                            <div className="chart-card">
                                                <h3 className="chart-title">{questionLabel}</h3>
                                                <table className="utm-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Label</th>
                                                            <th>Count</th>
                                                            <th>Limit</th>
                                                            <th>Total Count</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {optionsData.map((option) => (
                                                            <tr key={option.id}>
                                                                <td>{option.label}</td>
                                                                <td>{option.count}</td>
                                                                <td>{option.limit}</td>
                                                                <td>{option.initialLimit}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="total-row">
                                                            <td><strong>Total</strong></td>
                                                            <td><strong>{totalCount}</strong></td>
                                                            <td><strong>{totalLimit}</strong></td>
                                                            <td><strong>{totalInitialLimit}</strong></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}

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
                                <div className="chart-container">
                                    {(categoryData.maleCount > 0 || categoryData.femaleCount > 0 || categoryData.otherCount > 0) ? (
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={genderChartOptions}
                                        />
                                    ) : (
                                        <div className="no-data-placeholder">
                                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                            <p>No Data Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Marketing Details Modal */}
            {showMarketingModal && (
                <div className="analytics-modal-overlay">
                    <div className="analytics-modal-content">
                        <div className="analytics-modal-header">
                            <h2>Marketing Campaign Details</h2>
                            <button className="close-modal-btn" onClick={() => setShowMarketingModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="analytics-modal-body">
                            {marketingLoading ? (
                                <div className="modal-loading">
                                    <div className="spinner"></div>
                                    <p>Loading campaign data...</p>
                                </div>
                            ) : marketingData.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="utm-table">
                                        <thead>
                                            <tr>
                                                <th>Campaign Name</th>
                                                <th>Type</th>
                                                <th>Total Count</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marketingData.map((campaign) => (
                                                <tr key={campaign.id}>
                                                    <td>{campaign.campaign_name}</td>
                                                    <td>{campaign.campaign_type}</td>
                                                    <td>{campaign.count}</td>
                                                    <td>{new Date(campaign.start_date * 1000).toLocaleDateString()}</td>
                                                    <td>{new Date(campaign.end_date * 1000).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${campaign.status === 1 ? 'status-active' : 'status-inactive'}`}>
                                                            {campaign.status === 1 ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-placeholder">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Data" />
                                    <p>No marketing campaigns found for this event.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
