import React, { useState } from "react";

export default function EventImages({ onBack, onNext }) {
  const [bannerBg, setBannerBg] = useState(false);

  return (
    <div className="event-form-section">
      <h3>Event Description</h3>
      <form>
        <div className="form-group">
          <label>Event URL *</label>
          <input
            type="text"
            className="form-control"
            defaultValue="https://racesregistrations.com/e/kk"
          />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea className="form-control" rows={5} />
        </div>
        <div className="form-group">
          <label>Keywords/Metatags *</label>
          <input type="text" className="form-control" />
        </div>
        <div className="form-row" style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Event banner *</label>
            <input
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png"
            />
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
          <div style={{ display: "flex", gap: 16 }}>
            <button
              type="button"
              className={`btn ${!bannerBg ? "btn-danger" : "btn-light"}`}
              onClick={() => setBannerBg(false)}
            >
              No
            </button>
            <button
              type="button"
              className={`btn ${bannerBg ? "btn-success" : "btn-light"}`}
              onClick={() => setBannerBg(true)}
            >
              Yes
            </button>
          </div>
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
            onClick={onNext}
          >
            Save & Next (3/11)
          </button>
        </div>
      </form>
    </div>
  );
}
