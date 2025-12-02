import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const DiscountCoupons = ({ onBack, onNext }) => {
  const [showForm, setShowForm] = useState(false);
  const [useType, setUseType] = useState("oneTime");
  const [showPublic, setShowPublic] = useState(true);
  const [applyToCategories, setApplyToCategories] = useState("all");
  const initialFormState = {
    discountName: "",
    discountAmount: "percentage",
    discountPercentage: "",
    discountAmountValue: "",
    codeType: "single",
    noOfDiscounts: "",
    discountsPrefix: "",
    discountsCode: "",

    discountAvailedFromDate: "",
    discountAvailedFromTime: "",
    discountAvailedToDate: "",
    discountAvailedToTime: "",
    description: "",
    userEmail: "",
    uploadedCSV: "",
    edit_coupon_id: "",
    coupon_id: "",
    user_id: "",
    have_list_codes: "0",
  };

  // Toggle coupon status handler
  const handleToggleCoupon = async (coupon) => {
    const current = !!coupon.coupon_status;
    const newLocal = !current; // UI value after click

    // Per your request: when toggled OFF -> send true; when toggled ON -> send false
    const payloadStatus = !newLocal;

    const fd = new FormData();
    fd.append("coupon_id", String(coupon.id || coupon.coupon_id || ""));
    fd.append("coupon_status", payloadStatus ? "true" : "false");

    try {
      // Optimistic UI update
      setCouponDetails((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, coupon_status: newLocal } : c
        )
      );

      const res = await authAPI.statusCoupon(fd);
      console.log("statusCoupon response:", res);
      // Optionally reconcile with server response if needed
    } catch (err) {
      console.error("statusCoupon error:", err);
      // Revert UI on failure
      setCouponDetails((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, coupon_status: current } : c
        )
      );
      alert("Failed to update coupon status. Please try again.");
    }
  };
  const [formData, setFormData] = useState(initialFormState);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [hoveredCoupon, setHoveredCoupon] = useState(null);
  const [saveErrors, setSaveErrors] = useState({});
  const [attemptedSave, setAttemptedSave] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const getNextDayStr = (dateStr) => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return dateStr;
    }
  };

  const validateCouponForm = () => {
    const errors = {};
    // Discount Name required
    if (!formData.discountName || String(formData.discountName).trim() === "") {
      errors.discountName = "Discount name is required";
    }
    // No. of Discounts required
    if (!formData.noOfDiscounts || Number(formData.noOfDiscounts) <= 0) {
      errors.noOfDiscounts = "Enter number of discounts";
    }
    // Discount value required depending on type
    if (formData.discountAmount === "percentage") {
      if (
        !formData.discountPercentage ||
        String(formData.discountPercentage).trim() === ""
      ) {
        errors.discountPercentage = "Enter discount percentage";
      } else if (Number(formData.discountPercentage) <= 0) {
        errors.discountPercentage = "Percentage must be greater than 0";
      }
    } else {
      if (
        !formData.discountAmountValue ||
        String(formData.discountAmountValue).trim() === ""
      ) {
        errors.discountAmountValue = "Enter discount amount";
      } else if (Number(formData.discountAmountValue) <= 0) {
        errors.discountAmountValue = "Amount must be greater than 0";
      }
    }

    // Dates: from date cannot be before today
    if (!formData.discountAvailedFromDate) {
      errors.discountAvailedFromDate = "Start date is required";
    } else {
      const from = new Date(formData.discountAvailedFromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      from.setHours(0, 0, 0, 0);
      if (from < today) {
        errors.discountAvailedFromDate = "Start date cannot be before today";
      }
    }

    // End date required
    if (!formData.discountAvailedToDate) {
      errors.discountAvailedToDate = "End date is required";
    }

    // Times: require both from/to times and validate ordering when possible
    if (!formData.discountAvailedFromTime) {
      errors.discountAvailedFromTime = "Start time is required";
    }
    if (!formData.discountAvailedToTime) {
      errors.discountAvailedToTime = "End time is required";
    }

    // If both dates present, ensure logical ordering. Allow same-day if end time is later.
    if (formData.discountAvailedFromDate && formData.discountAvailedToDate) {
      const fromDate = new Date(formData.discountAvailedFromDate);
      const toDate = new Date(formData.discountAvailedToDate);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (toDate < fromDate) {
        errors.discountAvailedToDate = "End date cannot be before start date";
      } else if (toDate.getTime() === fromDate.getTime()) {
        // same date -> require times and ensure end time > start time
        if (
          formData.discountAvailedFromTime &&
          formData.discountAvailedToTime
        ) {
          const parseTimeToMinutes = (t) => {
            const parts = String(t).split(":");
            const hh = Number(parts[0] || 0);
            const mm = Number(parts[1] || 0);
            return hh * 60 + mm;
          };
          const fromM = parseTimeToMinutes(formData.discountAvailedFromTime);
          const toM = parseTimeToMinutes(formData.discountAvailedToTime);
          if (toM <= fromM) {
            errors.discountAvailedToTime = "End time must be after start time";
          }
        }
      }
    }

    setSaveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uniqueCoupons = (arr) => {
    if (!Array.isArray(arr)) return [];
    const map = new Map();
    arr.forEach((it, idx) => {
      if (!it) return;
      let idVal = null;
      if (it.id != null) idVal = it.id;
      else if (it.coupon_id != null) idVal = it.coupon_id;
      else if (it.couponId != null) idVal = it.couponId;
      else idVal = `gen_${idx}`;
      const key = String(idVal);
      const normalized = { ...it, id: idVal };
      map.set(key, normalized);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          const res = await authAPI.getEventDetails(eventId);
          const payload = res && res.data ? res.data : res;
          if (payload && payload.EventData && payload.EventData[0]) {
            console.log(
              "DiscountCoupons - EventData[0] keys:",
              Object.keys(payload.EventData[0] || {})
            );
            setEventDetails(payload.EventData[0]);
            // coupon_details may be on payload (top-level) or inside EventData[0]
            const couponArr = Array.isArray(payload.coupon_details)
              ? payload.coupon_details
              : Array.isArray(payload.EventData[0].coupon_details)
              ? payload.EventData[0].coupon_details
              : [];
            if (couponArr.length > 0)
              setCouponDetails(uniqueCoupons(couponArr));
          } else if (payload) {
            setEventDetails(payload);
            if (Array.isArray(payload.coupon_details))
              setCouponDetails(uniqueCoupons(payload.coupon_details));
          }
          if (payload && Array.isArray(payload.EventTickets)) {
            setTickets(payload.EventTickets);
            setSelectedTickets(payload.EventTickets.map((t) => t.id));
          } else {
            setTickets([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch event details in DiscountCoupons:", err);
      }
    };

    // initial load
    fetchEventDetails();

    // refresh when user navigates back or page becomes visible
    const handleRefresh = () => {
      20;
      fetchEventDetails();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleRefresh();
    };

    window.addEventListener("popstate", handleRefresh);
    window.addEventListener("pageshow", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("popstate", handleRefresh);
      window.removeEventListener("pageshow", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const eventId = sessionStorage.getItem("event_id") || "";
      const res = await authAPI.deleteCoupon(eventId, String(couponId));
      if (res && (res.success || res.status === "success")) {
        alert(res.message || "Coupon removed");
        // refresh event details
        const eventIdForRefresh = sessionStorage.getItem("event_id");
        if (eventIdForRefresh) {
          try {
            const detailsRes = await authAPI.getEventDetails(eventIdForRefresh);
            const payload =
              detailsRes && detailsRes.data ? detailsRes.data : detailsRes;
            if (payload && payload.EventData && payload.EventData[0]) {
              const couponArr = Array.isArray(payload.coupon_details)
                ? payload.coupon_details
                : Array.isArray(payload.EventData[0].coupon_details)
                ? payload.EventData[0].coupon_details
                : [];
              setCouponDetails(uniqueCoupons(couponArr));
              if (Array.isArray(payload.EventData[0].EventTickets))
                setTickets(payload.EventData[0].EventTickets);
            } else if (Array.isArray(payload.coupon_details)) {
              setCouponDetails(uniqueCoupons(payload.coupon_details));
              if (Array.isArray(payload.EventTickets))
                setTickets(payload.EventTickets);
            }
          } catch (e) {
            console.error("Failed to refresh event details after delete", e);
          }
        }
      } else {
        alert((res && res.message) || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("deleteEventCommFqa error:", err);
      alert(err.message || "Failed to delete coupon");
    }
  };

  const handleEditCoupon = async (coupon) => {
    try {
      const eventId = sessionStorage.getItem("event_id") || "";
      const fd = new FormData();
      fd.append("event_id", eventId);
      fd.append("event_comm_id", coupon.id || coupon.coupon_id || "");
      fd.append("coupon_id", coupon.coupon_id || "");
      fd.append("event_edit_flag", "coupon_edit");

      const res = await authAPI.editEventCommFqa(fd);
      // server returns data in res.data or res; our API wrapper returns response.data already
      const payload = res && res.communication_edit_details ? res : res;
      // coupon_edit_details expected
      const couponDetailsResp =
        (res && res.coupon_edit_details) ||
        (res && res.data && res.data.coupon_edit_details) ||
        [];
      if (Array.isArray(couponDetailsResp) && couponDetailsResp.length > 0) {
        const c = couponDetailsResp[0];
        // Map server fields to formData state keys used in this component
        setFormData((prev) => ({
          ...prev,
          edit_coupon_id: c.id || prev.edit_coupon_id,
          coupon_id: c.id || prev.coupon_id,
          discountName: c.discount_name || prev.discountName,
          description: c.description || prev.description,
          have_list_codes: c.have_list_codes || prev.have_list_codes,
          noOfDiscounts: c.no_of_discount || prev.noOfDiscounts,
          discountsCode: c.discount_code || prev.discountsCode,
          discountsPrefix: c.prefix_code || prev.discountsPrefix,
          discountAmountValue: c.discount_amount || prev.discountAmountValue,
          discountPercentage: c.discount_percentage || prev.discountPercentage,
          codeType: c.code_type === "2" ? "list" : "single",
          discountAvailedFromDate:
            c.discount_from_date || prev.discountAvailedFromDate,
          discountAvailedFromTime:
            c.discount_from_time || prev.discountAvailedFromTime,
          discountAvailedToDate:
            c.discount_to_date || prev.discountAvailedToDate,
          discountAvailedToTime:
            c.discount_to_time || prev.discountAvailedToTime,
          userEmail: c.user_email_address || prev.userEmail,
        }));
        // set selected tickets based on edit_ticket_details if available
        if (
          Array.isArray(c.edit_ticket_details) &&
          c.edit_ticket_details.length > 0
        ) {
          const ticketIds = c.edit_ticket_details
            .filter(Boolean)
            .map((t) => t.id);
          setSelectedTickets(ticketIds);
          setApplyToCategories("selected");
        }
        setAttemptedSave(false);
        setShowForm(true);
      } else {
        alert("No coupon details returned for edit.");
      }
    } catch (err) {
      console.error("editEventCommFqa error:", err);
      alert(err.message || "Failed to load coupon for editing");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="discount-coupons-section">
      <div className="section-header">
        {!showForm && <h3>Discount Coupons</h3>}
      </div>

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {!showForm && <h4 style={{ margin: 0 }}>Discount Coupons</h4>}
            {!showForm && (
              <button
                onClick={() => {
                  setFormData(initialFormState);
                  setApplyToCategories("all");
                  setUseType("oneTime");
                  setShowPublic(true);
                  // default select all tickets when starting new coupon
                  setSelectedTickets(tickets.map((t) => t.id));
                  // clear csv input if any
                  const csvInput = document.getElementById("csvUpload");
                  if (csvInput) csvInput.value = "";
                  setAttemptedSave(false);
                  setShowForm(true);
                }}
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
                + New Discount Coupon
              </button>
            )}
          </div>
          {showForm && (
            <div
              style={{
                marginTop: 24,
                padding: 24,
                border: "1px solid #eee",
                borderRadius: 12,
                background: "#fafafa",
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: 24 }}>
                Add Discount Coupon
              </h4>

              {/* One time Use / Multiple Time Use */}
              <div style={{ marginBottom: 20, textAlign: "right" }}>
                <button
                  onClick={() => setUseType("oneTime")}
                  style={{
                    background: useType === "oneTime" ? "#da251c" : "#fff",
                    color: useType === "oneTime" ? "#fff" : "#da251c",
                    border: "1.5px solid #da251c",
                    borderRadius: "6px 0 0 6px",
                    padding: "8px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🎫 One time Use
                </button>
                <button
                  onClick={() => setUseType("multiple")}
                  style={{
                    background: useType === "multiple" ? "#da251c" : "#fff",
                    color: useType === "multiple" ? "#fff" : "#da251c",
                    border: "1.5px solid #da251c",
                    borderRadius: "0 6px 6px 0",
                    padding: "8px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginLeft: -2,
                  }}
                >
                  🔄 Multiple Time Use
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Discount Name */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="discountName"
                    value={formData.discountName}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({ ...s, discountName: undefined }));
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  {attemptedSave && saveErrors.discountName && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.discountName}
                    </div>
                  )}
                </div>

                {/* Show Public */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Show Public ?
                  </label>
                  <div>
                    <button
                      onClick={() => setShowPublic(true)}
                      style={{
                        background: showPublic ? "#da251c" : "#fff",
                        color: showPublic ? "#fff" : "#666",
                        border: "1.5px solid #ddd",
                        borderRadius: "6px 0 0 6px",
                        padding: "8px 20px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🔓 Yes
                    </button>
                    <button
                      onClick={() => setShowPublic(false)}
                      style={{
                        background: !showPublic ? "#da251c" : "#fff",
                        color: !showPublic ? "#fff" : "#666",
                        border: "1.5px solid #ddd",
                        borderRadius: "0 6px 6px 0",
                        padding: "8px 20px",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginLeft: -2,
                      }}
                    >
                      🚫 No
                    </button>
                  </div>
                </div>

                {/* Discount Amount Mode (Amount / Percentage) */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Amount (Calculated per ticket)
                  </label>
                  <select
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountAmount: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                      background: "#fff",
                    }}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>

                {/* Discount Value: show percentage or fixed amount depending on selection */}
                <div>
                  {formData.discountAmount === "percentage" ? (
                    <>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        Discount Percentage{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={(e) => {
                          handleInputChange(e);
                          setSaveErrors((s) => ({
                            ...s,
                            discountPercentage: undefined,
                          }));
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          boxSizing: "border-box",
                        }}
                        min="0.01"
                        step="0.01"
                      />
                      {attemptedSave && saveErrors.discountPercentage && (
                        <div
                          style={{ color: "red", fontSize: 12, marginTop: 6 }}
                        >
                          {saveErrors.discountPercentage}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        Discount Amount (per ticket)
                      </label>
                      <input
                        type="number"
                        name="discountAmountValue"
                        value={formData.discountAmountValue}
                        onChange={(e) => {
                          handleInputChange(e);
                          setSaveErrors((s) => ({
                            ...s,
                            discountAmountValue: undefined,
                          }));
                        }}
                        placeholder="Enter fixed amount"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          boxSizing: "border-box",
                        }}
                        min="0.01"
                        step="0.01"
                      />
                      {attemptedSave && saveErrors.discountAmountValue && (
                        <div
                          style={{ color: "red", fontSize: 12, marginTop: 6 }}
                        >
                          {saveErrors.discountAmountValue}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Code Type (select) */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Code Type
                  </label>
                  <select
                    name="codeType"
                    value={formData.codeType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        codeType: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                      background: "#fff",
                    }}
                  >
                    <option value="single">Single Code</option>
                    <option value="list">List of Codes (CSV)</option>
                  </select>
                </div>

                {/* Discount Code or CSV Upload - span will be next to other column */}
                <div>
                  {formData.codeType === "list" && (
                    <>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        Upload Codes (CSV){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <label
                          htmlFor="csvUpload"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 20px",
                            border: "1px dashed #ddd",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "#fff",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#333"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Upload CSV
                        </label>
                        <input
                          id="csvUpload"
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            setFormData((prev) => ({
                              ...prev,
                              uploadedCSV: file ? file.name : "",
                            }));
                          }}
                          style={{ display: "none" }}
                        />
                        <div style={{ color: "#666" }}>
                          {formData.uploadedCSV || "No file chosen"}
                        </div>

                        {/* info icon to open modal */}
                        <button
                          type="button"
                          onClick={() => setShowCSVModal(true)}
                          aria-label="CSV upload instructions"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            width: 36,
                            height: 36,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 18,
                            boxShadow: "inset 0 0 0 1px #eee",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#da251c"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <circle cx="12" cy="16" r="1" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* No. of Discounts and Discounts Code side-by-side */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    No. of Discounts <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="noOfDiscounts"
                    value={formData.noOfDiscounts}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({
                        ...s,
                        noOfDiscounts: undefined,
                      }));
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                    min="1"
                  />
                  {attemptedSave && saveErrors.noOfDiscounts && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.noOfDiscounts}
                    </div>
                  )}
                </div>

                <div>
                  {formData.codeType === "list" ? (
                    <>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        Prefix (optional)
                      </label>
                      <input
                        type="text"
                        name="discountsPrefix"
                        value={formData.discountsPrefix}
                        onChange={handleInputChange}
                        placeholder="e.g. SPRING-"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          boxSizing: "border-box",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <label style={{ display: "block", marginBottom: 6 }}>
                        Discounts Code
                      </label>
                      <input
                        type="text"
                        name="discountsCode"
                        value={formData.discountsCode}
                        onChange={handleInputChange}
                        placeholder="Optional - for reference"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          boxSizing: "border-box",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Discount Availed From Date */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Availed From Date{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="discountAvailedFromDate"
                    value={formData.discountAvailedFromDate}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({
                        ...s,
                        discountAvailedFromDate: undefined,
                      }));
                    }}
                    placeholder="dd-mm-yyyy"
                    min={todayStr}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  {attemptedSave && saveErrors.discountAvailedFromDate && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.discountAvailedFromDate}
                    </div>
                  )}
                </div>

                {/* Discount Availed From Time */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Availed From Time{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="discountAvailedFromTime"
                    value={formData.discountAvailedFromTime}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({
                        ...s,
                        discountAvailedFromTime: undefined,
                      }));
                    }}
                    placeholder="--:--"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  {attemptedSave && saveErrors.discountAvailedFromTime && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.discountAvailedFromTime}
                    </div>
                  )}
                </div>

                {/* Discount Availed To Date */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Availed To Date{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="discountAvailedToDate"
                    value={formData.discountAvailedToDate}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({
                        ...s,
                        discountAvailedToDate: undefined,
                      }));
                    }}
                    placeholder="dd-mm-yyyy"
                    min={formData.discountAvailedFromDate || todayStr}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  {attemptedSave && saveErrors.discountAvailedToDate && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.discountAvailedToDate}
                    </div>
                  )}
                </div>

                {/* Discount Availed To Time */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Discount Availed To Time{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="discountAvailedToTime"
                    value={formData.discountAvailedToTime}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSaveErrors((s) => ({
                        ...s,
                        discountAvailedToTime: undefined,
                      }));
                    }}
                    placeholder="--:--"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                    }}
                  />
                  {attemptedSave && saveErrors.discountAvailedToTime && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
                      {saveErrors.discountAvailedToTime}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* User Email Address */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>
                    User Email Address
                  </label>
                  <textarea
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              {/* Apply Race Categories */}
              <div style={{ marginTop: 24 }}>
                <h5 style={{ marginBottom: 12 }}>Apply Race Categories</h5>
                <div>
                  <button
                    onClick={() => {
                      setApplyToCategories("all");
                      // when switching to all, select all ticket ids
                      setSelectedTickets(tickets.map((t) => t.id));
                    }}
                    style={{
                      background:
                        applyToCategories === "all" ? "#da251c" : "#fff",
                      color: applyToCategories === "all" ? "#fff" : "#da251c",
                      border: "1.5px solid #da251c",
                      borderRadius: "6px 0 0 6px",
                      padding: "8px 20px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🎯 All Race Categories
                  </button>
                  <button
                    onClick={() => {
                      setApplyToCategories("selected");
                      // when switching to selected, clear selection so user can pick
                      setSelectedTickets([]);
                    }}
                    style={{
                      background:
                        applyToCategories === "selected" ? "#da251c" : "#fff",
                      color:
                        applyToCategories === "selected" ? "#fff" : "#da251c",
                      border: "1.5px solid #da251c",
                      borderRadius: "0 6px 6px 0",
                      padding: "8px 20px",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginLeft: -2,
                    }}
                  >
                    🔒 Selected Race Categories
                  </button>
                </div>
              </div>

              {/* Tickets list when selected mode is active */}
              {applyToCategories === "selected" && (
                <div style={{ marginTop: 16 }}>
                  <h5 style={{ marginBottom: 8 }}>Select Tickets</h5>
                  {tickets.length === 0 ? (
                    <div style={{ color: "#666" }}>No tickets found.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {tickets.map((ticket) => {
                        const isSelected = selectedTickets.includes(ticket.id);
                        return (
                          <label
                            key={ticket.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                              padding: 8,
                              border: isSelected
                                ? "1px solid #da251c"
                                : "1px solid rgb(190, 190, 190)",
                              borderRadius: 8,
                              background: isSelected ? "#fff0f0" : "#fff",
                              boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
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
                                  width: 40,
                                  height: 40,
                                  borderRadius: 8,
                                  background: "#fff9f8",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "inset 0 0 0 1px #fff0f0",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#da251c"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 10.5V7a2 2 0 0 0-2-2h-3.5" />
                                  <path d="M3 13.5V17a2 2 0 0 0 2 2h3.5" />
                                  <rect
                                    x="7"
                                    y="4"
                                    width="10"
                                    height="16"
                                    rx="2"
                                  />
                                </svg>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: isSelected ? "#da251c" : "#000",
                                  }}
                                >
                                  {ticket.ticket_name || `Ticket ${ticket.id}`}
                                </div>
                              </div>
                            </div>

                            <div style={{ marginLeft: 12 }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTickets((prev) => [
                                      ...prev,
                                      ticket.id,
                                    ]);
                                  } else {
                                    setSelectedTickets((prev) =>
                                      prev.filter((id) => id !== ticket.id)
                                    );
                                  }
                                }}
                                style={{ width: 20, height: 20 }}
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Cancel and Save buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData(initialFormState);
                    setApplyToCategories("all");
                    setUseType("oneTime");
                    setShowPublic(true);
                    setSelectedTickets(tickets.map((t) => t.id));
                    const csvInput = document.getElementById("csvUpload");
                    if (csvInput) csvInput.value = "";
                    setAttemptedSave(false);
                  }}
                  style={{
                    border: "1.5px solid #666",
                    color: "#666",
                    background: "#fff",
                    borderRadius: 6,
                    padding: "10px 32px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 32px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    setAttemptedSave(true);
                    if (!validateCouponForm()) {
                      return;
                    }
                    // prepare form data according to backend expectations
                    const fd = new FormData();
                    // include values from formData state
                    fd.append("edit_coupon_id", formData.edit_coupon_id || "");
                    fd.append(
                      "event_id",
                      sessionStorage.getItem("event_id") || ""
                    );
                    // Determine user id robustly: try formData, then `localStorage.userData`, then simple keys
                    const rawUserData = localStorage.getItem("userData");
                    let derivedUserId = "";
                    try {
                      if (rawUserData) {
                        const parsed = JSON.parse(rawUserData);
                        derivedUserId =
                          parsed?.ID || parsed?.id || parsed?.user_id || "";
                      }
                    } catch (e) {
                      derivedUserId = "";
                    }
                    derivedUserId =
                      derivedUserId ||
                      formData.user_id ||
                      localStorage.getItem("user_id") ||
                      sessionStorage.getItem("user_id") ||
                      "";
                    fd.append("user_id", String(derivedUserId));
                    // also include created_by for backend which uses this value when inserting
                    // ensure created_by is always present (fallback to '0')
                    const createdBy =
                      derivedUserId || localStorage.getItem("user_id") || "0";
                    fd.append("created_by", String(createdBy));
                    // Determine discount type and map fields per rules:
                    // discount_type: '1' => amount, '2' => percentage
                    // If discount_type == '1' send value in discount_amount; discount_percentage empty
                    // If discount_type == '2' send value in discount_percentage; discount_amount empty
                    // discount_amt_per_type should be inverse: if type 1 -> 2, if type 2 -> 1
                    const selectedMode =
                      formData.discountAmount || "percentage"; // 'amount' or 'percentage'
                    const discountType = formData.discount_type
                      ? String(formData.discount_type)
                      : selectedMode === "amount"
                      ? "1"
                      : "2";

                    fd.append("discount_type", discountType);
                    fd.append("discount_name", formData.discountName || "");

                    // discount_amt_per_type is inverse
                    fd.append(
                      "discount_amt_per_type",
                      discountType === "1" ? "2" : "1"
                    );

                    if (discountType === "1") {
                      // send amount
                      fd.append(
                        "discount_amount",
                        formData.discountAmountValue || ""
                      );
                      fd.append(
                        "discount_percentage",
                        formData.discountPercentage || ""
                      );
                    } else {
                      // send percentage
                      fd.append(
                        "discount_percentage",
                        formData.discountPercentage || ""
                      );
                      fd.append(
                        "discount_amount",
                        formData.discountAmountValue || ""
                      );
                    }
                    // map codeType ('single'|'list') to backend values 1 or 2
                    const codeTypeValue =
                      formData.codeType === "list" ? "2" : "1";
                    fd.append("code_type", codeTypeValue);
                    fd.append("no_of_discount", formData.noOfDiscounts || "");
                    fd.append("discount_code", formData.discountsCode || "");
                    fd.append("prefix_code", formData.discountsPrefix || "");
                    fd.append(
                      "discount_from_date",
                      formData.discountAvailedFromDate || ""
                    );
                    fd.append(
                      "discount_to_date",
                      formData.discountAvailedToDate || ""
                    );
                    fd.append(
                      "discount_from_time",
                      formData.discountAvailedFromTime || ""
                    );
                    fd.append(
                      "discount_to_time",
                      formData.discountAvailedToTime || ""
                    );
                    fd.append(
                      "have_list_codes",
                      formData.have_list_codes || "0"
                    );
                    // upload_csv file (if selected) - component stored filename only; read file input instead
                    const csvInput = document.getElementById("csvUpload");
                    if (csvInput && csvInput.files && csvInput.files[0]) {
                      fd.append("upload_csv", csvInput.files[0]);
                    }

                    // apply_ticket: 1 => all, 2 => selected
                    const apply_ticket =
                      applyToCategories === "all" ? "1" : "2";
                    fd.append("apply_ticket", apply_ticket);

                    // ticket_selected_data expected as JSON string array with checked field
                    const ticketSelectedPayload = tickets.map((t) => ({
                      id: t.id,
                      ticket_name: t.ticket_name,
                      checked: selectedTickets.includes(t.id),
                    }));
                    fd.append(
                      "ticket_selected_data",
                      JSON.stringify(ticketSelectedPayload)
                    );

                    fd.append("description", formData.description || "");
                    fd.append("show_public", showPublic ? "1" : "0");
                    fd.append("user_email_address", formData.userEmail || "");
                    fd.append("coupon_id", formData.coupon_id || "");

                    // Preflight: ensure event_id exists and log FormData for debugging
                    const eventIdForSave =
                      sessionStorage.getItem("event_id") ||
                      localStorage.getItem("event_id") ||
                      (eventDetails &&
                        (eventDetails.id ||
                          eventDetails.event_id ||
                          (eventDetails.data && eventDetails.data.event_id))) ||
                      "";
                    if (!eventIdForSave) {
                      alert("Event ID missing. Please save the event first.");
                      return;
                    }

                    // Log FormData keys (files shown as File objects)
                    try {
                      for (const pair of fd.entries()) {
                        const key = pair[0];
                        const val = pair[1];
                        if (val instanceof File) {
                          console.log("FD:", key, "= File(" + val.name + ")");
                        } else {
                          console.log("FD:", key, "=", val);
                        }
                      }
                    } catch (logErr) {
                      console.log("Failed to inspect FormData", logErr);
                    }

                    try {
                      const res = await authAPI.addEditCoupon(fd);
                      if (res && res.success) {
                        alert(res.message || "Coupon saved");
                        // close form
                        setShowForm(false);
                        setFormData(initialFormState);
                        setApplyToCategories("all");
                        setUseType("oneTime");
                        setShowPublic(true);
                        setSelectedTickets(tickets.map((t) => t.id));
                        setAttemptedSave(false);
                        const csvInput = document.getElementById("csvUpload");
                        if (csvInput) csvInput.value = "";
                        // refresh event details to reflect new coupon
                        const eventId = sessionStorage.getItem("event_id");
                        if (eventId) {
                          try {
                            const detailsRes = await authAPI.getEventDetails(
                              eventId
                            );
                            const payload =
                              detailsRes && detailsRes.data
                                ? detailsRes.data
                                : detailsRes;
                            if (
                              payload &&
                              payload.EventData &&
                              payload.EventData[0]
                            ) {
                              const p = payload.EventData[0];
                              // post-save: EventData[0] keys available
                              if (Array.isArray(p.EventTickets))
                                setTickets(p.EventTickets);
                              // coupons can be top-level or inside EventData[0]
                              const couponArrPost = Array.isArray(
                                payload.coupon_details
                              )
                                ? payload.coupon_details
                                : Array.isArray(p.coupon_details)
                                ? p.coupon_details
                                : [];
                              if (couponArrPost.length > 0)
                                setCouponDetails(uniqueCoupons(couponArrPost));
                            } else {
                              console.log(
                                "DiscountCoupons - post-save payload keys:",
                                Object.keys(payload || {})
                              );
                              if (Array.isArray(payload.EventTickets))
                                setTickets(payload.EventTickets);
                              if (Array.isArray(payload.coupon_details))
                                setCouponDetails(
                                  uniqueCoupons(payload.coupon_details)
                                );
                            }
                          } catch (e) {
                            console.error(
                              "Failed to refresh event details after save",
                              e
                            );
                          }
                        }
                      } else {
                        alert(res.message || "Failed to save coupon");
                      }
                    } catch (err) {
                      console.error("addEditCoupon error:", err);
                      alert(err.message || "Failed to save coupon");
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          {/* CSV instructions modal */}
          {showCSVModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  width: "720px",
                  maxWidth: "95%",
                  background: "#fff",
                  borderRadius: 8,
                  padding: 24,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => setShowCSVModal(false)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>

                <h3 style={{ marginTop: 6 }}>
                  Upload CSV LIST OF DISCOUNT CODE
                </h3>

                <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 180,
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 14,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>DISCOUNT_CODE</div>
                      <div>CODEEXAMPLE1</div>
                      <div>CODEEXAMPLE2</div>
                      <div>CODEEXAMPLE3</div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#da251c",
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      Instruction to upload list of codes:
                    </div>
                    <ol style={{ paddingLeft: 18, color: "#333" }}>
                      <li>File should be in CSV format.</li>
                      <li>Should have only one column</li>
                      <li>First row should be header DISCOUNT_CODE</li>
                      <li>Length of code should be maximum 15 characters</li>
                      <li>All code should be unique.</li>
                      <li>Maximum 5,000 code can be added.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showForm &&
            (couponDetails && couponDetails.length > 0 ? (
              <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                {couponDetails.map((c) => {
                  const codePreview =
                    (c.multiple_coupon_details &&
                      c.multiple_coupon_details[0] &&
                      c.multiple_coupon_details[0].name) ||
                    c.discount_code ||
                    "";
                  const discountValue =
                    Number(c.discount_type) === 2
                      ? `${c.discount_percentage}%`
                      : `${c.discount_amount}`;
                  return (
                    <div
                      key={c.id}
                      onMouseEnter={() => setHoveredCoupon(c.id)}
                      onMouseLeave={() => setHoveredCoupon(null)}
                      style={{
                        border:
                          hoveredCoupon === c.id
                            ? "1px solid #da251c"
                            : "1px solid #eee",
                        borderRadius: 12,
                        padding: 22,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        position: "relative",
                        overflow: "visible",
                      }}
                    >
                      {/* floating edit/delete icons */}
                      <div
                        style={{
                          position: "absolute",
                          top: -14,
                          right: 12,
                          display: "flex",
                          gap: 8,
                          transition: "opacity 120ms ease",
                          opacity: hoveredCoupon === c.id ? 1 : 0,
                          pointerEvents:
                            hoveredCoupon === c.id ? "auto" : "none",
                        }}
                      >
                        <button
                          title="Edit"
                          onClick={() => handleEditCoupon(c)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            background: "#da251c",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                          }}
                        >
                          ✎
                        </button>

                        <button
                          title="Delete"
                          onClick={() => handleDeleteCoupon(c.id)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            background: "#da251c",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                          }}
                        >
                          🗑
                        </button>
                      </div>

                      {/* top row: name */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 18 }}>
                          {c.discount_name || "(no name)"}
                        </div>

                        {/* toggle switch */}
                        <div style={{ marginLeft: 12 }}>
                          <div
                            role="button"
                            aria-label="Toggle coupon status"
                            onClick={() => handleToggleCoupon(c)}
                            style={{
                              width: 48,
                              marginTop: 12,
                              height: 28,
                              borderRadius: 20,
                              background: c.coupon_status ? "#da251c" : "#eee",
                              padding: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: c.coupon_status
                                ? "flex-end"
                                : "flex-start",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                background: "#fff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* middle: stats */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 20,
                        }}
                      >
                        <div style={{ display: "flex", gap: 48, flex: 1 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 22 }}>
                              {c.no_of_discount}
                            </div>
                            <div style={{ color: "#666", marginTop: 6 }}>
                              No of Discounts
                            </div>
                          </div>

                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 22 }}>
                              {discountValue}
                            </div>
                            <div style={{ color: "#666", marginTop: 6 }}>
                              Discount Value
                            </div>
                          </div>

                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 22 }}>
                              {c.expired_date}
                            </div>
                            <div style={{ color: "#666", marginTop: 6 }}>
                              Expiry Date
                            </div>
                          </div>
                        </div>

                        <div style={{ marginLeft: 24 }}>
                          <div
                            style={{
                              padding: "12px 28px",
                              background:
                                "repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5 10px,#eee 10px,#eee 20px)",
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 20,
                            }}
                          >
                            {codePreview}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  marginTop: 32,
                  padding: 36,
                  borderRadius: 12,
                  textAlign: "center",
                  border: "1px solid #eee",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/747/747376.png"
                  alt="No Discount"
                  style={{
                    width: 80,
                    marginBottom: 16,
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
                <h3 style={{ margin: 0, fontWeight: 700 }}>
                  No Discount Coupons Added
                </h3>
                <div style={{ marginTop: 12, color: "#666" }}>
                  Please click on " + Add discount coupon" button to add new
                  discount discount coupon.
                </div>
              </div>
            ))}

          {!showForm && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountCoupons;
