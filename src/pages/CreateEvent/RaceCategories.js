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
}) {
  const [gst, setGst] = useState(false);
  const [taxType, setTaxType] = useState("inclusive");
  const [showForm, setShowForm] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, []);
  const [editTicket, setEditTicket] = useState(null);

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
              setEventDetails(res.data.EventData[0]);
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

  const handleNewClick = () => {
    setShowForm(true);
    if (setShowPreview) setShowPreview(false);
  };

  const handleCancel = () => {
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
        />
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
          <div
            style={{
              display: "flex",
              gap: 24,
              marginBottom: 32,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 320px", minWidth: 260 }}>
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
                  onClick={() => handleGstChange(true)}
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
                  onClick={() => handleGstChange(false)}
                >
                  No
                </button>
              </div>
            </div>

            <div style={{ flex: "1 1 320px", minWidth: 260 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                The basic registration fee will be :
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  style={{
                    background: taxType === "inclusive" ? "#da251c" : "#fff",
                    color: taxType === "inclusive" ? "#fff" : "#da251c",
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
                  onClick={() => handleTaxTypeChange("inclusive")}
                >
                  Inclusive
                </button>
                <button
                  type="button"
                  style={{
                    background: taxType === "exclusive" ? "#da251c" : "#fff",
                    color: taxType === "exclusive" ? "#fff" : "#da251c",
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
                  onClick={() => handleTaxTypeChange("exclusive")}
                >
                  Exclusive
                </button>
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
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: 0,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                  }}
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
                        color: "#2d3436",
                        marginTop: 24,
                        textTransform: "uppercase",
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
                            alert("No ticket data found");
                          }
                        } catch (err) {
                          alert("Failed to fetch ticket details");
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
                            alert("Failed to delete ticket");
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
                </div>
              ))}
            </div>
          ) : (
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
                style={{
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  marginBottom: 18,
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
                  padding: "8px 24px",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={handleNewClick}
              >
                <i className="fas fa-users" style={{ color: "#da251c" }}></i>{" "}
                +NEW RACE CATEGORY
              </button>
            </div>
          )}
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
