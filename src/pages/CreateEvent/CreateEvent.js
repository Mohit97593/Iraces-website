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
  const [nameError, setNameError] = useState("");
  const [savedSteps, setSavedSteps] = useState(new Array(11).fill(false)); // Track saved status for each step (now 11 steps)
  const [showPreview, setShowPreview] = useState(true);
  const [cityName, setCityName] = useState("");
  const [paidType, setPaidType] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
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
      // If event_id present in URL, store it and fetch details
      const eid = params.get("event_id");
      // If no event_id in URL, clear any stale per-event sessionStorage so
      // a "new event" flow is not treated as editing an old event.
      if (!eid) {
        try {
          sessionStorage.removeItem("event_id");
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
      }

      if (eid) {
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
            } catch (e) {}
          }
          sessionStorage.setItem("event_id", String(eid));
        } catch (e) {}
        // fetch event details and prefill basic fields
        (async () => {
          try {
            const det = await authAPI.getEventDetails(eid);
            if (det && det.data) {
              setEventDetails(det);
              // Normalize details object: prefer EventData[0] when present
              const details =
                (det.data.EventData && det.data.EventData[0]) || det.data || {};

              // try to set eventName and status if available
              const name =
                details.event_name || details.eventName || details.name || "";
              if (name) {
                setEventName(name);
                try {
                  sessionStorage.setItem("eventName", name);
                } catch (e) {}
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
                  } catch (e) {}
                }
                if (selected.length > 0) {
                  setSelectedCategories(selected);
                  try {
                    sessionStorage.setItem(
                      "eventCategories",
                      JSON.stringify(selected)
                    );
                  } catch (e) {}
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
              } catch (e) {}

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
                    details.registration_start_date ||
                    details.diplay_registration_start_date ||
                    "",
                  registrationStartTime:
                    details.registration_start_time ||
                    details.diplay_registration_start_time ||
                    "",
                  registrationEndDate:
                    details.registration_end_date ||
                    details.registration_end_date ||
                    details.diplay_registration_end_date ||
                    "",
                  registrationEndTime:
                    details.registration_end_time ||
                    details.diplay_registration_end_time ||
                    "",
                };
                // Only set if there's at least one value
                if (Object.values(sched).some((v) => v)) {
                  // Store in local eventFormData too so child components that read
                  // props (or parent state) can access scheduling values faster.
                  try {
                    setEventFormData((prev) => ({ ...prev, ...sched }));
                  } catch (e) {}
                  sessionStorage.setItem(
                    "eventSchedulingFormData",
                    JSON.stringify(sched)
                  );
                }
              } catch (e) {}

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
              } catch (e) {}

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
              } catch (e) {}

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
                    } catch (e) {}
                  }
                } catch (e) {}
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
                } catch (e) {}

                // Mark which steps are already saved based on presence of data
                try {
                  const stepSaved = new Array(11).fill(false);
                  // Step 1 - Essentials: event exists => saved
                  stepSaved[0] = true;

                  // Helper to check presence in details or top-level det.data
                  const hasAny = (keys) => {
                    for (const k of keys) {
                      if (
                        (details &&
                          details[k] !== undefined &&
                          details[k] !== null &&
                          details[k] !== "") ||
                        (det.data &&
                          det.data[k] !== undefined &&
                          det.data[k] !== null &&
                          det.data[k] !== "")
                      )
                        return true;
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
                      "city",
                      "city_name",
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
                    ])
                  )
                    stepSaved[2] = true;

                  // Step 4 - Settings (heuristic keys)
                  if (
                    hasAny([
                      "payment_type",
                      "paid_status",
                      "settings",
                      "event_settings",
                      "refund_policy",
                    ])
                  )
                    stepSaved[3] = true;

                  // Step 5 - Race Categories
                  if (
                    (det.data &&
                      det.data.AllEventTypes &&
                      det.data.AllEventTypes.length > 0) ||
                    hasAny([
                      "categories",
                      "event_categories",
                      "race_categories",
                    ])
                  )
                    stepSaved[4] = true;

                  // Step 6 - Form Questions
                  if (
                    hasAny([
                      "form_questions",
                      "event_form_questions",
                      "formQuestions",
                    ])
                  )
                    stepSaved[5] = true;

                  // Step 7 - Age Category
                  if (
                    hasAny(["age_categories", "AllAgeCategory", "ageCategory"])
                  )
                    stepSaved[6] = true;

                  // Step 8 - Discount Coupons
                  if (hasAny(["coupons", "event_coupons", "discounts"]))
                    stepSaved[7] = true;

                  // Step 9 - Communications
                  if (
                    hasAny([
                      "communications",
                      "event_comm",
                      "event_communications",
                    ])
                  )
                    stepSaved[8] = true;

                  // Step 10 - FAQs
                  if (hasAny(["faqs", "EventFaq", "event_faqs"]))
                    stepSaved[9] = true;

                  // Step 11 - Integrations
                  if (hasAny(["integrations", "event_integrations"]))
                    stepSaved[10] = true;

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
              } catch (e) {}
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
    const s = sessionStorage.getItem("eventName") || "";
    if (s && s !== eventName) setEventName(s);
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
        } catch (e) {}

        // Store event_id in session storage if returned
        if (newEventId) {
          try {
            sessionStorage.setItem("event_id", String(newEventId));
          } catch (e) {}
          if (lastEventId !== String(newEventId)) {
            try {
              sessionStorage.removeItem("eventSchedulingFormData");
            } catch (e) {}
            setLastEventId(String(newEventId));
          }
        }

        setSavedSteps((prev) => {
          const updated = [...prev];
          updated[0] = true;
          return updated;
        });
        setCurrentStep(2);
        alert(response?.message || "Event basic info saved successfully");
      } else {
        alert(response?.message || "Failed to save event basic info");
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
                initialFormData={eventFormData}
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
                  setSavedSteps((prev) => {
                    const updated = [...prev];
                    updated[5] = true;
                    return updated;
                  });
                  setCurrentStep(7);
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
                    // Convenience fee: 2% of base amount capped at ₹40
                    const convenienceFee =
                      baseAmount > 0 ? Math.min(0.02 * baseAmount, 40) : 0;
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
                    // Registration GST: 18% of base registration fee
                    const registrationGST =
                      baseAmount > 0
                        ? Math.round(baseAmount * 0.18 * 100) / 100
                        : 0;
                    const totalPayable =
                      baseAmount +
                      convenienceFee +
                      platformFee +
                      paymentGatewayFee +
                      convenienceFeeGST +
                      platformFeeGST +
                      paymentGatewayGST +
                      registrationGST;
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
                                Registration Fee GST 18%
                              </td>
                              <td
                                style={{ textAlign: "right", fontWeight: 600 }}
                              >
                                ₹{registrationGST.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", color: "#666" }}>
                                Payment Gateway Charge 2%
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
                      {headerTitle}
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
