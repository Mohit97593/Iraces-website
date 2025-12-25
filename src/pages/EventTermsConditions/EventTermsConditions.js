import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import { authAPI } from "../../services/authAPI";
import "./EventTermsConditions.css";

export default function EventTermsConditions() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [termsContent, setTermsContent] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchTermsConditions();
    }, [eventId]);

    const fetchTermsConditions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.getEventTermsConditions(eventId);
            if (response && response.data && response.data.TermsConditions) {
                setTermsContent(response.data.TermsConditions);
            } else {
                setError("No terms and conditions found for this event.");
            }
        } catch (error) {
            console.error("Error fetching terms and conditions:", error);
            setError("Failed to load terms and conditions. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="event-terms-page">
                <TopNav />
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading terms and conditions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="event-terms-page">
            <TopNav />

            {/* Blue Header Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="contact-hero-title">Terms & Conditions</h1>
                            <nav className="contact-breadcrumb">
                                <span>Home</span>
                                <span className="breadcrumb-separator">→</span>
                                <span>Terms & Conditions</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="container terms-container">
                <div className="terms-content-wrapper">
                    {error ? (
                        <div className="error-message1">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div
                            className="terms-content"
                            dangerouslySetInnerHTML={{ __html: termsContent }}
                        />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
