import React, { useState } from "react";
import "./CreateEvent.css";

const RaceCategoryForm = ({ onCancel, onSave }) => {
  const [paidType, setPaidType] = useState("Paid");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applyAgeLimit, setApplyAgeLimit] = useState(false);
  const [earlyBird, setEarlyBird] = useState(false);

  return (
    <div style={{ display: "flex", gap: "32px", width: "100%" }}>
      {/* Left Form Section */}
      <form style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: "1.6rem", margin: 0 }}>
            New Race Category
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              style={{
                background: paidType === "Paid" ? "#da251c" : "#fff",
                color: paidType === "Paid" ? "#fff" : "#da251c",
                border: "2px solid #da251c",
                borderRadius: 20,
                padding: "6px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => setPaidType("Paid")}
            >
              ₹ Paid
            </button>
            <button
              type="button"
              style={{
                background: paidType === "Free" ? "#da251c" : "#fff",
                color: paidType === "Free" ? "#fff" : "#da251c",
                border: "2px solid #da251c",
                borderRadius: 20,
                padding: "6px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => setPaidType("Free")}
            >
              % Free
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Race Category Name *
            </label>
            <input
              type="text"
              placeholder="Race Category Name *"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Category *
            </label>
            <select
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            >
              <option value="">-- Select Category --</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Maximum Registration *
            </label>
            <input
              type="number"
              placeholder="Maximum Registration *"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Race Category Price *
            </label>
            <input
              type="number"
              placeholder="Race Category Price *"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Minimum per booking count *
            </label>
            <input
              type="number"
              placeholder="Minimum per booking count *"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Allow registrations upto *
            </label>
            <input
              type="number"
              placeholder="Allow registrations upto *"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Registration Starts From *
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Start Time *
            </label>
            <input
              type="time"
              placeholder="--:--"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Registration Ends on *
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              End Time *
            </label>
            <input
              type="time"
              placeholder="--:--"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            aria-label="Show advanced settings"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginRight: 10,
              cursor: "pointer",
              outline: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 32,
                height: 20,
                borderRadius: 12,
                background: showAdvanced ? "#da251c" : "#eee",
                position: "relative",
                transition: "background 0.2s",
                marginRight: 8,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: showAdvanced ? 16 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  transition: "left 0.2s",
                  border: "1px solid #ccc",
                }}
              />
            </span>
          </button>
          <span style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}>
            Show advanced settings
          </span>
        </div>

        {showAdvanced && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Who will pay Convenience Fee *
                </label>
                <input
                  type="text"
                  placeholder="Participant"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  defaultValue="Participant"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Who will pay Payment Gateway fee *
                </label>
                <input
                  type="text"
                  placeholder="Participant"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  defaultValue="Participant"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Description *
                </label>
                <textarea
                  placeholder="Description *"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    minHeight: 100,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Message Attendee
                </label>
                <textarea
                  placeholder="Message Attendee"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    minHeight: 100,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              aria-label="Apply Age Limit"
              onClick={() => setApplyAgeLimit(!applyAgeLimit)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginRight: 10,
                cursor: "pointer",
                outline: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 32,
                  height: 20,
                  borderRadius: 12,
                  background: applyAgeLimit ? "#da251c" : "#eee",
                  position: "relative",
                  transition: "background 0.2s",
                  marginRight: 8,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: applyAgeLimit ? 16 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    transition: "left 0.2s",
                    border: "1px solid #ccc",
                  }}
                />
              </span>
            </button>
            <span
              style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}
            >
              Apply Age Limit{" "}
              <span style={{ color: "#888", fontSize: "0.95rem" }}>
                (Age calculated as on Event date)
              </span>
            </span>
          </div>
          {applyAgeLimit && (
            <div style={{ display: "flex", gap: "16px", marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Age Start *
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">-- Select --</option>
                  {/* Add age options here */}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Age End *
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">-- Select --</option>
                  {/* Add age options here */}
                </select>
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <button
              type="button"
              aria-label="Early bird settings"
              onClick={() => setEarlyBird(!earlyBird)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginRight: 10,
                cursor: "pointer",
                outline: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 32,
                  height: 20,
                  borderRadius: 12,
                  background: earlyBird ? "#da251c" : "#eee",
                  position: "relative",
                  transition: "background 0.2s",
                  marginRight: 8,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: earlyBird ? 16 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    transition: "left 0.2s",
                    border: "1px solid #ccc",
                  }}
                />
              </span>
            </button>
            <span
              style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}
            >
              Early bird settings
            </span>
          </div>
          {earlyBird && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    No of Registrations Limit *
                  </label>
                  <input
                    type="number"
                    placeholder="No of Registrations Limit *"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    Discount
                  </label>
                  <select
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="">Percentage</option>
                    <option value="">Amount</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    placeholder="Discount Value *"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    Start Date *
                  </label>
                  <input
                    type="date"
                    placeholder="dd-mm-yyyy"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    Start Time *
                  </label>
                  <input
                    type="time"
                    placeholder="--:--"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    End Date *
                  </label>
                  <input
                    type="date"
                    placeholder="dd-mm-yyyy"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    End Time *
                  </label>
                  <input
                    type="time"
                    placeholder="--:--"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "#fff",
              border: "2px solid #da251c",
              color: "#da251c",
              padding: "10px 32px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSave}
            style={{
              background: "#da251c",
              color: "#fff",
              border: "none",
              padding: "10px 32px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaceCategoryForm;
