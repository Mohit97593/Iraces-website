import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import { authAPI } from "../../services/authAPI";
import "../Contact/Contact.css"; // Reuse contact page hero styles
import "./FooterContent.css";

export default function FooterContent() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getFooterButtons();
        if (response && response.data && response.data.footer_buttons) {
          const button = response.data.footer_buttons.find(
            (b) => b.id.toString() === id
          );
          if (button) {
            setContent(button);
          } else {
            setError("Content not found");
          }
        }
      } catch (err) {
        console.error("Error fetching footer button content:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  return (
    <div className="footer-content-page">
      <TopNav />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">
                {loading ? "Loading..." : content ? content.name : "Not Found"}
              </h1>
              <nav className="contact-breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-separator">→</span>
                <span>{content ? content.name : "Page"}</span>
              </nav>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="dynamic-content-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="content-container card shadow-sm p-4 p-md-5 mb-5 bg-white rounded">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger text-center" role="alert">
                    {error}
                  </div>
                ) : (
                  <div
                    className="rendered-html-content"
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
