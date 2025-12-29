import React, { useState, useEffect } from "react";
import "./CreateEvent.css";
import GeneralFormQuestions from "./GeneralFormQuestions";
import { authAPI } from "../../services/authAPI";

const FormQuestions = ({ onBack, onNext }) => {
  const [showGeneralForm, setShowGeneralForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [formCommon, setFormCommon] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [localToggleMap, setLocalToggleMap] = useState({});
  const [lastToggledId, setLastToggledId] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [draggedGroup, setDraggedGroup] = useState(null);

  useEffect(() => {
    // load questions initially; fetchQuestions defined below so other handlers can reuse it
    fetchQuestions();
  }, []);

  // Reusable fetchQuestions so we can refresh after delete
  // Accept optional updatedQuestion to merge into fetched data so optimistic edits persist
  async function fetchQuestions(updatedQuestion = null) {
    const eventId =
      sessionStorage.getItem("event_id") ||
      localStorage.getItem("event_id") ||
      "";
    if (!eventId) return;
    try {
      const fd = new FormData();
      fd.append("event_id", eventId);
      console.log("Fetching event form questions for event_id=", eventId);
      const res = await authAPI.eventFormQuestions(fd);
      if (res && res.data && res.data.form_question) {
        // Prefer grouped event_form_details if present
        const grouped = res.data.form_question.event_form_details || {};
        // If caller provided an updatedQuestion, merge it into grouped so UI shows edits
        if (updatedQuestion) {
          try {
            const mergeUpdatedQuestion = (prevQuestions, updated) => {
              if (!updated) return prevQuestions;
              const matchId = String(
                updated.general_form_id ||
                updated.general_form ||
                updated.id ||
                updated.form_id ||
                ""
              );
              const replaceInArray = (arr) =>
                arr.map((it) => {
                  const id = String(
                    it.general_form_id ||
                    it.general_form ||
                    it.id ||
                    it.form_id ||
                    ""
                  );
                  if (id && id === matchId) return { ...it, ...updated };
                  return it;
                });
              if (Array.isArray(prevQuestions))
                return replaceInArray(prevQuestions);
              if (typeof prevQuestions === "object" && prevQuestions !== null) {
                const resq = {};
                Object.keys(prevQuestions).forEach((k) => {
                  const v = prevQuestions[k];
                  if (Array.isArray(v)) resq[k] = replaceInArray(v);
                  else resq[k] = v;
                });
                return resq;
              }
              return prevQuestions;
            };
            const merged = mergeUpdatedQuestion(grouped, updatedQuestion);
            setQuestions(merged);
          } catch (err) {
            setQuestions(grouped);
          }
        } else {
          setQuestions(grouped);
        }
        // Debug: log server status for a few items and check last toggled id
        try {
          const renderList = (() => {
            if (!grouped) return [];
            if (Array.isArray(grouped)) return grouped;
            const arr = [];
            Object.values(grouped).forEach((v) => {
              if (Array.isArray(v)) arr.push(...v);
            });
            return arr;
          })();
          const sample = renderList.slice(0, 6).map((qq) => ({
            id: getQId(qq),
            serverValue: qq.event_form_status,
          }));
          console.log(
            "fetchQuestions: sample statuses:",
            sample,
            "lastToggledId:",
            lastToggledId,
            "localToggleMap:",
            localToggleMap
          );
          if (lastToggledId) {
            const found = renderList.find((qq) => getQId(qq) === lastToggledId);
            console.log("fetchQuestions: last toggled server entry:", found);
          }
        } catch (e) {
          console.error("fetchQuestions debug failed:", e);
        }
      }

      // Fetch full event details as well
      try {
        const ev = await authAPI.getEventDetails(eventId);
        console.log("getEventDetails response:", ev);
        setEventDetails(ev);
      } catch (err) {
        console.error("Failed to load event details:", err);
      }
    } catch (err) {
      console.error("Failed to load form questions:", err);
    }
  }

  const handleDeleteQuestion = async (q) => {
    const ok = window.confirm("Are you sure you want to delete this question?");
    if (!ok) return;
    try {
      const fd = new FormData();
      fd.append(
        "event_id",
        sessionStorage.getItem("event_id") ||
        localStorage.getItem("event_id") ||
        ""
      );
      // general_form_id should be the template id or the saved question id depending on backend
      fd.append(
        "general_form_id",
        q.general_form_id || q.general_form || q.id || ""
      );
      fd.append(
        "question_form_name",
        q.question_form_name || q.question_label || q.label || ""
      );

      const res = await authAPI.deleteEventFormQuestions(fd);

      console.log("deleteEventFormQuestions response:", res);

      // Show message if available
      // Treat responses that include a success code OR have a message/data as success
      if (
        res &&
        (res.success === 200 ||
          String(res.success) === "1" ||
          res.data ||
          res.message)
      ) {
        alert(res.message || "Question removed successfully");
      } else {
        alert(res?.message || "Failed to remove question");
      }

      // Refresh questions regardless of the response structure so UI stays in sync
      try {
        await fetchQuestions();
      } catch (err) {
        console.error("fetchQuestions after delete failed:", err);
      }

      // Always attempt to refresh form common details after delete
      try {
        console.log("Refreshing form common details after delete...");
        const fdCommon = new FormData();
        fdCommon.append("form_name", "");
        fdCommon.append("form_edit_id", "0");
        fdCommon.append("form_action_flag", "form_details");
        fdCommon.append("form_flag", "general_form");
        const commonRes = await authAPI.formCommonDetails(fdCommon);
        console.log("formCommonDetails response after delete:", commonRes);
        if (commonRes && commonRes.data) setFormCommon(commonRes.data);
      } catch (err) {
        console.error("Failed to refresh form common details:", err);
      }
    } catch (err) {
      console.error("deleteEventFormQuestions failed:", err);
      alert("Failed to delete question. See console for details.");
    }
  };

  useEffect(() => {
    const fetchFormCommon = async () => {
      try {
        const fd = new FormData();
        fd.append("form_name", "");
        fd.append("form_edit_id", "0");
        fd.append("form_action_flag", "form_details");
        fd.append("form_flag", "general_form");
        console.log("Fetching form common details");
        const res = await authAPI.formCommonDetails(fd);
        console.log("formCommonDetails response:", res);
        if (res && res.data) setFormCommon(res.data);
      } catch (err) {
        console.error("Failed to load form common details:", err);
      }
    };
    fetchFormCommon();
  }, []);

  const handleAddQuestions = () => {
    setShowGeneralForm(true);
  };

  const mergeUpdatedQuestion = (prevQuestions, updated) => {
    if (!updated) return prevQuestions;
    const matchId = String(
      updated.general_form_id ||
      updated.general_form ||
      updated.id ||
      updated.form_id ||
      ""
    );

    // Helper to replace in an array
    const replaceInArray = (arr) =>
      arr.map((it) => {
        const id = String(
          it.general_form_id || it.general_form || it.id || it.form_id || ""
        );
        if (id && id === matchId) return { ...it, ...updated };
        return it;
      });

    if (Array.isArray(prevQuestions)) return replaceInArray(prevQuestions);
    if (typeof prevQuestions === "object" && prevQuestions !== null) {
      const res = {};
      Object.keys(prevQuestions).forEach((k) => {
        const v = prevQuestions[k];
        if (Array.isArray(v)) res[k] = replaceInArray(v);
        else res[k] = v;
      });
      return res;
    }
    return prevQuestions;
  };

  const handleSaveQuestions = (newQuestions, updatedQuestion) => {
    // Immediately update local grouped data (server-provided) so UI reflects changes
    if (newQuestions) {
      setQuestions(newQuestions);
    }

    // Also merge the single updated question into current state as a safe fallback
    if (updatedQuestion) {
      setQuestions((prev) =>
        mergeUpdatedQuestion(prev || newQuestions, updatedQuestion)
      );
    }

    setShowGeneralForm(false);
    console.log("Saved questions (optimistic):", newQuestions, updatedQuestion);
    // Refresh from server to reflect canonical state
    (async () => {
      try {
        await fetchQuestions(updatedQuestion);
        console.log("Refreshed questions after save");
      } catch (err) {
        console.error("Failed to refresh questions after save:", err);
      }
    })();
  };

  const getRenderList = () => {
    if (!questions) return [];
    if (Array.isArray(questions)) return questions;
    if (typeof questions === "object") {
      // If questions is grouped by section name, flatten arrays
      // IMPORTANT: Use sorted keys to ensure consistent ordering for drag-and-drop
      const arr = [];
      const sortedKeys = Object.keys(questions).sort();
      sortedKeys.forEach((key) => {
        const v = questions[key];
        if (Array.isArray(v)) arr.push(...v);
      });
      return arr;
    }
    return [];
  };

  const isMandatory = (q) => {
    if (!q) return false;
    const valCandidates = [
      q.is_mandatory,
      q.is_manadatory,
      q.isManadatory,
      q.mandatory,
      q.question_mandatory_status,
      q.question_mandatory,
      q.mandatory_flag,
      q.required,
    ];
    for (const v of valCandidates) {
      if (
        v === "1" ||
        v === 1 ||
        v === true ||
        String(v).toLowerCase() === "yes" ||
        String(v).toLowerCase() === "true"
      )
        return true;
    }
    return false;
  };

  // Helper: convert various server values to boolean (true => server says "enabled")
  // NOTE: backend stores the opposite meaning for visual toggle: when server value is true,
  // the visual should be OFF. So UI visual = !serverBool.
  const parseServerBool = (val) => {
    return (
      val === "1" ||
      val === 1 ||
      val === true ||
      String(val).toLowerCase() === "true"
    );
  };

  // Helper: stable id string for a question (use the same fields everywhere)
  const getQId = (q) => {
    return String(q && (q.general_form_id || q.general_form || q.id || ""));
  };

  // local optimistic toggle: newVisualState = true => visual ON (red)
  const handleToggleEventFormStatus = async (q, newVisualState) => {
    const id = getQId(q);
    const questionId = q.id; // This is the actual database ID (e.g., 4542)
    const serverBoolBefore = parseServerBool(q.question_status);
    console.log("Toggling question", {
      displayId: id,
      questionId: questionId,
      newVisualState,
      serverBoolBefore
    });

    // optimistic update - update question_status field
    setLocalToggleMap((s) => ({ ...s, [id]: !!newVisualState }));
    setLastToggledId(id);

    // Also update the question_status in the questions state
    setQuestions((prevQuestions) => {
      const updateQuestion = (questions) => {
        if (Array.isArray(questions)) {
          return questions.map(item => {
            if (getQId(item) === id) {
              return { ...item, question_status: newVisualState };
            }
            return item;
          });
        } else if (typeof questions === 'object' && questions !== null) {
          const updated = {};
          Object.keys(questions).forEach(key => {
            const value = questions[key];
            if (Array.isArray(value)) {
              updated[key] = value.map(item => {
                if (getQId(item) === id) {
                  return { ...item, question_status: newVisualState };
                }
                return item;
              });
            } else {
              updated[key] = value;
            }
          });
          return updated;
        }
        return questions;
      };
      return updateQuestion(prevQuestions);
    });

    try {
      const fd = new FormData();
      fd.append("coupon_id", questionId); // Use the actual question id (e.g., 4542)
      // INVERTED LOGIC: Toggle ON (red) -> send "false", Toggle OFF (white) -> send "true"
      // Backend stores opposite: when we send "false", it stores question_status: true
      fd.append("event_form_status", newVisualState ? "false" : "true");
      fd.append("action_flag", "event_form_changes_status");

      console.log("Sending to API:", {
        coupon_id: questionId,
        event_form_status: newVisualState ? "false" : "true",
        visualState: newVisualState ? "ON (red)" : "OFF (white)",
        expectedServerStatus: newVisualState ? "true" : "false"
      });

      const res = await authAPI.statusCoupon(fd);
      console.log(
        "statusCoupon response:",
        res,
        "for question id",
        questionId,
        "sent event_form_status",
        newVisualState ? "false" : "true"
      );

      if (
        res &&
        (res.success === 200 ||
          String(res.success) === "1" ||
          res.data ||
          res.message)
      ) {
        // refresh data in background
        try {
          await fetchQuestions();
          const fdCommon = new FormData();
          fdCommon.append("form_name", "");
          fdCommon.append("form_edit_id", "0");
          fdCommon.append("form_action_flag", "form_details");
          fdCommon.append("form_flag", "general_form");
          const commonRes = await authAPI.formCommonDetails(fdCommon);
          if (commonRes && commonRes.data) setFormCommon(commonRes.data);
          // server confirmed; keep optimistic override so UI remains in user's chosen state
          setLocalToggleMap((s) => ({ ...s, [id]: !!newVisualState }));
        } catch (err) {
          console.error("Failed to refresh after toggle:", err);
        }
      } else {
        // revert optimistic
        setLocalToggleMap((s) => ({ ...s, [id]: !newVisualState }));
        alert(res?.message || "Failed to update status");
      }
    } catch (err) {
      setLocalToggleMap((s) => ({ ...s, [id]: !newVisualState }));
      console.error("Failed to toggle event form status:", err);
      alert("Failed to update status. See console.");
    }
  };

  // Wrapper to show a confirmation before toggling
  const handleToggleClick = (q) => {
    const id = getQId(q);
    const serverBool = parseServerBool(q.question_status); // Use question_status
    const current = id in localToggleMap ? !!localToggleMap[id] : serverBool; // Direct mapping, not inverted
    const newVisualState = !current;
    const msg = newVisualState
      ? "Are you sure you want to enable this question?"
      : "Are you sure you want to disable this question?";
    const ok = window.confirm(msg);
    if (!ok) return;
    handleToggleEventFormStatus(q, newVisualState);
  };

  // Confirm then change ticket-pdf checkbox
  const handleTicketCheckboxConfirm = (q, checked) => {
    const msg = checked
      ? "Are you sure you want to show this question on the Ticket PDF?"
      : "Are you sure you want to hide this question from the Ticket PDF?";
    const ok = window.confirm(msg);
    if (!ok) return;
    handleTicketCheckboxChange(q, checked);
  };

  // Performs optimistic update and calls API to set ticket PDF flag
  const handleTicketCheckboxChange = async (q, checked) => {
    const newFlag = checked ? 1 : 0;
    const fd = new FormData();
    fd.append(
      "event_id",
      sessionStorage.getItem("event_id") ||
      localStorage.getItem("event_id") ||
      ""
    );
    fd.append(
      "general_form_id",
      q.general_form_id || q.general_form || q.id || ""
    );
    fd.append("ticket_pdf_show_flag", newFlag);
    fd.append("child_question_ids", q.child_question_ids || "");

    // optimistic UI: update local copy of questions so checkbox updates immediately
    setQuestions((prev) => {
      try {
        const list = getRenderList();
        return list.map((qq) => {
          if (
            (qq.general_form_id || qq.general_form || qq.id) ==
            (q.general_form_id || q.general_form || q.id)
          ) {
            return { ...qq, show_on_ticket_pdf: newFlag };
          }
          return qq;
        });
      } catch (err) {
        return prev;
      }
    });

    try {
      const res = await authAPI.removeAddQuestionTicketPdf(fd);
      console.log("removeAddQuestionTicketPdf response:", res);
      // on success refresh questions
      await fetchQuestions();
    } catch (err) {
      console.error("Failed to update ticket pdf flag:", err);
      alert("Failed to update ticket pdf flag. See console.");
      // revert UI
      await fetchQuestions();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, question, groupName, index) => {
    setDraggedItem({ question, groupName, index });
    setDraggedGroup(groupName);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to allow the drag image to be created
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the container entirely
    if (e.currentTarget === e.target) {
      setDraggedOverIndex(null);
    }
  };

  const handleDrop = (e, targetGroupName, targetIndex) => {
    e.preventDefault();

    if (!draggedItem) {
      setDraggedItem(null);
      setDraggedOverIndex(null);
      setDraggedGroup(null);
      return;
    }

    const sourceIndex = draggedItem.index;

    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDraggedOverIndex(null);
      setDraggedGroup(null);
      return;
    }

    console.log('Dropping:', { sourceIndex, targetIndex });

    // Reorder questions in the flat list
    setQuestions((prevQuestions) => {
      console.log('Previous questions state:', prevQuestions);

      // Handle different question state structures
      if (!prevQuestions) return prevQuestions;

      // Get the flattened list to work with
      let flatList = [];
      if (Array.isArray(prevQuestions)) {
        flatList = [...prevQuestions];
      } else if (typeof prevQuestions === 'object') {
        // Flatten the grouped structure
        // IMPORTANT: Use same sorting as getRenderList to ensure indices match
        const sortedKeys = Object.keys(prevQuestions).sort();
        sortedKeys.forEach((key) => {
          const v = prevQuestions[key];
          if (Array.isArray(v)) flatList.push(...v);
        });
      }

      if (flatList.length === 0) return prevQuestions;

      // Reorder the flat list
      const [movedQuestion] = flatList.splice(sourceIndex, 1);
      flatList.splice(targetIndex, 0, movedQuestion);

      console.log('New list after reorder:', flatList);

      // IMPORTANT: Return as flat array to preserve custom order
      // Don't regroup by form_name as that would reset the order
      return flatList;
    });

    setDraggedItem(null);
    setDraggedOverIndex(null);
    setDraggedGroup(null);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDraggedOverIndex(null);
    setDraggedGroup(null);
  };

  return (
    <div
      className="form-questions-section"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      {!showGeneralForm && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{ fontWeight: 700, fontSize: "1.6rem", marginBottom: 0 }}
            >
              Event Form Questions
              <span title="You can sort order for the following question. Just Drag and Drop.">
                <i className="fas fa-info-circle"></i>
              </span>
            </h2>
            <button
              onClick={handleAddQuestions}
              style={{
                border: "1.5px solid #da251c",
                color: "#da251c",
                background: "#fff",
                borderRadius: 6,
                padding: "8px 22px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              + Add Questions
            </button>
          </div>
          <div
            style={{
              color: "#888",
              margin: "8px 0 24px 0",
              fontSize: "1.05rem",
            }}
          >
            You can sort order for the following question. Just Drag and Drop.
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              padding: 0,
              marginTop: 0,
              marginBottom: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: "260px",
              border: "1px solid #eee",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 80,
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #eee",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                right: -20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 80,
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #eee",
              }}
            ></div>
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              {!showGeneralForm ? (
                (() => {
                  const renderList = getRenderList();
                  if (renderList && renderList.length > 0) {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {renderList.map((q, i) => (
                          <div
                            key={getQId(q) || i}
                            style={{
                              border: draggedOverIndex === i && draggedGroup === "all"
                                ? "2px solid #da251c"
                                : "1.5px solid transparent",
                              borderRadius: 12,
                              padding: 12,
                              background: draggedOverIndex === i && draggedGroup === "all"
                                ? "#fff5f5"
                                : "#fff",
                              transition: "all 0.2s ease",
                              boxShadow: "0 2px 8px rgba(218, 37, 28, 0.1)",
                              marginBottom: 8
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.border = "1.5px solid #da251c";
                              e.currentTarget.style.boxShadow = "0 4px 16px rgba(218, 37, 28, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.border = "1.5px solid transparent";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(218, 37, 28, 0.1)";
                            }}
                          >
                            <div
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, q, "all", i)}
                              onDragOver={(e) => handleDragOver(e, i)}
                              onDragEnter={(e) => handleDragEnter(e, i)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, "all", i)}
                              onDragEnd={handleDragEnd}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "grab",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <div
                                  style={{
                                    width: 16,
                                    height: 24,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#666",
                                  }}
                                >
                                  <span style={{ fontSize: 18 }}>⋮⋮</span>
                                </div>
                                <div
                                  style={{
                                    background: "#f0f4f6",
                                    padding: "10px 22px",
                                    borderRadius: 8,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#333",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {q.question_label ||
                                      q.label ||
                                      q.display_label_name ||
                                      "Question"}
                                  </span>
                                  {isMandatory(q) && (
                                    <span
                                      style={{
                                        color: "#d9534f",
                                        marginLeft: 8,
                                        fontWeight: 700,
                                      }}
                                    >
                                      (Mandatory)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    title="Delete"
                                    onClick={() => handleDeleteQuestion(q)}
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 18,
                                      background: "#fff",
                                      border: "1px solid #e74c3c",
                                      color: "#e74c3c",
                                      cursor: "pointer",
                                    }}
                                  >
                                    🗑
                                  </button>
                                  <button
                                    title="Edit"
                                    onClick={() => {
                                      setEditQuestion(q);
                                      setShowGeneralForm(true);
                                    }}
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 18,
                                      background: "#fff",
                                      border: "1px solid #007bff",
                                      color: "#007bff",
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✎
                                  </button>
                                </div>
                                <div>
                                  <label
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleToggleClick(q)}
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" ||
                                        e.key === " "
                                      ) {
                                        handleToggleClick(q);
                                      }
                                    }}
                                    style={{
                                      display: "inline-block",
                                      width: 46,
                                      height: 28,
                                      borderRadius: 18,
                                      background: (() => {
                                        const id = getQId(q);
                                        const serverBool = parseServerBool(
                                          q.question_status // Use question_status
                                        );
                                        const val =
                                          id in localToggleMap
                                            ? localToggleMap[id]
                                            : serverBool; // Direct mapping: true = ON (red)
                                        return val ? "#da251c" : "#fff";
                                      })(),
                                      border: "2px solid #da251c",
                                      position: "relative",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <span
                                      style={{
                                        position: "absolute",
                                        left: (() => {
                                          const id = getQId(q);
                                          const serverBool =
                                            parseServerBool(
                                              q.question_status // Use question_status
                                            );
                                          const val =
                                            id in localToggleMap
                                              ? localToggleMap[id]
                                              : serverBool; // Direct mapping
                                          return val ? 20 : 4;
                                        })(),
                                        top: 3,
                                        width: 20,
                                        height: 20,
                                        background: (() => {
                                          const id = getQId(q);
                                          const serverBool =
                                            parseServerBool(
                                              q.question_status // Use question_status
                                            );
                                          const val =
                                            id in localToggleMap
                                              ? localToggleMap[id]
                                              : serverBool; // Direct mapping
                                          return val ? "#fff" : "#da251c";
                                        })(),
                                        borderRadius: 10,
                                        display: "inline-block",
                                      }}
                                    ></span>
                                  </label>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <label
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      style={{ width: 25, height: 25 }}
                                      type="checkbox"
                                      checked={
                                        q.show_on_ticket_pdf === "1" ||
                                          q.show_on_ticket_pdf === 1 ||
                                          q.show_on_ticket_pdf === true
                                          ? true
                                          : false
                                      }
                                      onChange={(e) =>
                                        handleTicketCheckboxConfirm(
                                          q,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>


                            {/* Subquestions Display */}
                            {
                              q.sub_questions_array && Array.isArray(q.sub_questions_array) && q.sub_questions_array.length > 0 && (
                                <div style={{ marginTop: 12, marginLeft: 40 }}>
                                  {/* Show parent question options */}
                                  {q.question_form_option && Array.isArray(q.question_form_option) && q.question_form_option.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                      {q.question_form_type === 'radio' && (
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                          {q.question_form_option.map((opt, optIdx) => (
                                            <div
                                              key={optIdx}
                                              style={{
                                                border: '1px solid #ddd',
                                                borderRadius: 8,
                                                padding: '12px 24px',
                                                background: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'not-allowed',
                                                opacity: 0.7
                                              }}
                                            >
                                              <span style={{ fontWeight: 500, color: '#333' }}>{opt.label}</span>
                                              <input
                                                type="radio"
                                                disabled
                                                style={{ cursor: 'not-allowed' }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {(q.question_form_type === 'select' || q.question_form_type === 'dropdown') && (
                                        <select
                                          disabled
                                          style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: '0.95rem',
                                            cursor: 'not-allowed',
                                            opacity: 0.7,
                                            background: '#fff'
                                          }}
                                        >
                                          <option>Select {q.question_label}</option>
                                          {q.question_form_option.map((opt, optIdx) => (
                                            <option key={optIdx}>{opt.label}</option>
                                          ))}
                                        </select>
                                      )}
                                    </div>
                                  )}

                                  {/* Show subquestions */}
                                  {q.sub_questions_array.map((subQ, subIdx) => {
                                    // Debug: Log subquestion data to check for child subquestions
                                    console.log(`Subquestion ${subIdx}:`, subQ);
                                    console.log(`  - Has sub_questions?`, subQ.sub_questions);
                                    console.log(`  - Has sub_questions_array?`, subQ.sub_questions_array);
                                    console.log(`  - All keys:`, Object.keys(subQ));

                                    return (
                                      <div key={subIdx}>
                                        <div
                                          style={{
                                            background: "#f8f9fa",
                                            borderLeft: "3px solid #da251c",
                                            borderRadius: 6,
                                            padding: "12px 16px",
                                            marginBottom: 8,
                                            fontSize: "0.95rem",
                                            textAlign: "left",
                                          }} ty6789
                                        >
                                          <span style={{ color: "#333", fontWeight: 600 }}>
                                            {subQ.question_label || subQ.label}
                                          </span>
                                          {(subQ.is_manadatory === 1 || subQ.is_manadatory === "1") && (
                                            <span style={{ color: "#d9534f", marginLeft: 8, fontWeight: 700 }}>
                                              (Mandatory)
                                            </span>
                                          )}
                                        </div>

                                        {/* Child Subquestions Display (Nested) */}
                                        {(subQ.sub_questions || subQ.sub_questions_array) &&
                                          Array.isArray(subQ.sub_questions || subQ.sub_questions_array) &&
                                          (subQ.sub_questions || subQ.sub_questions_array).length > 0 && (
                                            <div style={{ marginLeft: 30, marginTop: 8 }}>
                                              {(subQ.sub_questions || subQ.sub_questions_array).map((childSubQ, childIdx) => (
                                                <div
                                                  key={childIdx}
                                                  style={{
                                                    background: "#e8f5e9",
                                                    borderLeft: "3px solid #4CAF50",
                                                    borderRadius: 6,
                                                    padding: "10px 14px",
                                                    marginBottom: 6,
                                                    fontSize: "0.9rem",
                                                    textAlign: "left",
                                                  }}
                                                >
                                                  <span style={{ color: "#2e7d32", fontWeight: 600, fontSize: "0.85rem" }}>
                                                    🔹 {childSubQ.question_label || childSubQ.label || childSubQ.title}
                                                  </span>
                                                  {(childSubQ.is_manadatory === 1 || childSubQ.is_manadatory === "1" || childSubQ.mandatory === 1) && (
                                                    <span style={{ color: "#d9534f", marginLeft: 8, fontWeight: 700, fontSize: "0.85rem" }}>
                                                      (Mandatory)
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )
                            }
                          </div>
                        ))}
                      </div >
                    );
                  }

                  return (
                    <>
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: "1.4rem",
                          marginBottom: 12,
                        }}
                      >
                        NO QUESTIONS ADDED
                      </h3>
                      <hr
                        style={{
                          margin: "16px 0",
                          border: "none",
                          borderTop: "1px solid #ddd",
                        }}
                      />
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1.15rem",
                          marginBottom: 18,
                        }}
                      >
                        PLEASE CLICK ON ADD " NEW QUESTIONS" BUTTON TO ADD NEW
                        QUESTIONS
                      </div>
                      <button
                        onClick={handleAddQuestions}
                        style={{
                          border: "1.5px solid #da251c",
                          color: "#da251c",
                          background: "#fff",
                          borderRadius: 6,
                          padding: "12px 32px",
                          fontWeight: 600,
                          fontSize: "1.15rem",
                          cursor: "pointer",
                        }}
                      >
                        + NEW QUESTIONS
                      </button>
                    </>
                  );
                })()
              ) : (
                <GeneralFormQuestions
                  onSave={handleSaveQuestions}
                  questions={questions}
                  eventDetails={eventDetails}
                  initialEditQuestion={editQuestion}
                />
              )}
            </div>
          </div>

          {!showGeneralForm && (
            <>
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
                    fontSize: "1.1rem",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  className="next-btn"
                  onClick={onNext}
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 32px",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                  }}
                >
                  Save & Next (6/11)
                </button>
              </div>
            </>
          )}
        </div>
      </div >

      {/* Only show GeneralFormQuestions inside the card above, not here */}
    </div >
  );
};

export default FormQuestions;
