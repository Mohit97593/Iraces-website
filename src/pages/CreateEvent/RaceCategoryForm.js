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
  organizerGST,
  collectGST,
  taxType,
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
          ? "Amount"
          : "Percentage",
    discountValue: editTicket?.discount_value || "",
    ebStartDate: editTicket?.eb_start_date || "",
    ebStartTime: editTicket?.eb_start_time || "",
    ebEndDate: editTicket?.eb_end_date || "",
    ebEndTime: editTicket?.eb_end_time || "",
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Update form fields when editTicket changes
  React.useEffect(() => {
    if (editTicket) {
      const updatedFormData = {
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
              ? "Amount"
              : "Percentage",
        discountValue: editTicket.discount_value ?? "",
        ebStartDate: editTicket.eb_start_date ?? "",
        ebStartTime: editTicket.eb_start_time ?? "",
        ebEndDate: editTicket.eb_end_date ?? "",
        ebEndTime: editTicket.eb_end_time ?? "",
      };

      setFormData(updatedFormData);
      setShowAdvanced(editTicket.advanced_settings === 1);
      setEarlyBird(editTicket.early_bird === 1);
      setApplyAgeLimit(editTicket.apply_age_limit === 1);

      // Ensure correct section is shown based on paidType
      if (setPaidType) {
        setPaidType(editTicket.ticket_status === 2 ? "Free" : "Paid");
      }

      // Calculate and update eventFormData with edited ticket's price
      const price = Number(editTicket.ticket_price) || 0;
      if (price > 0) {
        // Calculate amount for convenience fee calculation
        // Add GST only if: organizerGST=true AND collectGST=true AND taxType='exclusive'
        const amountForConvenienceFee = (organizerGST && collectGST && taxType === 'exclusive')
          ? price + (price * 0.18)
          : price;

        // Tiered convenience fee: 0-1000 = 2%, 1001-1400 = ₹30, 1401+ = ₹40
        let convenienceFee;
        if (amountForConvenienceFee <= 1000) {
          convenienceFee = 0.02 * amountForConvenienceFee;
        } else if (amountForConvenienceFee <= 1400) {
          convenienceFee = 30;
        } else {
          convenienceFee = 40;
        }
        const platformFee = 5;
        const convenienceFeeGST = Math.round(convenienceFee * 0.18 * 100) / 100;
        const platformFeeGST = Math.round(platformFee * 0.18 * 100) / 100;
        // Registration GST: Show line if collectGST=Yes AND taxType=Exclusive
        // Amount: ₹0 if organizerGST=false, otherwise 18%
        const registrationGST = (collectGST && taxType === 'exclusive')
          ? (organizerGST ? Math.round(price * 0.18 * 100) / 100 : 0)
          : 0;

        // Registration amount includes GST if exclusive
        const registrationAmount = price + registrationGST;

        // Payment gateway fee calculated on registration amount (not base price)
        const paymentGatewayFeeRaw = registrationAmount > 0 ? 0.0185 * registrationAmount : 0;
        const paymentGatewayFee = registrationAmount > 0 ? Math.round(paymentGatewayFeeRaw * 100) / 100 : 0;
        const paymentGatewayGST = Math.round(paymentGatewayFee * 0.18 * 100) / 100;

        // Start with all fees included
        let totalPayable =
          price +
          convenienceFee +
          platformFee +
          paymentGatewayFee +
          convenienceFeeGST +
          platformFeeGST +
          paymentGatewayGST +
          registrationGST;

        // Subtract convenience fees if Organiser pays them
        if (updatedFormData.convenienceFeePlayer === "Organiser") {
          totalPayable -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
        }

        // Subtract gateway fees if Organiser pays them
        if (updatedFormData.gatewayFeePlayer === "Organiser") {
          totalPayable -= (paymentGatewayFee + paymentGatewayGST);
        }

        // Calculate receivable amount - start with registration amount (includes GST)
        let receivableAmount = registrationAmount;

        if (updatedFormData.convenienceFeePlayer === "Organiser") {
          receivableAmount -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
        }

        if (updatedFormData.gatewayFeePlayer === "Organiser") {
          receivableAmount -= (paymentGatewayFee + paymentGatewayGST);
        }

        setEventFormData({
          ...eventFormData,
          raceCategoryPrice: editTicket.ticket_price,
          ticketCalculation: {
            baseAmount: price,
            // Store the base rate/amount, not the calculated fee
            convenienceFeeBase: amountForConvenienceFee <= 1000 ? 2 : (amountForConvenienceFee <= 1400 ? 30 : 40),
            convenienceFee: convenienceFee,
            convenienceFeeGST: convenienceFeeGST,
            totalConvenienceFees: convenienceFee + convenienceFeeGST,
            platformFee: platformFee,
            platformFeeGST: platformFeeGST,
            totalPlatformFees: platformFee + platformFeeGST,
            paymentGatewayFee: 1.85,
            paymentGatewayBuyer: paymentGatewayFee,
            paymentGatewayGST: paymentGatewayGST,
            registrationAmount: registrationAmount,  // price + registrationGST
            registrationGST: registrationGST,
            netRegistrationAmount: registrationAmount + convenienceFee + convenienceFeeGST + platformFee + platformFeeGST,
            totalPayable: totalPayable,
            receivableAmount: receivableAmount,
            totalPG: totalPayable,  // Real website stores total_buyer here
            convenienceFeePlayer: updatedFormData.convenienceFeePlayer,
            gatewayFeePlayer: updatedFormData.gatewayFeePlayer,
            collectGST: collectGST,
            taxType: taxType
          },
        });
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

  // Helper function to recalculate fees when fee payer changes
  const recalculateFees = (updatedFormData) => {
    const price = Number(updatedFormData.raceCategoryPrice || eventFormData.raceCategoryPrice) || 0;

    if (price <= 0) return;

    // Calculate amount for convenience fee calculation
    // Add GST only if: organizerGST=true AND collectGST=true AND taxType='exclusive'
    const amountForConvenienceFee = (organizerGST && collectGST && taxType === 'exclusive')
      ? price + (price * 0.18)
      : price;

    // Calculate all fees
    // Tiered convenience fee: 0-1000 = 2%, 1001-1400 = ₹30, 1401+ = ₹40
    let convenienceFee = 0;
    if (amountForConvenienceFee > 0) {
      if (amountForConvenienceFee <= 1000) {
        convenienceFee = 0.02 * amountForConvenienceFee;
      } else if (amountForConvenienceFee <= 1400) {
        convenienceFee = 30;
      } else {
        convenienceFee = 40;
      }
    }
    const platformFee = price > 0 ? 5 : 0;
    const convenienceFeeGST = price > 0 ? Math.round(convenienceFee * 0.18 * 100) / 100 : 0;
    const platformFeeGST = price > 0 ? Math.round(platformFee * 0.18 * 100) / 100 : 0;
    // Registration GST: Show line if collectGST=Yes AND taxType=Exclusive
    // Amount: ₹0 if organizerGST=false, otherwise 18%
    const registrationGST = (collectGST && taxType === 'exclusive' && price > 0)
      ? (organizerGST ? Math.round(price * 0.18 * 100) / 100 : 0)
      : 0;

    // Registration amount includes GST if exclusive
    const registrationAmount = price + registrationGST;

    // Payment gateway fee calculated on registration amount (not base price)
    const paymentGatewayFeeRaw = registrationAmount > 0 ? 0.0185 * registrationAmount : 0;
    const paymentGatewayFee = registrationAmount > 0 ? Math.round(paymentGatewayFeeRaw * 100) / 100 : 0;
    const paymentGatewayGST = price > 0 ? Math.round(paymentGatewayFee * 0.18 * 100) / 100 : 0;

    // Start with all fees included
    let totalPayable =
      price +
      convenienceFee +
      platformFee +
      paymentGatewayFee +
      convenienceFeeGST +
      platformFeeGST +
      paymentGatewayGST +
      registrationGST;

    // Subtract convenience fees if Organiser pays them
    if (updatedFormData.convenienceFeePlayer === "Organiser") {
      totalPayable -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
    }

    // Subtract gateway fees if Organiser pays them
    if (updatedFormData.gatewayFeePlayer === "Organiser") {
      totalPayable -= (paymentGatewayFee + paymentGatewayGST);
    }

    // Calculate receivable amount - start with registration amount (includes GST)
    let receivableAmount = registrationAmount;

    // Deduct convenience fee + platform fee if organiser pays convenience fee
    if (updatedFormData.convenienceFeePlayer === "Organiser") {
      receivableAmount -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
    }

    // Deduct gateway fee if organiser pays gateway fee
    if (updatedFormData.gatewayFeePlayer === "Organiser") {
      receivableAmount -= (paymentGatewayFee + paymentGatewayGST);
    }

    setEventFormData({
      ...eventFormData,
      raceCategoryPrice: price,
      ticketCalculation: {
        baseAmount: price,
        // Store the base rate/amount, not the calculated fee
        convenienceFeeBase: amountForConvenienceFee <= 1000 ? 2 : (amountForConvenienceFee <= 1400 ? 30 : 40),
        convenienceFee: convenienceFee,
        convenienceFeeGST: convenienceFeeGST,
        totalConvenienceFees: convenienceFee + convenienceFeeGST,
        platformFee: platformFee,
        platformFeeGST: platformFeeGST,
        totalPlatformFees: platformFee + platformFeeGST,
        paymentGatewayFee: 1.85,
        paymentGatewayBuyer: paymentGatewayFee,
        paymentGatewayGST: paymentGatewayGST,
        registrationAmount: registrationAmount,  // price + registrationGST
        registrationGST: registrationGST,
        netRegistrationAmount: registrationAmount + convenienceFee + convenienceFeeGST + platformFee + platformFeeGST,
        totalPayable: totalPayable,
        receivableAmount: receivableAmount,
        totalPG: totalPayable,  // Real website stores total_buyer here
        convenienceFeePlayer: updatedFormData.convenienceFeePlayer,
        gatewayFeePlayer: updatedFormData.gatewayFeePlayer,
        collectGST: collectGST,
        taxType: taxType,
      },
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};

    if (!formData.ticketName || formData.ticketName.trim() === "") {
      newErrors.ticketName = "Ticket name is required";
    }

    if (!formData.category || formData.category === "" || formData.category === 0) {
      newErrors.category = "Category is required";
    }

    if (!formData.maxRegistration || formData.maxRegistration <= 0) {
      newErrors.maxRegistration = "Max registration is required and must be greater than 0";
    }

    if (paidType !== "Free" && (!formData.raceCategoryPrice || formData.raceCategoryPrice <= 0)) {
      newErrors.raceCategoryPrice = "Price is required and must be greater than 0";
    }

    // Validate minBooking
    if (!formData.minBooking || formData.minBooking <= 0) {
      newErrors.minBooking = "Minimum per booking count must be greater than 0";
    } else if (Number(formData.minBooking) > Number(formData.maxRegistration)) {
      newErrors.minBooking = "Minimum per booking count cannot exceed Maximum Registration";
    }

    // Validate maxBooking
    if (!formData.maxBooking || formData.maxBooking <= 0) {
      newErrors.maxBooking = "Allow registrations upto must be greater than 0";
    } else if (Number(formData.maxBooking) > Number(formData.maxRegistration)) {
      newErrors.maxBooking = "Allow registrations upto cannot exceed Maximum Registration";
    }

    if (!formData.registrationStartDate) {
      newErrors.registrationStartDate = "Start date is required";
    }

    if (!formData.registrationStartTime) {
      newErrors.registrationStartTime = "Start time is required";
    }

    if (!formData.registrationEndDate) {
      newErrors.registrationEndDate = "End date is required";
    }

    if (!formData.registrationEndTime) {
      newErrors.registrationEndTime = "End time is required";
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
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
              value={formData.ticketName}
              onChange={(e) => handleChange("ticketName", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.ticketName ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.ticketName && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.ticketName}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Category <span className="required">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.category ? "1px solid #d63031" : "1px solid #ddd",
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
            {errors.category && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.category}
              </div>
            )}
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
              min="1"
              value={formData.maxRegistration}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("maxRegistration", value);

                // Re-validate minBooking and maxBooking when maxRegistration changes
                const newErrors = { ...errors };

                // Clear maxRegistration error if value is valid
                if (value && value > 0) {
                  delete newErrors.maxRegistration;
                }

                // Re-validate minBooking
                if (formData.minBooking && Number(formData.minBooking) > Number(value)) {
                  newErrors.minBooking = "Cannot exceed Maximum Registration";
                } else if (formData.minBooking && formData.minBooking > 0) {
                  delete newErrors.minBooking;
                }

                // Re-validate maxBooking
                if (formData.maxBooking && Number(formData.maxBooking) > Number(value)) {
                  newErrors.maxBooking = "Cannot exceed Maximum Registration";
                } else if (formData.maxBooking && formData.maxBooking > 0) {
                  delete newErrors.maxBooking;
                }

                setErrors(newErrors);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.maxRegistration ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.maxRegistration && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.maxRegistration}
              </div>
            )}
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
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: errors.raceCategoryPrice ? "1px solid #d63031" : "1px solid #ddd",
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
                    // Calculate amount for convenience fee calculation
                    // If GST is enabled, calculate convenience fee on (price + 18% GST)
                    const amountForConvenienceFee = organizerGST
                      ? price + (price * 0.18)
                      : price;

                    // Tiered convenience fee: 0-1000 = 2%, 1001-1400 = ₹30, 1401+ = ₹40
                    let convenienceFee = 0;
                    if (amountForConvenienceFee > 0) {
                      if (amountForConvenienceFee <= 1000) {
                        convenienceFee = 0.02 * amountForConvenienceFee;
                      } else if (amountForConvenienceFee <= 1400) {
                        convenienceFee = 30;
                      } else {
                        convenienceFee = 40;
                      }
                    }
                    const platformFee = price > 0 ? 5 : 0;
                    const convenienceFeeGST =
                      price > 0
                        ? Math.round(convenienceFee * 0.18 * 100) / 100
                        : 0;
                    const platformFeeGST =
                      price > 0
                        ? Math.round(platformFee * 0.18 * 100) / 100
                        : 0;
                    // Registration GST: Show line if collectGST=Yes AND taxType=Exclusive
                    // Amount: ₹0 if organizerGST=false, otherwise 18%
                    const registrationGST = (collectGST && taxType === 'exclusive' && price > 0)
                      ? (organizerGST ? Math.round(price * 0.18 * 100) / 100 : 0)
                      : 0;

                    // Registration amount includes GST if exclusive
                    const registrationAmount = price + registrationGST;

                    // Payment gateway fee calculated on registration amount (not base price)
                    const paymentGatewayFeeRaw = registrationAmount > 0 ? 0.0185 * registrationAmount : 0;
                    const paymentGatewayFee = registrationAmount > 0 ? Math.round(paymentGatewayFeeRaw * 100) / 100 : 0;
                    const paymentGatewayGST =
                      price > 0
                        ? Math.round(paymentGatewayFee * 0.18 * 100) / 100
                        : 0;

                    // Start with all fees included
                    let totalPayable =
                      price +
                      convenienceFee +
                      platformFee +
                      paymentGatewayFee +
                      convenienceFeeGST +
                      platformFeeGST +
                      paymentGatewayGST +
                      registrationGST;

                    // Subtract convenience fees if Organiser pays them
                    if (formData.convenienceFeePlayer === "Organiser") {
                      totalPayable -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
                    }

                    // Subtract gateway fees if Organiser pays them
                    if (formData.gatewayFeePlayer === "Organiser") {
                      totalPayable -= (paymentGatewayFee + paymentGatewayGST);
                    }

                    // Calculate receivable amount - start with registration amount (includes GST)
                    let receivableAmount = registrationAmount;

                    // Deduct convenience fee + platform fee if organiser pays convenience fee
                    // For ₹100: ₹100 - ₹2 - ₹0.36 - ₹5 - ₹0.90 = ₹91.74
                    if (formData.convenienceFeePlayer === "Organiser") {
                      receivableAmount -= (convenienceFee + convenienceFeeGST + platformFee + platformFeeGST);
                    }

                    // Deduct gateway fee if organiser pays gateway fee
                    // Additional deduction: ₹1.85 + ₹0.33 = ₹2.18
                    // Total: ₹91.74 - ₹2.18 = ₹89.56
                    if (formData.gatewayFeePlayer === "Organiser") {
                      receivableAmount -= (paymentGatewayFee + paymentGatewayGST);
                    }

                    setEventFormData({
                      ...eventFormData,
                      raceCategoryPrice: e.target.value,
                      ticketCalculation: {
                        baseAmount: price,
                        // Store the base rate/amount, not the calculated fee
                        convenienceFeeBase: amountForConvenienceFee <= 1000 ? 2 : (amountForConvenienceFee <= 1400 ? 30 : 40),
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
                        registrationAmount: registrationAmount,  // price + registrationGST
                        registrationGST: registrationGST,
                        netRegistrationAmount:
                          registrationAmount + convenienceFee + convenienceFeeGST + platformFee + platformFeeGST,
                        totalPayable: totalPayable,
                        receivableAmount: receivableAmount,
                        totalPG: totalPayable,  // Real website stores total_buyer here
                        convenienceFeePlayer: formData.convenienceFeePlayer,
                        gatewayFeePlayer: formData.gatewayFeePlayer,
                        collectGST: collectGST,
                        taxType: taxType,
                      },
                    });
                  }}
                />
                {errors.raceCategoryPrice && (
                  <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                    {errors.raceCategoryPrice}
                  </div>
                )}
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
              min="1"
              value={formData.minBooking}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("minBooking", value);

                // Real-time validation
                const newErrors = { ...errors };
                if (!value || value <= 0) {
                  newErrors.minBooking = "Minimum per booking count must be greater than 0";
                } else if (Number(value) > Number(formData.maxRegistration)) {
                  newErrors.minBooking = "Cannot exceed Maximum Registration";
                } else {
                  delete newErrors.minBooking;
                }
                setErrors(newErrors);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.minBooking ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.minBooking && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.minBooking}
              </div>
            )}
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
              min="1"
              value={formData.maxBooking}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("maxBooking", value);

                // Real-time validation
                const newErrors = { ...errors };
                if (!value || value <= 0) {
                  newErrors.maxBooking = "Allow registrations upto must be greater than 0";
                } else if (Number(value) > Number(formData.maxRegistration)) {
                  newErrors.maxBooking = "Cannot exceed Maximum Registration";
                } else {
                  delete newErrors.maxBooking;
                }
                setErrors(newErrors);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.maxBooking ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.maxBooking && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.maxBooking}
              </div>
            )}
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
              min={todayDate}
              value={formData.registrationStartDate}
              onChange={(e) => {
                handleChange("registrationStartDate", e.target.value);

                // Real-time validation for past dates
                const newErrors = { ...errors };
                if (e.target.value) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selectedDate = new Date(e.target.value);

                  if (selectedDate < today) {
                    newErrors.registrationStartDate = "Start date cannot be in the past";
                  } else {
                    delete newErrors.registrationStartDate;
                  }

                  // Also check if end date needs to be revalidated
                  if (formData.registrationEndDate) {
                    const endDate = new Date(formData.registrationEndDate);
                    if (endDate < selectedDate) {
                      newErrors.registrationEndDate = "End date cannot be before start date";
                    } else {
                      delete newErrors.registrationEndDate;
                    }
                  }
                } else {
                  delete newErrors.registrationStartDate;
                }
                setErrors(newErrors);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.registrationStartDate ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.registrationStartDate && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.registrationStartDate}
              </div>
            )}
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
              value={formData.registrationStartTime}
              onChange={(e) =>
                handleChange("registrationStartTime", e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.registrationStartTime ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.registrationStartTime && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.registrationStartTime}
              </div>
            )}
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
              min={formData.registrationStartDate || todayDate}
              value={formData.registrationEndDate}
              onChange={(e) => {
                handleChange("registrationEndDate", e.target.value);

                // Real-time validation for end date
                const newErrors = { ...errors };
                if (e.target.value && formData.registrationStartDate) {
                  const startDate = new Date(formData.registrationStartDate);
                  const selectedEndDate = new Date(e.target.value);

                  if (selectedEndDate < startDate) {
                    newErrors.registrationEndDate = "End date cannot be before start date";
                  } else {
                    delete newErrors.registrationEndDate;
                  }
                } else {
                  delete newErrors.registrationEndDate;
                }
                setErrors(newErrors);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: errors.registrationEndDate ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.registrationEndDate && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.registrationEndDate}
              </div>
            )}
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
                border: errors.registrationEndTime ? "1px solid #d63031" : "1px solid #ddd",
              }}
            />
            {errors.registrationEndTime && (
              <div style={{ color: "#d63031", fontSize: "0.85rem", marginTop: 4 }}>
                {errors.registrationEndTime}
              </div>
            )}
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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    handleChange("convenienceFeePlayer", newValue);
                    const updatedFormData = {
                      ...formData,
                      convenienceFeePlayer: newValue,
                      gatewayFeePlayer: formData.gatewayFeePlayer
                    };
                    recalculateFees(updatedFormData);
                  }}
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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    handleChange("gatewayFeePlayer", newValue);
                    const updatedFormData = {
                      ...formData,
                      convenienceFeePlayer: formData.convenienceFeePlayer,
                      gatewayFeePlayer: newValue
                    };
                    recalculateFees(updatedFormData);
                  }}
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
