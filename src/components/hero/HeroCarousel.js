// Use base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toggleModal } from "../../slice/hero/heroSlice";
import "./Hero.css";
// Font Awesome is provided via CDN in public/index.html; remove local import to avoid build errors
import Avatar1 from "../../assets/image/avatar1.jpg";
import Avatar2 from "../../assets/image/avatar2.jpg";
import Avatar3 from "../../assets/image/avatar3.jpg";
import Avatar4 from "../../assets/image/avatar4.jpg";
import logo from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";
import EventsPanel from "../EventsPanel/EventsPanel";
import TrainingPanel from "../TrainingPanel/TrainingPanel";
import WhyRunmatePanel from "../RunmatePanel/WhyRunmatePanel";
import RunUnintentionallyPanel from "../UnintentionallyPanel/RunUnintentionallyPanel";
import CoachesPanel from "../CoachesPanel/CoachesPanel";
import InstagramGrid from "../InstagramGrid/InstagramGrid";
import TestimonialsCarousel from "../TestimonialsCarousel/TestimonialsCarousel";
import BlogPanel from "../BlogPanel/BlogPanel";
import FAQPanel from "../FAQPanel/FAQPanel";
import Footer from "../Footer/Footer";

export default function HeroCarousel() {
  // Local state for API banners
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  // Animation state
  const [animate, setAnimate] = useState(false);
  const numbersRef = useRef(null);

  // Fetch banners from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          setSlides(data.data);
        }
      });
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slides]);

  // Animation trigger
  useEffect(() => {
    const id = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(id);
  }, []);

  // Numbers section animation (unchanged)
  const countUp = (el, target, duration = 2000) => {
    const start = performance.now();
    const from = 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t;
      const current = Math.round(from + (target - from) * eased);
      el.textContent = `${current}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = `${target}${suffix}`;
    };
    requestAnimationFrame(step);
  };
  useEffect(() => {
    if (!numbersRef.current) return;
    const node = numbersRef.current;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = node.querySelectorAll(".number-card");
            cards.forEach((c, i) => {
              setTimeout(() => c.classList.add("visible"), i * 120);
            });
            const counters = node.querySelectorAll("[data-target]");
            counters.forEach((el) => {
              const target = parseInt(el.getAttribute("data-target"), 10) || 0;
              const idx = Array.from(counters).indexOf(el);
              setTimeout(() => countUp(el, target, 1600), idx * 140);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  console.log("Number of slides:", slides);
  if (!slides || slides.length === 0) return null;

  const active = slides[currentIndex];
  const staticTitle = "RUN TOGETHER, ACHIEVE MORE";
  const staticSubtitle =
    "Join our vibrant running club and conquer every mile – from weekend jogs to marathon triumphs.";

  // Default banner image import
  const defaultBanner = require("../../assets/image/default-banner.png");
  // Local state to track image error
  const [bannerError, setBannerError] = useState(false);

  // Helper to get banner image src
  const getBannerSrc = () => {
    if (bannerError || !active.banner_image_url) return defaultBanner;
    return active.banner_image_url;
  };

  return (
    <>
      <section className="hero-viewport">
        <div className="hero-slide">
          {/* Banner image with error fallback */}
          <div className="hero-bg">
            <img
              src={getBannerSrc()}
              alt="Banner"
              className="banner-img"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
              }}
              onError={() => setBannerError(true)}
            />
          </div>
          <div className="hero-overlay">
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                <div
                  className={`col-lg-7 text-white position-relative`}
                  style={{ marginBottom: "80px" }}
                >
                  <div className="avatar-row mb-3">
                    <img src={Avatar1} className="avatar" alt="a" />
                    <img src={Avatar2} className="avatar" alt="b" />
                    <img src={Avatar3} className="avatar" alt="c" />
                    <img src={Avatar4} className="avatar" alt="d" />
                    <div className="active-count ms-3">
                      1.200+
                      <br />
                      <small>Active Members</small>
                    </div>
                  </div>

                  <h4
                    className={`display-1 hero-title ${
                      animate ? "animated slide-in-left" : ""
                    }`}
                    style={{
                      fontSize: "90px",
                      lineHeight: "100px",
                      // marginBottom: "1rem",
                    }}
                  >
                    {staticTitle}
                  </h4>
                  <p className="lead hero-sub">{staticSubtitle}</p>
                  {/* ✅ Modal Open Button */}
                  <button
                    className="btn btn-success mt-3"
                    onClick={() => dispatch(toggleModal())}
                  >
                    Learn More
                  </button>
                </div>

                <div className="col-lg-5 d-flex justify-content-end align-items-center">
                  <div className={animate ? "animated slide-in-right" : ""}>
                    <div className="upcoming-card">
                      <img src={logo} alt="event" className="upcoming-image" />
                      <div className="upcoming-content">
                        <div className="upcoming-header">
                          <div className="badge">- UPCOMING RACES -</div>
                          <h4>
                            RACES CITY
                            <br />
                            SPRINT 10K
                          </h4>
                        </div>
                        <div className="info-box mt-3 p-3">
                          <div className="info-row">
                            <i
                              className="info-icon fa-regular fa-calendar"
                              aria-hidden="true"
                            ></i>
                            <span>
                              <strong>September 20, 2025</strong>
                            </span>
                          </div>
                          <div className="info-row">
                            <i
                              className="info-icon fa-regular fa-clock"
                              aria-hidden="true"
                            ></i>
                            <span>Start 05:00 AM - Finish 10:00 AM</span>
                          </div>
                          <div className="info-row">
                            <i
                              className="info-icon fa-solid fa-location-dot"
                              aria-hidden="true"
                            ></i>
                            <span>South Jekardah</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="social-vertical">
          <a
            className="social-btn"
            href="https://www.facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f" aria-hidden="true" />
          </a>

          <a
            className="social-btn"
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" aria-hidden="true" />
          </a>

          <a
            className="social-btn"
            href="https://www.threads.net"
            target="_blank"
            rel="noreferrer"
            aria-label="Threads"
          >
            {/* Font Awesome may not include an official Threads icon depending on version; using 'fa-x' (or update FA) */}
            <i className="fab fa-x" aria-hidden="true" />
          </a>

          <a
            className="social-btn"
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter" aria-hidden="true" />
          </a>
        </div>

        <div className="hero-controls container">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              className={`dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        {/* --- Numbers / Stats section (matches provided screenshot) --- */}
        <section ref={numbersRef} className="numbers-section container mt-5">
          <div className="row align-items-start">
            <div className="col-md-3 d-none d-md-block">
              <div className="numbers-pill">- RACES IN NUMBERS -</div>
            </div>

            <div className="col-12 col-md-9">
              <p className="numbers-intro">
                RACES is India’s first fully integrated registration platform
                for running events. Beside being a registration platform for
                running events, we also provide technology solutions, back
                office service and go-to-market offerings to grow your running
                event.
              </p>

              <div className="row number-cards mt-4">
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="85"
                      data-suffix="+"
                    >
                      0
                    </div>
                    <div className="number-title">COMMUNITY EVENTS</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="98"
                      data-suffix="%"
                    >
                      0
                    </div>
                    <div className="number-title">MEMBER COMPLETION RATE</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="number-card">
                    <div
                      className="number-value"
                      data-target="320"
                      data-suffix="+"
                    >
                      0
                    </div>
                    <div className="number-title">PERSONAL BESTS ACHIEVED</div>
                    <div className="number-desc">
                      Fusce gravida purus etilamu quam viverra, vel aliquam arcu
                      meris porttitor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Feature / About section (images left/center, text right) --- */}
        <section className="feature-section my-5">
          <div className="row align-items-start">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="feature-image-wrap">
                <img
                  src={require("../../assets/image/run1.jpg")}
                  alt="run1"
                  className="feature-image rounded-xl"
                />
              </div>
              <div className="mt-4">
                <button className="about-btn">ABOUT US</button>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
              <div className="feature-image-wrap center-card">
                <img
                  src={require("../../assets/image/run2.jpg")}
                  alt="run2"
                  className="feature-image tall rounded-xl"
                />
              </div>
            </div>

            <div className="col-lg-5 col-md-12">
              <h2 className="feature-title" style={{ fontSize: "42px" }}>
                STRONGER WITH EVERY STRIDE.
              </h2>
              <p className="feature-copy">
                Races is more than just a running club—it’s a thriving,
                inclusive community where runners of all levels come together to
                train, race, and grow. Founded in 2018, we’ve helped over 1,200
                runners across 12 cities reach their goals—whether it’s a
                couch-to-5K transformation or a Boston-qualifier dream.
              </p>

              <div className="feature-pills mt-4">
                <div className="pill">
                  <i
                    className="fa-regular fa-flag me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Weekly Community Runs
                </div>
                <div className="pill">
                  <i
                    className="fa-regular fa-bullseye me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Personalized Training Support
                </div>
                <div className="pill">
                  <i
                    className="fa-regular fa-users-line me-2"
                    style={{ color: "#9cf09c" }}
                  />
                  Open to All Ages & Skill Levels
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events listing added below the About/Feature section */}
        <EventsPanel />

        {/* Training Programs section (matches screenshot) */}
        <TrainingPanel />

        {/* Why Runmate section */}
        <WhyRunmatePanel />

        {/* Run Unintentionally section */}
        <RunUnintentionallyPanel />

        {/* Coaches section */}
        <CoachesPanel />

        <InstagramGrid />

        {/* {Testimonials} */}
        <TestimonialsCarousel />

        {/* Blog Section */}
        <BlogPanel />

        {/* FAQ Section */}
        <FAQPanel />
      </section>

      <Footer />
    </>
  );
}
