import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";

export default function EventSettings({ onBack, onNext }) {
  // Clear localStorage for eventSettingsFormData if event id changes (new event)
  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    const lastEventId = localStorage.getItem("eventSettingsLastEventId");
    if (eventId && eventId !== lastEventId) {
      localStorage.removeItem("eventSettingsFormData");
      localStorage.setItem("eventSettingsLastEventId", eventId);
    }
  }, []);
  const [limit, setLimit] = useState("");
  const [registrationType, setRegistrationType] = useState("multiple");
  const [uniqueOnly, setUniqueOnly] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) {
      authAPI.getEventDetails(eventId).then((res) => {
        if (res && res.data && res.data.EventData && res.data.EventData[0]) {
          setEventDetails(res.data.EventData[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Restore form data from localStorage if available
    const saved = localStorage.getItem("eventSettingsFormData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLimit(data.limit || "");
        setRegistrationType(data.registrationType || "multiple");
        setUniqueOnly(data.uniqueOnly || false);
      } catch {}
    }
  }, []);

  const handleSaveSettings = async () => {
    const eventId = eventDetails?.id;
    let userId = sessionStorage.getItem("user_id");
    // Fallback: try to get user_id from eventDetails if not in sessionStorage
    if (!userId || userId === "null") {
      userId = eventDetails?.user_id || "";
    }
    const formData = new FormData();
    formData.append("event_id", eventId);
    formData.append("user_id", userId);
    formData.append("overall_limit", limit);
    formData.append("allow_unique_registration", uniqueOnly ? 1 : 0);
    formData.append(
      "event_registration_status",
      registrationType === "single" ? 1 : 2
    );
    try {
      const res = await authAPI.addEventSetting(formData);
      if (res.success === 200) {
        alert(res.message || "Event settings updated successfully");
        // Save form data to localStorage on save
        localStorage.setItem(
          "eventSettingsFormData",
          JSON.stringify({
            limit,
            registrationType,
            uniqueOnly,
          })
        );
        if (typeof onNext === "function") onNext();
      } else {
        alert(res.message || "Failed to update event settings");
      }
    } catch (err) {
      alert("Error updating event settings");
    }
  };

  return (
    <div className="event-form-section">
      <h3 style={{ fontWeight: 700, fontSize: "1.6rem", marginBottom: 32 }}>
        Event Settings
      </h3>
      <form style={{ maxWidth: 900 }}>
        {/* You can use eventDetails here if needed */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          <input
            type="number"
            className="form-control"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 420,
              height: 52,
              borderRadius: 12,
              border: "1.5px solid #eee",
              fontSize: "1.1rem",
              paddingLeft: 18,
              fontWeight: 500,
              background: "#fff",
            }}
            placeholder="Overall Limit"
          />
          <span
            style={{
              fontWeight: 500,
              fontSize: "1.1rem",
              marginRight: 12,
            }}
          >
            Registrations
          </span>
          <div
            style={{
              display: "flex",
              gap: 0,
              border: "2px solid #da251c",
              borderRadius: 24,
              overflow: "hidden",
              minWidth: 260,
              maxWidth: 340,
              width: 260,
              height: 48,
            }}
          >
            <button
              type="button"
              className="btn"
              style={{
                border: "none",
                outline: "none",
                background: registrationType === "single" ? "#da251c" : "#fff",
                color: registrationType === "single" ? "#fff" : "#da251c",
                fontWeight: 600,
                padding: "0 32px",
                fontSize: "1.1rem",
                borderRadius: "24px 0 0 24px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                width: 130,
                justifyContent: "center",
                boxShadow:
                  registrationType === "single" ? "0 2px 8px #eee" : "none",
                cursor: "pointer",
              }}
              onClick={() => setRegistrationType("single")}
            >
              <i
                className="fas fa-globe"
                style={{
                  color: registrationType === "single" ? "#fff" : "#da251c",
                  fontSize: 18,
                }}
              ></i>{" "}
              <span style={{ marginLeft: 6 }}>Single</span>
            </button>
            <button
              type="button"
              className="btn"
              style={{
                border: "none",
                outline: "none",
                background:
                  registrationType === "multiple" ? "#da251c" : "#fff",
                color: registrationType === "multiple" ? "#fff" : "#da251c",
                fontWeight: 600,
                padding: "0 32px",
                fontSize: "1.1rem",
                borderRadius: "0 24px 24px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                width: 130,
                justifyContent: "center",
                boxShadow:
                  registrationType === "multiple" ? "0 2px 8px #eee" : "none",
                cursor: "pointer",
              }}
              onClick={() => setRegistrationType("multiple")}
            >
              <i
                className="fas fa-lock"
                style={{
                  color: registrationType === "multiple" ? "#fff" : "#da251c",
                  fontSize: 18,
                }}
              ></i>{" "}
              <span style={{ marginLeft: 6 }}>Multiple</span>
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 500,
              fontSize: "1.1rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 44,
                height: 24,
                background: uniqueOnly ? "#da251c" : "#eee",
                borderRadius: 12,
                position: "relative",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
              onClick={() => setUniqueOnly(!uniqueOnly)}
            >
              <span
                style={{
                  position: "absolute",
                  left: uniqueOnly ? 22 : 2,
                  top: 2,
                  width: 20,
                  height: 20,
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 1px 4px #ccc",
                  transition: "left 0.2s",
                }}
              ></span>
            </span>
            Allow only unique registrations
          </label>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
          }}
        >
          <button
            type="button"
            className="btn-back"
            style={{
              minWidth: 100,
              fontWeight: 600,
              background: "#fff",
              color: "#da251c",
              border: "2px solid #da251c",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: "1.1rem",
              height: 42,
              marginLeft: 8,
              marginTop: "22px",
            }}
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-save-continue"
            style={{
              minWidth: 120,
              fontWeight: 600,
              background: "#da251c",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "10px 32px",
              fontSize: "1.1rem",
              height: 44,
            }}
            onClick={handleSaveSettings}
          >
            Save & Next (4/11)
          </button>
        </div>
      </form>
    </div>
  );
}
