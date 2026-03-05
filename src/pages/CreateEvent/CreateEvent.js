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
import Grouping from "./Grouping";
import AgeCategory from "./AgeCategory";
import DiscountCoupons from "./DiscountCoupons";
import CommunicationsStep from "./CommunicationsStep";
import FAQsStep from "./FAQsStep";
import Integrations from "./Integrations";
import eventViewImg from "../../assets/image/event-view.jpg";
import Toast from "../../components/Toast/Toast";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

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
  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [savedSteps, setSavedSteps] = useState(new Array(12).fill(false)); // Track saved status for each step (now 12 steps)
  const [showPreview, setShowPreview] = useState(true);
  const [cityName, setCityName] = useState("");
  const [paidType, setPaidType] = useState("Paid");
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [organizerGST, setOrganizerGST] = useState(false); // Track organizer's GST setting
  const [isEditingCommunication, setIsEditingCommunication] = useState(false); // Track if editing communication
  const [toast, setToast] = useState(null); // Toast notification state
  const today = new Date();
  const year = today.getFullYear();

  // DERIVE PREVIEW DATE FROM eventFormData.eventStartDate IF AVAILABLE
  let previewDate = today;
  if (eventFormData.eventStartDate) {
    try {
      const parsed = new Date(`${eventFormData.eventStartDate}T00:00`);
      if (!isNaN(parsed.getTime())) {
        previewDate = parsed;
      }
    } catch (e) { }
  }

  const day = previewDate.getDate();
  const monthShort = previewDate.toLocaleString("default", { month: "short" });
  const monthLong = previewDate.toLocaleString("default", { month: "long" });

  // Format for 'Register By' (e.g., November 12, 2025)
  const registerBy = `${monthLong} ${day}, ${year}`;

  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const renderCategoryIcon = (cat) => {
    if (!cat.logo) return <i className="fas fa-person-running" style={{ marginRight: '8px', fontSize: '1.5rem', color: '#da251c' }}></i>;

    const logoStr = String(cat.logo);

    // Case 1: Logo is an image filename
    if (/\.(png|jpe?g|gif|svg)$/i.test(logoStr) && !logoStr.includes(' ')) {
      return (
        <img
          src={`https://iraces.in/uploads/category_logo/${logoStr}`}
          alt={stripHtml(cat.name)}
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
      );
    }

    // Case 2: Logo is SVG path data (starts with 'M' or 'm')
    if (logoStr.startsWith('M') || logoStr.startsWith('m')) {
      return (
        <svg
          viewBox="0 -960 960 960"
          width="32"
          height="32"
          style={{ marginRight: "12px", fill: "currentColor", color: "#da251c", flexShrink: 0 }}
        >
          <path d={logoStr} />
        </svg>
      );
    }

    // Case 3: Fallback using static list if available, or default icon
    const plainName = stripHtml(cat.name).toLowerCase();
    const match = categoryList?.find(c => c.label.toLowerCase() === plainName || plainName.includes(c.label.toLowerCase()));

    if (match) {
      return <i className={`${match.icon}`} style={{ marginRight: '8px', fontSize: '1.5rem', color: '#da251c' }}></i>;
    }

    return <i className="fas fa-person-running" style={{ marginRight: '8px', fontSize: '1.5rem', color: '#da251c' }}></i>;
  };

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

  // Helper function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // If URL contains ?step=N, use it to open that step (useful when navigating back after save)
    try {
      const params = new URLSearchParams(window.location.search || "");
      const s = params.get("step");

      // Check for event_id in sessionStorage first (from MyEvents edit button)
      let eid = sessionStorage.getItem('editEventId');

      // If not in sessionStorage, check URL query parameter (legacy support)
      if (!eid) {
        eid = params.get("event_id");
      }

      // Clean up URL if it has query parameters
      if (window.location.search) {
        // Remove query parameters from URL without reloading page
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // If no event_id in URL or sessionStorage, clear any stale per-event sessionStorage so
      // a "new event" flow is not treated as editing an old event.
      if (!eid) {
        try {
          // Clear editEventId from sessionStorage for new event
          sessionStorage.removeItem('editEventId');
          sessionStorage.removeItem("event_id");
          sessionStorage.removeItem("eventName");
          sessionStorage.removeItem("eventSchedulingFormData");
          sessionStorage.removeItem("eventImagesFormData");
          sessionStorage.removeItem("event_categories");
          sessionStorage.removeItem("eventCategories");
          sessionStorage.removeItem("eventCityName");
          sessionStorage.removeItem("registerEndDateDisplay");
          sessionStorage.removeItem("eventSettingsFormData");
          sessionStorage.removeItem("eventStatus");
        } catch (e) {
          // ignore
        }
        // Clear eventName state for new event
        setEventName("");
        setSelectedCategories([]);
        setStatus("draft");
      }

      if (eid) {
        // Clear editEventId from sessionStorage after reading it
        sessionStorage.removeItem('editEventId');

        // If switching to edit a different event, clear per-event sessionStorage
        try {
          const prev = sessionStorage.getItem("event_id");
          if (prev && String(prev) !== String(eid)) {
            try {
              sessionStorage.removeItem("eventSchedulingFormData");
              sessionStorage.removeItem("eventImagesFormData");
              sessionStorage.removeItem("event_categories");
              sessionStorage.removeItem("eventCategories");
              sessionStorage.removeItem("eventCityName");
              sessionStorage.removeItem("registerEndDateDisplay");
              sessionStorage.removeItem("eventSettingsFormData");
              sessionStorage.removeItem("eventStatus");
              // keep eventName until new details arrive; it's fine to overwrite later
            } catch (e) { }
          }
          sessionStorage.setItem("event_id", String(eid));
        } catch (e) { }
        // fetch event details and prefill basic fields
        (async () => {
          try {
            const det = await authAPI.getEventDetails(eid);
            if (det && det.data) {
              setEventDetails(det);
              // Normalize details object: prefer EventData[0] when present
              const details =
                (det.data.EventData && det.data.EventData[0]) || det.data || {};

              // Debug logging to see what fields the API returns
              console.log("Event Details API Response:", det);
              console.log("Registration fields from API:", {
                registration_start_date: details.registration_start_date,
                registration_start_time: details.registration_start_time,
                registration_end_date: details.registration_end_date,
                registration_end_time: details.registration_end_time,
                diplay_registration_start_date: details.diplay_registration_start_date,
                diplay_registration_start_time: details.diplay_registration_start_time,
                diplay_registration_end_date: details.diplay_registration_end_date,
                diplay_registration_end_time: details.diplay_registration_end_time,
                display_registration_start_date: details.display_registration_start_date,
                display_registration_start_time: details.display_registration_start_time,
                display_registration_end_date: details.display_registration_end_date,
                display_registration_end_time: details.display_registration_end_time,
              });

              // try to set eventName and status if available
              const name =
                details.event_name || details.eventName || details.name || "";
              if (name) {
                setEventName(name);
                try {
                  sessionStorage.setItem("eventName", name);
                } catch (e) { }
              }

              // Populate selectedCategories for step 1 so previously selected
              // categories show up in the UI immediately.
              try {
                let selected = [];
                if (
                  Array.isArray(details.categories) &&
                  details.categories.length > 0
                ) {
                  selected = details.categories
                    .map((c) =>
                      typeof c === "string"
                        ? c
                        : c.name || c.category_name || ""
                    )
                    .filter(Boolean);
                } else if (
                  Array.isArray(details.event_categories) &&
                  details.event_categories.length > 0
                ) {
                  selected = details.event_categories
                    .map((c) =>
                      typeof c === "string"
                        ? c
                        : c.name || c.category_name || ""
                    )
                    .filter(Boolean);
                }
                // If server returns AllCategory with checked flags, use those
                else if (det.data && Array.isArray(det.data.AllCategory)) {
                  try {
                    const checked = det.data.AllCategory.filter(
                      (c) =>
                        c.checked ||
                        c.checked === true ||
                        String(c.checked) === "1"
                    );
                    if (checked.length > 0) {
                      selected = checked.map((c) => c.name).filter(Boolean);
                    }
                  } catch (e) { }
                }
                if (selected.length > 0) {
                  setSelectedCategories(selected);
                  try {
                    sessionStorage.setItem(
                      "eventCategories",
                      JSON.stringify(selected)
                    );
                  } catch (e) { }
                }
              } catch (e) {
                console.error(
                  "Error setting selected categories from details:",
                  e
                );
              }

              const st =
                details.event_info_status ||
                details.status ||
                det.data.status ||
                null;
              if (st !== null && st !== undefined) {
                if (Number(st) === 1) setStatus("public");
                else if (Number(st) === 2) setStatus("private");
                else if (Number(st) === 3) setStatus("draft");
              }

              // Persist canonical event_id
              try {
                const canonicalId =
                  details.event_id ||
                  details.id ||
                  det.data.event_id ||
                  det.event_id ||
                  null;
                if (canonicalId)
                  sessionStorage.setItem("event_id", String(canonicalId));
              } catch (e) { }

              // Prefill scheduling step data used by EventScheduling
              try {
                const sched = {
                  timeZone:
                    details.time_zone_name ||
                    details.timezone_name ||
                    details.timezone ||
                    details.timeZone ||
                    details.time_zone ||
                    "",
                  country:
                    details.country_name ||
                    (typeof details.country === "string"
                      ? details.country
                      : "") ||
                    details.country ||
                    "",
                  pincode:
                    details.pincode ||
                    details.pin_code ||
                    details.pincode ||
                    "",
                  state:
                    details.state_name ||
                    (typeof details.state === "string" ? details.state : "") ||
                    details.state ||
                    "",
                  city:
                    details.city_name ||
                    (typeof details.city === "string" ? details.city : "") ||
                    details.city ||
                    "",
                  googleMapLink:
                    details.google_map_link ||
                    details.googleMapLink ||
                    details.google_map_link ||
                    "",
                  eventAddress: details.event_address || details.address || "",
                  // server uses start_date / start_time_event in this response
                  eventStartDate:
                    details.event_start_date || details.start_date || "",
                  eventStartTime:
                    details.event_start_time || details.start_time_event || "",
                  eventEndDate:
                    details.event_end_date || details.end_date || "",
                  eventEndTime:
                    details.event_end_time || details.end_time_event || "",
                  registrationStartDate:
                    details.diplay_registration_start_date ||
                    details.registration_start_date ||
                    details.display_registration_start_date ||
                    "",
                  registrationStartTime:
                    details.diplay_registration_start_time ||
                    details.registration_start_time ||
                    details.display_registration_start_time ||
                    "",
                  registrationEndDate:
                    details.diplay_registration_end_date ||
                    details.registration_end_date ||
                    details.display_registration_end_date ||
                    "",
                  registrationEndTime:
                    details.diplay_registration_end_time ||
                    details.registration_end_time ||
                    details.display_registration_end_time ||
                    "",
                };
                // Only set if there's at least one value
                if (Object.values(sched).some((v) => v)) {
                  // Store in local eventFormData too so child components that read
                  // props (or parent state) can access scheduling values faster.
                  try {
                    setEventFormData((prev) => ({ ...prev, ...sched }));
                  } catch (e) { }
                  sessionStorage.setItem(
                    "eventSchedulingFormData",
                    JSON.stringify(sched)
                  );
                }
              } catch (e) { }

              // Prefill images/description step
              try {
                const imagesData = {
                  event_id: details.id || details.event_id || null,
                  description:
                    details.event_description || details.description || "",
                  keywords: details.event_keywords || details.keywords || "",
                  backgroundColor:
                    details.background_color ||
                    details.bg_color ||
                    details.banner_bg_color ||
                    "",
                  backgroundStatus:
                    details.background_status || details.banner_bg_status || 1,
                  bannerBg: details.banner_bg || false,
                };
                if (imagesData.event_id) {
                  sessionStorage.setItem(
                    "eventImagesFormData",
                    JSON.stringify(imagesData)
                  );
                }
                // set banner image for preview in parent
                if (details.banner_image)
                  setBannerImageUrl(details.banner_image);
                else if (
                  det.data.PreviewEventDetails &&
                  det.data.PreviewEventDetails.banner_img
                )
                  setBannerImageUrl(det.data.PreviewEventDetails.banner_img);
              } catch (e) { }

              // Prefill categories (RaceCategories expects 'event_categories' in sessionStorage sometimes)
              try {
                if (
                  det.data.AllEventTypes &&
                  Array.isArray(det.data.AllEventTypes)
                ) {
                  sessionStorage.setItem(
                    "event_categories",
                    JSON.stringify(det.data.AllEventTypes)
                  );
                }
                // Also store eventCategories if available
                if (details.categories || details.event_categories) {
                  sessionStorage.setItem(
                    "eventCategories",
                    JSON.stringify(
                      details.categories || details.event_categories
                    )
                  );
                }
              } catch (e) { }

              // Misc UI values
              try {
                if (details.city_name || details.city) {
                  sessionStorage.setItem(
                    "eventCityName",
                    details.city_name || details.city
                  );
                }
                if (
                  details.diplay_registration_end_date ||
                  details.diplay_registration_end_time ||
                  details.registration_end_date ||
                  details.registration_end_time
                ) {
                  const rd =
                    details.diplay_registration_end_date ||
                    details.registration_end_date ||
                    "";
                  const rt =
                    details.diplay_registration_end_time ||
                    details.registration_end_time ||
                    "";
                  sessionStorage.setItem(
                    "registerEndDateDisplay",
                    rd && rt ? `${rd} ${rt}` : rd || rt || ""
                  );
                }
                // Persist event settings if present in response
                try {
                  if (
                    det.data &&
                    Array.isArray(det.data.event_setting_details) &&
                    det.data.event_setting_details.length > 0
                  ) {
                    const s = det.data.event_setting_details[0];
                    try {
                      sessionStorage.setItem(
                        "eventSettingsFormData",
                        JSON.stringify(s)
                      );
                    } catch (e) { }
                  }
                } catch (e) { }
                // Persist event status if available
                try {
                  const evStatus =
                    details.event_info_status ||
                    details.status ||
                    det.data.status ||
                    null;
                  if (evStatus !== null && evStatus !== undefined) {
                    let mapped = "draft";
                    if (Number(evStatus) === 1) mapped = "public";
                    else if (Number(evStatus) === 2) mapped = "private";
                    else if (Number(evStatus) === 3) mapped = "draft";
                    sessionStorage.setItem("eventStatus", String(mapped));
                    setStatus(mapped);
                  }
                } catch (e) { }

                // Mark which steps are already saved based on presence of data
                try {
                  const stepSaved = new Array(12).fill(false);
                  // Step 1 - Essentials: event exists => saved
                  stepSaved[0] = true;

                  // Enhanced helper to check presence in details or top-level det.data
                  const hasAny = (keys) => {
                    for (const k of keys) {
                      // Check in details
                      if (details && details[k] !== undefined && details[k] !== null && details[k] !== "") {
                        // If it's an array, check it has length
                        if (Array.isArray(details[k])) {
                          if (details[k].length > 0) return true;
                        } else {
                          return true;
                        }
                      }
                      // Check in det.data
                      if (det.data && det.data[k] !== undefined && det.data[k] !== null && det.data[k] !== "") {
                        // If it's an array, check it has length
                        if (Array.isArray(det.data[k])) {
                          if (det.data[k].length > 0) return true;
                        } else {
                          return true;
                        }
                      }
                    }
                    return false;
                  };

                  // Step 2 - Scheduling
                  if (
                    hasAny([
                      "event_start_date",
                      "event_start_time",
                      "event_end_date",
                      "registration_start_date",
                      "registration_end_date",
                      "timezone",
                      "timeZone",
                      "time_zone",
                      "city",
                      "city_name",
                      "pincode",
                      "state",
                      "state_name",
                      "country",
                      "country_name"
                    ])
                  )
                    stepSaved[1] = true;

                  // Step 3 - Description / Images
                  if (
                    hasAny([
                      "banner_image",
                      "event_description",
                      "description",
                      "event_keywords",
                      "keywords",
                      "background_color",
                      "bg_color"
                    ])
                  )
                    stepSaved[2] = true;

                  // Step 4 - Settings - Check for event_setting_details array
                  if (
                    (det.data &&
                      Array.isArray(det.data.event_setting_details) &&
                      det.data.event_setting_details.length > 0) ||
                    (det.data && det.data.EventSettingDetails && det.data.EventSettingDetails.length > 0) ||
                    hasAny([
                      "payment_type",
                      "paid_status",
                      "settings",
                      "event_settings",
                      "event_setting",
                      "refund_policy",
                      "is_refund_policy"
                    ])
                  )
                    stepSaved[3] = true;

                  // Step 5 - Race Categories
                  if (
                    (det.data &&
                      det.data.AllEventTypes &&
                      det.data.AllEventTypes.length > 0) ||
                    (det.data && det.data.EventCategories && det.data.EventCategories.length > 0) ||
                    hasAny([
                      "categories",
                      "event_categories",
                      "race_categories",
                      "AllEventTypes"
                    ])
                  )
                    stepSaved[4] = true;

                  // Step 6 - Form Questions - Check for actual question data
                  if (
                    (det.data &&
                      Array.isArray(det.data.GeneralFormQuestions) &&
                      det.data.GeneralFormQuestions.length > 0) ||
                    (det.data &&
                      Array.isArray(det.data.EventFormQuestions) &&
                      det.data.EventFormQuestions.length > 0) ||
                    (det.data && det.data.event_form_details && Object.keys(det.data.event_form_details).length > 0) ||
                    hasAny([
                      "form_questions",
                      "event_form_questions",
                      "event_form_details",
                      "formQuestions",
                      "GeneralFormQuestions",
                      "EventFormQuestions",
                    ])
                  )
                    stepSaved[5] = true;

                  // Step 7 - Grouping - Check for group data
                  if (
                    (det.data &&
                      Array.isArray(det.data.AllGroupQuestion) &&
                      det.data.AllGroupQuestion.length > 0) ||
                    (det.data && det.data.GroupQuestions && det.data.GroupQuestions.length > 0) ||
                    hasAny([
                      "grouping",
                      "event_grouping",
                      "groups",
                      "AllGroupQuestion",
                      "group_questions",
                      "GroupQuestions"
                    ])
                  )
                    stepSaved[6] = true;

                  // Step 8 - Age Category - Check for AllAgeCategory array
                  if (
                    (det.data &&
                      Array.isArray(det.data.AllAgeCategory) &&
                      det.data.AllAgeCategory.length > 0) ||
                    (det.data && det.data.AgeCategories && det.data.AgeCategories.length > 0) ||
                    hasAny([
                      "age_categories",
                      "AllAgeCategory",
                      "AgeCategories",
                      "ageCategory",
                      "age_category",
                    ])
                  )
                    stepSaved[7] = true;

                  // Step 9 - Discount Coupons - Check for coupon data
                  if (
                    (det.data &&
                      Array.isArray(det.data.AllCoupon) &&
                      det.data.AllCoupon.length > 0) ||
                    (det.data &&
                      Array.isArray(det.data.EventCoupons) &&
                      det.data.EventCoupons.length > 0) ||
                    (det.data && det.data.coupons && det.data.coupons.length > 0) ||
                    hasAny([
                      "coupons",
                      "event_coupons",
                      "discounts",
                      "AllCoupon",
                      "EventCoupons",
                    ])
                  )
                    stepSaved[8] = true;

                  // Step 10 - Communications - Check for communication templates
                  if (
                    (det.data &&
                      Array.isArray(det.data.EventCommunication) &&
                      det.data.EventCommunication.length > 0) ||
                    (det.data &&
                      Array.isArray(det.data.event_communications) &&
                      det.data.event_communications.length > 0) ||
                    (det.data && det.data.communications && det.data.communications.length > 0) ||
                    hasAny([
                      "communications",
                      "event_comm",
                      "event_communications",
                      "EventCommunication",
                    ])
                  )
                    stepSaved[9] = true;

                  // Step 11 - FAQs - Check for EventFaq array
                  if (
                    (det.data &&
                      Array.isArray(det.data.EventFaq) &&
                      det.data.EventFaq.length > 0) ||
                    (det.data && det.data.faqs && det.data.faqs.length > 0) ||
                    hasAny([
                      "faqs",
                      "EventFaq",
                      "event_faqs",
                      "event_faq",
                    ])
                  )
                    stepSaved[10] = true;

                  // Step 12 - Integrations - Check for integration data
                  if (
                    (det.data &&
                      Array.isArray(det.data.EventIntegrations) &&
                      det.data.EventIntegrations.length > 0) ||
                    (det.data &&
                      Array.isArray(det.data.event_integrations) &&
                      det.data.event_integrations.length > 0) ||
                    (det.data && det.data.integrations && det.data.integrations.length > 0) ||
                    hasAny([
                      "integrations",
                      "event_integrations",
                      "EventIntegrations",
                    ])
                  )
                    stepSaved[11] = true;

                  console.log("📊 Saved Steps Detection:", stepSaved);

                  // Try to load saved steps from sessionStorage and merge
                  try {
                    const eventId = sessionStorage.getItem("event_id");
                    if (eventId) {
                      const savedStepsStr = sessionStorage.getItem(`savedSteps_${eventId}`);
                      if (savedStepsStr) {
                        const savedStepsFromStorage = JSON.parse(savedStepsStr);
                        console.log("📦 Loaded saved steps from sessionStorage:", savedStepsFromStorage);
                        // Merge: if either API detection OR sessionStorage says it's saved, mark it as saved
                        for (let i = 0; i < stepSaved.length; i++) {
                          if (savedStepsFromStorage[i] === true) {
                            stepSaved[i] = true;
                          }
                        }
                        console.log("✅ Final merged saved steps:", stepSaved);
                      }
                    }
                  } catch (e) {
                    console.error("Error loading saved steps from sessionStorage:", e);
                  }

                  setSavedSteps(stepSaved);
                } catch (e) {
                  console.error(
                    "Error computing saved steps from event details:",
                    e
                  );
                }

                // Notify child components that prefill is complete so they can re-read sessionStorage
                try {
                  const evt = new CustomEvent("createEventPrefillDone", {
                    detail: { event_id: sessionStorage.getItem("event_id") },
                  });
                  window.dispatchEvent(evt);
                } catch (e) {
                  // ignore
                }
              } catch (e) { }
            }
          } catch (e) {
            console.error("Failed to fetch event details for edit route:", e);
          }
        })();
      }
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

  useEffect(() => {
    // Only load eventName from sessionStorage if editing an existing event
    const editingEventId = sessionStorage.getItem("event_id");
    if (editingEventId) {
      const s = sessionStorage.getItem("eventName") || "";
      if (s && s !== eventName) setEventName(s);
    }
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

      // Call get organizer details API to fetch GST setting
      const organizerRes = await authAPI.getOrganizerDetails();
      if (
        organizerRes &&
        organizerRes.data &&
        organizerRes.data.organizerData &&
        organizerRes.data.organizerData.length > 0
      ) {
        const organizerData = organizerRes.data.organizerData[0];
        setOrganizerGST(organizerData.gst === 1);
      }

      // Call get category API
      const categoryRes = await authAPI.getCategory();
      if (categoryRes && categoryRes.data && categoryRes.data.Allcategory) {
        setCategories(categoryRes.data.Allcategory);
        // Reconcile any stored eventCategories (ids, objects or names) into names
        try {
          const stored =
            sessionStorage.getItem("eventCategories") ||
            sessionStorage.getItem("event_categories");
          if (stored) {
            let parsed = [];
            try {
              parsed = JSON.parse(stored);
            } catch (e) {
              // if not JSON, try comma-separated
              parsed = String(stored)
                .split(",")
                .map((s) => s.trim());
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
              const names = parsed
                .map((p) => {
                  if (!p && p !== 0) return null;
                  if (typeof p === "string") {
                    // maybe a name or numeric string id
                    if (/^\d+$/.test(p)) {
                      const byId = categoryRes.data.Allcategory.find(
                        (c) => String(c.id) === p
                      );
                      return byId ? byId.name : p;
                    }
                    return p;
                  }
                  if (typeof p === "number") {
                    const byId = categoryRes.data.Allcategory.find(
                      (c) => c.id === p
                    );
                    return byId ? byId.name : String(p);
                  }
                  // object shape: try id -> name
                  if (typeof p === "object") {
                    const id = p.id || p.category_id || p.categoryId || null;
                    if (id) {
                      const byId = categoryRes.data.Allcategory.find(
                        (c) => String(c.id) === String(id)
                      );
                      if (byId) return byId.name;
                    }
                    return p.name || p.category_name || null;
                  }
                  return null;
                })
                .filter(Boolean);
              if (names.length > 0) setSelectedCategories(names);
            }
          }
        } catch (e) {
          console.error("Failed to reconcile stored eventCategories:", e);
        }
      }

      // Call get types API
      const typesRes = await authAPI.getTypes();
      if (typesRes && typesRes.data && typesRes.data.Alltypes) {
        setTypes(typesRes.data.Alltypes);
      }

      // Call event details API after all others only when not editing an explicit event
      // If an edit flow is in progress and sessionStorage.event_id is set, do not
      // auto-load the first event (this was causing the page to pick a default id
      // like 14 and overwrite the intended event being edited).
      try {
        const editingEventId = sessionStorage.getItem("event_id");
        if (!editingEventId) {
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
        } else {
          console.log(
            "CreateEvent: editingEventId present, skipping auto-load of first event:",
            editingEventId
          );
        }
      } catch (e) {
        console.error("Error during conditional event details fetch:", e);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sticky event preview scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      // Only enable sticky on desktop (screen width > 991px)
      if (window.innerWidth <= 991) {
        return;
      }

      const previewElement = document.querySelector('.event-preview-sidebar');
      if (!previewElement) return;

      const previewParent = previewElement.parentElement;
      const scrollThreshold = 450; // Adjust based on hero section height

      if (window.scrollY > scrollThreshold) {
        previewElement.classList.add('is-sticky');
        // Calculate and set the width to match the column width
        const columnWidth = previewParent.offsetWidth;
        previewElement.style.width = `${columnWidth}px`;
      } else {
        previewElement.classList.remove('is-sticky');
        previewElement.style.width = '';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryToggle = (label) => {
    setCategoryError(""); // Clear error when user selects a category
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate Event Category selection
    if (!selectedCategories || selectedCategories.length === 0) {
      setCategoryError("Please select at least one event category");
      return;
    }
    setCategoryError("");

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
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(targetStep);
  };

  // Update save handlers for each step
  const handleEssentialsSave = async () => {
    // Validate Event Category selection before proceeding
    if (!selectedCategories || selectedCategories.length === 0) {
      setCategoryError("Please select at least one event category");
      return;
    }
    setCategoryError("");

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
        // url_link: window.location.origin,
      };

      // If editing existing event, add event_id. Prefer canonical places, fallback to sessionStorage.
      const editingEventId =
        eventDetails?.data?.event_id ||
        eventDetails?.data?.id ||
        eventDetails?.event_id ||
        eventDetails?.id ||
        sessionStorage.getItem("event_id") ||
        null;
      if (editingEventId) {
        payload.event_id = editingEventId;
      }

      // Client-side validation: prevent creating a new event with the same name
      try {
        const allEventsRes = await authAPI.getEvents({});
        if (
          allEventsRes &&
          allEventsRes.data &&
          Array.isArray(allEventsRes.data.EventData)
        ) {
          const nameToCheck = (payload.event_name || eventName || "")
            .trim()
            .toLowerCase();
          const conflict = allEventsRes.data.EventData.find((ev) => {
            const n = (ev.event_name || ev.name || ev.event_display_name || "")
              .trim()
              .toLowerCase();
            // If we're editing, allow same event id
            const evId = ev.event_id || ev.id || null;
            const editingId =
              payload.event_id || sessionStorage.getItem("event_id") || null;
            if (!n) return false;
            if (n === nameToCheck) {
              // if editing same event (by id from payload or sessionStorage), it's fine
              if (editingId && String(editingId) === String(evId)) return false;
              return true;
            }
            return false;
          });
          if (conflict) {
            const msg =
              "Event with the same name already exists. Please choose a different name or edit the existing event.";
            setNameError(msg);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore validation failures and proceed to server-side handling
      }

      const response = await authAPI.createEventBasicInfo(payload);
      // Flexible success detection to support different backend response shapes
      const successFlag =
        (response && response.success === 200) ||
        (response && response.status === 200) ||
        response === 200 ||
        response === "success" ||
        response?.success === true ||
        response?.validate === 0 ||
        response?.data?.status === 200;

      // Try to find event id in common locations
      const newEventId =
        response?.data?.event_id ||
        response?.event_id ||
        response?.data?.data?.event_id ||
        null;

      // If backend returned a duplicate-name style message, treat it as a validation error
      if (
        response &&
        response.message &&
        /same name|already exists|already exist/i.test(response.message)
      ) {
        const msg =
          response.message ||
          "Event with the same name already exists. Please choose a different name or edit the existing event.";
        setNameError(msg);
        setLoading(false);
        return;
      }

      if (successFlag) {
        // Persist event name so header and preview update immediately
        try {
          const nameToStore = payload.event_name || eventName || "";
          sessionStorage.setItem("eventName", nameToStore);
          setEventName(nameToStore);
        } catch (e) { }

        // Store event_id in session storage if returned
        if (newEventId) {
          try {
            sessionStorage.setItem("event_id", String(newEventId));
          } catch (e) { }
          if (lastEventId !== String(newEventId)) {
            try {
              sessionStorage.removeItem("eventSchedulingFormData");
            } catch (e) { }
            setLastEventId(String(newEventId));
          }
        }

        setSavedSteps((prev) => {
          const updated = [...prev];
          updated[0] = true;
          // Persist to sessionStorage
          try {
            const eventId = sessionStorage.getItem("event_id");
            if (eventId) {
              sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
            }
          } catch (e) { }
          return updated;
        });
        showToast(response?.message || "Event Essentials saved successfully!");
        setCurrentStep(2);
      } else {
        showToast(response?.message || "Failed to save event basic info", 'error');
      }
    } catch (error) {
      console.error("Error saving event essentials:", error);
      showToast("Failed to save event basic info. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleSchedulingSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[1] = true;
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(3);
  };
  const handleImagesSave = (bannerUrl) => {
    if (bannerUrl) setBannerImageUrl(bannerUrl);
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true;
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(4);
  };
  const handleSettingsSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[3] = true;
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(5);
  };
  const handleRaceCategoriesSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[4] = true;
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(6);
  };
  const handleGroupingSave = () => {
    setSavedSteps((prev) => {
      const updated = [...prev];
      updated[6] = true;
      // Persist to sessionStorage
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          sessionStorage.setItem(`savedSteps_${eventId}`, JSON.stringify(updated));
        }
      } catch (e) { }
      return updated;
    });
    setCurrentStep(8);
  };

  // Step titles and their corresponding components
  const steps = [
    { title: "Event Essentials", component: "essentials" },
    { title: "Event Scheduling", component: "scheduling" },
    { title: "Event Description", component: "description" },
    { title: "Event Settings", component: "settings" },
    { title: "Race Categories", component: "racecategories" },
    { title: "Form Questions", component: "formquestions" },
    { title: "Grouping", component: "grouping" }, // 7th step
    { title: "Age Category", component: "agecategory" }, // 8th step
    { title: "Discount Coupons", component: "discountcoupons" }, // 9th step
    { title: "Communications", component: "communications" }, // 10th step
    { title: "FAQ's", component: "faqs" }, // 11th step
    { title: "Integrations", component: "integrations" }, // 12th step
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
  // Get event name from sessionStorage if available (show across all steps)
  const storedEventName = sessionStorage.getItem("eventName") || "";
  const headerTitle = storedEventName || eventName || "Design Your Event";

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
              <h1 className="contact-hero-title">{headerTitle}</h1>
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
                      className={`status-btn ${status === "public" ? "active" : ""
                        }`}
                      onClick={() => setStatus("public")}
                    >
                      <i className="fas fa-globe"></i> Public
                    </button>
                    <button
                      className={`status-btn ${status === "private" ? "active" : ""
                        }`}
                      onClick={() => setStatus("private")}
                    >
                      <i className="fas fa-lock"></i> Private
                    </button>
                    <button
                      className={`status-btn ${status === "draft" ? "active" : ""
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
                      className="form-controll"
                      placeholder={`(Allowed only this special characters - , @ , ' , " )`}
                      value={eventName}
                      onChange={(e) => {
                        setEventName(sanitizeEventName(e.target.value));
                        if (nameError) setNameError("");
                      }}
                      onPaste={(e) => {
                        const pasted = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        e.preventDefault();
                        setEventName(sanitizeEventName(pasted));
                      }}
                      required
                    />
                    {nameError ? (
                      <div style={{ color: "#d32f2f", marginTop: 8 }}>
                        {nameError}
                      </div>
                    ) : null}
                  </div>

                  {/* Event Category */}
                  <div className="form-group">
                    <label>
                      Event Category <span className="required">*</span>
                    </label>
                    <div className="category-grid">
                      {categories.length > 0 ? (
                        categories.map((cat, index) => {
                          return (
                            <div
                              key={cat.id || index}
                              className={`category-card ${selectedCategories.includes(cat.name)
                                ? "selected"
                                : ""
                                }`}
                              onClick={() => handleCategoryToggle(cat.name)}
                              title={stripHtml(cat.name)}
                            >
                              {renderCategoryIcon(cat)}
                              <span className="category-name-text">{stripHtml(cat.name)}</span>
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => { }}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <p>Loading categories...</p>
                      )}
                    </div>
                    {categoryError && (
                      <div style={{ color: "#da251c", fontSize: "14px", marginTop: "8px" }}>
                        {categoryError}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="submit" className="btn-save-continue">
                      Save & Continue
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <EventScheduling
                onBack={() => setCurrentStep(1)}
                onNext={handleSchedulingNext}
                initialFormData={eventFormData}
                showToast={showToast}
                onChange={(updatedData) => {
                  setEventFormData(prev => ({ ...prev, ...updatedData }));
                }}
              />
            )}
            {currentStep === 3 && (
              <EventImages
                onBack={() => setCurrentStep(2)}
                onNext={handleImagesSave}
                showToast={showToast}
              />
            )}
            {currentStep === 4 && (
              <EventSettings
                onBack={() => setCurrentStep(3)}
                onNext={handleSettingsSave}
                showToast={showToast}
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
                organizerGST={organizerGST}
                showToast={showToast}
              />
            )}
            {currentStep === 6 && (
              <FormQuestions
                onBack={() => setCurrentStep(5)}
                onNext={() => {
                  /* Next step logic */
                  setSavedSteps((prev) => {
                    const updated = [...prev];
                    updated[5] = true;
                    return updated;
                  });
                  setCurrentStep(7);
                }}
                showToast={showToast}
              />
            )}
            {currentStep === 7 && (
              <Grouping
                onBack={() => setCurrentStep(6)}
                onNext={handleGroupingSave}
                showToast={showToast}
              />
            )}
            {currentStep === 8 && (
              <AgeCategory
                onBack={() => setCurrentStep(7)}
                onNext={() => markCurrentSavedAndGo(9)}
                showToast={showToast}
              />
            )}
            {currentStep === 9 && (
              <DiscountCoupons
                onBack={() => setCurrentStep(8)}
                onNext={() => markCurrentSavedAndGo(10)}
                showToast={showToast}
              />
            )}
            {currentStep === 10 && (
              <CommunicationsStep
                onBack={() => setCurrentStep(9)}
                onNext={() => markCurrentSavedAndGo(11)}
                onEditingChange={setIsEditingCommunication}
                showToast={showToast}
              />
            )}
            {currentStep === 11 && (
              <FAQsStep
                onBack={() => setCurrentStep(10)}
                onNext={() => markCurrentSavedAndGo(12)}
                showToast={showToast}
              />
            )}
            {currentStep === 12 && (
              <Integrations
                onBack={() => setCurrentStep(11)}
                onNext={() => markCurrentSavedAndGo(13)}
                showToast={showToast}
              />
            )}
          </div>

          {/* Right Column - Preview, Placeholders, or Money to you */}
          <div className="col-lg-4 event-preview-sidebar">
            {/* Show Placeholders section ONLY when editing communication (step 10 + editing mode) */}
            {currentStep === 10 && isEditingCommunication && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "16px" }}>
                  Placeholders
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: "16px" }}>
                  You can use following placeholders in your message content.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <strong style={{ fontSize: "1rem", display: "block", marginBottom: "8px" }}>
                    Example:
                  </strong>
                  <p style={{ fontSize: "0.9rem", color: "#333", marginBottom: "4px" }}>
                    Hi {"{FIRSTNAME}"},
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#333" }}>
                    Welcome to {"{EVENTNAME}"}.
                  </p>
                </div>

                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      "FIRSTNAME", "LASTNAME", "EVENTID", "EVENTNAME",
                      "EVENTSTARTDATE", "EVENTSTARTTIME", "EVENTENDDATE", "EVENTENDTIME",
                      "YTCRTEAM", "EVENTURL", "COMPANYNAME", "TOTALTICKETS",
                      "VENUE", "TICKETAMOUNT", "RACECATEGORY", "REGISTRATIONID"
                    ].map((placeholder) => (
                      <div
                        key={placeholder}
                        style={{
                          padding: "8px 12px",
                          background: "#f5f5f5",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "#333",
                        }}
                      >
                        {placeholder}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Show Event Preview for all other cases */}
            {!(currentStep === 10 && isEditingCommunication) && (currentStep !== 5 || showPreview) && (
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
                    background: "#fff",
                    borderRadius: 16,
                    padding: 32,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Payment calculation logic */}
                  {(() => {
                    let baseAmount = eventFormData.raceCategoryPrice
                      ? Number(eventFormData.raceCategoryPrice)
                      : 0;
                    if (!baseAmount || baseAmount < 1) baseAmount = 0;

                    // Get fee payer information from ticketCalculation
                    const ticketCalc = eventFormData.ticketCalculation || {};
                    const convenienceFeePlayer = ticketCalc.convenienceFeePlayer || "Participant";
                    const gatewayFeePlayer = ticketCalc.gatewayFeePlayer || "Participant";
                    const collectGST = ticketCalc.collectGST !== undefined ? ticketCalc.collectGST : false;
                    const taxType = ticketCalc.taxType || 'inclusive';

                    // Calculate amount for convenience fee calculation
                    // Add GST only if: organizerGST=true AND collectGST=true AND taxType='exclusive'
                    const amountForConvenienceFee = (organizerGST && collectGST && taxType === 'exclusive')
                      ? baseAmount + (baseAmount * 0.18)
                      : baseAmount;

                    // Use dynamic values from ticketCalculation if available
                    let convenienceFee = 0;
                    let platformFee = 0;
                    let paymentGatewayFee = 0;
                    let convenienceFeeGST = 0;
                    let platformFeeGST = 0;
                    let registrationGST = 0;
                    let paymentGatewayGST = 0;

                    if (ticketCalc.convenienceFee !== undefined) {
                      // Use values directly from the form's dynamic calculation
                      convenienceFee = ticketCalc.convenienceFee;
                      platformFee = ticketCalc.platformFee;
                      paymentGatewayFee = ticketCalc.paymentGatewayBuyer;
                      convenienceFeeGST = ticketCalc.convenienceFeeGST;
                      platformFeeGST = ticketCalc.platformFeeGST;
                      registrationGST = ticketCalc.registrationGST;
                      paymentGatewayGST = ticketCalc.paymentGatewayGST;
                    } else if (amountForConvenienceFee > 0) {
                      // Hardcoded fallback ONLY if form hasn't calculated anything yet
                      if (amountForConvenienceFee <= 1000) {
                        convenienceFee = 0.02 * amountForConvenienceFee;
                      } else if (amountForConvenienceFee <= 1400) {
                        convenienceFee = 30;
                      } else {
                        convenienceFee = 40;
                      }
                      platformFee = baseAmount > 0 ? 5 : 0;
                      convenienceFeeGST = Math.round(convenienceFee * 0.18 * 100) / 100;
                      platformFeeGST = Math.round(platformFee * 0.18 * 100) / 100;
                      registrationGST = (collectGST && taxType === 'exclusive' && baseAmount > 0)
                        ? (organizerGST ? Math.round(baseAmount * 0.18 * 100) / 100 : 0)
                        : 0;

                      const registrationAmount = baseAmount + registrationGST;
                      let gatewayBasis = registrationAmount;
                      if (convenienceFeePlayer === "Participant") {
                        gatewayBasis += (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
                      }
                      const paymentGatewayFeeRaw = gatewayBasis > 0 ? 0.0185 * gatewayBasis : 0;
                      paymentGatewayFee = gatewayBasis > 0 ? Math.round(paymentGatewayFeeRaw * 100) / 100 : 0;
                      paymentGatewayGST = baseAmount > 0 ? Math.round(paymentGatewayFee * 0.18 * 100) / 100 : 0;
                    }
                    // Start with all fees included
                    let totalPayable =
                      baseAmount +
                      convenienceFee +
                      platformFee +
                      paymentGatewayFee +
                      convenienceFeeGST +
                      platformFeeGST +
                      paymentGatewayGST +
                      registrationGST;

                    // Subtract convenience fees if Organiser pays them
                    if (convenienceFeePlayer === "Organiser") {
                      totalPayable -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
                    }

                    // Subtract gateway fees if Organiser pays them
                    if (gatewayFeePlayer === "Organiser") {
                      totalPayable -= (paymentGatewayFee + paymentGatewayGST);
                    }

                    // Calculate receivable amount based on who pays the fees
                    let receivableAmount = baseAmount;

                    // Deduct convenience fee + platform fee if organiser pays convenience fee
                    // For ₹100: ₹100 - ₹2 - ₹0.36 - ₹5 - ₹0.90 = ₹91.74
                    if (convenienceFeePlayer === "Organiser") {
                      receivableAmount -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
                    }

                    // Deduct gateway fee if organiser pays gateway fee
                    // Additional deduction: ₹1.85 + ₹0.33 = ₹2.18
                    // Total: ₹91.74 - ₹2.18 = ₹89.56
                    if (gatewayFeePlayer === "Organiser") {
                      receivableAmount -= (paymentGatewayFee + paymentGatewayGST);
                    }

                    // Add Registration Fee GST if organizer has GST enabled
                    if (organizerGST && registrationGST > 0) {
                      receivableAmount += registrationGST;
                    }
                    return (
                      <>
                        {/* Header Section */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 32,
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: 700,
                              fontSize: "1.5rem",
                              margin: 0,
                              color: "#000",
                            }}
                          >
                            Money to you
                          </h3>
                          <div
                            style={{
                              fontSize: "1.8rem",
                              fontWeight: 700,
                              color: "#000",
                            }}
                          >
                            ₹{receivableAmount.toFixed(2)}
                          </div>
                        </div>

                        {/* Base Registration Fee */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 0",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          <span style={{ fontSize: "1rem", color: "#000" }}>
                            Base Registration Fee
                          </span>
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "#000",
                            }}
                          >
                            ₹{baseAmount.toFixed(0)}
                          </span>
                        </div>

                        {/* Fee Details Group */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Convenience Fee
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{convenienceFee.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Platform Fee
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{platformFee.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Payment Gateway Charges (1.85%)
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{paymentGatewayFee.toFixed(2)}
                            </span>
                          </div>
                          {collectGST && taxType === 'exclusive' && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 0",
                              }}
                            >
                              <span style={{ fontSize: "0.95rem", color: "#666" }}>
                                Registration Fee GST 18%
                              </span>
                              <span
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 500,
                                  color: "#000",
                                }}
                              >
                                ₹{registrationGST.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* GST Details Group */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Convenience Fee GST 18%
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{convenienceFeeGST.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Platform Fee GST 18%
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{platformFeeGST.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.95rem", color: "#666" }}>
                              Payment Gateway GST 18%
                            </span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                color: "#000",
                              }}
                            >
                              ₹{paymentGatewayGST.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Summary Section */}
                        <div
                          style={{
                            marginTop: 24,
                            paddingTop: 16,
                            borderTop: "1px solid #e0e0e0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: "1rem", color: "#000" }}>
                              Total Payable (By Participant)
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#000",
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
                            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>
                              Receivable Amount
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#000",
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
            {!(currentStep === 10 && isEditingCommunication) && (currentStep !== 5 || showPreview) && (
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
                  minHeight: "418px",
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
                      eventViewImg
                    }
                    alt="Event Banner"
                    style={{
                      width: "100%",
                      height: "100%",
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
                    padding: "20px 20px 24px 20px",
                    flex: "1 1 auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Date Badge - Red/White Split Design */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "stretch",
                      width: "fit-content",
                      marginBottom: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background: "#da251c",
                        color: "#fff",
                        padding: "8px 16px",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        letterSpacing: "0.5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {monthShort.toUpperCase()}
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        color: "#333",
                        padding: "8px 16px",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        border: "1px solid #e0e0e0",
                        borderLeft: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "50px",
                      }}
                    >
                      {day}
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "#2c3e50",
                      marginBottom: "12px",
                      lineHeight: "1.3",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {headerTitle}
                  </h3>

                  {/* Register By */}
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "#7f8c8d",
                      marginBottom: "16px",
                    }}
                  >
                    Register by :{" "}
                    <span
                      style={{
                        color: "#da251c",
                        fontWeight: 700,
                      }}
                    >
                      {registerEndDateDisplay}
                    </span>
                  </div>

                  {/* Registration Status and Register Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "auto",
                      paddingTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: "#27ae60",
                        fontWeight: 600,
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i
                        className="fas fa-check-circle"
                        style={{ fontSize: "1.1rem" }}
                      ></i>
                      Registration Open
                    </span>
                    <button
                      style={{
                        background: "#da251c",
                        border: "none",
                        color: "#fff",
                        borderRadius: "24px",
                        padding: "10px 24px",
                        fontWeight: 600,
                        fontSize: "1rem",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(218, 37, 28, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#c41f17";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#da251c";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(218, 37, 28, 0.3)";
                      }}
                    >
                      Register
                      <i className="fas fa-arrow-right" style={{ fontSize: "0.9rem" }}></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* <Footer /> */}
    </div>
  );
}
