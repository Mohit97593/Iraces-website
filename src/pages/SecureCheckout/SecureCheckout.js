import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import RegistrationImg from "../../assets/image/registraction.png";
import "./SecureCheckout.css";

export default function SecureCheckout() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuestLogoutPopup, setShowGuestLogoutPopup] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [overallLimit, setOverallLimit] = useState(null);
  const [totalExistingBooked, setTotalExistingBooked] = useState(0);
  const [registrations, setRegistrations] = useState([]);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Tax status state
  const [pricesTaxesStatus, setPricesTaxesStatus] = useState("Exclusive of Taxes");

  // Coupon display location state
  const [couponDisplayLocation, setCouponDisplayLocation] = useState("both"); // Default to 'both'

  useEffect(() => {
    checkUserLoginAndFetch();
  }, [eventId]);

  // Load existing coupon from sessionStorage on mount
  useEffect(() => {
    const storedCouponCode = sessionStorage.getItem('couponCode');
    const storedCouponData = sessionStorage.getItem('appliedCoupon');

    if (storedCouponCode && storedCouponData) {
      try {
        const couponData = JSON.parse(storedCouponData);
        setCouponCode(storedCouponCode);
        setAppliedCoupon(couponData);
        console.log('✅ Loaded existing coupon from sessionStorage:', storedCouponCode);
      } catch (error) {
        console.error('Error parsing stored coupon data:', error);
      }
    }
  }, []);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Recalculate discount whenever tickets or coupon changes
  useEffect(() => {
    if (appliedCoupon && selectedTickets.length > 0) {
      const totalDiscount = selectedTickets.reduce((sum, t) => {
        return sum + getTicketDiscount(t, appliedCoupon);
      }, 0);
      setDiscount(totalDiscount);
    } else {
      setDiscount(0);
    }
  }, [selectedTickets, appliedCoupon]);

  // Helper to check if a ticket is eligible for the coupon

  // Helper to check if a ticket is eligible for the coupon
  const isTicketEligible = (ticketId, coupon) => {
    if (!ticketId || !coupon) return false;

    // apply_ticket: "1" = all tickets, "2" = selected tickets
    const applyType = parseInt(coupon.apply_ticket);

    if (applyType === 2) {
      // 1. Check ticket_selected_data (JSON array of checked tickets)
      if (coupon.ticket_selected_data) {
        try {
          const selectedData = typeof coupon.ticket_selected_data === 'string'
            ? JSON.parse(coupon.ticket_selected_data)
            : coupon.ticket_selected_data;

          if (Array.isArray(selectedData)) {
            const isSelected = selectedData.some(t =>
              String(t.id) === String(ticketId) &&
              (t.checked === true || t.checked === "true" || t.checked === 1 || t.checked === "1")
            );
            if (isSelected) return true;
          }
        } catch (e) {
          console.error("Error parsing ticket_selected_data:", e);
        }
      }

      // 2. Check ticket_details (Comma-separated string of eligible ticket IDs)
      if (coupon.ticket_details) {
        const eligibleIds = String(coupon.ticket_details).split(',').map(id => id.trim());
        if (eligibleIds.includes(String(ticketId))) {
          return true;
        }
      }

      // If applyType is 2 and no matches found, it's not eligible
      return false;
    }

    // Default to true for all other cases (including applyType 1 or undefined)
    return true;
  };

  // Helper to calculate discount for a specific ticket
  const getTicketDiscount = (ticket, coupon) => {
    if (!isTicketEligible(ticket.id, coupon)) {
      console.log(`🚫 getTicketDiscount: Ticket ${ticket.id} NOT eligible`);
      return 0;
    }

    let ticketPrice = parseFloat(ticket.ticket_price);
    // Apply early bird if active
    if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
      const ebDiscount = parseFloat(ticket.discount_value || 0);
      if (ticket.discount === 1) { // percentage
        ticketPrice = ticketPrice - (ticketPrice * ebDiscount / 100);
      } else { // amount
        ticketPrice = ticketPrice - ebDiscount;
      }
    }

    const amtPerType = parseInt(coupon.discount_amt_per_type);
    const totalTicketAmount = ticketPrice * ticket.quantity;

    console.log(`💰 getTicketDiscount: Ticket Price: ${ticketPrice}, Total: ${totalTicketAmount}, Coupon Type: ${amtPerType}`);

    if (amtPerType === 1) { // Fixed Amount
      const discAmt = parseFloat(coupon.discount_amount || 0);
      console.log(`✅ getTicketDiscount: Fixed Discount: ${discAmt}`);
      return discAmt;
    } else if (amtPerType === 2) { // Percentage
      const percentage = parseFloat(coupon.discount_percentage || 0);
      const discAmt = (totalTicketAmount * percentage) / 100;
      console.log(`✅ getTicketDiscount: Percentage Discount: ${percentage}% -> ${discAmt}`);
      return discAmt;
    }

    console.log("❌ getTicketDiscount: Unrecognized amtPerType", amtPerType);
    return 0;
  };

  // Fetch coupons when user applies a coupon code
  // This is now handled in handleApplyCoupon function

  // Clear applied coupon when no tickets are selected
  useEffect(() => {
    if (selectedTickets.length === 0 && appliedCoupon) {
      console.log("🧹 Clearing applied coupon - no tickets selected");
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode("");
      setCouponError("");
    }
  }, [selectedTickets.length, appliedCoupon]);

  // Fetch available coupons when tickets are selected
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (selectedTickets.length === 0) {
        setAvailableCoupons([]);
        return;
      }

      try {
        const ticketIds = selectedTickets.map(t => t.id);
        console.log("📤 Fetching available coupons for tickets:", ticketIds);

        // Call getCoupons API without coupon_code to get all available coupons
        const response = await authAPI.getCoupons({
          event_id: eventId,
          ticket_ids: ticketIds,
          coupon_code: "" // Empty string to get all coupons
        });

        console.log("📥 Available coupons response:", response);

        if (response && response.data && response.data.Coupons && response.data.Coupons.length > 0) {
          setAvailableCoupons(response.data.Coupons);
          console.log("✅ Found", response.data.Coupons.length, "available coupons");
        } else {
          setAvailableCoupons([]);
          console.log("ℹ️ No coupons available for selected tickets");
        }
      } catch (error) {
        console.error("❌ Error fetching available coupons:", error);
        setAvailableCoupons([]);
      }
    };

    fetchAvailableCoupons();
  }, [selectedTickets, eventId]);

  // Sticky summary scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      // Only enable sticky on desktop (screen width > 991px)
      if (window.innerWidth <= 991) {
        return;
      }

      const summaryElement = document.querySelector('.registration-summary');
      const leftColumn = document.querySelector('.col-lg-8');
      if (!summaryElement || !leftColumn) return;

      const summaryHeight = summaryElement.offsetHeight;
      const leftHeight = leftColumn.offsetHeight;

      // If summary is taller than or equal to tickets, don't make it sticky
      // This allows the summary to scroll naturally so all content is visible
      if (summaryHeight >= leftHeight) {
        summaryElement.classList.remove('is-sticky');
        summaryElement.style.width = '';
        return;
      }

      const summaryParent = summaryElement.parentElement;
      const scrollThreshold = 450; // Adjust based on hero section height

      if (window.scrollY > scrollThreshold) {
        summaryElement.classList.add('is-sticky');
        // Calculate and set the width to match the column width
        const columnWidth = summaryParent.offsetWidth;
        summaryElement.style.width = `${columnWidth}px`;
      } else {
        summaryElement.classList.remove('is-sticky');
        summaryElement.style.width = '';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkUserLoginAndFetch = async () => {
    if (!user) {
      // No user, redirect to login
      // Save original URL for post-login redirection
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("redirectAfterLogin", currentPath);
      console.log("💾 Saved redirect path to sessionStorage:", currentPath);
      navigate("/login");
      return;
    }

    // Robust Guest Login Detection
    const isGuestSession = sessionStorage.getItem("isGuestLogin") === "true";
    const hasGuestEmail = !!sessionStorage.getItem("guestEmail");
    const isGuestByName = user?.firstName === "Guest" || user?.firstname === "Guest";
    const isGuest = isGuestSession || hasGuestEmail || isGuestByName;
    
    const allowedEventId = sessionStorage.getItem("guestAllowedEventId");

    // We'll perform a strict check after event details are fetched to see allow_guest_login
    if (isGuest && allowedEventId && String(eventId) !== String(allowedEventId)) {
      console.warn("🚫 Guest user attempting to access restricted event:", eventId);
      setShowGuestLogoutPopup(true);
      setLoading(false);
      return;
    }

    try {
      // Get user_id from sessionStorage if available
      let user_id = null;
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          user_id = parsed.ID || parsed.id || null;
        } catch (e) {
          console.error("Error parsing userData:", e);
        }
      }

      // Call last login check API
      const result = await authAPI.checkUserLastLoginDetails(user_id);

      if (result.data === 1) {
        // Not logged in or session expired, redirect to login
        navigate("/login");
        return;
      }

      // User is logged in, proceed to fetch event details
      fetchEventDetails();
    } catch (error) {
      console.error("Login check error:", error);
      // If API fails (404, etc.), but user has valid token, proceed anyway
      // This allows the page to work even if the API endpoint doesn't exist yet
      fetchEventDetails();
    }
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch event details from events API
      const eventsResponse = await authAPI.getEvents({ event_id: eventId });
      let eventData = null;
      if (
        eventsResponse &&
        eventsResponse.data &&
        eventsResponse.data.EventData &&
        eventsResponse.data.EventData.length > 0
      ) {
        eventData = eventsResponse.data.EventData[0];
        setEvent(eventData);

        // Secondary Strict Guest Check
        const isGuestSession = sessionStorage.getItem("isGuestLogin") === "true";
        const hasGuestEmail = !!sessionStorage.getItem("guestEmail");
        const isGuestByName = user?.firstName === "Guest" || user?.firstname === "Guest";
        const isGuest = isGuestSession || hasGuestEmail || isGuestByName;

        if (isGuest && String(eventData.allow_guest_login) !== "1") {
          console.warn("🚫 SecureCheckout: Guest not allowed for this event.");
          setShowGuestLogoutPopup(true);
          setLoading(false);
          return;
        }
      }

      // Step 2: Fetch ticket details using get_event_ticket API
      const ticketResponse = await authAPI.getEventTicket(eventId);
      console.log("get_event_ticket response:", ticketResponse);

      if (ticketResponse && ticketResponse.data) {
        // Get event_tickets array from response
        const eventTickets = ticketResponse.data.event_tickets || [];
        setTickets(eventTickets);

        // Store event_registration_status from EventData[0]
        // Status is inside EventData array, not at root level
        let regStatus = null;
        let eventOverallLimit = null;
        let taxesStatus = "Exclusive of Taxes"; // Default value
        if (ticketResponse.data.EventData && ticketResponse.data.EventData.length > 0) {
          regStatus = ticketResponse.data.EventData[0].event_registration_status;
          eventOverallLimit = ticketResponse.data.EventData[0].overall_limit;
          // Extract prices_taxes_status from API response
          taxesStatus = ticketResponse.data.EventData[0].prices_taxes_status || "Exclusive of Taxes";
        }
        setRegistrationStatus(regStatus);
        setOverallLimit(eventOverallLimit);
        setPricesTaxesStatus(taxesStatus);

        // NEW: Calculate total existing booked tickets
        const totalBooked = eventTickets.reduce((sum, t) => {
          return sum + (parseInt(t.TotalBookedTickets) || 0);
        }, 0);
        setTotalExistingBooked(totalBooked);

        console.log("✅ event_registration_status:", regStatus);
        console.log("✅ overall_limit:", eventOverallLimit);
        console.log("✅ total_existing_booked:", totalBooked);
        console.log("✅ prices_taxes_status:", taxesStatus);

        // If events API did not return event data, try to use EventData from ticket response
        if (
          !eventData &&
          ticketResponse.data.EventData &&
          ticketResponse.data.EventData.length > 0
        ) {
          setEvent(ticketResponse.data.EventData[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }

    // Fetch coupon display location
    try {
      const couponStatusResponse = await authAPI.getCouponStatus(eventId);
      console.log("getCouponStatus response:", couponStatusResponse);
      if (couponStatusResponse && couponStatusResponse.data) {
        const location = couponStatusResponse.data.coupon_status || "both"; // Changed from coupon_display_location to coupon_status
        setCouponDisplayLocation(location);
        console.log("✅ Coupon display location:", location);
      }
    } catch (error) {
      console.error("Error fetching coupon status:", error);
      // Default to 'both' if API fails
      setCouponDisplayLocation("both");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleAddTicket = (ticket) => {
    console.log("=== handleAddTicket START ===");
    console.log("🎫 Ticket:", ticket.ticket_name || ticket.display_ticket_name);
    console.log("📊 registrationStatus:", registrationStatus);
    console.log("🎯 overallLimit:", overallLimit);

    // Add min_booking tickets initially
    const minBooking = ticket.min_booking || 1;

    // Calculate current total quantity
    const currentTotalQuantity = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);
    console.log("📦 Current total quantity:", currentTotalQuantity);

    // Check overall_limit if it exists
    if (overallLimit && overallLimit > 0) {
      const newTotalInCart = Number(registrationStatus) === 1
        ? minBooking  // Single selection replaces, so just minBooking
        : currentTotalQuantity + minBooking;  // Multiple selection adds

      if ((totalExistingBooked + newTotalInCart) > overallLimit) {
        const remaining = overallLimit - totalExistingBooked;
        if (remaining <= 0) {
          alert(`Registration Closed! Total limit of ${overallLimit} reached.`);
        } else {
          alert(`Cannot add ticket. Only ${remaining} spots remaining for this event.`);
        }
        console.log("❌ BLOCKED: Would exceed overall_limit");
        return;
      }
    }

    // Check Capacity (total_quantity vs TotalBookedTickets)
    const totalQty = Number(ticket.total_quantity || 0);
    const bookedQty = Number(ticket.TotalBookedTickets || 0);
    const calculatedRemaining = totalQty - bookedQty;

    if (totalQty > 0 && bookedQty >= totalQty) {
      alert(`Limit exceed! This ticket category is sold out.`);
      console.log("❌ BLOCKED: Sold out (booked >= total)");
      return;
    }

    if (totalQty > 0 && minBooking > calculatedRemaining) {
      alert(`Only ${calculatedRemaining} tickets remaining for this category.`);
      return;
    }

    const newTicket = {
      ...ticket,
      quantity: minBooking
    };

    // If event_registration_status is 1, only allow single ticket selection
    if (Number(registrationStatus) === 1) {
      console.log("✅ SINGLE SELECTION MODE - Replacing all tickets");
      setSelectedTickets([newTicket]);
    } else {
      console.log("✅ MULTIPLE SELECTION MODE - Adding to existing");
      setSelectedTickets([...selectedTickets, newTicket]);
    }
    console.log("=== handleAddTicket END ===");
  };

  const handleIncreaseQuantity = (ticketId) => {
    // Calculate current total quantity
    const currentTotalQuantity = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);

    // Check overall_limit before increasing
    if (overallLimit && overallLimit > 0) {
      if ((totalExistingBooked + currentTotalQuantity) >= overallLimit) {
        alert(`Cannot increase quantity. Overall event limit of ${overallLimit} reached.`);
        console.log("❌ BLOCKED: Already at overall_limit");
        return;
      }
    }

    setSelectedTickets(selectedTickets.map(t => {
      if (t.id === ticketId) {
        // Check Capacity
        const totalQty = Number(t.total_quantity || 0);
        const bookedQty = Number(t.TotalBookedTickets || 0);
        const calculatedRemaining = totalQty - bookedQty;

        if (totalQty > 0 && t.quantity >= calculatedRemaining) {
          alert(`Limit exceed! Only ${calculatedRemaining} tickets available for this category.`);
          return t;
        }

        const maxBooking = t.max_booking || 1;
        if (t.quantity < maxBooking) {
          return { ...t, quantity: t.quantity + 1 };
        }
      }
      return t;
    }));
  };

  const handleDecreaseQuantity = (ticketId) => {
    setSelectedTickets(selectedTickets.map(t => {
      if (t.id === ticketId) {
        const minBooking = t.min_booking || 1;
        if (t.quantity > minBooking) {
          return { ...t, quantity: t.quantity - 1 };
        }
      }
      return t;
    }));
  };

  const handleRemoveTicket = (ticketId) => {
    setSelectedTickets(selectedTickets.filter(t => t.id !== ticketId));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponLoading(true);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (selectedTickets.length === 0) {
      setCouponError("Please select tickets first");
      return;
    }

    try {
      // Call getCoupons API with coupon code
      const ticketIds = selectedTickets.map(t => t.id);
      console.log("📤 Calling getCoupons API with:");
      console.log("  - event_id:", eventId);
      console.log("  - ticket_ids:", ticketIds);
      console.log("  - coupon_code:", couponCode.trim());

      const response = await authAPI.getCoupons({
        event_id: eventId,
        ticket_ids: ticketIds,
        coupon_code: couponCode.trim()
      });

      console.log("📥 getCoupons API response:", response);

      // Check if response contains valid coupon data
      // Find matching coupon from response
      const matchingCoupon = response.data.Coupons.find(
        coupon => (coupon.discount_code || coupon.coupon_code)?.toLowerCase() === couponCode.trim().toLowerCase()
      );

      if (!matchingCoupon) {
        console.log("❌ handleApplyCoupon: No matching coupon found in response list");
        setCouponError("Invalid coupon code");
        return;
      }

      console.log("🎟️ handleApplyCoupon: Found matching coupon:", matchingCoupon);

      // Calculate total discount across all eligible tickets using the global helper
      const totalDiscount = selectedTickets.reduce((sum, t) => {
        const tDisc = getTicketDiscount(t, matchingCoupon);
        return sum + tDisc;
      }, 0);

      // Standardize coupon data
      const standardizedCoupon = {
        ...matchingCoupon,
        coupon_code: matchingCoupon.discount_code || matchingCoupon.coupon_code,
        discount_type: parseInt(matchingCoupon.discount_amt_per_type),
        discount_value: parseInt(matchingCoupon.discount_amt_per_type) === 2
          ? parseFloat(matchingCoupon.discount_percentage || 0)
          : parseFloat(matchingCoupon.discount_amount || 0)
      };

      setAppliedCoupon(standardizedCoupon);
      setDiscount(totalDiscount);
      setAvailableCoupons(response.data.Coupons); // Update available coupons from response

      // Store in sessionStorage for cross-page synchronization
      sessionStorage.setItem('couponCode', couponCode.trim());
      sessionStorage.setItem('appliedCoupon', JSON.stringify(standardizedCoupon));
      sessionStorage.setItem('couponDiscount', totalDiscount.toFixed(2));

      console.log("✅ handleApplyCoupon: Coupon applied successfully", standardizedCoupon);
      console.log("💰 handleApplyCoupon: Final discount amount:", totalDiscount);
    } catch (error) {
      console.error("❌ handleApplyCoupon: Error applying coupon:", error);
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleApplyCouponFromCard = (coupon) => {
    setCouponError("");

    // Calculate total discount across all eligible tickets
    const totalDiscount = selectedTickets.reduce((sum, t) => {
      return sum + getTicketDiscount(t, coupon);
    }, 0);

    // Standardize coupon data
    const standardizedCoupon = {
      ...coupon,
      coupon_code: coupon.discount_code || coupon.coupon_code,
      discount_type: parseInt(coupon.discount_amt_per_type),
      discount_value: parseInt(coupon.discount_amt_per_type) === 2
        ? parseFloat(coupon.discount_percentage || 0)
        : parseFloat(coupon.discount_amount || 0)
    };

    setAppliedCoupon(standardizedCoupon);
    setDiscount(totalDiscount);
    setCouponCode(standardizedCoupon.coupon_code);

    // Store in sessionStorage for cross-page synchronization
    sessionStorage.setItem('couponCode', standardizedCoupon.coupon_code);
    sessionStorage.setItem('appliedCoupon', JSON.stringify(standardizedCoupon));
    sessionStorage.setItem('couponDiscount', totalDiscount.toFixed(2));

    console.log("✅ Coupon applied from card successfully", standardizedCoupon);
    console.log("💰 Final discount amount:", totalDiscount);
  };

  if (loading) {
    return (
      <div className="secure-checkout-page">
        <TopNav />
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    // If it's a guest restriction, show the logout screen instead of "Event Not Found"
    if (showGuestLogoutPopup) {
      return (
        <div className="secure-checkout-page">
          <TopNav />
          <div className="error-container" style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#fff5f3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <i className="fas fa-user-lock" style={{ fontSize: "50px", color: "#da251c" }}></i>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#333", marginBottom: "16px" }}>Guest Login Logout</h2>
            <p style={{ color: "#666", maxWidth: "500px", margin: "0 auto 32px", fontSize: "16px", lineHeight: "1.6" }}>
              You are currently logged in as a guest for another event. Please logout to register for this event.
            </p>
            <button
              className="btn"
              style={{
                backgroundColor: "#da251c",
                color: "white",
                padding: "14px 40px",
                borderRadius: "30px",
                fontWeight: "700",
                fontSize: "18px",
                border: "none",
                boxShadow: "0 4px 15px rgba(218,37,28,0.3)"
              }}
              onClick={async () => {
                await logout();
                sessionStorage.removeItem("isGuestLogin");
                sessionStorage.removeItem("guestEmail");
                sessionStorage.removeItem("guestAllowedEventId");
                sessionStorage.removeItem("guestAllowedEventName");
                setShowGuestLogoutPopup(false);
                navigate("/login");
              }}
            >
              Logout Now
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="secure-checkout-page">
        <TopNav />
        <div className="error-container">
          <i
            className="fas fa-exclamation-circle"
            style={{ fontSize: "4rem", color: "#dc3545" }}
          ></i>
          <h4 className="mt-3">Event Not Found</h4>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/search-events")}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="secure-checkout-page">
      <TopNav />

      {/* Guest Logout Confirmation Popup */}
      {showGuestLogoutPopup && (
        <div className="guest-logout-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000
        }}>
          <div className="guest-logout-modal" style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "20px",
            maxWidth: "450px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#fff5f3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: "40px", color: "#da251c" }}></i>
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#333" }}>Action Required</h3>
            <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "24px" }}>
              You are currently logged in as a <b>Guest</b> for another event. To register for this event, you need to logout first.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={async () => {
                  await logout();
                  sessionStorage.removeItem("isGuestLogin");
                  sessionStorage.removeItem("guestEmail");
                  sessionStorage.removeItem("guestAllowedEventId");
                  sessionStorage.removeItem("guestAllowedEventName");
                  setShowGuestLogoutPopup(false);
                  navigate("/login");
                }}
                style={{
                  backgroundColor: "#da251c",
                  color: "white",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#b91e14"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#da251c"}
              >
                Logout & Continue Login
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ddd",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer"
                }}
              >
                Cancel and Go Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blue Header Section */}
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">SECURE CHECKOUT</h1>
              <nav className="contact-breadcrumb">
                <span onClick={() => navigate("/")}>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Register Now</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container checkout-container">
        <div className="row">
          {/* Left Column - Event Details & Category Selection */}
          <div className="col-lg-8">
            {/* Event Info Box */}
            <div className="event-info-box">
              <button className="back-button" onClick={handleBack}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              {(() => {
                const eventInfo = `${event.name || ""} | ${formatDate(
                  event.start_time
                )} | ${event.city_name || "Noida"}`;
                sessionStorage.setItem("eventInfo", eventInfo);
                return (
                  <>
                    <h2 className="event-name">{event.name}</h2>
                    <p className="event-date-location">
                      {formatDate(event.start_time)} |{" "}
                      {event.city_name || "Noida"}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Category Selection */}
            <div className="category-selection-section">
              {tickets.length > 0 ? (
                tickets.map((ticket, index) => (
                  <div key={index} className="category-card1">
                    <div className="category-header">
                      <h3 className="category-title">
                        {ticket.ticket_name || ticket.display_ticket_name}
                      </h3>
                    </div>
                    <div className="category-content">
                      {/* Display dynamic ticket description from API */}
                      {ticket.ticket_description && (
                        <div className="ticket-description">
                          {ticket.ticket_description
                            .split("\n")
                            .map((line, idx) => (
                              <div key={idx} className="feature-item">
                                <span>{line}</span>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Fallback if no description */}
                      {!ticket.ticket_description && (
                        <div className="category-features">
                          <div className="feature-item">
                            <i className="fas fa-user-friends"></i>
                            <span>Participant Entitlements</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-id-badge"></i>
                            <span>Timed Bib</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-medal"></i>
                            <span>Finisher Medal</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-tshirt"></i>
                            <span>Race Day T-shirt</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-utensils"></i>
                            <span>Breakfast after the run</span>
                          </div>
                        </div>
                      )}

                      <div className="category-footer">
                        {(() => {
                          const totalQty = Number(ticket.total_quantity || 0);
                          const bookedQty = Number(ticket.TotalBookedTickets || 0);
                          const remaining = totalQty - bookedQty;
                          const isSoldOut = totalQty > 0 && bookedQty >= totalQty;
                          const selectedTicket = selectedTickets.find(t => t.id === ticket.id);

                          return (
                            <>
                              <div className="category-price">
                                {/* Regular/Discounted Price Display */}
                                {ticket.early_bird === 1 && ticket.show_early_bird === 1 ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px', fontWeight: '500' }}>
                                      ₹{ticket.strike_out_price || ticket.ticket_price}
                                    </span>
                                    <span style={{ color: '#e74c3c', fontSize: '24px', fontWeight: '700' }}>
                                      ₹{(() => {
                                        const originalPrice = parseFloat(ticket.ticket_price);
                                        const discountValue = parseFloat(ticket.discount_value || 0);
                                        let discountedPrice = ticket.discount === 1
                                          ? originalPrice - (originalPrice * discountValue / 100)
                                          : originalPrice - discountValue;
                                        return discountedPrice.toFixed(2);
                                      })()}
                                    </span>
                                    <span style={{ backgroundColor: '#ffe5e5', color: '#e74c3c', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                                      {ticket.discount === 1 ? `${ticket.discount_value}% OFF` : `₹${ticket.discount_value} OFF`}
                                    </span>
                                  </div>
                                ) : (
                                  <span>₹{ticket.ticket_price}</span>
                                )}

                                {/* Remaining Tickets Indicator - Positioned on the Left */}
                                {totalQty > 0 && remaining > 0 && remaining <= 10 && (
                                  <div style={{
                                    color: '#e74c3c',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}>
                                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '11px' }}></i>
                                    {remaining} {remaining === 1 ? 'ticket' : 'tickets'} left
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                {selectedTicket ? (
                                  <div className="quantity-controls">
                                    <button
                                      className="btn-quantity"
                                      onClick={() => handleDecreaseQuantity(ticket.id)}
                                      disabled={selectedTicket.quantity <= (ticket.min_booking || 1)}
                                    >
                                      <i className="fas fa-minus"></i>
                                    </button>
                                    <span className="quantity-display">{selectedTicket.quantity}</span>
                                    <button
                                      className="btn-quantity"
                                      onClick={() => handleIncreaseQuantity(ticket.id)}
                                      disabled={selectedTicket.quantity >= (ticket.max_booking || 1)}
                                    >
                                      <i className="fas fa-plus"></i>
                                    </button>
                                    <button className="btn-remove" onClick={() => handleRemoveTicket(ticket.id)}>Remove</button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-add"
                                    onClick={() => handleAddTicket(ticket)}
                                    disabled={isSoldOut}
                                  >
                                    <i className="fas fa-plus"></i> {isSoldOut ? "Sold Out" : "Add"}
                                  </button>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* NEW: Inline Mobile Summary & Proceed Button */}
                      {selectedTickets.find(t => t.id === ticket.id) && (
                        <div className="mobile-only-summary">
                          <div className="mobile-summary-row">
                            <span className="mobile-summary-label">Total Amount:</span>
                            <span className="mobile-summary-value">
                              ₹{(() => {
                                const totalPrice = selectedTickets.reduce((sum, t) => {
                                  let effectivePrice = parseFloat(t.ticket_price);
                                  if (t.early_bird === 1 && t.show_early_bird === 1) {
                                    const discountValue = parseFloat(t.discount_value || 0);
                                    if (t.discount === 1) {
                                      effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                                    } else {
                                      effectivePrice = effectivePrice - discountValue;
                                    }
                                  }
                                  return sum + (effectivePrice * t.quantity);
                                }, 0);
                                const currentDiscount = appliedCoupon ? selectedTickets.reduce((sum, t) => {
                                  return sum + getTicketDiscount(t, appliedCoupon);
                                }, 0) : 0;
                                return Math.max(0, totalPrice - currentDiscount).toFixed(2);
                              })()}
                            </span>
                          </div>
                          <button
                            className="btn-mobile-proceed"
                            onClick={() => {
                              sessionStorage.setItem("selectedTickets", JSON.stringify(selectedTickets));
                              navigate(`/participant-details/${eventId}`);
                            }}
                          >
                            <span style={{ fontSize: '1.1rem' }}>{selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}</span>
                            <span>PROCEED</span>
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tickets-message">
                  <p>available soon.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Registration Summary */}
          <div className="col-lg-4">
            <div className="registration-summary">
              {selectedTickets.length > 0 ? (
                <>
                  <div className="summary-box">
                    <h3 className="summary-heading">SUMMARY</h3>
                    <div className="summary-details">
                      {selectedTickets.map((ticket) => {
                        // Calculate effective price based on early bird discount
                        let effectivePrice = parseFloat(ticket.ticket_price);

                        if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
                          const discountValue = parseFloat(ticket.discount_value || 0);
                          if (ticket.discount === 1) {
                            // Percentage discount
                            effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                          } else {
                            // Amount discount
                            effectivePrice = effectivePrice - discountValue;
                          }
                        }

                        const ticketDiscount = appliedCoupon ? getTicketDiscount(ticket, appliedCoupon) : 0;

                        return (
                          <React.Fragment key={ticket.id}>
                            <div className="summary-row">
                              <span>{ticket.ticket_name || ticket.display_ticket_name} ({ticket.quantity}x)</span>
                              <span>
                                ₹{(effectivePrice * ticket.quantity).toFixed(2)}
                              </span>
                            </div>
                            {ticketDiscount > 0 && (
                              <div className="summary-row" style={{ color: '#28a745', fontSize: '0.9em', marginTop: '-8px', marginBottom: '8px', paddingLeft: '10px' }}>
                                <span>↳ Discount ({appliedCoupon.discount_code})</span>
                                <span>- ₹{ticketDiscount.toFixed(2)}</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {/* Subtotal */}
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>
                          ₹{(() => {
                            const totalPrice = selectedTickets.reduce((sum, t) => {
                              let effectivePrice = parseFloat(t.ticket_price);

                              if (t.early_bird === 1 && t.show_early_bird === 1) {
                                const discountValue = parseFloat(t.discount_value || 0);
                                if (t.discount === 1) {
                                  // Percentage discount
                                  effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                                } else {
                                  // Amount discount
                                  effectivePrice = effectivePrice - discountValue;
                                }
                              }

                              return sum + (effectivePrice * t.quantity);
                            }, 0);
                            return totalPrice.toFixed(2);
                          })()}
                        </span>
                      </div>

                      {/* Remove global discount row as it's now per-ticket */}
                      {appliedCoupon && (
                        <div className="summary-row" style={{ justifyContent: 'flex-start' }}>
                          <button
                            onClick={handleRemoveCoupon}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-times"></i> Remove Coupon ({appliedCoupon.discount_code})
                          </button>
                        </div>
                      )}

                      {/* Total Amount */}
                      <div className="summary-row total">
                        <span>Total Amount</span>
                        <span className="summary-total-amount">
                          ₹
                          {(() => {
                            // Calculate total with early bird discount applied
                            const totalPrice = selectedTickets.reduce((sum, t) => {
                              let effectivePrice = parseFloat(t.ticket_price);

                              if (t.early_bird === 1 && t.show_early_bird === 1) {
                                const discountValue = parseFloat(t.discount_value || 0);
                                if (t.discount === 1) {
                                  // Percentage discount
                                  effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                                } else {
                                  // Amount discount
                                  effectivePrice = effectivePrice - discountValue;
                                }
                              }

                              return sum + (effectivePrice * t.quantity);
                            }, 0);

                            // Calculate discount dynamically for total
                            const currentDiscount = appliedCoupon ? selectedTickets.reduce((sum, t) => {
                              return sum + getTicketDiscount(t, appliedCoupon);
                            }, 0) : 0;

                            const finalPrice = Math.max(0, totalPrice - currentDiscount);
                            const formattedPrice = finalPrice.toFixed(2);
                            const totalQuantity = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);
                            sessionStorage.setItem("summaryTotalAmount", formattedPrice);
                            sessionStorage.setItem("ticketQuantity", totalQuantity);
                            sessionStorage.setItem("selectedTickets", JSON.stringify(selectedTickets));
                            // Save coupon discount info
                            if (discount > 0) {
                              sessionStorage.setItem("couponDiscount", discount.toFixed(2));
                              sessionStorage.setItem("couponCode", appliedCoupon?.discount_code || "");
                            } else {
                              sessionStorage.removeItem("couponDiscount");
                              sessionStorage.removeItem("couponCode");
                            }
                            return formattedPrice;
                          })()}
                        </span>
                      </div>
                      <div className="summary-note">({pricesTaxesStatus})</div>
                    </div>
                    <button
                      className="btn-proceed"
                      onClick={() => {
                        sessionStorage.setItem("selectedTickets", JSON.stringify(selectedTickets));
                        navigate(`/participant-details/${eventId}`);
                      }}
                    >
                      <i className="fas fa-users"></i>
                      <span className="proceed-count">{selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}</span>
                      <span className="proceed-text">PROCEED</span>
                      <i className="fas fa-arrow-right proceed-arrow"></i>
                    </button>
                  </div>

                  {/* Coupon Box - Only show if location is 'outside' or 'both' */}
                  {(couponDisplayLocation === "outside" || couponDisplayLocation === "both") && (
                    <div className="coupon-box">
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="coupon-input"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={appliedCoupon !== null}
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px'
                          }}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={appliedCoupon !== null || !couponCode.trim() || couponLoading}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: appliedCoupon ? '#28a745' : '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: appliedCoupon || !couponCode.trim() || couponLoading ? 'not-allowed' : 'pointer',
                            opacity: appliedCoupon || !couponCode.trim() || couponLoading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            minWidth: '100px'
                          }}
                        >
                          {couponLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Applying...
                            </>
                          ) : (
                            appliedCoupon ? '✓ Applied' : 'Apply'
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                          {couponError}
                        </div>
                      )}
                      {appliedCoupon && (
                        <div style={{ color: '#28a745', fontSize: '14px', marginTop: '5px' }}>
                          ✓ Coupon "{appliedCoupon.discount_code}" applied successfully!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Coupons Cards */}
                  {availableCoupons.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
                        Available Coupons
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {availableCoupons.map((coupon) => {
                          const isApplied = appliedCoupon && appliedCoupon.id === coupon.id;
                          // discount_amt_per_type: "1" = fixed amount, "2" = percentage
                          const amtPerType = parseInt(coupon.discount_amt_per_type);
                          const discountText = amtPerType === 1
                            ? `₹${coupon.discount_amount || 0}`
                            : `${coupon.discount_percentage || 0}%`;

                          return (
                            <div
                              key={coupon.id}
                              style={{
                                backgroundColor: 'white',
                                border: isApplied ? '2px solid #28a745' : '1px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '15px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {/* Discount Badge */}
                              <div style={{
                                width: '50px',
                                height: '50px',
                                margin: '0 auto 12px',
                                backgroundColor: '#e74c3c',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)'
                                }}></div>
                                <i className="fas fa-percent" style={{ color: 'white', fontSize: '20px', zIndex: 1 }}></i>
                              </div>

                              {/* Coupon Code */}
                              <div style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#333',
                                marginBottom: '8px',
                                letterSpacing: '1px'
                              }}>
                                {coupon.discount_code}
                              </div>

                              {/* Savings Text */}
                              <div style={{
                                fontSize: '14px',
                                color: '#28a745',
                                fontWeight: '600',
                                marginBottom: '12px'
                              }}>
                                Save {discountText} on this event
                              </div>

                              {/* Divider */}
                              <div style={{
                                borderTop: '1px dashed #ddd',
                                margin: '12px 0'
                              }}></div>

                              {/* Apply Button */}
                              <button
                                onClick={() => handleApplyCouponFromCard(coupon)}
                                disabled={isApplied}
                                style={{
                                  width: '100%',
                                  padding: '10px',
                                  backgroundColor: isApplied ? '#28a745' : '#333',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: isApplied ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.3s ease',
                                  opacity: isApplied ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                  if (!isApplied) {
                                    e.target.style.backgroundColor = '#e74c3c';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!isApplied) {
                                    e.target.style.backgroundColor = '#333';
                                  }
                                }}
                              >
                                {isApplied ? '✓ Applied' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="summary-header">
                    <img
                      src={RegistrationImg}
                      alt="No Registration"
                      className="summary-icon"
                    />
                  </div>
                  <h3 className="summary-title">No Registration Added</h3>
                  <p className="summary-text">Select a category to continue</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
