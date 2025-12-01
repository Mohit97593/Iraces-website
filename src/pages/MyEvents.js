import React, { useState, useEffect } from "react";
import TopNav from "../components/Navbar/TopNav";
import "./MyEvents.css";
import "./SearchEvents.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";

export default function MyEvents() {
  const [activeType, setActiveType] = useState(1); // 1=public,2=private,3=draft

  const getStoredUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && (userData.user_id || userData.id))
        return userData.user_id || userData.id;
    } catch (e) {
      // ignore
    }
    // fallback to authAPI helper if available
    try {
      const ud = authAPI.getUserData && authAPI.getUserData();
      if (ud && (ud.user_id || ud.id)) return ud.user_id || ud.id;
    } catch (e) {}
    return 0;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getEvents({});
        console.log("MyEvents getEvents API result:", res);
        const profile = await authAPI.getProfile();
        console.log("MyEvents getProfile API result:", profile);
        // Now call allEventDetails API for public events
        let user_id = getStoredUserId();
        const payload = {
          event_id: 0,
          event_info_status: 1,
          user_id: user_id,
          login_as_organiser_id: 0,
        };
        const eventDetails = await authAPI.allEventDetails(payload);
        console.log("MyEvents allEventDetails API result:", eventDetails);
        // populate events state if available (handle multiple response shapes)
        const parsed = parseEventsFromResponse(eventDetails);
        setEvents(parsed);
      } catch (err) {
        console.error("Failed to call APIs:", err);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const callAllEventDetails = async (type) => {
    console.log("callAllEventDetails invoked with type:", type);
    setActiveType(type);
    try {
      // Example user_id, read from localStorage or authAPI
      let user_id = getStoredUserId();
      const payload = {
        event_id: 0,
        event_info_status: type === 1 ? 1 : type === 2 ? 2 : 3,
        user_id: user_id,
        login_as_organiser_id: 0,
      };
      const res = await authAPI.allEventDetails(payload);
      console.log("MyEvents allEventDetails API result:", res);
      const parsed = parseEventsFromResponse(res);
      setEvents(parsed);
    } catch (err) {
      console.error("Failed to call allEventDetails:", err);
    }
  };

  // Helper to normalize API response shapes to an array of events
  const parseEventsFromResponse = (resp) => {
    if (!resp) return [];
    // Common shapes:
    // { data: { EventData: [...] } }
    // { data: { event_data: [...] } }
    // { event_data: [...] }
    // [...] (array)

    if (Array.isArray(resp)) return resp;

    if (resp.data) {
      if (Array.isArray(resp.data.EventData)) return resp.data.EventData;
      if (Array.isArray(resp.data.event_data)) return resp.data.event_data;
      // Some APIs nest further: resp.data.data.event_data
      if (resp.data.data) {
        if (Array.isArray(resp.data.data.EventData))
          return resp.data.data.EventData;
        if (Array.isArray(resp.data.data.event_data))
          return resp.data.data.event_data;
      }
    }

    // Check top-level keys
    if (Array.isArray(resp.EventData)) return resp.EventData;
    if (Array.isArray(resp.event_data)) return resp.event_data;

    return [];
  };

  // events state and helpers
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState({});
  const [toggleStates, setToggleStates] = useState({});
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [copyingEvents, setCopyingEvents] = useState({});

  useEffect(() => {
    if (events && events.length > 0) {
      const initialLiked = {};
      events.forEach((ev) => {
        initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
      });
      setLikedEvents(initialLiked);

      // Initialize toggle states (default OFF)
      const initialToggles = {};
      events.forEach((ev) => {
        initialToggles[ev.id] = false;
      });
      setToggleStates(initialToggles);
    }
  }, [events]);

  const handleToggleLike = async (eventId) => {
    const current = likedEvents[eventId];
    const newState = !current;
    setLikedEvents((p) => ({ ...p, [eventId]: newState }));
    try {
      // followEvent(eventId, is_follow) where is_follow: 0=follow,1=unfollow
      const isFollowParam = newState ? 0 : 1;
      await authAPI.followEvent(eventId, isFollowParam);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLikedEvents((p) => ({ ...p, [eventId]: current }));
    }
  };

  // Centralized delete helper that calls server then refreshes current tab
  const deleteEventById = async (eventId, eventStatus = 0) => {
    const ok = window.confirm("Are you sure you want to delete this event?");
    if (!ok) return;

    let deleteSucceeded = false;
    try {
      const formData = new FormData();
      formData.append("event_id", String(eventId));
      formData.append("event_status", String(eventStatus || 0));
      formData.append("action_flag", "delete");

      const res = await authAPI.eventDeleteChangeStatus(formData);
      console.log("delete response:", res);
      // consider any truthy response as success (API shapes vary)
      if (res) deleteSucceeded = true;
      if (res && res.message) {
        try {
          // show server message when present
          alert(res.message);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Delete API error:", err);
    }

    // Always attempt to refresh the authoritative list from server
    try {
      console.log(
        "Refreshing events after delete (direct call), activeType:",
        activeType
      );
      const user_id = getStoredUserId();
      const payloadRefresh = {
        event_id: 0,
        event_info_status: activeType === 1 ? 1 : activeType === 2 ? 2 : 3,
        user_id: user_id,
        login_as_organiser_id: 0,
      };
      const refreshRes = await authAPI.allEventDetails(payloadRefresh);
      console.log("allEventDetails refresh response:", refreshRes);
      const parsedRefresh = parseEventsFromResponse(refreshRes);
      setEvents(parsedRefresh);
      // If delete had succeeded, show confirmation (only if no message shown earlier)
      if (deleteSucceeded) {
        try {
          // no-op if already alerted
        } catch (e) {}
      }
    } catch (e) {
      console.error("Direct refresh after delete failed:", e);
      // final fallback: remove locally so UI updates
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    }
  };

  const formatEventDate = (timestamp) => {
    if (!timestamp) return { month: "", day: "" };
    const date = new Date(timestamp * 1000);
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),
    };
  };

  const formatRegisterBy = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isRegistrationClosed = (endTime) => {
    if (!endTime) return false;
    return endTime * 1000 < Date.now();
  };

  return (
    <>
      <TopNav />
      {/* Hero Section - copied from Contact page for exact blue section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">My Events</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">–</span>
                <span>My Events</span>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <div className="my-events-section">
        <div className="my-events-type-group">
          <button
            className={`my-events-type-btn public${
              activeType === 1 ? " active-red" : ""
            }`}
            onClick={() => callAllEventDetails(1)}
          >
            🔓 Public
          </button>
          <button
            className={`my-events-type-btn private${
              activeType === 2 ? " active-red" : ""
            }`}
            onClick={() => callAllEventDetails(2)}
          >
            🔒 Private
          </button>
          <button
            className={`my-events-type-btn draft${
              activeType === 3 ? " active-red" : ""
            }`}
            onClick={() => callAllEventDetails(3)}
          >
            📝 Draft
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          {events.length === 0 ? (
            <div className="my-events-empty">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                alt="No events"
                className="my-events-empty-img"
              />
              <h2 className="my-events-empty-title">No events found</h2>
              <p className="my-events-empty-desc">
                Sorry, There are no events added yet. Please design your event
                now!
              </p>
            </div>
          ) : (
            <div className="container-fluid">
              <div className="row g-4">
                {events.map((event) => {
                  const eventDate = formatEventDate(event.start_time);
                  const registerBy = formatRegisterBy(
                    event.registration_end_time
                  );
                  const registrationClosed = isRegistrationClosed(
                    event.registration_end_time
                  );

                  return (
                    <div className="col-lg-4 col-md-6 col-12" key={event.id}>
                      <div className="event-card1">
                        <div className="event-card-img-wrapper">
                          <img
                            src={event.banner_image || event.image}
                            alt={event.name}
                            className="event-card-img"
                          />
                          <span className="event-card-badge navi-mumbai-badge">
                            <i
                              className="fas fa-map-marker-alt"
                              style={{ marginRight: 4 }}
                            ></i>
                            {event.city_name || event.city || "City"}
                          </span>
                          {/* Delete button */}
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              display: "flex",
                              gap: 8,
                              zIndex: 5,
                            }}
                          >
                            <button
                              className="event-copy-btn"
                              aria-label="Copy event"
                              onClick={async () => {
                                // prevent double clicks
                                if (copyingEvents[event.id]) return;
                                try {
                                  setCopyingEvents((p) => ({
                                    ...p,
                                    [event.id]: true,
                                  }));
                                  // Fetch full event details
                                  const det = await authAPI.getEventDetails(
                                    event.id
                                  );
                                  const details =
                                    (det &&
                                      det.data &&
                                      det.data.EventData &&
                                      det.data.EventData[0]) ||
                                    det.data ||
                                    det ||
                                    {};

                                  // Build a unique name based on existing events
                                  const existingNames = events.map((ev) =>
                                    (ev.name || ev.event_name || "")
                                      .trim()
                                      .toLowerCase()
                                  );
                                  let baseName = (
                                    details.event_name ||
                                    details.eventName ||
                                    details.name ||
                                    event.name ||
                                    "Untitled Event"
                                  ).trim();
                                  let newName = `${baseName} Copy`;
                                  let suffix = 1;
                                  while (
                                    existingNames.includes(
                                      newName.trim().toLowerCase()
                                    )
                                  ) {
                                    suffix += 1;
                                    newName = `${baseName} Copy (${suffix})`;
                                  }

                                  // Prepare category_id similar to CreateEvent
                                  let category_id = [];
                                  const cats =
                                    details.categories ||
                                    details.event_categories ||
                                    det.data?.AllEventTypes ||
                                    [];
                                  if (Array.isArray(cats)) {
                                    category_id = cats
                                      .map((c) => {
                                        if (!c) return null;
                                        if (typeof c === "string") {
                                          return {
                                            id: "",
                                            name: c,
                                            logo: c,
                                            active: 1,
                                            checked: "true",
                                          };
                                        }
                                        // object
                                        return {
                                          id: c.id || c.category_id || "",
                                          name: c.name || c.category_name || "",
                                          logo: c.logo || c.name || "",
                                          active: c.active || 1,
                                          checked: "true",
                                        };
                                      })
                                      .filter(Boolean);
                                  }

                                  // status mapping
                                  const st =
                                    details.event_info_status ||
                                    details.status ||
                                    3;

                                  // created_by
                                  let user_id = 0;
                                  try {
                                    const ud = JSON.parse(
                                      localStorage.getItem("userData")
                                    );
                                    if (ud && ud.user_id) user_id = ud.user_id;
                                  } catch (e) {}

                                  const payload = {
                                    event_info_status: st,
                                    event_name: newName,
                                    display_name_status: 0,
                                    display_name: "",
                                    event_type: 0,
                                    category_id: category_id,
                                    event_types: [],
                                    created_by: user_id || "",
                                    by_admin: "",
                                    url_link: window.location.origin,
                                  };

                                  const createRes =
                                    await authAPI.createEventBasicInfo(payload);
                                  const newEventId =
                                    createRes?.data?.event_id ||
                                    createRes?.event_id ||
                                    createRes?.data?.data?.event_id ||
                                    null;

                                  // Build a minimal event object for UI insertion
                                  const newEvent = {
                                    id: newEventId || Date.now(),
                                    name: newName,
                                    banner_image:
                                      details.banner_image ||
                                      details.image ||
                                      null,
                                    city_name:
                                      details.city_name || details.city || "",
                                    start_time:
                                      details.start_time ||
                                      details.event_start_date ||
                                      0,
                                    registration_end_time:
                                      details.registration_end_time || 0,
                                    active: details.active || 1,
                                  };

                                  setEvents((prev) => [
                                    newEvent,
                                    ...(prev || []),
                                  ]);
                                  try {
                                    alert("Event copied successfully");
                                  } catch (e) {}
                                } catch (err) {
                                  console.error("Failed to copy event:", err);
                                  try {
                                    alert(
                                      "Failed to copy event. Please try again."
                                    );
                                  } catch (e) {}
                                } finally {
                                  setCopyingEvents((p) => ({
                                    ...p,
                                    [event.id]: false,
                                  }));
                                }
                              }}
                            >
                              {copyingEvents[event.id] ? (
                                <span style={{ padding: "6px 8px" }}>
                                  Copying...
                                </span>
                              ) : (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z"
                                    fill="#333"
                                  />
                                  <path
                                    d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"
                                    fill="#333"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              className="event-edit-btn"
                              aria-label="Edit event"
                              onClick={() =>
                                navigate(`/create-event?event_id=${event.id}`)
                              }
                            >
                              <svg
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.41l-2.34-2.34a1.003 1.003 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                            </button>
                            <button
                              className="event-delete-btn"
                              onClick={() =>
                                deleteEventById(event.id, event.active || 0)
                              }
                              aria-label="Delete event"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9 3v1H4v2h16V4h-5V3H9zm1 6v8h2V9H10zm4 0v8h2V9h-2zM7 9v8h2V9H7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="event-card-body">
                          <div className="event-header">
                            <div className="event-date-wrapper">
                              <div className="event-month">
                                {eventDate.month}
                              </div>
                              <div className="event-day">{eventDate.day}</div>
                            </div>
                            <div className="event-title-wrapper">
                              <h3 className="event-title">{event.name}</h3>
                            </div>
                          </div>

                          <hr className="event-divider" />

                          <div className="event-register-info">
                            Register By :{" "}
                            <span className="register-date">{registerBy}</span>
                          </div>

                          <div className="event-footer d-flex align-items-center justify-content-between">
                            {registrationClosed ? (
                              <span className="registration-status">
                                <i
                                  className="fas fa-ban"
                                  style={{ marginRight: 6 }}
                                ></i>
                                Registration Closed
                              </span>
                            ) : (
                              <span
                                className="registration-status"
                                style={{ color: "green" }}
                              >
                                <i
                                  className="fas fa-check-circle"
                                  style={{ marginRight: 6 }}
                                ></i>
                                Registration Open
                              </span>
                            )}
                            {/* Toggle switch replacing Register/View button */}
                            <div
                              className={`event-toggle ${
                                toggleStates[event.id] ? "on" : ""
                              }`}
                              onClick={() =>
                                setToggleStates((prev) => ({
                                  ...prev,
                                  [event.id]: !prev[event.id],
                                }))
                              }
                              role="button"
                              tabIndex={0}
                              aria-pressed={!!toggleStates[event.id]}
                            >
                              <div className="toggle-track">
                                <div className="toggle-handle"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
