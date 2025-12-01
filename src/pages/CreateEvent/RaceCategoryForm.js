import React, { useState, useEffect } from "react";
import axios from "axios";
import { authAPI } from "../../services/authAPI";

// Get today's date in yyyy-mm-dd format
const todayDate = new Date().toISOString().split("T")[0];
import "./CreateEvent.css";

const RaceCategoryForm = ({
  onCancel,
  onSave,
  paidType,
  setPaidType,
  eventFormData,
  setEventFormData,
  editTicket,
}) => {
  const [loading, setLoading] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);

  // Read initial categories from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("event_categories");
      if (stored) setEventCategories(JSON.parse(stored));
    } catch (e) {
      setEventCategories([]);
    }

    const onPrefill = () => {
      try {
        const stored = sessionStorage.getItem("event_categories");
        if (stored) setEventCategories(JSON.parse(stored));
      } catch (e) {
        setEventCategories([]);
      }
    };
    window.addEventListener("createEventPrefillDone", onPrefill);
    return () =>
      window.removeEventListener("createEventPrefillDone", onPrefill);
  }, []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applyAgeLimit, setApplyAgeLimit] = useState(false);
  const [earlyBird, setEarlyBird] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ticketName: editTicket?.ticket_name || "",
    category: editTicket?.category || "",
    maxRegistration: editTicket?.total_quantity || "",
    raceCategoryPrice: editTicket?.ticket_price || "",
    minBooking: editTicket?.min_booking || "",
    maxBooking: editTicket?.max_booking || "",
    registrationStartDate: editTicket?.ticket_start_date || "",
    registrationStartTime: editTicket?.ticket_start_time || "",
    registrationEndDate: editTicket?.ticket_end_date || "",
    registrationEndTime: editTicket?.ticket_end_time || "",
    convenienceFeePlayer:
      editTicket?.player_of_fee === 2 ? "Participant" : "Organiser",
    gatewayFeePlayer:
      editTicket?.player_of_gateway_fee === 2 ? "Participant" : "Organiser",
    description: editTicket?.ticket_description || "",
    messageAttendee: editTicket?.msg_attendance || "",
    ageStart: editTicket?.age_start || "",
    ageEnd: editTicket?.age_end || "",
    // Early bird fields
    noOfTickets: editTicket?.no_of_tickets || "",
    discountType:
      editTicket?.discount === 1
        ? "Percentage"
        : editTicket?.discount === 2
        ? "Flat"
        : "Percentage",
    discountValue: editTicket?.discount_value || "",
    ebStartDate: editTicket?.eb_start_date || "",
    ebStartTime: editTicket?.eb_start_time || "",
    ebEndDate: editTicket?.eb_end_date || "",
    ebEndTime: editTicket?.eb_end_time || "",
  });

  // Update form fields when editTicket changes
  React.useEffect(() => {
    if (editTicket) {
      setFormData({
        ticketName: editTicket.ticket_name ?? "",
        category: editTicket.category ?? "",
        maxRegistration: editTicket.total_quantity ?? "",
        raceCategoryPrice: editTicket.ticket_price ?? "",
        minBooking: editTicket.min_booking ?? "",
        maxBooking: editTicket.max_booking ?? "",
        registrationStartDate: editTicket.ticket_start_date ?? "",
        registrationStartTime: editTicket.ticket_start_time ?? "",
        registrationEndDate: editTicket.ticket_end_date ?? "",
        registrationEndTime: editTicket.ticket_end_time ?? "",
        convenienceFeePlayer:
          editTicket.player_of_fee === 2 ? "Participant" : "Organiser",
        gatewayFeePlayer:
          editTicket.player_of_gateway_fee === 2 ? "Participant" : "Organiser",
        description: editTicket.ticket_description ?? "",
        messageAttendee: editTicket.msg_attendance ?? "",
        ageStart: editTicket.age_start ?? "",
        ageEnd: editTicket.age_end ?? "",
        // Early bird fields
        noOfTickets: editTicket.no_of_tickets ?? "",
        discountType:
          editTicket.discount === 1
            ? "Percentage"
            : editTicket.discount === 2
            ? "Flat"
            : "Percentage",
        discountValue: editTicket.discount_value ?? "",
        ebStartDate: editTicket.eb_start_date ?? "",
        ebStartTime: editTicket.eb_start_time ?? "",
        ebEndDate: editTicket.eb_end_date ?? "",
        ebEndTime: editTicket.eb_end_time ?? "",
      });
      setShowAdvanced(editTicket.advanced_settings === 1);
      setEarlyBird(editTicket.early_bird === 1);
      setApplyAgeLimit(editTicket.apply_age_limit === 1);
      // Ensure correct section is shown based on paidType
      if (setPaidType) {
        setPaidType(editTicket.ticket_status === 2 ? "Free" : "Paid");
      }
    }
  }, [editTicket]);

  // Helper to check if paidType is Free
  const isFree = paidType === "Free";

  // Example ticketCalculation object (replace with your calculation logic)
  const ticketCalculation = eventFormData.ticketCalculation || {};

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventId = sessionStorage.getItem("event_id");
      const createdBy =
        localStorage.getItem("user_id") || sessionStorage.getItem("user_id");

      if (!eventId) {
        alert("Event ID not found. Please save event essentials first.");
        setLoading(false);
        return;
      }

      // Prepare ticket calculation details from eventFormData
      const ticketCalcDetails = eventFormData.ticketCalculation || {};

      // Build the payload according to API requirements
      const payload = {
        event_id: eventId,
        ticket_id: editTicket?.id || 0, // Use ticket id for edit, 0 for new
        ticket_status: paidType === "Free" ? 2 : 1,
        ticket_name: formData.ticketName,
        category: formData.category,
        total_quantity: formData.maxRegistration,
        ticket_price: isFree ? "" : formData.raceCategoryPrice || 0,
        start_date: formData.registrationStartDate,
        start_time: formData.registrationStartTime,
        end_date: formData.registrationEndDate,
        end_time: formData.registrationEndTime,
        advanced_settings: showAdvanced ? 1 : 0,
        player_of_fee: formData.convenienceFeePlayer === "Participant" ? 2 : 1,
        player_of_gateway_fee:
          formData.gatewayFeePlayer === "Participant" ? 2 : 1,
        min_booking: formData.minBooking || 0,
        max_booking: formData.maxBooking || 0,
        ticket_description: formData.description || "",
        msg_attendance: formData.messageAttendee || "",
        minimum_donation_amount: 0,
        created_by: createdBy,
        early_bird: earlyBird ? 1 : 0,
        no_of_tickets: earlyBird ? formData.noOfTickets : 0,
        eb_start_date: earlyBird ? formData.ebStartDate : "",
        eb_start_time: earlyBird ? formData.ebStartTime : "",
        eb_end_date: earlyBird ? formData.ebEndDate : "",
        eb_end_time: earlyBird ? formData.ebEndTime : "",
        discount: earlyBird
          ? formData.discountType === "Percentage"
            ? 1
            : 2
          : 0,
        discount_value: earlyBird ? formData.discountValue : 0,
        apply_age_limit: applyAgeLimit ? 1 : 0,
        age_start: applyAgeLimit ? formData.ageStart : 0,
        age_end: applyAgeLimit ? formData.ageEnd : 0,
        // Ticket calculation details
        "ticket_calculation_details[ticket_price]":
          formData.raceCategoryPrice || 0,
        "ticket_calculation_details[payment_gateway_fees]":
          ticketCalcDetails.paymentGatewayFee || 1.85,
        "ticket_calculation_details[convenience_fees_gst_percentage]": 18,
        "ticket_calculation_details[gst_on_platform_fees]": 18,
        "ticket_calculation_details[payment_gateway_gst]": 18,
        "ticket_calculation_details[collect_gst]": 1,
        "ticket_calculation_details[including_excluding gst]": 2,
        "ticket_calculation_details[basic_amount]":
          ticketCalcDetails.baseAmount || formData.raceCategoryPrice || 0,
        "ticket_calculation_details[registration_18_percent_GST]":
          ticketCalcDetails.registrationGST || 0,
        "ticket_calculation_details[registration_amount]":
          ticketCalcDetails.registrationAmount ||
          formData.raceCategoryPrice ||
          0,
        "ticket_calculation_details[convenience_fee_base]":
          ticketCalcDetails.convenienceFeeBase || 40,
        "ticket_calculation_details[convenience_fee_amount]":
          ticketCalcDetails.convenienceFee || 40,
        "ticket_calculation_details[18_percent_GST_convenience_fees]":
          ticketCalcDetails.convenienceFeeGST || 0,
        "ticket_calculation_details[total_convenience_fees]":
          ticketCalcDetails.totalConvenienceFees || 0,
        "ticket_calculation_details[platform_fees_5_each]":
          ticketCalcDetails.platformFee || 5,
        "ticket_calculation_details[18_percent_GST_platform_fees]":
          ticketCalcDetails.platformFeeGST || 0,
        "ticket_calculation_details[total_platform_fees]":
          ticketCalcDetails.totalPlatformFees || 0,
        "ticket_calculation_details[net_registration_amount]":
          ticketCalcDetails.netRegistrationAmount || 0,
        "ticket_calculation_details[payment_gateway_1.85_buyer]":
          ticketCalcDetails.paymentGatewayBuyer || 0,
        "ticket_calculation_details[18_per_payment_gateway_GST]":
          ticketCalcDetails.paymentGatewayGST || 0,
        "ticket_calculation_details[total_PG]": ticketCalcDetails.totalPG || 0,
        "ticket_calculation_details[total_buyer]":
          ticketCalcDetails.totalPayable || 0,
        "ticket_calculation_details[to_organiser]":
          ticketCalcDetails.receivableAmount || formData.raceCategoryPrice || 0,
      };

      // Call the API
      const response = await authAPI.addEditEventTicket(payload);

      if (response && response.message) {
        alert(response.message);

        // Fetch updated event details
        const eventDetailsResponse = await authAPI.getEventDetails(eventId);

        if (onSave && typeof onSave === "function") {
          onSave(eventDetailsResponse);
        }
      }
    } catch (error) {
      console.error("Error saving race category:", error);
      alert(error.message || "Failed to save race category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "32px", width: "100%" }}>
      {/* Left Form Section */}
      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
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
              Race Category Name <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Race Category Name *"
              required
              value={formData.ticketName}
              onChange={(e) => handleChange("ticketName", e.target.value)}
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
              Category <span className="required">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleChange("category", Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            >
              <option value="">-- Select Category --</option>
              {eventCategories.length > 0
                ? eventCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                : null}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Maximum Registration <span className="required">*</span>
            </label>
            <input
              type="number"
              placeholder="Maximum Registration *"
              required
              value={formData.maxRegistration}
              onChange={(e) => handleChange("maxRegistration", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            {/* Hide Race Category Price input if Free */}
            {!isFree && (
              <>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Race Category Price <span className="required">*</span>
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
                  value={
                    formData.raceCategoryPrice ||
                    eventFormData.raceCategoryPrice ||
                    ""
                  }
                  onChange={(e) => {
                    const price = Number(e.target.value) || 0;
                    handleChange("raceCategoryPrice", e.target.value);

                    // Calculate all fees and update eventFormData
                    // Convenience fee: 2% of price capped at ₹40
                    const convenienceFee =
                      price > 0 ? Math.min(0.02 * price, 40) : 0;
                    const platformFee = price > 0 ? 5 : 0;
                    const paymentGatewayFeeRaw = price > 0 ? 0.0185 * price : 0;
                    const paymentGatewayFee =
                      price > 0
                        ? Math.round(paymentGatewayFeeRaw * 20) / 20
                        : 0;
                    const convenienceFeeGST =
                      price > 0
                        ? Math.round(convenienceFee * 0.18 * 100) / 100
                        : 0;
                    const platformFeeGST =
                      price > 0
                        ? Math.round(platformFee * 0.18 * 100) / 100
                        : 0;
                    const paymentGatewayGST =
                      price > 0
                        ? Math.round(paymentGatewayFee * 0.18 * 100) / 100
                        : 0;
                    // Registration GST: 18% of base registration fee
                    const registrationGST =
                      price > 0 ? Math.round(price * 0.18 * 100) / 100 : 0;

                    const totalPayable =
                      price +
                      convenienceFee +
                      platformFee +
                      paymentGatewayFee +
                      convenienceFeeGST +
                      platformFeeGST +
                      paymentGatewayGST +
                      registrationGST;

                    setEventFormData({
                      ...eventFormData,
                      raceCategoryPrice: e.target.value,
                      ticketCalculation: {
                        baseAmount: price,
                        convenienceFeeBase: convenienceFee,
                        convenienceFee: convenienceFee,
                        convenienceFeeGST: convenienceFeeGST,
                        totalConvenienceFees:
                          convenienceFee + convenienceFeeGST,
                        platformFee: platformFee,
                        platformFeeGST: platformFeeGST,
                        totalPlatformFees: platformFee + platformFeeGST,
                        paymentGatewayFee: 1.85,
                        paymentGatewayBuyer: paymentGatewayFee,
                        paymentGatewayGST: paymentGatewayGST,
                        totalPG: paymentGatewayFee + paymentGatewayGST,
                        registrationAmount: price,
                        registrationGST: registrationGST,
                        netRegistrationAmount:
                          price + convenienceFee + convenienceFeeGST,
                        totalPayable: totalPayable,
                        receivableAmount: price,
                      },
                    });
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Minimum per booking count <span className="required">*</span>
            </label>
            <input
              type="number"
              placeholder="Minimum per booking count *"
              required
              value={formData.minBooking}
              onChange={(e) => handleChange("minBooking", e.target.value)}
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
              Allow registrations upto <span className="required">*</span>
            </label>
            <input
              type="number"
              placeholder="Allow registrations upto *"
              required
              value={formData.maxBooking}
              onChange={(e) => handleChange("maxBooking", e.target.value)}
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
              Registration Starts From <span className="required">*</span>
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              required
              min={todayDate}
              value={formData.registrationStartDate}
              onChange={(e) =>
                handleChange("registrationStartDate", e.target.value)
              }
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
              Start Time <span className="required">*</span>
            </label>
            <input
              type="time"
              placeholder="--:--"
              required
              value={formData.registrationStartTime}
              onChange={(e) =>
                handleChange("registrationStartTime", e.target.value)
              }
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
              Registration Ends on <span className="required">*</span>
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              required
              min={formData.registrationStartDate || todayDate}
              value={formData.registrationEndDate}
              onChange={(e) =>
                handleChange("registrationEndDate", e.target.value)
              }
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
              End Time <span className="required">*</span>
            </label>
            <input
              type="time"
              placeholder="--:--"
              required
              value={formData.registrationEndTime}
              min={
                formData.registrationEndDate === formData.registrationStartDate
                  ? formData.registrationStartTime || undefined
                  : undefined
              }
              onChange={(e) =>
                handleChange("registrationEndTime", e.target.value)
              }
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
            display: isFree ? "none" : "flex",
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

        {/* Hide advanced settings if Free */}
        {showAdvanced && !isFree && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Who will pay Convenience Fee{" "}
                  <span className="required">*</span>
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  value={formData.convenienceFeePlayer}
                  onChange={(e) =>
                    handleChange("convenienceFeePlayer", e.target.value)
                  }
                >
                  <option value="Organiser">Organiser</option>
                  <option value="Participant">Participant</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Who will pay Payment Gateway fee{" "}
                  <span className="required">*</span>
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  value={formData.gatewayFeePlayer}
                  onChange={(e) =>
                    handleChange("gatewayFeePlayer", e.target.value)
                  }
                >
                  <option value="Organiser">Organiser</option>
                  <option value="Participant">Participant</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Description <span className="required">*</span>
                </label>
                <textarea
                  placeholder="Description *"
                  required
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
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
                  value={formData.messageAttendee}
                  onChange={(e) =>
                    handleChange("messageAttendee", e.target.value)
                  }
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
                  Age Start <span className="required">*</span>
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  value={formData.ageStart || ""}
                  onChange={(e) => handleChange("ageStart", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {[...Array(110)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Age End <span className="required">*</span>
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  value={formData.ageEnd || ""}
                  onChange={(e) => handleChange("ageEnd", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {[...Array(110)].map((_, i) =>
                    !formData.ageStart || i + 1 >= formData.ageStart ? (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </div>
          )}
          <div
            style={{
              display: isFree ? "none" : "flex",
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
          {/* Hide Early bird settings if Free */}
          {earlyBird && !isFree && (
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
                    No of Registrations Limit{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="No of Registrations Limit *"
                    required
                    value={formData.noOfTickets}
                    onChange={(e) =>
                      handleChange("noOfTickets", e.target.value)
                    }
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
                    value={formData.discountType}
                    onChange={(e) =>
                      handleChange("discountType", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Amount">Amount</option>
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
                    Discount Value <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Discount Value *"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      handleChange("discountValue", e.target.value)
                    }
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
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    placeholder="dd-mm-yyyy"
                    required
                    min={todayDate}
                    value={formData.ebStartDate}
                    onChange={(e) =>
                      handleChange("ebStartDate", e.target.value)
                    }
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
                    Start Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    placeholder="--:--"
                    required
                    value={formData.ebStartTime}
                    onChange={(e) =>
                      handleChange("ebStartTime", e.target.value)
                    }
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
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    placeholder="dd-mm-yyyy"
                    required
                    min={formData.ebStartDate || todayDate}
                    value={formData.ebEndDate}
                    onChange={(e) => handleChange("ebEndDate", e.target.value)}
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
                    End Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    placeholder="--:--"
                    required
                    value={formData.ebEndTime}
                    min={
                      formData.ebEndDate === formData.ebStartDate
                        ? formData.ebStartTime || undefined
                        : undefined
                    }
                    onChange={(e) => handleChange("ebEndTime", e.target.value)}
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
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#da251c",
              color: "#fff",
              border: "none",
              padding: "10px 32px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaceCategoryForm;
