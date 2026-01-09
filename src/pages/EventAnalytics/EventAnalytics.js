import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./EventAnalytics.css";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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
        }
    }, [eventId]);

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

    const handleBack = () => {
        navigate("/myevents");
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({ ...prev, [name]: value }));
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
                y: item.total_booking || item.count || item.Total || 0,
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

                    {/* Payment History */}
                    <div className="stat-card">
                        <div className="stat-content">
                            <div className="stat-info">
                                <h3>Payment History</h3>
                                {/* <div className="stat-value">{stats.pageViews}</div> */}
                                <Link to={`/payment-log/${eventId}`} className="view-details">View Details</Link>
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
                                                return (
                                                    <tr key={index}>
                                                        <td>{coupon.DiscountCode || coupon.DiscountName || 'Unknown'}</td>
                                                        <td>{total}</td>
                                                        <td>{used}</td>
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
        </>
    );
}
