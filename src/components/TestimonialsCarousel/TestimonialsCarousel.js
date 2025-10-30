import React, { useEffect, useState } from "react";
import "./TestimonialsCarousel.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function stripHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch(`${API_BASE_URL}/get_testimonial`);
        const result = await response.json();
        // Try to log and inspect the actual API response
        console.log("API testimonials response:", result);
        if (result?.data?.testimonials) {
          setTestimonials(result.data.testimonials);
        } else {
          setTestimonials([]);
        }
      } catch (err) {
        setError("Failed to load testimonials.");
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  // Helper to get correct field names
  const getField = (obj, keys, fallback = "") => {
    for (let k of keys) {
      if (obj[k] && typeof obj[k] === "string" && obj[k].trim() !== "")
        return obj[k];
    }
    return fallback;
  };

  return (
    <div className="testimonials-section container-fluid">
      <div className="testimonials-header row justify-content-center align-items-center text-center">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <span className="testimonials-label d-inline-block w-100">
            - TESTIMONIALS -
          </span>
        </div>
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <h2 className="testimonials-title w-100">
            REAL RUNNERS, REAL STORIES
          </h2>
        </div>
        <div className="col-12 col-md-3">
          <button className="testimonials-cta w-100">JOIN THE COMMUNITY</button>
        </div>
      </div>
      <div className="testimonials-grid">
        {loading ? (
          <div className="text-center w-100">Loading...</div>
        ) : error ? (
          <div className="text-center w-100 text-danger">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center w-100">No testimonials found.</div>
        ) : (
          testimonials.map((t, idx) => (
            <div className="testimonial-card" key={idx}>
              <div
                style={{
                  fontSize: "2.5rem",
                  color: "#eee",
                  marginBottom: "-16px",
                }}
              >
                “
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                  marginTop: "8px",
                }}
              >
                {getField(t, ["testimonial_name", "name"], "Anonymous")}
              </div>
              <div
                style={{
                  fontStyle: "italic",
                  color: "#888",
                  fontSize: "1rem",
                  marginBottom: "12px",
                }}
              >
                {getField(t, ["testimonial_role", "role"], "Athlete")}
              </div>
              <div
                style={{
                  fontWeight: "normal",
                  fontSize: "1.1rem",
                  margin: "12px 0",
                }}
              >
                {stripHtml(
                  getField(
                    t,
                    ["testimonial_text", "text", "testimonial", "description"],
                    "No testimonial text."
                  )
                )}
              </div>
              <div style={{ margin: "24px 0 0 0" }}>
                {Array.from({ length: t.stars || 5 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      color: "#000",
                      fontSize: "1.3rem",
                      marginRight: "2px",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TestimonialsCarousel;
