import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";

export default function EventImages({ onBack, onNext }) {
  const [bannerBg, setBannerBg] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#030303");
  const [backgroundStatus, setBackgroundStatus] = useState(1);
  const [eventBanner, setEventBanner] = useState(null);
  const [descriptionImage, setDescriptionImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  // For persisting form data
  useEffect(() => {
    // Load saved form data from sessionStorage if available
    const saved = sessionStorage.getItem("eventImagesFormData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // If event_id matches or not present, restore
        if (
          !data.event_id ||
          (eventDetails && data.event_id === eventDetails.id)
        ) {
          setDescription(data.description || "");
          setKeywords(data.keywords || "");
          setBackgroundColor(data.backgroundColor || "#030303");
          setBackgroundStatus(data.backgroundStatus || 1);
          setBannerBg(data.bannerBg || false);
        }
      } catch {}
    }
  }, [eventDetails]);

  const handleSave = async () => {
    setErrorMsg("");
    // Validation
    if (!eventDetails || !eventDetails.new_event_url) {
      setErrorMsg("Event URL is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Description is required.");
      return;
    }
    if (!keywords.trim()) {
      setErrorMsg("Keywords/Metatags are required.");
      return;
    }
    if (!eventBanner) {
      setErrorMsg("Banner image is required.");
      return;
    }
    if (eventBanner && eventBanner.size > 5 * 1024 * 1024) {
      setErrorMsg("Banner image must be 5MB or less.");
      return;
    }
    // Save form data to sessionStorage
    sessionStorage.setItem(
      "eventImagesFormData",
      JSON.stringify({
        event_id: eventDetails.id,
        description,
        keywords,
        backgroundColor,
        backgroundStatus,
        bannerBg,
      })
    );
    const formData = new FormData();
    formData.append("event_id", eventDetails.id);
    formData.append("event_description", description);
    formData.append("event_keywords", keywords);
    formData.append("background_color", backgroundColor ? backgroundColor : "");
    formData.append("background_status", backgroundStatus);
    formData.append("event_url", eventDetails.new_event_url || "");
    formData.append("url_link", eventDetails.url_link || "");
    formData.append(
      "description_image",
      descriptionImage ? descriptionImage : ""
    );
    if (eventBanner) formData.append("event_banner", eventBanner);
    try {
      const res = await authAPI.addEventDescription(formData);
      if (res.data && res.data.status === 200) {
        alert("Event description saved!");
        // Call event details API after saving description
        let bannerImage = null;
        if (eventDetails && eventDetails.id) {
          const detailsRes = await authAPI.getEventDetails(eventDetails.id);
          if (
            detailsRes &&
            detailsRes.data &&
            detailsRes.data.EventData &&
            detailsRes.data.EventData[0]
          ) {
            setEventDetails(detailsRes.data.EventData[0]);
            bannerImage = detailsRes.data.EventData[0].banner_image || null;
          }
        }
        // Pass banner image to parent (CreateEvent) if available
        if (bannerImage) {
          onNext(bannerImage);
        } else if (res.data.banner_image) {
          onNext(res.data.banner_image);
        } else {
          onNext();
        }
      } else {
        setErrorMsg(res.data.message || "Failed to save event description");
      }
    } catch (err) {
      setErrorMsg("Error saving event description");
    }
  };

  return (
    <div className="event-form-section">
      <h3>Event Description</h3>
      <form>
        <div className="form-group">
          <label>
            Event URL <span style={{ color: "#da251c" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={
              eventDetails && eventDetails.new_event_url
                ? eventDetails.new_event_url
                : ""
            }
            readOnly
            required
          />
          {errorMsg === "Event URL is required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>
            Description <span style={{ color: "#da251c" }}>*</span>
          </label>
          <textarea
            className="form-control"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errorMsg === "Description is required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>
            Keywords/Metatags <span style={{ color: "#da251c" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
          />
          {errorMsg === "Keywords/Metatags are required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-row" style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>
              Event banner <span style={{ color: "#da251c" }}>*</span>
            </label>
            <input
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  setErrorMsg("Banner image must be 5MB or less.");
                  e.target.value = null;
                  setEventBanner(null);
                } else {
                  setErrorMsg("");
                  setEventBanner(file);
                }
              }}
              required
            />
            {errorMsg === "Banner image is required." && (
              <div
                style={{
                  color: "#da251c",
                  fontWeight: 500,
                  fontSize: "0.92em",
                  marginTop: 4,
                }}
              >
                {errorMsg}
              </div>
            )}
            {errorMsg === "Banner image must be 5MB or less." && (
              <div
                style={{
                  color: "#da251c",
                  fontWeight: 500,
                  fontSize: "0.92em",
                  marginTop: 4,
                }}
              >
                {errorMsg}
              </div>
            )}
            <small>In jpg, jpeg, png formats. Max upto 5MB.</small>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Event Communication Creatives</label>
            <input type="file" className="form-control" multiple />
            <small>You can choose multiple files.</small>
          </div>
        </div>
        <div className="form-group">
          <label>Banner Background</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              type="button"
              className={`btn ${bannerBg ? "btn-success" : "btn-light"}`}
              style={{
                borderRadius: "24px 0 0 24px",
                border: bannerBg ? "2px solid #da251c" : "1px solid #ccc",
                color: bannerBg ? "#fff" : "#da251c",
                background: bannerBg ? "#da251c" : "#fff",
                fontWeight: 600,
                minWidth: 60,
              }}
              onClick={() => {
                setBannerBg(true);
                setBackgroundStatus(1);
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className={`btn ${!bannerBg ? "btn-danger" : "btn-light"}`}
              style={{
                borderRadius: "0 24px 24px 0",
                border: !bannerBg ? "2px solid #da251c" : "1px solid #ccc",
                color: !bannerBg ? "#fff" : "#da251c",
                background: !bannerBg ? "#da251c" : "#fff",
                fontWeight: 600,
                minWidth: 60,
              }}
              onClick={() => {
                setBannerBg(false);
                setBackgroundStatus(0);
                setBackgroundColor("");
              }}
            >
              No
            </button>
            {bannerBg && (
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{
                  marginLeft: 16,
                  width: 40,
                  height: 32,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            )}
            {bannerBg && (
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 500,
                }}
              >
                Background Color
              </span>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Description Image</label>
          <input
            type="file"
            className="form-control"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setDescriptionImage(e.target.files[0])}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 32,
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
            onClick={handleSave}
          >
            Save & Next (3/11)
          </button>
        </div>
      </form>
    </div>
  );
}
