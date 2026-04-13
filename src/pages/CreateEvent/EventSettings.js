import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import Toast from "../../components/Toast/Toast";
import HelpIcon from "../../components/HelpModal/HelpIcon";
import { helpContent } from "../../utils/HelpContent";

export default function EventSettings({ onBack, onNext, showToast, isReadOnly }) {
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  // Clear sessionStorage for eventSettingsFormData if event id changes (new event)
  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    const lastEventId = sessionStorage.getItem("eventSettingsLastEventId");
    if (eventId && eventId !== lastEventId) {
      sessionStorage.removeItem("eventSettingsFormData");
      sessionStorage.setItem("eventSettingsLastEventId", eventId);
    }
  }, []);
  const [limit, setLimit] = useState("");
  const [registrationType, setRegistrationType] = useState("multiple");
  const [uniqueOnly, setUniqueOnly] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return;

    const loadData = async () => {
      try {
        const res = await authAPI.getEventDetails(eventId);
        if (res && res.data && res.data.EventData && res.data.EventData[0]) {
          const apiData = res.data.EventData[0];
          setEventDetails(apiData);

          // Restore form data from sessionStorage if available
          const saved = sessionStorage.getItem("eventSettingsFormData");
          let parsedSaved = null;
          if (saved) {
            try {
              parsedSaved = JSON.parse(saved);
            } catch (e) {
              console.error("Error parsing saved settings:", e);
            }
          }

          // Use saved data if present, otherwise fallback to API data
          setLimit(parsedSaved?.limit || apiData.overall_limit || "");
          setRegistrationType(
            parsedSaved?.registrationType ||
            (apiData.event_registration_status === 1 ? "single" : "multiple")
          );
          setUniqueOnly(
            parsedSaved?.uniqueOnly !== undefined
              ? parsedSaved.uniqueOnly
              : apiData.allow_unique_registration === 1
          );

          console.log("Event Settings Loaded from API:", apiData);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    };

    loadData();
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
        // Use parent showToast so the toast persists after step navigation
        if (showToast) showToast(res.message || "Event settings updated successfully", 'success');
        else triggerToast(res.message || "Event settings updated successfully");
        // Save form data to sessionStorage on save
        sessionStorage.setItem(
          "eventSettingsFormData",
          JSON.stringify({
            limit,
            registrationType,
            uniqueOnly,
          })
        );
        if (typeof onNext === "function") onNext();
      } else {
        triggerToast(res.message || "Failed to update event settings", 'error');
      }
    } catch (err) {
      triggerToast("Error updating event settings", 'error');
    }
  };

  return (
    <div className="event-form-section">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.6rem", margin: 0 }}>
            Event Settings
          </h3>
          <HelpIcon
            title={helpContent.settings.title}
            content={helpContent.settings.content}
          />
        </div>
      </div>
      <form style={{ width: "100%" }}>
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
            className="form-controll"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            disabled={isReadOnly}
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
              background: isReadOnly ? "#fafafa" : "#fff",
              cursor: isReadOnly ? "not-allowed" : "text",
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
              disabled={isReadOnly}
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
                cursor: isReadOnly ? "not-allowed" : "pointer",
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
              disabled={isReadOnly}
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
                cursor: isReadOnly ? "not-allowed" : "pointer",
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
                cursor: isReadOnly ? "not-allowed" : "pointer",
                opacity: isReadOnly ? 0.7 : 1,
              }}
              onClick={() => !isReadOnly && setUniqueOnly(!uniqueOnly)}
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
        {!isReadOnly && (
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
        )}
      </form>
    </div>
  );
}
