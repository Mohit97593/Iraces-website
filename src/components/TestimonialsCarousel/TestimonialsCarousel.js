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
  // Carousel logic: show N cards per slide, auto-slide, show dots
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(1);
  useEffect(() => {
    function handleResize() {
      setCardsPerSlide(Math.max(1, Math.floor(window.innerWidth / 370)));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Total possible starting indices for sliding one by one
  const totalSlides =
    testimonials.length > cardsPerSlide
      ? testimonials.length - cardsPerSlide + 1
      : 1;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(timer);
  }, [totalSlides, cardsPerSlide]);

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
        {/* <div className="col-12 col-md-3">
          <button className="testimonials-cta w-100">JOIN THE COMMUNITY</button>
        </div> */}
      </div>
      {/* Carousel grid: show only current slide's cards */}
      <div
        className="testimonials-grid"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "stretch",
          gap: "24px",
          minHeight: "340px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div className="text-center w-100">Loading...</div>
        ) : error ? (
          <div className="text-center w-100 text-danger">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center w-100">No testimonials found.</div>
        ) : (
          testimonials
            .slice(currentSlide, currentSlide + cardsPerSlide)
            .map((t, idx) => (
              <div
                className="testimonial-card"
                key={idx + currentSlide}
                style={{
                  minWidth: "320px",
                  maxWidth: "340px",
                  flex: "1 1 320px",
                  margin: "0 auto",
                }}
              >
                {/* Show testimonial image only if present from API (field: testimonial_img) */}
                {t.testimonial_img && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <img
                      src={t.testimonial_img}
                      alt={getField(
                        t,
                        ["testimonial_name", "name"],
                        "Anonymous"
                      )}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px #ccc",
                      }}
                    />
                  </div>
                )}
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
                      [
                        "testimonial_text",
                        "text",
                        "testimonial",
                        "description",
                      ],
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
      {/* Navigation dots for carousel (one dot per possible slide) */}
      {!loading && !error && totalSlides > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
            gap: "8px",
          }}
        >
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: idx === currentSlide ? "#222" : "#ccc",
                border: "none",
                cursor: "pointer",
                outline: "none",
                transition: "background 0.12s",
              }}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TestimonialsCarousel;
