import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const FAQsStep = ({ onBack, onNext, showToast, isReadOnly }) => {
  const [items, setItems] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // load existing FAQs from event details
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return;
    try {
      const res = await authAPI.getEventDetails(Number(eventId));
      const data = res?.data || res || {};
      const faqs = data.faq_details || [];
      const mapped = (faqs || []).map((f) => ({
        id: f.id,
        title: f.question || "FAQ",
        content: f.answer || "",
        active: !!f.status,
        custom_faq: f.custom_faq || 0,
      }));
      setItems(mapped);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    }
  };

  const handleToggle = async (item) => {
    if (!window.confirm(`Change status for \"${item.title}\"?`)) return;
    const newStatus = !item.active;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, active: newStatus } : it))
    );
    const formData = new FormData();
    formData.append("coupon_id", String(item.id));
    formData.append("coupon_status", (!newStatus).toString());
    formData.append("action_flag", "faq_changes_status");
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) formData.append("event_id", String(eventId));
    try {
      await authAPI.statusCoupon(formData);

      // Add delay and refresh event details to get updated FAQ status from server
      if (eventId) {
        setTimeout(async () => {
          await loadFAQs();
        }, 500);
      }
    } catch (err) {
      console.error("Failed to update FAQ status:", err);
      // revert
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, active: item.active } : it
        )
      );
      showToast && showToast("Failed to update status. Try again.", 'error');
    }
  };

  const handleEdit = async (item) => {
    // call edit API to fetch details and open add form pre-filled
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return showToast && showToast("Missing event_id", 'error');
    try {
      const fd = new FormData();
      fd.append("event_id", String(eventId));
      fd.append("event_comm_id", String(item.id));
      fd.append("event_edit_flag", "faq_edit");
      const res = await authAPI.editEventCommFqa(fd);
      const details =
        res?.data?.faq_edit_details ||
        res?.faq_edit_details ||
        res?.data?.communication_details ||
        [];
      const d = details[0] || {};
      setNewQuestion(d.question || d.title || "");
      setNewAnswer(d.answer || "");
      setEditingId(item.id);
      setAdding(true);
    } catch (err) {
      console.error("Failed to load edit details:", err);
      showToast && showToast("Failed to load edit details", 'error');
    }
  };

  const handleAdd = () => {
    // open inline add editor
    setNewQuestion("");
    setNewAnswer("");
    setEditingId(null);
    setAdding(true);
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewQuestion("");
    setNewAnswer("");
    setEditingId(null);
  };

  const handleSaveAdd = async () => {
    if (!newQuestion.trim()) {
      showToast && showToast("Question is required", 'error');
      return false;
    }
    if (!newAnswer.trim()) {
      showToast && showToast("Answer is required", 'error');
      return false;
    }

    const isEdit = !!editingId;
    const eventId = sessionStorage.getItem("event_id");

    if (!eventId) {
      showToast && showToast("Event ID not found. Please try again.", 'error');
      return false;
    }

    // resolve user id from stored userData
    let userId = "";
    try {
      const stored = sessionStorage.getItem("userData");
      if (stored) {
        const ud = JSON.parse(stored);
        userId =
          ud.id ||
          ud.ID ||
          ud.user_id ||
          ud.userId ||
          ud.UserId ||
          ud.UserID ||
          "";
      }
    } catch (e) {
      // ignore parse errors
    }
    if (!userId) {
      userId = sessionStorage.getItem("user_id") || "";
    }
    if (!userId) {
      showToast && showToast("Unable to determine user_id. Please login again.", 'error');
      return false;
    }

    try {
      const fd = new FormData();
      fd.append("event_id", String(eventId));
      fd.append("user_id", String(userId));
      fd.append("quetion_name", newQuestion.trim());
      fd.append("answer", newAnswer.trim());

      // if editing, include event_comm_id and flag
      if (isEdit) {
        fd.append("event_comm_id", String(editingId));
        fd.append("event_edit_flag", "faq_edit");
      }

      const res = await authAPI.addEventFaq(fd);
      console.log("FAQ API Response:", res);

      // Show success message
      showToast && showToast((res && res.message) || (isEdit ? "FAQ updated successfully!" : "FAQ added successfully!"), 'success');

      // Close the add form
      setAdding(false);
      setNewQuestion("");
      setNewAnswer("");
      setEditingId(null);

      // Refresh FAQ list from event details API
      setTimeout(async () => {
        await loadFAQs();
      }, 500);

      return true;
    } catch (err) {
      console.error("Failed to save FAQ:", err, err.response);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.response?.statusText ||
        err.message;
      showToast && showToast("Failed to save FAQ: " + (typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)), 'error');
      return false;
    }
  };

  const handleDelete = (item) => {
    if (!window.confirm("Delete this FAQ?")) return;
    // call delete API
    const eventId = sessionStorage.getItem("event_id") || "";
    const fd = new FormData();
    fd.append("event_id", String(eventId));
    fd.append("event_comm_id", String(item.id));
    fd.append("common_flag", "faq_delete");
    authAPI
      .deleteEventCommFqa(fd)
      .then((res) => {
        showToast && showToast((res && res.message) || "FAQ deleted successfully!");
        setItems((prev) =>
          prev.filter((it) => String(it.id) !== String(item.id))
        );
      })
      .catch((err) => {
        console.error("Failed to delete FAQ:", err);
        showToast && showToast("Failed to delete.", 'error');
      });
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>{adding ? "Add FAQ's" : "FAQ's"}</h3>
        {!adding && !isReadOnly && (
          <button
            onClick={handleAdd}
            style={{
              border: "1.5px solid #da251c",
              color: "#da251c",
              background: "#fff",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add FAQ's
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {adding ? (
          <div className={`faq-card adding`}>
            <div style={{ marginTop: 12 }}>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Question <span style={{ color: "#da251c" }}>*</span>
              </label>
              <input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="form-control"
                placeholder="Question"
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Answer <span style={{ color: "#da251c" }}>*</span>
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="form-control"
                placeholder="Answer"
                rows={6}
              />
            </div>
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              onMouseEnter={() => setHovered(it.id)}
              onMouseLeave={() => setHovered(null)}
              className={`faq-card ${hovered === it.id ? "hover" : ""}`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>{it.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {!isReadOnly && (
                    <div
                      className={`toggle ${it.active ? "on" : ""}`}
                      onClick={() => handleToggle(it)}
                      role="button"
                    >
                      <div className="knob" />
                    </div>
                  )}
                </div>
              </div>

              {!isReadOnly && (
                <div
                  className={`faq-actions ${hovered === it.id ? "visible" : ""}`}
                >
                  <button onClick={() => handleEdit(it)} title="Edit">
                    ✎
                  </button>
                  <button onClick={() => handleDelete(it)} title="Delete">
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 24,
        }}
      >
        {adding ? (
          <>
            <button
              onClick={handleCancelAdd}
              style={{
                border: "1.5px solid #da251c",
                color: "#da251c",
                background: "#fff",
                borderRadius: 6,
                padding: "10px 32px",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const ok = await handleSaveAdd();
                if (ok) {
                  // stay on the same page and show the list (do not navigate forward)
                  return;
                }
              }}
              style={{
                background: "#da251c",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 32px",
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </>
        ) : (
          !isReadOnly && (
            <>
              <button
                onClick={onBack}
                style={{
                  border: "1.5px solid #da251c",
                  color: "#da251c",
                  background: "#fff",
                  borderRadius: 6,
                  padding: "10px 32px",
                  fontWeight: 600,
                }}
              >
                Back
              </button>
              <button
                onClick={() => onNext()}
                style={{
                  background: "#da251c",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 32px",
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default FAQsStep;
