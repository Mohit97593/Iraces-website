import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const Integrations = ({ onBack, onNext }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedEventUrl, setSavedEventUrl] = useState("");
  const [savedCheckoutUrl, setSavedCheckoutUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await authAPI.getEventDetails(Number(eventId));
        if (res && res.data) setEventDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch event details for integrations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getPopupEmbed = () => {
    const eventId = sessionStorage.getItem("event_id") || "";
    return (
      "<button onclick='popup(" +
      eventId +
      ");' style='padding: 10px 16px; background-color: #d01c68; color: #fff; border-color: #d01c68;'>Register Now</button><noscript id='tsNoJsMsg'>Javascript on your browser is not enabled.</noscript><script src='https://racesregistrations.com/races/public/assets/js/popup_scripts.js' type='text/javascript'></script>"
    );
  };

  const getIframeEmbed = () => {
    const eventId = sessionStorage.getItem("event_id") || "";
    return (
      '<iframe id="ts-iframe" src="https://racesregistrations.com/races/public/ticket_iframe.html?' +
      eventId +
      '" frameborder="1" height="600" width="80%"></iframe><link rel="stylesheet" href="https://racesregistrations.com/static/Bookingflow/css/ts-iframe.style.css" >'
    );
  };

  const handleSave = async () => {
    try {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) {
        alert("Event ID not found. Please save the event first.");
        return;
      }
      const res = await authAPI.eventIntegration(eventId, 1);
      console.log("eventIntegration response:", res);
      const success = res && (res.success === 200 || res.success === "200");
      if (success) {
        const origin = window.location.origin;
        const eventUrl = `${origin}/event/${eventId}`;
        setSavedEventUrl(eventUrl);
        // Show modal here and let user navigate using modal button
        setShowSuccessModal(true);
      } else {
        alert((res && res.message) || "Failed to save integration settings");
      }
    } catch (err) {
      console.error("Failed calling eventIntegration:", err);
      alert("Failed to save integration settings.");
    }
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Integrations</h3>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h4 style={{ color: "#da251c" }}>
            &lt;&gt; Embed Tickets on your website (Pop-up)
          </h4>
          <p>
            To embed ticketing on your website which opens over the content on
            clicking a button, paste this HTML code
          </p>
          <div style={{ position: "relative" }}>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #eee",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <code>{getPopupEmbed()}</code>
            </pre>
          </div>
        </div>

        <div>
          <h4 style={{ color: "#da251c" }}>
            &lt;&gt; Embed Tickets on your website (iframe)
          </h4>
          <p>
            To embed ticketing within the content on your website, paste this
            HTML code
          </p>
          <div style={{ position: "relative" }}>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #eee",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <code>{getIframeEmbed()}</code>
            </pre>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            onClick={onBack}
            style={{
              border: "1.5px solid #da251c",
              color: "#da251c",
              background: "#fff",
              borderRadius: 6,
              padding: "10px 32px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "#da251c",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 32px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 560,
              maxWidth: "95%",
            }}
          >
            <div style={{ textAlign: "center", paddingTop: 6 }}>
              <div style={{ fontSize: 56, lineHeight: 1 }}>
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 15.172L5.414 10.586L4 12l6 6 10-10-1.414-1.414L10 15.172z"
                    fill="#07A08A"
                  />
                </svg>
              </div>
              <div style={{ color: "#d01c27", fontWeight: 700, marginTop: 8 }}>
                YAY!
              </div>
              <h3 style={{ margin: "8px 0 14px", color: "#222" }}>
                Event created successfully
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    border: "1px dashed #444",
                    padding: "10px 14px",
                    borderRadius: 6,
                    minWidth: 360,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{ flex: 1, color: "#222", wordBreak: "break-all" }}
                  >
                    {savedEventUrl || `${window.location.origin}/event/new`}
                  </div>
                  <button
                    onClick={() => {
                      const text =
                        savedEventUrl || `${window.location.origin}/event/new`;
                      try {
                        navigator.clipboard.writeText(text);
                        alert("Link copied");
                      } catch (e) {
                        console.error("clipboard error", e);
                        alert("Failed to copy link");
                      }
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 8,
                      fontSize: 16,
                    }}
                    aria-label="Copy Link"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    border: "1.5px solid #da251c",
                    color: "#da251c",
                    background: "#fff",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    const eventId = sessionStorage.getItem("event_id");
                    if (eventId) {
                      navigate(`/event/${eventId}`);
                    } else {
                      navigate(`/event/new`);
                    }
                  }}
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Go To Register Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
