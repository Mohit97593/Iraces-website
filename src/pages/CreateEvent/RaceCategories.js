import React, { useState } from "react";
import RaceCategoryForm from "./RaceCategoryForm";

export default function RaceCategories({ onBack, onNext, setShowPreview }) {
  const [gst, setGst] = useState(false);
  const [taxType, setTaxType] = useState("inclusive");
  const [showForm, setShowForm] = useState(false);

  const handleNewClick = () => {
    setShowForm(true);
    if (setShowPreview) setShowPreview(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    if (setShowPreview) setShowPreview(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Add save logic here
    setShowForm(false);
    if (setShowPreview) setShowPreview(true);
  };

  return (
    <div className="event-form-section">
      {showForm ? (
        <RaceCategoryForm onCancel={handleCancel} onSave={handleSave} />
      ) : (
        <>
          <h3 style={{ fontWeight: 700, fontSize: "1.6rem", marginBottom: 32 }}>
            Race Category
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div></div>
            <button
              type="button"
              style={{
                border: "2px solid #da251c",
                color: "#da251c",
                background: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                padding: "8px 24px",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={handleNewClick}
            >
              <i className="fas fa-users" style={{ color: "#da251c" }}></i> +
              New Race Category
            </button>
          </div>
          <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Do you want to collect GST on Registration Fee?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  style={{
                    background: gst ? "#da251c" : "#fff",
                    color: gst ? "#fff" : "#da251c",
                    border: "2px solid #da251c",
                    borderRadius: 24,
                    fontWeight: 600,
                    padding: "10px 32px",
                    fontSize: "1.1rem",
                    minWidth: 90,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => setGst(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  style={{
                    background: !gst ? "#da251c" : "#fff",
                    color: !gst ? "#fff" : "#da251c",
                    border: "2px solid #da251c",
                    borderRadius: 24,
                    fontWeight: 600,
                    padding: "10px 32px",
                    fontSize: "1.1rem",
                    minWidth: 90,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => setGst(false)}
                >
                  <i
                    className="fas fa-lock"
                    style={{ color: !gst ? "#fff" : "#da251c" }}
                  ></i>{" "}
                  No
                </button>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                The basic registration fee will be :
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  style={{
                    background: taxType === "inclusive" ? "#da251c" : "#fff",
                    color: taxType === "inclusive" ? "#fff" : "#da251c",
                    border: "2px solid #da251c",
                    borderRadius: "18px",
                    fontWeight: 600,
                    padding: "8px 18px",
                    fontSize: "1.08rem",
                    minWidth: 120,
                    minHeight: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxSizing: "border-box",
                    lineHeight: 1.2,
                  }}
                  onClick={() => setTaxType("inclusive")}
                >
                  Inclusive Taxes
                </button>
                <button
                  type="button"
                  style={{
                    background: taxType === "exclusive" ? "#da251c" : "#fff",
                    color: taxType === "exclusive" ? "#fff" : "#da251c",
                    border: "2px solid #da251c",
                    borderRadius: "18px",
                    fontWeight: 600,
                    padding: "8px 18px",
                    fontSize: "1.08rem",
                    minWidth: 120,
                    minHeight: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxSizing: "border-box",
                    lineHeight: 1.2,
                  }}
                  onClick={() => setTaxType("exclusive")}
                >
                  Exclusive Taxes
                </button>
              </div>
            </div>
          </div>
          <hr style={{ margin: "32px 0" }} />
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px #eee",
              padding: "32px 0",
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1.5px dashed #eee",
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}
            >
              NO RACE CATEGORIES ADDED
            </div>
            <div
              style={{ fontWeight: 500, fontSize: "1.05rem", marginBottom: 18 }}
            >
              PLEASE CLICK ON ADD "+ NEW RACE CATEGORY" BUTTON TO ADD NEW RACE
              CATEGORY
            </div>
            <button
              type="button"
              style={{
                border: "2px solid #da251c",
                color: "#da251c",
                background: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                padding: "8px 24px",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={handleNewClick}
            >
              <i className="fas fa-users" style={{ color: "#da251c" }}></i> +NEW
              RACE CATEGORY
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
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
              Save & Next (5/11)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
