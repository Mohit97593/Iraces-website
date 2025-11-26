import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const CommunicationsStep = ({ onBack, onNext }) => {
  const [items, setItems] = useState([]);
  const [termsItem, setTermsItem] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) {
        // No event selected: do not show fallback static items. Leave lists empty.
        setItems([]);
        setTermsItem(null);
        return;
      }

      try {
        setLoading(true);
        const res = await authAPI.getEventDetails(Number(eventId));
        const data = res?.data || res || {};

        const comms = data.communication_details || [];
        const mapped = comms.map((c) => ({
          id: c.id,
          title: c.subject_name || c.title || "Communication",
          content: c.message_content || "",
          active: !!c.status,
        }));
        setItems(mapped);

        const terms =
          (data.terms_conditions_details && data.terms_conditions_details[0]) ||
          null;
        if (terms) {
          setTermsItem({
            id: terms.id,
            title: terms.title || "Terms and Condition",
            content: terms.terms_conditions || "",
            status: !!terms.status,
          });
        } else {
          setTermsItem({
            id: "terms",
            title: "Terms and Condition",
            content: "",
            status: true,
          });
        }
      } catch (err) {
        console.error("Failed to load event details for communications:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDelete = (item) => {
    (async () => {
      if (!window.confirm("Are you sure you want to delete this item?")) return;

      const eventId = sessionStorage.getItem("event_id") || "";

      // determine common_flag
      let common_flag = "";
      if (termsItem && String(item.id) === String(termsItem.id)) {
        common_flag = "delete_terms";
      } else if (String(item.title).toLowerCase().includes("faq")) {
        common_flag = "faq_delete";
      } else if (String(item.title).toLowerCase().includes("coupon")) {
        common_flag = "coupon_delete";
      }

      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("event_comm_id", String(item.id));
      if (common_flag) formData.append("common_flag", common_flag);

      try {
        const res = await authAPI.deleteEventCommFqa(formData);
        const msg =
          (res && (res.message || (res.data && res.data.message))) || "Deleted";
        alert(msg);
        // remove from UI
        setItems((prev) =>
          prev.filter((i) => String(i.id) !== String(item.id))
        );
        // if terms were deleted, clear termsItem
        if (termsItem && String(item.id) === String(termsItem.id))
          setTermsItem(null);
      } catch (err) {
        console.error("deleteEventCommFqa error:", err);
        alert("Failed to delete. Please try again.");
      }
    })();
  };

  const handleEdit = async (item) => {
    // When edit clicked, call editEventCommFqa to fetch editable details
    const isTerms = String(item.id) === "terms" || item.id === "terms";
    const eventId = sessionStorage.getItem("event_id") || "";
    // determine comm id to send
    const commId = isTerms
      ? termsItem && termsItem.id
        ? termsItem.id
        : ""
      : item.id;

    // set editingId to hide other cards
    setEditingId(String(item.id));

    const fd = new FormData();
    if (eventId) fd.append("event_id", String(eventId));
    if (commId) fd.append("event_comm_id", String(commId));
    const flag = isTerms ? "term_conditions_edit" : "comm_edit";
    fd.append("event_edit_flag", flag);

    try {
      const res = await authAPI.editEventCommFqa(fd);
      // server may return different shapes; try common keys
      let detail = null;
      if (res) {
        detail =
          (res.communication_edit_details &&
            res.communication_edit_details[0]) ||
          (res.comm_edit_details && res.comm_edit_details[0]) ||
          (res.data &&
            res.data.communication_edit_details &&
            res.data.communication_edit_details[0]) ||
          (res.data &&
            res.data.comm_edit_details &&
            res.data.comm_edit_details[0]) ||
          null;
      }

      if (detail) {
        const title =
          detail.subject_name ||
          detail.title ||
          detail.name ||
          editModalData.title ||
          "";
        const content =
          detail.message_content ||
          detail.terms_conditions ||
          detail.content ||
          editModalData.content ||
          "";
        setEditModalData({ id: commId || item.id, title, content, isTerms });
      } else {
        // fallback to local source
        const source = isTerms
          ? termsItem
          : items.find((i) => String(i.id) === String(item.id));
        const editObj = source
          ? {
              id: source.id,
              title: source.title || "",
              content: source.content || "",
              isTerms,
            }
          : {
              id: item.id,
              title: item.title || "",
              content: item.content || "",
              isTerms,
            };
        setEditModalData(editObj);
      }

      setShowEditModal(true);
    } catch (err) {
      console.error("editEventCommFqa fetch error:", err);
      // still open editor with local data
      const source = isTerms
        ? termsItem
        : items.find((i) => String(i.id) === String(item.id));
      const editObj = source
        ? {
            id: source.id,
            title: source.title || "",
            content: source.content || "",
            isTerms,
          }
        : {
            id: item.id,
            title: item.title || "",
            content: item.content || "",
            isTerms,
          };
      setEditModalData(editObj);
      setShowEditModal(true);
    }
  };

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({
    id: "",
    title: "",
    content: "",
    isTerms: false,
  });

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditModalData({ id: "", title: "", content: "", isTerms: false });
    setEditingId(null);
  };

  const saveEdit = async () => {
    // build FormData per API: event_id, event_comm_id, event_edit_flag
    const eventId = sessionStorage.getItem("event_id") || "";
    // If editing Terms & Conditions, call the dedicated API with required keys
    try {
      if (editModalData.isTerms) {
        const fd = new FormData();
        fd.append("event_id", String(eventId));
        const derivedUserId =
          localStorage.getItem("user_id") ||
          sessionStorage.getItem("user_id") ||
          "";
        fd.append("user_id", String(derivedUserId));
        fd.append("title", editModalData.title || "");
        fd.append("terms_conditions", editModalData.content || "");
        fd.append("event_comm_id", String(editModalData.id || ""));

        const res = await authAPI.addEditTermsConditions(fd);
        const message =
          (res && (res.message || (res.data && res.data.message))) || "Saved";
        alert(message);
      } else {
        const fd = new FormData();
        fd.append("event_id", String(eventId));
        // use event_comm_id as id when editing communications
        fd.append("event_comm_id", String(editModalData.id));
        // action flag depends on type
        const flag = "comm_edit";
        fd.append("event_edit_flag", flag);
        // include fields that backend may expect
        fd.append("title", editModalData.title || "");
        fd.append("message_content", editModalData.content || "");

        const res = await authAPI.editEventCommFqa(fd);
        const message =
          (res && (res.message || (res.data && res.data.message))) || "Saved";
        alert(message);
      }
      // refresh event details to reflect saved changes
      const reloadId = sessionStorage.getItem("event_id");
      if (reloadId) {
        try {
          const resp = await authAPI.getEventDetails(Number(reloadId));
          const data = resp?.data || resp || {};
          const comms = data.communication_details || [];
          const mapped = comms.map((c) => ({
            id: c.id,
            title: c.subject_name || c.title || "Communication",
            content: c.message_content || "",
            active: !!c.status,
          }));
          setItems(mapped);

          const terms =
            (data.terms_conditions_details &&
              data.terms_conditions_details[0]) ||
            null;
          if (terms) {
            setTermsItem({
              id: terms.id,
              title: terms.title || "Terms and Condition",
              content: terms.terms_conditions || "",
              status: !!terms.status,
            });
          }
        } catch (e) {
          console.error("Failed to reload event details after edit:", e);
        }
      }
      closeEditModal();
    } catch (err) {
      console.error("editEventCommFqa error (save):", err);
      alert((err && err.message) || "Failed to save. Please try again.");
    }
  };

  const toggleActive = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, active: !it.active } : it))
    );
  };

  const toggleTerms = () => {
    const term = items.find((it) =>
      String(it.title).toLowerCase().includes("term")
    );
    if (term) toggleActive(term.id);
  };

  const handleToggleTerms = async () => {
    if (!termsItem) return;

    const confirmChange = window.confirm("Change Terms & Conditions status?");
    if (!confirmChange) return;

    const newStatus = !termsItem.status;
    // optimistic UI
    setTermsItem((t) => ({ ...(t || {}), status: newStatus }));

    // per spec: when toggle ON => send false, OFF => send true
    const payloadStatus = (!newStatus).toString();
    const formData = new FormData();
    formData.append("coupon_id", String(termsItem.id));
    formData.append("coupon_status", payloadStatus);
    formData.append("action_flag", "term_changes_status");

    try {
      const res = await authAPI.statusCoupon(formData);
      const message =
        (res && (res.message || (res.data && res.data.message))) ||
        "Status updated";
      alert(message);
    } catch (err) {
      console.error("statusCoupon error:", err);
      // revert on failure
      setTermsItem((t) => ({ ...(t || {}), status: !newStatus }));
      alert("Failed to update status. Please try again.");
    }
  };

  const handleToggleItem = async (item) => {
    if (!item) return;

    const confirmChange = window.confirm(`Change status for "${item.title}"?`);
    if (!confirmChange) return;

    const newStatus = !item.active;
    // optimistic UI
    setItems((prev) =>
      prev.map((it) =>
        String(it.id) === String(item.id) ? { ...it, active: newStatus } : it
      )
    );

    const payloadStatus = (!newStatus).toString();
    const formData = new FormData();
    formData.append("coupon_id", String(item.id));
    formData.append("coupon_status", payloadStatus);
    formData.append("action_flag", "comm_changes_status");
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) formData.append("event_id", String(eventId));

    try {
      const res = await authAPI.statusCoupon(formData);
      const message =
        (res && (res.message || (res.data && res.data.message))) ||
        "Status updated";
      alert(message);
    } catch (err) {
      console.error("statusCoupon error (item):", err);
      // revert
      setItems((prev) =>
        prev.map((it) =>
          String(it.id) === String(item.id) ? { ...it, active: !newStatus } : it
        )
      );
      alert("Failed to update status. Please try again.");
    }
  };

  // If editingId is set, show only the inline editor (hide everything else)
  if (editingId) {
    return (
      <div className="event-form-section">
        <div style={{ maxWidth: 900, margin: "20px auto" }}>
          <div className="ce-inline-editor">
            <h3 style={{ marginTop: 0 }}>
              Edit{" "}
              {editModalData.isTerms ? "Terms & Conditions" : "Communication"}
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              <label>Title</label>
              <input
                value={editModalData.title}
                onChange={(e) =>
                  setEditModalData((p) => ({ ...p, title: e.target.value }))
                }
                type="text"
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />

              <label>Content</label>
              <textarea
                value={editModalData.content}
                onChange={(e) =>
                  setEditModalData((p) => ({ ...p, content: e.target.value }))
                }
                style={{
                  minHeight: 320,
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  onClick={closeEditModal}
                  style={{
                    background: "#fff",
                    color: "#da251c",
                    border: "1px solid #da251c",
                    padding: "8px 18px",
                    borderRadius: 6,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 6,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Communications</h3>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {items
            .filter((it) => {
              // when editing, show only the card being edited
              if (editingId) return String(it.id) === String(editingId);
              if (!termsItem) return it.title !== "Terms and Condition";
              return (
                String(it.id) !== String(termsItem.id) &&
                it.title !== termsItem.title
              );
            })
            .map((it) => (
              <div
                key={it.id}
                onMouseEnter={() => setHovered(it.id)}
                onMouseLeave={() => setHovered(null)}
                className={`comm-card ${hovered === it.id ? "hover" : ""}`}
                style={{
                  padding: 24,
                  borderRadius: 8,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                  minHeight: 110,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>
                    {it.title}
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    <div
                      className={`toggle ${it.active ? "on" : ""}`}
                      onClick={() => handleToggleItem(it)}
                      role="button"
                      aria-label="toggle"
                    >
                      <div className="knob" />
                    </div>
                  </div>
                </div>

                {/* floating actions */}
                <div
                  className={`comm-actions ${
                    hovered === it.id ? "visible" : ""
                  }`}
                >
                  <button onClick={() => handleEdit(it)} title="Edit">
                    ✎
                  </button>
                  <button onClick={() => handleDelete(it)} title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            ))}
        </div>
        {/* Inline Edit Panel (in-page) - appears here when editing an item */}
        {showEditModal && (
          <div className="ce-inline-editor">
            <h3 style={{ marginTop: 0 }}>
              Edit{" "}
              {editModalData.isTerms ? "Terms & Conditions" : "Communication"}
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              <label>Title</label>
              <input
                value={editModalData.title}
                onChange={(e) =>
                  setEditModalData((p) => ({ ...p, title: e.target.value }))
                }
                type="text"
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />

              <label>Content</label>
              <textarea
                value={editModalData.content}
                onChange={(e) =>
                  setEditModalData((p) => ({ ...p, content: e.target.value }))
                }
                style={{
                  minHeight: 220,
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  onClick={closeEditModal}
                  style={{
                    background: "#fff",
                    color: "#da251c",
                    border: "1px solid #da251c",
                    padding: "8px 16px",
                    borderRadius: 6,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
          <h4 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Terms & Conditions
          </h4>
          <div
            className={`comm-card ${hovered === "terms" ? "hover" : ""}`}
            onMouseEnter={() => setHovered("terms")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: 24,
              minHeight: 110,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>
                {termsItem ? termsItem.title : "Terms and Condition"}
              </div>
              <div style={{ marginLeft: 12 }}>
                <div
                  className={`toggle ${
                    termsItem && termsItem.status ? "on" : ""
                  }`}
                  role="button"
                  aria-label="toggle"
                  onClick={handleToggleTerms}
                >
                  <div className="knob" />
                </div>
              </div>
            </div>

            <div
              className={`comm-actions ${hovered === "terms" ? "visible" : ""}`}
            >
              <button onClick={() => handleEdit({ id: "terms" })} title="Edit">
                ✎
              </button>
              <button
                onClick={() => handleDelete({ id: "terms" })}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
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
            Save & Next (8/11)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsStep;
