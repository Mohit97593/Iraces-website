import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import Footer from "../../components/Footer/Footer";
import { authAPI } from "../../services/authAPI";
import EventScheduling from "./EventScheduling";
import EventImages from "./EventImages";
import EventSettings from "./EventSettings";
import RaceCategories from "./RaceCategories";
import "./CreateEvent.css";
import FormQuestions from "./FormQuestions";
import AgeCategory from "./AgeCategory";
import DiscountCoupons from "./DiscountCoupons";
import CommunicationsStep from "./CommunicationsStep";
import FAQsStep from "./FAQsStep";
import Integrations from "./Integrations";

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
  // Track last event_id to clear scheduling form data for new event
  const [lastEventId, setLastEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventFormData, setEventFormData] = useState({});
  const [savedSteps, setSavedSteps] = useState(new Array(11).fill(false)); // Track saved status for each step (now 11 steps)
  const [showPreview, setShowPreview] = useState(true);
  const [cityName, setCityName] = useState("");
  const [paidType, setPaidType] = useState("");
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
    // If URL contains ?step=N, use it to open that step (useful when navigating back after save)
    try {
      const params = new URLSearchParams(window.location.search || "");
      const s = params.get("step");
      if (s) {
        const n = Number(s);
        if (!Number.isNaN(n) && n >= 1 && n <= 8) setCurrentStep(n);
      }
    } catch (e) {
      console.error("Failed to parse step query param:", e);
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Reset showPreview when changing steps
    if (currentStep !== 5) {
      setShowPreview(true);
    }
  }, [currentStep]);

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

  // sanitize event name to allow letters, numbers, spaces and -, @, comma, single and double quotes
  const sanitizeEventName = (value) => {
    if (!value && value !== "") return value;
    // allow letters, numbers, spaces, hyphen, at, comma, single quote, double quote
    const allowed = value.replace(/[^0-9A-Za-z \-@,\'\"]/g, "");
    return allowed;
  };

  const handleSchedulingNext = (schedulingData) => {
    if (schedulingData && schedulingData.city) {
      setCityName(schedulingData.city);
      sessionStorage.setItem("eventCityName", schedulingData.city);
    }
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[1] = true;
      return updated;
    });
    setEventFormData({
      ...eventFormData,
      ...schedulingData,
    });
    setCurrentStep(3); // Move to next step
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Mark the current step as saved (for progress) and move to a target step
  const markCurrentSavedAndGo = (targetStep) => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      // mark current as saved
      if (currentStep - 1 >= 0 && currentStep - 1 < updated.length)
        updated[currentStep - 1] = true;
      return updated;
    });
    setCurrentStep(targetStep);
  };

  // Update save handlers for each step
  const handleEssentialsSave = async () => {
    try {
      setLoading(true);

      // Map status to numeric value (1=public, 2=private, 3=draft)
      const statusMap = {
        public: 1,
        private: 2,
        draft: 3,
      };

      // Prepare category_id array with checked status
      const category_id = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        logo: cat.logo || cat.name,
        active: cat.active || 1,
        checked: selectedCategories.includes(cat.name) ? "true" : "false",
      }));

      // Prepare event_types array with checked status
      const event_types = types.map((type) => ({
        id: type.id,
        name: type.name,
        logo: type.logo || "",
        show_as_home: type.show_as_home || 0,
        sort_order: type.sort_order || 0,
        active: type.active || 1,
        checked: "false", // Default to false, update based on selection if needed
      }));

      const payload = {
        event_info_status: statusMap[status],
        event_name: sanitizeEventName(eventName),
        display_name_status: 0,
        display_name: "",
        event_type: 0,
        category_id: category_id,
        event_types: event_types,
        created_by: profile?.user_id || "",
        by_admin: "",
        url_link: window.location.origin,
      };

      // If editing existing event, add event_id
      if (eventDetails?.data?.event_id) {
        payload.event_id = eventDetails.data.event_id;
      }

      const response = await authAPI.createEventBasicInfo(payload);

      if (response.success === 200) {
        // Store event_id in session storage
        if (response.data?.event_id) {
          sessionStorage.setItem("event_id", response.data.event_id);
          // If new event_id, clear scheduling form data
          if (lastEventId !== response.data.event_id) {
            sessionStorage.removeItem("eventSchedulingFormData");
            setLastEventId(response.data.event_id);
          }
        }

        setSavedSteps((prev) => {
          const updated = [...prev];
          updated[0] = true;
          return updated;
        });
        setCurrentStep(2);
        alert(response.message || "Event basic info saved successfully");
      } else {
        alert(response.message || "Failed to save event basic info");
      }
    } catch (error) {
      console.error("Error saving event essentials:", error);
      alert("Failed to save event basic info. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSchedulingSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[1] = true;
      return updated;
    });
    setCurrentStep(3);
  };
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const handleImagesSave = (bannerUrl) => {
    if (bannerUrl) setBannerImageUrl(bannerUrl);
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true;
      return updated;
    });
    setCurrentStep(4);
  };
  const handleSettingsSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[3] = true;
      return updated;
    });
    setCurrentStep(5);
  };
  const handleRaceCategoriesSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[4] = true;
      return updated;
    });
    setCurrentStep(6);
  };

  // Step titles and their corresponding components
  const steps = [
    { title: "Event Essentials", component: "essentials" },
    { title: "Event Scheduling", component: "scheduling" },
    { title: "Event Description", component: "description" },
    { title: "Event Settings", component: "settings" },
    { title: "Race Categories", component: "racecategories" },
    { title: "Form Questions", component: "formquestions" },
    { title: "Age Category", component: "agecategory" }, // 7th step
    { title: "Discount Coupons", component: "discountcoupons" }, // 8th step
    { title: "Communications", component: "communications" }, // 9th step
    { title: "FAQ's", component: "faqs" }, // 10th step
    { title: "Integrations", component: "integrations" }, // 11th step
  ];

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

  // Get event name from sessionStorage if available
  const eventNameDisplay =
    sessionStorage.getItem("eventName") || eventName || "Event Name";

  // Get register end date from sessionStorage if available
  const registerEndDateDisplay =
    sessionStorage.getItem("registerEndDateDisplay") || registerBy;

  // Get city name from sessionStorage if available
  const cityNameDisplay =
    sessionStorage.getItem("eventCityName") || cityName || "City Name";

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
          {steps.map((step, idx) => {
            const isCompleted = savedSteps[idx];
            const isCurrent = idx === currentStep - 1;
            // Disable navigation to steps 2+ if first step is not saved
            const isDisabled = idx > 0 && !savedSteps[0];
            return (
              <React.Fragment key={step.title}>
                <div
                  className={
                    isCompleted
                      ? "event-step-pill"
                      : isCurrent
                      ? "event-step-pill"
                      : "event-step-circle"
                  }
                  style={
                    isCompleted
                      ? {
                          background: "#43a047",
                          color: "#fff",
                          borderRadius: "24px",
                          padding: "10px 24px",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: 600,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }
                      : isCurrent
                      ? {
                          background: "#da251c",
                          color: "#fff",
                          borderRadius: "24px",
                          padding: "10px 24px",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: 600,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }
                      : {
                          width: "44px",
                          height: "44px",
                          border: "2px solid #da251c",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#da251c",
                          fontWeight: 600,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }
                  }
                  title={step.title}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  aria-label={step.title}
                  onClick={() => {
                    if (!isDisabled) setCurrentStep(idx + 1);
                  }}
                  onKeyDown={(e) => {
                    if (isDisabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      setCurrentStep(idx + 1);
                    }
                  }}
                >
                  {isCompleted ? (
                    <i className="fas fa-check" style={{ marginRight: 8 }}></i>
                  ) : isCurrent ? (
                    <i className="fas fa-circle" style={{ marginRight: 8 }}></i>
                  ) : null}
                  {isCompleted || isCurrent ? step.title : null}
                </div>
                {idx < steps.length - 1 && (
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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEssentialsSave();
                  }}
                >
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
                      onChange={(e) =>
                        setEventName(sanitizeEventName(e.target.value))
                      }
                      onPaste={(e) => {
                        const pasted = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        e.preventDefault();
                        setEventName(sanitizeEventName(pasted));
                      }}
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
                onBack={() => setCurrentStep(1)}
                onNext={handleSchedulingNext}
              />
            )}
            {currentStep === 3 && (
              <EventImages
                onBack={() => setCurrentStep(2)}
                onNext={handleImagesSave}
              />
            )}
            {currentStep === 4 && (
              <EventSettings
                onBack={() => setCurrentStep(3)}
                onNext={handleSettingsSave}
              />
            )}
            {currentStep === 5 && (
              <RaceCategories
                onBack={() => setCurrentStep(4)}
                onNext={handleRaceCategoriesSave}
                setShowPreview={setShowPreview}
                paidType={paidType}
                setPaidType={setPaidType}
                eventFormData={eventFormData}
                setEventFormData={setEventFormData}
              />
            )}
            {currentStep === 6 && (
              <FormQuestions
                onBack={() => setCurrentStep(5)}
                onNext={() => {
                  /* Next step logic */
                }}
              />
            )}
            {currentStep === 7 && (
              <AgeCategory
                onBack={() => setCurrentStep(6)}
                onNext={() => markCurrentSavedAndGo(8)}
              />
            )}
            {currentStep === 8 && (
              <DiscountCoupons
                onBack={() => setCurrentStep(7)}
                onNext={() => markCurrentSavedAndGo(9)}
              />
            )}
            {currentStep === 9 && (
              <CommunicationsStep
                onBack={() => setCurrentStep(8)}
                onNext={() => markCurrentSavedAndGo(10)}
              />
            )}
            {currentStep === 10 && (
              <FAQsStep
                onBack={() => setCurrentStep(9)}
                onNext={() => markCurrentSavedAndGo(11)}
              />
            )}
            {currentStep === 11 && (
              <Integrations
                onBack={() => setCurrentStep(10)}
                onNext={() => markCurrentSavedAndGo(12)}
              />
            )}
          </div>

          {/* Right Column - Preview or Money to you */}
          <div className="col-lg-4">
            {(currentStep !== 5 || showPreview) && (
              <>
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
              </>
            )}
            {currentStep === 5 &&
              !showPreview &&
              paidType &&
              paidType.toLowerCase() === "paid" && (
                <div
                  style={{
                    background: "#fafafa",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  }}
                >
                  {/* Payment calculation logic */}
                  {(() => {
                    let baseAmount = eventFormData.raceCategoryPrice
                      ? Number(eventFormData.raceCategoryPrice)
                      : 0;
                    if (!baseAmount || baseAmount < 1) baseAmount = 0;
                    const convenienceFeeFixed = baseAmount > 0 ? 20 : 0;
                    const convenienceFeePercent =
                      baseAmount > 0 ? 0.02 * baseAmount : 0;
                    const convenienceFee =
                      convenienceFeeFixed + convenienceFeePercent;
                    const platformFee = baseAmount > 0 ? 5 : 0;
                    const paymentGatewayFeeRaw =
                      baseAmount > 0 ? 0.0185 * baseAmount : 0;
                    const paymentGatewayFee =
                      baseAmount > 0
                        ? Math.round(paymentGatewayFeeRaw * 20) / 20
                        : 0;
                    const convenienceFeeGST =
                      baseAmount > 0
                        ? Math.round(convenienceFee * 0.18 * 100) / 100
                        : 0;
                    const platformFeeGST =
                      baseAmount > 0
                        ? Math.round(platformFee * 0.18 * 100) / 100
                        : 0;
                    const paymentGatewayGST =
                      baseAmount > 0
                        ? Math.round(paymentGatewayFee * 0.18 * 100) / 100
                        : 0;
                    const totalPayable =
                      baseAmount +
                      convenienceFee +
                      platformFee +
                      paymentGatewayFee +
                      convenienceFeeGST +
                      platformFeeGST +
                      paymentGatewayGST;
                    const receivableAmount = baseAmount;
                    return (
                      <>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "1.4rem",
                            marginBottom: 16,
                          }}
                        >
                          Money to you
                        </h3>
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            marginBottom: 24,
                            color: "#333",
                          }}
                        >
                          ₹{receivableAmount.toFixed(2)}
                        </div>
                        <hr
                          style={{
                            margin: "16px 0",
                            border: "none",
                            borderTop: "1px solid #ddd",
                          }}
                        />
                        <table
                          style={{
                            width: "100%",
                            marginBottom: 16,
                            fontSize: "0.95rem",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Base Registration Fee
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{baseAmount.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Convenience Fee
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{convenienceFee.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Platform Fee
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{platformFee.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Payment Gateway Charges
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{paymentGatewayFee.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Convenience Fee GST 18%
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{convenienceFeeGST.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Platform Fee GST 18%
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{platformFeeGST.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Payment Gateway GST 18%
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{paymentGatewayGST.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {/* Add summary section below table */}
                        <div
                          style={{
                            marginTop: 24,
                            padding: "12px 0",
                            borderTop: "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "#222" }}>
                              Total Payable (By Participant)
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#da251c",
                                fontSize: "1.15rem",
                              }}
                            >
                              ₹{totalPayable.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "#222" }}>
                              Receivable Amount
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#43a047",
                                fontSize: "1.15rem",
                              }}
                            >
                              ₹{receivableAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            {(currentStep !== 5 || showPreview) && (
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
                    src={
                      bannerImageUrl ||
                      require("../../assets/image/event-view.jpg")
                    }
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
                    {cityNameDisplay}
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
                      {eventNameDisplay}
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
                      {registerEndDateDisplay}
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
            )}
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
