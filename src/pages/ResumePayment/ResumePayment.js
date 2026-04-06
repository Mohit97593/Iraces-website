import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authAPI";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import "./ResumePayment.css";

export default function ResumePayment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const txnid = searchParams.get("txnid");
    const eventId = searchParams.get("event_id");

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [resuming, setResuming] = useState(false);

    useEffect(() => {
        if (!txnid || !eventId) {
            setError("Invalid payment link. Missing transaction ID or event ID.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Event Details
                const eventsResponse = await authAPI.getEvents({ event_id: eventId });
                if (eventsResponse && eventsResponse.data && eventsResponse.data.EventData && eventsResponse.data.EventData.length > 0) {
                    setEvent(eventsResponse.data.EventData[0]);
                }

                // 2. Fetch Resume Payment Data
                console.log("🔄 Fetching resume payment data for txnid:", txnid);
                const response = await authAPI.resumePayment({ txnid: txnid });
                console.log("✅ Resume Payment API Response:", response);

                if (response && (response.status === "success" || response.data || response.message === "Resume payment ready")) {
                    setPaymentData(response.data || response);
                } else {
                    setError(response?.message || "Unable to resume payment. Please contact support.");
                }
            } catch (err) {
                console.error("❌ Error resuming payment:", err);
                setError("An error occurred while trying to resume your payment. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [txnid, eventId]);

    const handlePayNow = async () => {
        if (!txnid) return;

        setResuming(true);
        setError(null);
        
        try {
            // 1. Re-fetch the latest payment data to get a fresh hash/redirect_url
            console.log("🔄 Re-fetching fresh payment data before redirect...");
            const response = await authAPI.resumePayment({ txnid: txnid });
            console.log("📥 Fresh Resume Payment Response:", response);

            if (!response || (response.status === "error" && !response.data)) {
                throw new Error(response?.message || "Failed to get fresh payment data. Please try again.");
            }

            const freshData = response.data || response;
            setPaymentData(freshData); // Update local state with fresh data

            // 2. Determine Gateway and Redirect
            const gateway = (freshData.payment_gateway || "").toLowerCase();
            
            // Priority 1: PayU Payment (Form POST)
            if (gateway.includes('payu') || (freshData.hash && (freshData.merchant_key || freshData.key))) {
                console.log("💳 Initiating PayU payment for resumed transaction...");
                
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.iraces.in/api';
                
                const fields = {
                    key: freshData.merchant_key || freshData.key || '',
                    txnid: freshData.txnid || txnid,
                    amount: freshData.amount || '',
                    productinfo: freshData.productinfo || event?.name || 'Event Registration',
                    firstname: freshData.firstname || freshData.first_name || '',
                    lastname: freshData.lastname || freshData.last_name || '',
                    email: freshData.email || '',
                    phone: freshData.phone_no || freshData.phone || '',
                    surl: freshData.surl || `${API_BASE_URL}/payment_gateway/success`,
                    furl: freshData.furl || `${API_BASE_URL}/payment_gateway/failure`,
                    hash: freshData.hash || ''
                };

                console.log("📦 Submitting PayU Form with fields:", fields);

                // Create form
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://secure.payu.in/_payment';
                form.id = 'payu-resume-form';

                Object.keys(fields).forEach(key => {
                    const value = fields[key];
                    if (value !== undefined && value !== null && value !== '') {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = String(value).trim();
                        form.appendChild(input);
                    }
                });

                document.body.appendChild(form);
                form.submit();

                // Cleanup fallback
                setTimeout(() => {
                    if (document.getElementById('payu-resume-form')) {
                        document.body.removeChild(form);
                    }
                }, 2000);
            } 
            // Priority 2: PhonePe or other Redirect based payments
            else if (freshData.redirect_url) {
                console.log("🔗 Redirecting to payment gateway:", freshData.redirect_url);
                window.location.href = freshData.redirect_url;
            } 
            // Priority 3: Fallback based on Gateway name
            else if (gateway.includes('phonepe')) {
                 setError("PhonePe redirection URL is missing. Please try again or contact support.");
                 setResuming(false);
            }
            else {
                setError("Payment gateway is not properly configured for this transaction.");
                setResuming(false);
            }
        } catch (err) {
            console.error("❌ Error initiating payment redirect:", err);
            setError(err.message || "Failed to initiate payment. Please try again.");
            setResuming(false);
        }
    };

    return (
        <div className="resume-payment-page">
            <TopNav />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="contact-hero-title">
                                {event ? event.name : "Resume Payment"}
                            </h1>
                            <nav className="contact-breadcrumb justify-content-center">
                                <span onClick={() => navigate("/")} style={{cursor: 'pointer'}}>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>Complete Registration</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            <main className="resume-container">
                <div className="resume-card shadow-lg">
                    {loading ? (
                        <div className="resume-state">
                            <i className="fas fa-spinner fa-spin resume-icon"></i>
                            <h2>Fetching Your Details...</h2>
                            <p>Please wait while we retrieve your transaction information.</p>
                        </div>
                    ) : error ? (
                        <div className="resume-state error">
                            <i className="fas fa-exclamation-circle resume-icon"></i>
                            <h2>Oops! Something Went Wrong</h2>
                            <p className="error-msg">{error}</p>
                            <button className="back-home-btn" onClick={() => navigate("/")}>
                                Back to Home
                            </button>
                        </div>
                    ) : (
                        <div className="resume-content">
                            <div className="resume-header">
                                <i className="fas fa-credit-card resume-icon-success"></i>
                                <h2>Complete Your Payment</h2>
                                <p>We found your pending registration for <strong>{event?.name || paymentData?.productinfo}</strong>.</p>
                            </div>

                            <div className="transaction-details">
                                <div className="detail-row">
                                    <span className="detail-label">Event:</span>
                                    <span className="detail-value">{event?.name || paymentData?.productinfo}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Transaction ID:</span>
                                    <span className="detail-value">{txnid}</span>
                                </div>
                                
                                {paymentData?.firstname && (
                                    <div className="detail-row">
                                        <span className="detail-label">Participant:</span>
                                        <span className="detail-value">{paymentData.firstname} {paymentData.lastname || ""}</span>
                                    </div>
                                )}

                                {paymentData?.email && (
                                    <div className="detail-row">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{paymentData.email}</span>
                                    </div>
                                )}

                                {paymentData?.phone_no && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{paymentData.phone_no}</span>
                                    </div>
                                )}

                                <div className="detail-row">
                                    <span className="detail-label">Total Amount:</span>
                                    <span className="detail-value highlight">₹{paymentData?.amount}</span>
                                </div>
                                
                                {paymentData?.payment_gateway && (
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Gateway:</span>
                                        <span className="detail-value">{paymentData.payment_gateway}</span>
                                    </div>
                                )}
                            </div>

                            <div className="resume-actions">
                                <p className="resume-info-text">
                                    Click the button below to securely complete your transaction.
                                </p>
                                <button 
                                    className={`pay-now-btn ${resuming ? "processing" : ""}`}
                                    onClick={handlePayNow}
                                    disabled={resuming}
                                >
                                    {resuming ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                                    ) : (
                                        `Pay ₹${paymentData?.amount} Now`
                                    )}
                                </button>
                                <p className="secure-text">
                                    <i className="fas fa-lock"></i> 100% Secure Transaction via {paymentData?.payment_gateway || "Gateway"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>


            <Footer />
        </div>
    );
}
