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
    } catch (e) { }
    return 0;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingEvents(true);
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
      } finally {
        setLoadingEvents(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const callAllEventDetails = async (type) => {
    console.log("callAllEventDetails invoked with type:", type);
    setActiveType(type);
    try {
      setLoadingEvents(true);
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
    } finally {
      setLoadingEvents(false);
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
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedEventToCopy, setSelectedEventToCopy] = useState(null);
  const [newEventName, setNewName] = useState("");
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (events && events.length > 0) {
      const initialLiked = {};
      events.forEach((ev) => {
        initialLiked[ev.id] = ev.is_follow === 1 || ev.is_follow === "1";
      });
      setLikedEvents(initialLiked);

      // Initialize toggle states based on event_status from API
      // event_status: true = toggle ON, event_status: false = toggle OFF
      const initialToggles = {};
      events.forEach((ev) => {
        initialToggles[ev.id] = ev.event_status === true || ev.event_status === "true" || ev.event_status === 1;
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

  // Handle event status toggle
  const handleToggleStatus = async (eventId, currentState) => {
    // Optimistically update UI
    const newState = !currentState;
    setToggleStates((prev) => ({ ...prev, [eventId]: newState }));

    try {
      // When toggle is ON, send "false" to backend
      // When toggle is OFF, send "true" to backend
      const statusToSend = newState ? "false" : "true";

      console.log(`🔄 Changing event ${eventId} status to:`, statusToSend);

      const payload = {
        event_id: eventId,
        event_status: statusToSend,
        action_flag: "change_status"
      };

      const response = await authAPI.changeEventStatus(payload);
      console.log("✅ Status change response:", response);

      // Refresh events list to get updated data
      const user_id = getStoredUserId();
      const refreshPayload = {
        event_info_status: activeType === 1 ? 1 : activeType === 2 ? 2 : 3,
        user_id: user_id,
        login_as_organiser_id: 0,
      };

      const refreshRes = await authAPI.allEventDetails(refreshPayload);
      const parsedRefresh = parseEventsFromResponse(refreshRes);
      setEvents(parsedRefresh);

      // Show success message if available
      if (response && response.message) {
        console.log("✅", response.message);
      }
    } catch (err) {
      console.error("❌ Failed to toggle status:", err);
      // Revert on error
      setToggleStates((prev) => ({ ...prev, [eventId]: currentState }));
      alert("Failed to change event status. Please try again.");
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
        } catch (e) { }
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
        } catch (e) { }
      }
    } catch (e) {
      console.error("Direct refresh after delete failed:", e);
      // final fallback: remove locally so UI updates
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    }
  };

  const handleCopyEvent = async () => {
    if (!selectedEventToCopy || !newEventName.trim()) return;

    try {
      setIsCopying(true);
      const payload = {
        event_id: selectedEventToCopy.id,
        new_event_name: newEventName.trim(),
        copy_tickets: true,
        copy_questions: true,
        copy_age_criteria: true,
        copy_communications: true
      };

      console.log("🚀 Copying event with payload:", payload);
      const res = await authAPI.copyEvent(payload);
      console.log("✅ Copy response:", res);

      if (res && (res.status == 1 || res.status == "1" || res.status == 200 || res.validate == 0 || res.validate == "0" || res.success || (res.message && res.message.toLowerCase().includes("success")))) {
        // Close modal and stop loading BEFORE the long refresh call
        setShowCopyModal(false);
        setIsCopying(false);

        // Trigger refresh in background (don't await if we want instant close)
        callAllEventDetails(3);

        setTimeout(() => {
          alert(res.message || "Event copied successfully! Check Drafts tab.");
        }, 200);
      } else {
        alert(res?.message || "Failed to copy event");
      }
    } catch (err) {
      console.error("❌ Copy event error:", err);
      alert(err || "An error occurred while copying the event");
    } finally {
      setIsCopying(false);
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
                <span className="breadcrumb-separator">→</span>
                <span>My Events</span>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <div className="my-events-section">
        <div className="my-events-type-group">
          <button
            className={`my-events-type-btn public${activeType === 1 ? " active-red" : ""
              }`}
            onClick={() => callAllEventDetails(1)}
          >
            🔓 Public
          </button>
          <button
            className={`my-events-type-btn private${activeType === 2 ? " active-red" : ""
              }`}
            onClick={() => callAllEventDetails(2)}
          >
            🔒 Private
          </button>
          <button
            className={`my-events-type-btn draft${activeType === 3 ? " active-red" : ""
              }`}
            onClick={() => callAllEventDetails(3)}
          >
            📝 Draft
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          {loadingEvents ? (
            <div className="my-events-loading">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
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
                          {/* Early Bird Badge */}
                          {(event.early_bird === 1 || event.early_bird === "1") && (
                            <span
                              className="event-card-badge"
                              style={{
                                position: 'absolute',
                                top: '168px',
                                right: '0px',
                                backgroundColor: '#D4A017',
                                color: '#fff',
                                padding: '4px 19px',
                                left: '8px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 2,
                                width: "100px"

                              }}
                            >
                              Early Bird
                            </span>
                          )}
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
                              onClick={() => {
                                setSelectedEventToCopy(event);
                                setNewName(`${event.name || event.event_name || "Event"} Copy`);
                                setShowCopyModal(true);
                              }}
                            >
                              <i className="fas fa-copy"></i>
                            </button>
                            <button
                              className="event-edit-btn"
                              aria-label="Edit event"
                              onClick={() => {
                                // Store event_id in localStorage instead of URL
                                localStorage.setItem('editEventId', event.id);
                                navigate('/create-event');
                              }}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              className="event-delete-btn"
                              onClick={() =>
                                deleteEventById(event.id, event.active || 0)
                              }
                              aria-label="Delete event"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>

                        <div className="event-card-body">
                          {/* Date Badge - Red/White Split Design */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "stretch",
                              width: "fit-content",
                              marginBottom: "12px",
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
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {eventDate.month.toUpperCase()}
                            </div>
                            <div
                              style={{
                                background: "#fff",
                                color: "#333",
                                padding: "8px 16px",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                border: "1px solid #e0e0e0",
                                borderLeft: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "45px",
                              }}
                            >
                              {eventDate.day}
                            </div>
                          </div>

                          {/* Event Title */}
                          <h3
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: 700,
                              color: "#2c3e50",
                              marginBottom: "10px",
                              lineHeight: "1.3",
                              margin: "0 0 10px 0",
                            }}
                          >
                            {event.name}
                          </h3>

                          {/* Register By */}
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#7f8c8d",
                              marginBottom: "12px",
                            }}
                          >
                            Register by :{" "}
                            <span
                              style={{
                                color: "#da251c",
                                fontWeight: 700,
                              }}
                            >
                              {registerBy}
                            </span>
                          </div>

                          <div className="event-register-info" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                            <i
                              className="fas fa-chart-bar"
                              style={{
                                fontSize: '18px',
                                color: '#666',
                                cursor: 'pointer'
                              }}
                              onClick={() => navigate(`/event-analytics/${event.id}`, { state: { eventName: event.name } })}
                              title="View Analytics"
                            ></i>
                          </div>

                          <div className="event-footer d-flex align-items-center justify-content-between">
                            {registrationClosed ? (
                              <span
                                style={{
                                  color: "#dc3545",
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <i
                                  className="fas fa-ban"
                                  style={{ fontSize: "1rem" }}
                                ></i>
                                Registration Closed
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#27ae60",
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <i
                                  className="fas fa-check-circle"
                                  style={{ fontSize: "1rem" }}
                                ></i>
                                Registration Open
                              </span>
                            )}
                            {/* Toggle switch */}
                            <div
                              className={`event-toggle ${toggleStates[event.id] ? "on" : ""
                                }`}
                              onClick={() => handleToggleStatus(event.id, toggleStates[event.id])}
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
      {/* Copy Event Modal */}
      {showCopyModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="modal-card" style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 700, color: '#2c3e50' }}>Copy Event</h3>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#34495e' }}>
                New Event Name <span style={{ color: '#da251c' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
                value={newEventName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name for the event"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                className="btn-cancel"
                onClick={() => setShowCopyModal(false)}
                style={{
                  padding: '10px 25px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleCopyEvent}
                disabled={isCopying || !newEventName.trim()}
                style={{
                  padding: '10px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#da251c',
                  color: '#fff',
                  cursor: (isCopying || !newEventName.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: (isCopying || !newEventName.trim()) ? 0.7 : 1
                }}
              >
                {isCopying ? 'Copying...' : 'Copy Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
