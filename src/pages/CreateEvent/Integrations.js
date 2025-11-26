import React, { useEffect, useState } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const Integrations = ({ onBack, onNext }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
            onClick={onNext}
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
    </div>
  );
};

export default Integrations;
