import React, { useState, useEffect } from "react";
import RaceCategoryForm from "./RaceCategoryForm";
import { authAPI } from "../../services/authAPI";

export default function RaceCategories({
  onBack,
  onNext,
  setShowPreview,
  paidType,
  setPaidType,
  eventFormData,
  setEventFormData,
  organizerGST,
  showToast,
  isEditMode,
  isReadOnly,
}) {
  const [gst, setGst] = useState(false);
  const [taxType, setTaxType] = useState("inclusive");
  const [showForm, setShowForm] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [chargesDetails, setChargesDetails] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, []);
  const [editTicket, setEditTicket] = useState(null);
  const [hoveredTicketId, setHoveredTicketId] = useState(null);

  const fetchEventDetails = () => {
    const eventId = sessionStorage.getItem("event_id");
    console.log("Fetching event details for event_id:", eventId);

    if (eventId) {
      authAPI
        .getEventDetails(eventId)
        .then((res) => {
          console.log("Event details API response:", res);

          if (res && res.data) {
            // Set event details from EventData[0]
            if (res.data.EventData && res.data.EventData[0]) {
              const eventData = res.data.EventData[0];
              setEventDetails(eventData);

              // Load GST and Tax Type settings from event data
              if (eventData.collect_gst !== undefined) {
                setGst(eventData.collect_gst === 1);
              }
              if (eventData.prices_taxes_status !== undefined) {
                setTaxType(eventData.prices_taxes_status === 1 ? 'inclusive' : 'exclusive');
              }
            }

            // Capture race_category_charges_details from API
            let apiCharges = res.data.race_category_charges_details;

            // If not in root, check in EventData[0]
            if (!apiCharges && res.data.EventData && res.data.EventData[0]) {
              apiCharges = res.data.EventData[0].race_category_charges_details;
            }

            if (apiCharges && Array.isArray(apiCharges)) {
              console.log("✅ Dynamic charges found:", apiCharges);
              setChargesDetails(apiCharges);
            } else {
              console.log("ℹ️ No dynamic charges found in API response, using defaults.");
            }

            // Store AllEventTypes in sessionStorage as event_categories
            if (
              res.data.AllEventTypes &&
              Array.isArray(res.data.AllEventTypes)
            ) {
              sessionStorage.setItem(
                "event_categories",
                JSON.stringify(res.data.AllEventTypes)
              );
            }

            // Get tickets from EventTickets
            const ticketDetails =
              res.data.EventTickets || res.data.tickets_details;

            if (ticketDetails && ticketDetails.length > 0) {
              console.log("Setting tickets:", ticketDetails);
              setTickets(ticketDetails);
            } else {
              console.log("No tickets found in response");
              setTickets([]);
            }
          } else {
            console.log("Unexpected response structure");
          }
        })
        .catch((error) => {
          console.error("Error fetching event details:", error);
        });
    }
  };

  const handleNewClick = async () => {
    // If there are existing tickets, fetch the last one's details to use as template
    if (tickets && tickets.length > 0) {
      try {
        const lastTicket = tickets[tickets.length - 1];
        const res = await authAPI.getTicketDetail(lastTicket.id);
        if (res && res.data && res.data.Ticket && res.data.Ticket.length > 0) {
          const ticketData = res.data.Ticket[0];
          // Remove ID and clear ticket name so it creates a new ticket
          const template = { ...ticketData };
          delete template.id;
          delete template.ticket_id;
          template.ticket_name = ""; // Clear name for new category
          setEditTicket(template);
        } else {
          setEditTicket(null);
        }
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setEditTicket(null);
      }
    } else {
      setEditTicket(null);
    }
    setShowForm(true);
    if (setShowPreview) setShowPreview(false);
  };

  const handleCancel = () => {
    setEditTicket(null);
    setShowForm(false);
    if (setShowPreview) setShowPreview(true);
  };

  const handleSave = (eventDetailsResponse) => {
    console.log("handleSave called with response:", eventDetailsResponse);

    // Update tickets from event details response
    if (eventDetailsResponse && eventDetailsResponse.data) {
      // Check for EventTickets or tickets_details in data object
      const ticketDetails =
        eventDetailsResponse.data.EventTickets ||
        eventDetailsResponse.data.tickets_details;
      console.log("Ticket details from response:", ticketDetails);

      if (ticketDetails && ticketDetails.length > 0) {
        setTickets(ticketDetails);
        console.log("Tickets updated:", ticketDetails);
      } else {
        console.log("No tickets found, fetching again...");
        // Fallback: fetch event details again
        fetchEventDetails();
      }
    } else {
      console.log("Response structure not as expected, fetching again...");
      // Fallback: fetch event details again
      fetchEventDetails();
    }

    setShowForm(false);
    if (setShowPreview) setShowPreview(true);
  };

  const handleGstChange = (value) => {
    setGst(value);
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return;
    const payload = {
      event_id: eventId,
      collect_gst: value ? 1 : 0,
      prices_taxes_status: taxType === "inclusive" ? 1 : 2,
      event_img_id: 0,
      common_flag: "ticket_gst_taxes_price",
    };
    authAPI.updateEventGstTaxes(payload);
  };

  const handleTaxTypeChange = (type) => {
    setTaxType(type);
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId) return;
    const payload = {
      event_id: eventId,
      collect_gst: gst ? 1 : 0,
      prices_taxes_status: type === "inclusive" ? 1 : 2,
      event_img_id: 0,
      common_flag: "ticket_gst_taxes_price",
    };
    authAPI.updateEventGstTaxes(payload);
  };

  return (
    <div className="event-form-section">
      {showForm ? (
        <RaceCategoryForm
          key={editTicket ? editTicket.id : "new"}
          onCancel={handleCancel}
          onSave={handleSave}
          paidType={paidType}
          setPaidType={setPaidType}
          eventFormData={eventFormData}
          setEventFormData={setEventFormData}
          editTicket={editTicket}
          organizerGST={organizerGST}
          collectGST={gst}
          taxType={taxType}
          apiChargesDetails={chargesDetails}
          isEditMode={isEditMode}
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: "1.6rem", margin: 0 }}>
              Race Category
            </h3>
            {!isReadOnly && (
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
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.border = "2px solid #000";
                  e.currentTarget.querySelector("i").style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#da251c";
                  e.currentTarget.style.border = "2px solid #da251c";
                  e.currentTarget.querySelector("i").style.color = "#da251c";
                }}
                onClick={handleNewClick}
              >
                <i className="fas fa-users" style={{ color: "#da251c", transition: "color 0.3s ease" }}></i> +
                New Race Category
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              marginBottom: 32,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 320px",
                minWidth: 260,
                padding: "24px",
                borderRadius: 12,
                border: "2px solid transparent",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "2px solid #da251c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "2px solid transparent";
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
                Do you want to collect GST on Registration Fee?
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    border: "2px solid #da251c",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: gst ? "#da251c" : "#fff",
                      color: gst ? "#fff" : "#da251c",
                      border: "none",
                      borderRadius: 0,
                      fontWeight: 600,
                      padding: "8px 20px",
                      fontSize: "0.95rem",
                      minWidth: 70,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: isReadOnly ? "default" : "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => !isReadOnly && handleGstChange(true)}
                    disabled={isReadOnly}
                  >
                    <i className="fas fa-check-circle"></i> Yes
                  </button>
                  <button
                    type="button"
                    style={{
                      background: !gst ? "#da251c" : "#fff",
                      color: !gst ? "#fff" : "#da251c",
                      border: "none",
                      borderRadius: 0,
                      fontWeight: 600,
                      padding: "8px 20px",
                      fontSize: "0.95rem",
                      minWidth: 70,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: isReadOnly ? "default" : "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => !isReadOnly && handleGstChange(false)}
                    disabled={isReadOnly}
                  >
                    <i className="fas fa-lock"></i> No
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: "1 1 320px",
                minWidth: 260,
                padding: "18px",
                borderRadius: 12,
                border: "2px solid transparent",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "2px solid #da251c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "2px solid transparent";
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
                The basic registration fee will be :
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    border: "2px solid #da251c",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: taxType === "inclusive" ? "#da251c" : "#fff",
                      color: taxType === "inclusive" ? "#fff" : "#da251c",
                      border: "none",
                      borderRadius: 0,
                      fontWeight: 600,
                      padding: "8px 18px",
                      fontSize: "0.95rem",
                      minWidth: 70,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: isReadOnly ? "default" : "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => !isReadOnly && handleTaxTypeChange("inclusive")}
                    disabled={isReadOnly}
                  >
                    <i className="fas fa-check-circle"></i> Inclusive Taxes
                  </button>
                  <button
                    type="button"
                    style={{
                      background: taxType === "exclusive" ? "#da251c" : "#fff",
                      color: taxType === "exclusive" ? "#fff" : "#da251c",
                      border: "none",
                      borderRadius: 0,
                      fontWeight: 600,
                      padding: "8px 20px",
                      fontSize: "0.95rem",
                      minWidth: 70,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: isReadOnly ? "default" : "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => !isReadOnly && handleTaxTypeChange("exclusive")}
                    disabled={isReadOnly}
                  >
                    <i className="fas fa-lock"></i> Exclusive Taxes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr style={{ margin: "32px 0" }} />

          {/* Race Category Cards */}
          {tickets && tickets.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {tickets.map((ticket, index) => (
                <div
                  key={ticket.id || index}
                  style={{
                    background:
                      "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
                    borderRadius: 16,
                    boxShadow:
                      hoveredTicketId === ticket.id
                        ? "0 8px 20px rgba(0,0,0,0.20)"
                        : "0 2px 8px rgba(0,0,0,0.3)",
                    padding: 0,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredTicketId(ticket.id)}
                  onMouseLeave={() => setHoveredTicketId(null)}
                >
                  {/* Left side with perforation */}
                  <div
                    style={{
                      width: 80,
                      background:
                        "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: "2px dashed rgba(255,255,255,0.5)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        transform: "rotate(-90deg)",
                        whiteSpace: "nowrap",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        letterSpacing: "2px",
                        color: "#2d3436",
                      }}
                    >
                      ENJOY YOUR EVENT
                    </div>
                    {/* Top circle cutout */}
                    <div
                      style={{
                        position: "absolute",
                        top: -15,
                        right: -15,
                        width: 30,
                        height: 30,
                        background: "#fff",
                        borderRadius: "50%",
                      }}
                    />
                    {/* Bottom circle cutout */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -15,
                        right: -15,
                        width: 30,
                        height: 30,
                        background: "#fff",
                        borderRadius: "50%",
                      }}
                    />
                  </div>

                  {/* Main content */}
                  <div
                    style={{
                      flex: 1,
                      padding: "24px 20px",
                      position: "relative",
                    }}
                  >
                    {/* Paid/Free badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background:
                          ticket.ticket_status === 2 ? "#00b894" : "#d63031",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    >
                      {ticket.ticket_status === 2 ? "FREE" : "PAID"}
                    </div>

                    {/* Ticket name */}
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        marginBottom: 8,
                        color:
                          hoveredTicketId === ticket.id ? "#da251c" : "#2d3436",
                        marginTop: 24,
                        textTransform: "uppercase",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {ticket.ticket_name || "N/A"}
                    </h3>

                    {/* Registration and Price */}
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: 16,
                        color: "#2d3436",
                      }}
                    >
                      {ticket.total_quantity || 0} REGISTRATIONS
                      {ticket.ticket_status !== 2 && ticket.ticket_price && (
                        <span> | ₹{ticket.ticket_price}</span>
                      )}
                    </div>

                    {/* Dates */}
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#2d3436",
                        lineHeight: 1.8,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        START DATE:{ticket.ticket_sale_start_date || "N/A"}
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        END DATE:{ticket.ticket_sale_end_date || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Right side icons */}
                  {!isReadOnly && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: 68,
                        background: "rgba(255,255,255,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 24,
                        borderLeft: "1px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 8,
                        }}
                        onClick={async () => {
                          try {
                            const res = await authAPI.getTicketDetail(ticket.id);
                            if (
                              res &&
                              res.data &&
                              res.data.Ticket &&
                              res.data.Ticket.length > 0
                            ) {
                              setEditTicket(res.data.Ticket[0]);
                              // Set paidType based on ticket_status: 2 = Free, else Paid
                              if (setPaidType) {
                                setPaidType(
                                  res.data.Ticket[0].ticket_status === 2
                                    ? "Free"
                                    : "Paid"
                                );
                              }
                              setShowForm(true);
                              if (setShowPreview) setShowPreview(false);
                            } else {
                              showToast && showToast("No ticket data found", 'error');
                            }
                          } catch (err) {
                            showToast && showToast("Failed to fetch ticket details", 'error');
                          }
                        }}
                      >
                        <i
                          className="fas fa-edit"
                          style={{ fontSize: "1.2rem", color: "#2d3436" }}
                        ></i>
                      </button>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 8,
                        }}
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this ticket?"
                            )
                          ) {
                            try {
                              const formData = new FormData();
                              formData.append("ticket_id", ticket.id.toString());
                              await authAPI.deleteEventTicket(formData);
                              setTickets((prev) =>
                                prev.filter((t) => t.id !== ticket.id)
                              );
                              fetchEventDetails(); // Sync with backend
                            } catch (err) {
                              showToast && showToast("Failed to delete ticket", 'error');
                            }
                          }
                        }}
                      >
                        <i
                          className="fas fa-trash"
                          style={{ fontSize: "1.2rem", color: "#2d3436" }}
                        ></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: hoveredTicketId === "empty-state"
                  ? "0 8px 20px rgba(0,0,0,0.20)"
                  : "0 2px 8px rgba(0,0,0,0.3)",
                padding: "48px 32px",
                marginBottom: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid #e0e0e0",
                position: "relative",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={() => setHoveredTicketId("empty-state")}
              onMouseLeave={() => setHoveredTicketId(null)}
            >
              {/* Left side cutout */}
              <div
                style={{
                  position: "absolute",
                  left: -15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  background: "#f5f5f5",
                  borderRadius: "50%",
                }}
              />
              {/* Right side cutout */}
              <div
                style={{
                  position: "absolute",
                  right: -15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  background: "#f5f5f5",
                  borderRadius: "50%",
                }}
              />

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  marginBottom: 12,
                  color: hoveredTicketId === "empty-state" ? "#da251c" : "#000",
                  transition: "color 0.3s ease",
                  textAlign: "center",
                }}
              >
                NO RACE CATEGORIES ADDED
              </div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: "1rem",
                  marginBottom: 24,
                  color: "#666",
                  textAlign: "center",
                  maxWidth: "600px",
                }}
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
                  padding: "10px 28px",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.border = "2px solid #000";
                  e.currentTarget.querySelector("i").style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#da251c";
                  e.currentTarget.style.border = "2px solid #da251c";
                  e.currentTarget.querySelector("i").style.color = "#da251c";
                }}
                onClick={handleNewClick}
              >
                <i className="fas fa-users" style={{ color: "#da251c", transition: "color 0.3s ease" }}></i>
                +NEW RACE CATEGORY
              </button>
            </div>
          )}
          {!isReadOnly && (
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
          )}
        </>
      )
      }
    </div >
  );
}
