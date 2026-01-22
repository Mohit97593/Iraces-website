import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./RemittanceDetails.css";

export default function RemittanceDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [eventName, setEventName] = useState(location.state?.eventName || "");
    const [loading, setLoading] = useState(false);
    const [remittanceData, setRemittanceData] = useState([]);
    const [totals, setTotals] = useState({
        total_gross_amount: 0,
        total_service_charge: 0,
        total_sgst: 0,
        total_cgst: 0,
        total_igst: 0,
        total_deductions: 0,
        total_tcs: 0,
        total_tds: 0,
        total_amount_remitted: 0
    });

    // Fetch remittance data
    const fetchRemittanceData = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching remittance data for event:", eventId);

            const response = await authAPI.getRemittanceByEvent(eventId);
            console.log("✅ getRemittanceByEvent API Response:", response);

            if (response && response.data) {
                setRemittanceData(response.data.remittances || []);
                setTotals(response.data.totals || {});
            }
        } catch (error) {
            console.error("❌ Error fetching remittance data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch event data on component mount
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
            fetchRemittanceData();
        }
    }, [eventId]);

    const handleBack = () => {
        navigate(`/event-analytics/${eventId}`, { state: { eventName } });
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
                            <h1 className="contact-hero-title">{eventName || "Remittance Details"}</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>My Event</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>{eventName || "Remittance Details"}</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="remittance-container">
                <div className="remittance-header">
                    <h2>Remittance Details</h2>
                    <button className="back-btn" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading remittance data...</p>
                    </div>
                )}

                {/* Data Table */}
                <div className="table-container">
                    <table className="remittance-table">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Remittance Name</th>
                                <th>Remittance Date</th>
                                <th>Gross Amount</th>
                                <th>Service Charge</th>
                                <th>SGST</th>
                                <th>CGST</th>
                                <th>IGST</th>
                                <th>Deductions</th>
                                <th>TCS</th>
                                <th>TDS</th>
                                <th>Amount Remitted</th>
                                <th>Bank Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {remittanceData.length > 0 ? (
                                <>
                                    {remittanceData.map((remittance, index) => (
                                        <tr key={remittance.id || index}>
                                            <td>{index + 1}</td>
                                            <td>{remittance.remittance_name || 'N/A'}</td>
                                            <td>{remittance.remittance_date_formatted || remittance.remittance_date || 'N/A'}</td>
                                            <td>₹{formatCurrency(remittance.gross_amount)}</td>
                                            <td>₹{formatCurrency(remittance.service_charge)}</td>
                                            <td>₹{formatCurrency(remittance.sgst)}</td>
                                            <td>₹{formatCurrency(remittance.cgst)}</td>
                                            <td>₹{formatCurrency(remittance.igst)}</td>
                                            <td>₹{formatCurrency(remittance.deductions)}</td>
                                            <td>₹{formatCurrency(remittance.tcs)}</td>
                                            <td>₹{formatCurrency(remittance.tds)}</td>
                                            <td>₹{formatCurrency(remittance.amount_remitted)}</td>
                                            <td>{remittance.bank_reference || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr className="total-row">
                                        <td colSpan="3"><strong>Total</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_gross_amount)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_service_charge)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_sgst)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_cgst)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_igst)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_deductions)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_tcs)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_tds)}</strong></td>
                                        <td><strong>₹{formatCurrency(totals.total_amount_remitted)}</strong></td>
                                        <td></td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="13" style={{ textAlign: 'center', padding: '20px' }}>
                                        No remittance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
