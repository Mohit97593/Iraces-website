import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const FAQsStep = ({ onBack, onNext }) => {
  const [items, setItems] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // load existing FAQs from event details
    const load = async () => {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) return;
      try {
        const res = await authAPI.getEventDetails(Number(eventId));
        const data = res?.data || res || {};
        const faqs = data.faq_details || data.communication_details || [];
        const mapped = (faqs || []).map((f) => ({
          id: f.id || f.event_comm_id || f.faq_id,
          title: f.question || f.title || f.subject_name || "FAQ",
          active: f.status ? !!f.status : false,
        }));
        setItems(mapped);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      }
    };
    load();
  }, []);

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
    } catch (err) {
      console.error("Failed to update FAQ status:", err);
      // revert
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, active: item.active } : it
        )
      );
      alert("Failed to update status. Try again.");
    }
  };

  const handleEdit = async (item) => {
    // call edit API to fetch details and open add form pre-filled
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return alert("Missing event_id");
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
      alert("Failed to load edit details");
    }
  };

  const handleAdd = () => {
    // open inline add editor
    setNewQuestion("");
    setNewAnswer("");
    setAdding(true);
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleSaveAdd = async () => {
    if (!newQuestion.trim()) {
      alert("Question is required");
      return;
    }
    const isEdit = !!editingId;
    let tempId = null;
    if (!isEdit) {
      tempId = `new_${Date.now()}`;
      const newItem = { id: tempId, title: newQuestion.trim(), active: true };
      // optimistic UI
      setItems((prev) => [newItem, ...prev]);
    }
    setAdding(false);

    // attempt backend save if event_id exists
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) {
      // resolve user id from stored userData (many possible keys)
      let userId = "";
      try {
        const stored = localStorage.getItem("userData");
        if (stored) {
          const ud = JSON.parse(stored);
          userId =
            ud.id ||
            ud.ID ||
            ud.user_id ||
            ud.userId ||
            ud.UserId ||
            ud.ID ||
            ud.UserID ||
            "";
        }
      } catch (e) {
        // ignore parse errors
      }
      if (!userId) {
        userId = localStorage.getItem("user_id") || "";
      }
      if (!userId) {
        alert("Unable to determine user_id. Please login again.");
        // leave optimistic UI entry but don't call backend
        setNewQuestion("");
        setNewAnswer("");
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
        } else {
          fd.append("event_comm_id", "");
        }
        const res = await authAPI.addEventFaq(fd);
        // if backend returns new id, replace temp id
        const newId =
          res &&
          (res.data?.id ||
            res.data?.event_comm_id ||
            res.event_comm_id ||
            res.id ||
            res.data?.inserted_id);
        if (newId) {
          if (isEdit) {
            setItems((prev) =>
              prev.map((it) =>
                String(it.id) === String(editingId)
                  ? { ...it, id: newId, title: newQuestion.trim() }
                  : it
              )
            );
          } else {
            setItems((prev) =>
              prev.map((it) => (it.id === tempId ? { ...it, id: newId } : it))
            );
          }
        }
        setNewQuestion("");
        setNewAnswer("");
        setEditingId(null);
        return true;
      } catch (err) {
        console.error("Failed to save FAQ:", err, err.response);
        const serverMsg =
          err.response?.data || err.response?.statusText || err.message;
        alert("Failed to save FAQ: " + JSON.stringify(serverMsg));
        return false;
      }
    }
    setNewQuestion("");
    setNewAnswer("");
    return true;
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
        alert((res && res.message) || "Deleted");
        setItems((prev) =>
          prev.filter((it) => String(it.id) !== String(item.id))
        );
      })
      .catch((err) => {
        console.error("Failed to delete FAQ:", err);
        alert("Failed to delete.");
      });
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>{adding ? "Add FAQ's" : "FAQ's"}</h3>
        {!adding && (
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
                  <div
                    className={`toggle ${it.active ? "on" : ""}`}
                    onClick={() => handleToggle(it)}
                    role="button"
                  >
                    <div className="knob" />
                  </div>
                </div>
              </div>

              <div
                className={`faq-actions ${hovered === it.id ? "visible" : ""}`}
              >
                <button onClick={() => handleEdit(it)} title="Edit">
                  ✎
                </button>
              </div>
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
              Save & Next (10/11)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FAQsStep;
