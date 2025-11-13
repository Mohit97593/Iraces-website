import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import { authAPI } from "../../services/authAPI";
import EventScheduling from "./EventScheduling";
import "./CreateEvent.css";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState("draft");
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventFormData, setEventFormData] = useState({});
  // Today's date and year
  const today = new Date();
  const day = today.getDate();
  const monthShort = today.toLocaleString("default", { month: "short" });
  const monthLong = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  // Format for 'Register By' (e.g., November 12, 2025)
  const registerBy = `${monthLong} ${day}, ${year}`;

  const categoryList = [
    { label: "Running", icon: "fas fa-person-running" },
    { label: "Walking", icon: "fas fa-person-walking" },
    { label: "Cycling", icon: "fas fa-person-biking" },
    { label: "Triathlon", icon: "fas fa-person-swimming" },
    { label: "Yoga", icon: "fas fa-spa" },
    { label: "Zumba", icon: "fas fa-music" },
    { label: "Tshirt / Vest", icon: "fas fa-tshirt" },
    { label: "Event", icon: "fas fa-calendar-alt" },
    { label: "Blood Donation Drive", icon: "fas fa-hand-holding-heart" },
    { label: "Golf", icon: "fas fa-golf-ball-tee" },
    { label: "Duathlon", icon: "fas fa-person-running" },
    { label: "Olympic Distance Triathlon", icon: "fas fa-medal" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Call get events API
      const eventsRes = await authAPI.getEvents({});
      if (eventsRes && eventsRes.data && eventsRes.data.EventData) {
        setEvents(eventsRes.data.EventData);
      }

      // Call get profile API
      const profileRes = await authAPI.getProfile();
      if (profileRes && profileRes.data) {
        setProfile(profileRes.data);
      }

      // Call get category API
      const categoryRes = await authAPI.getCategory();
      if (categoryRes && categoryRes.data && categoryRes.data.Allcategory) {
        setCategories(categoryRes.data.Allcategory);
      }

      // Call get types API
      const typesRes = await authAPI.getTypes();
      if (typesRes && typesRes.data && typesRes.data.Alltypes) {
        setTypes(typesRes.data.Alltypes);
      }

      // Call event details API after all others
      if (
        eventsRes &&
        eventsRes.data &&
        eventsRes.data.EventData &&
        eventsRes.data.EventData.length > 0
      ) {
        const eventId = eventsRes.data.EventData[0].id;
        const eventDetailsRes = await authAPI.getEventDetails(eventId);
        if (eventDetailsRes) {
          setEventDetails(eventDetailsRes);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (label) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Always set event name in sessionStorage before moving to next step
    sessionStorage.setItem("eventName", eventName);
    sessionStorage.setItem(
      "eventCategories",
      JSON.stringify(selectedCategories)
    );
    sessionStorage.setItem("eventStatus", status);
    setEventFormData({
      ...eventFormData,
      eventName,
      selectedCategories,
      status,
    });
    setCurrentStep(2);
  };

  const handleSchedulingNext = (schedulingData) => {
    console.log("Event Scheduling Data:", schedulingData);
    setEventFormData({
      ...eventFormData,
      ...schedulingData,
    });
    setCurrentStep(3); // Move to next step
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="create-event-page">
        <TopNav />
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <TopNav />

      {/* Header Section */}
      {/* <div className="design-event-header">
        <div className="container">
          <h1>Design Your Event</h1>
          <div className="breadcrumb">
            <span onClick={() => navigate("/")}>Home</span>
            <span className="separator">−</span>
            <span>Design Your Event</span>
          </div>
        </div>
      </div> */}

      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">
                {currentStep === 2
                  ? sessionStorage.getItem("eventName") ||
                    eventName ||
                    "Design Your Event"
                  : "Design Your Event"}
              </h1>
              <nav className="contact-breadcrumb">
                <span onClick={() => navigate("/")}>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Design Your Event</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="container">
        <div
          className="event-steps-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            margin: "32px 0",
          }}
        >
          {[
            "Event Essentials",
            "Event Scheduling",
            "Event Details",
            "Categories",
            "Types",
            "Preview",
            "Payment",
            "Confirmation",
            "Publish",
            "Done",
          ].map((step, idx, arr) => {
            const isCompleted = idx < currentStep - 1;
            const isCurrent = idx === currentStep - 1;
            return (
              <React.Fragment key={step}>
                {isCompleted ? (
                  <div
                    className="event-step-pill"
                    style={{
                      background: "#43a047",
                      color: "#fff",
                      borderRadius: "24px",
                      padding: "10px 24px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                    }}
                  >
                    <i className="fas fa-check" style={{ marginRight: 8 }}></i>
                    {step}
                  </div>
                ) : isCurrent ? (
                  <div
                    className="event-step-pill"
                    style={{
                      background: "#da251c",
                      color: "#fff",
                      borderRadius: "24px",
                      padding: "10px 24px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                    }}
                  >
                    <i className="fas fa-circle" style={{ marginRight: 8 }}></i>
                    {step}
                  </div>
                ) : (
                  <div
                    className="event-step-circle"
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "2px solid #da251c",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#da251c",
                      fontWeight: 600,
                    }}
                  >
                    {/* Empty circle */}
                  </div>
                )}
                {idx < arr.length - 1 && (
                  <div
                    style={{
                      width: "32px",
                      height: "4px",
                      background: "#da251c",
                      borderRadius: "2px",
                    }}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container event-content-container">
        <div className="row">
          {/* Left Column - Form */}
          <div className="col-lg-8">
            {currentStep === 1 && (
              <div className="event-form-section">
                <div className="section-header">
                  <h3>Event Essentials</h3>
                  <div className="status-buttons">
                    <button
                      className={`status-btn ${
                        status === "public" ? "active" : ""
                      }`}
                      onClick={() => setStatus("public")}
                    >
                      <i className="fas fa-globe"></i> Public
                    </button>
                    <button
                      className={`status-btn ${
                        status === "private" ? "active" : ""
                      }`}
                      onClick={() => setStatus("private")}
                    >
                      <i className="fas fa-lock"></i> Private
                    </button>
                    <button
                      className={`status-btn ${
                        status === "draft" ? "active" : ""
                      }`}
                      onClick={() => setStatus("draft")}
                    >
                      <i className="fas fa-file-alt"></i> Draft
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Event Name */}
                  <div className="form-group">
                    <label>
                      Event Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`(Allowed only this special characters - , @ , ' , " )`}
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Event Category */}
                  <div className="form-group">
                    <label>
                      Event Category <span className="required">*</span>
                    </label>
                    <div className="category-grid">
                      {categories.length > 0 ? (
                        categories.map((cat, index) => {
                          // Check if logo is a valid image filename (not a name)
                          const isLogoImage =
                            cat.logo && /\.(png|jpe?g)$/i.test(cat.logo);
                          return (
                            <div
                              key={cat.id || index}
                              className={`category-card ${
                                selectedCategories.includes(cat.name)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => handleCategoryToggle(cat.name)}
                            >
                              {isLogoImage ? (
                                <img
                                  src={`https://iraces.in/uploads/category_logo/${cat.logo}`}
                                  alt={cat.name}
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                    objectFit: "contain",
                                    marginRight: "8px",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span>{cat.name}</span>
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => {}}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <p>Loading categories...</p>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn-save-continue">
                    Save & Continue
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <EventScheduling
                onBack={handleBack}
                onNext={handleSchedulingNext}
              />
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="col-lg-4">
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "1.2rem",
                marginBottom: "10px",
              }}
            >
              Event Preview
            </div>
            <div
              className="event-card search-event-card"
              style={{
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: 0,
                marginTop: 0,
                marginBottom: 24,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: "400px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "180px",
                  background: "#eee",
                }}
              >
                <img
                  src={require("../../assets/image/event-view.jpg")}
                  alt="Event Banner"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "#da251c",
                    color: "#fff",
                    padding: "6px 18px",
                    borderRadius: "16px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    zIndex: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  City Name
                </span>
                <button
                  className="search-like-btn"
                  aria-label="Like"
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    background: "#fff",
                    border: "1.5px solid #da251c",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 17.5C9.7 17.5 9.4 17.4 9.2 17.2L3.1 11.5C1.2 9.7 1.2 6.7 3.1 4.9C4.1 3.9 5.4 3.4 6.7 3.4C7.8 3.4 8.9 3.8 9.8 4.6C10.7 3.8 11.8 3.4 12.9 3.4C14.2 3.4 15.5 3.9 16.5 4.9C18.4 6.7 18.4 9.7 16.5 11.5L10.8 17.2C10.6 17.4 10.3 17.5 10 17.5Z"
                      fill="#fff"
                      stroke="#da251c"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  padding: "20px 20px 0 20px",
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#1565c0",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                    }}
                  >
                    {monthShort}
                  </span>
                  <span
                    style={{
                      color: "#da251c",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                    }}
                  >
                    {day}
                  </span>
                  <span
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#333",
                      marginLeft: "8px",
                    }}
                  >
                    {currentStep === 2
                      ? sessionStorage.getItem("eventName") ||
                        eventName ||
                        "Event Name"
                      : "Event Name"}
                  </span>
                </div>
                <hr
                  style={{
                    margin: "10px 0",
                    border: "none",
                    borderTop: "1px solid #e0e0e0",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  Register By :{" "}
                  <span
                    style={{
                      color: "#da251c",
                      fontWeight: 700,
                    }}
                  >
                    {registerBy}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "18px",
                  }}
                >
                  <span
                    style={{
                      color: "green",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="fas fa-check-circle"
                      style={{ marginRight: 6 }}
                    ></i>
                    Registration Open
                  </span>
                  <button
                    style={{
                      background: "transparent",
                      border: "2px solid #da251c",
                      color: "#da251c",
                      borderRadius: "20px",
                      padding: "6px 24px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      transition: "all 0.3s",
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
