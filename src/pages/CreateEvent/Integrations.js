import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

const Integrations = ({ onBack, onNext, showToast }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTCSModal, setShowTCSModal] = useState(false);
  const [tcsAccepted, setTcsAccepted] = useState(false);
  const [savedEventUrl, setSavedEventUrl] = useState("");
  const [savedCheckoutUrl, setSavedCheckoutUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await authAPI.getEventDetails(Number(eventId));
        if (res && res.data) setEventDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch event details for integrations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getPopupEmbed = () => {
    const eventId = sessionStorage.getItem("event_id") || "";
    return (
      "<button onclick='popup(" +
      eventId +
      ");' style='padding: 10px 16px; background-color: #d01c68; color: #fff; border-color: #d01c68;'>Register Now</button><noscript id='tsNoJsMsg'>Javascript on your browser is not enabled.</noscript><script src='https://racesregistrations.com/races/public/assets/js/popup_scripts.js' type='text/javascript'></script>"
    );
  };

  const getIframeEmbed = () => {
    const eventId = sessionStorage.getItem("event_id") || "";
    return (
      '<iframe id="ts-iframe" src="https://racesregistrations.com/races/public/ticket_iframe.html?' +
      eventId +
      '" frameborder="1" height="600" width="80%"></iframe><link rel="stylesheet" href="https://racesregistrations.com/static/Bookingflow/css/ts-iframe.style.css" >'
    );
  };

  const handleSaveClick = () => {
    // Show TCS modal first
    setShowTCSModal(true);
    setTcsAccepted(false);
  };

  const handleTCSConfirm = async () => {
    if (!tcsAccepted) {
      showToast && showToast("Please acknowledge the terms of services related to TCS.", 'error');
      return;
    }

    setShowTCSModal(false);

    try {
      const eventId = sessionStorage.getItem("event_id");
      if (!eventId) {
        showToast && showToast("Event ID not found. Please save the event first.", 'error');
        return;
      }
      const res = await authAPI.eventIntegration(eventId, 1);
      console.log("eventIntegration response:", res);
      const success = res && (res.success === 200 || res.success === "200");
      if (success) {
        const origin = window.location.origin;
        const eventUrl = `${origin}/event/${eventId}`;
        setSavedEventUrl(eventUrl);
        // Show modal here and let user navigate using modal button
        setShowSuccessModal(true);
      } else {
        showToast && showToast((res && res.message) || "Failed to save integration settings", 'error');
      }
    } catch (err) {
      console.error("Failed calling eventIntegration:", err);
      showToast && showToast("Failed to save integration settings.", 'error');
    }
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Integrations</h3>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h4 style={{ color: "#da251c" }}>
            &lt;&gt; Embed Tickets on your website (Pop-up)
          </h4>
          <p>
            To embed ticketing on your website which opens over the content on
            clicking a button, paste this HTML code
          </p>
          <div style={{ position: "relative" }}>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #eee",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <code>{getPopupEmbed()}</code>
            </pre>
          </div>
        </div>

        <div>
          <h4 style={{ color: "#da251c" }}>
            &lt;&gt; Embed Tickets on your website (iframe)
          </h4>
          <p>
            To embed ticketing within the content on your website, paste this
            HTML code
          </p>
          <div style={{ position: "relative" }}>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #eee",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <code>{getIframeEmbed()}</code>
            </pre>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 12,
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
            onClick={handleSaveClick}
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
            Save
          </button>
        </div>
      </div>

      {/* TCS Acknowledgment Modal */}
      {showTCSModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              background: "#fff",
              borderRadius: 8,
              width: 800,
              maxWidth: "95%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                What is TCS and how does TCS work?
              </h3>
              <button
                onClick={() => setShowTCSModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: 0,
                  lineHeight: 1
                }}
              >×</button>
            </div>

            {/* Modal Content - Scrollable */}
            <div style={{
              padding: "24px",
              overflowY: "auto",
              flex: 1
            }}>
              <p style={{ marginTop: 0, lineHeight: 1.6 }}>
                Starting 1st October 2018, every e-commerce operator has to collect TCS as per the GST regulations.
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>What is TCS under GST?</h4>
              <p style={{ lineHeight: 1.6 }}>
                Tax Collected at Source (TCS) under GST means the tax collected by an e-commerce operator from the
                consideration received by it on behalf of the supplier of goods, or services who makes supplies through
                the operator's online platform. TCS will be charged as a percentage on the net taxable supplies.
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>
                What is meant by the "net value of taxable supplies"?
              </h4>
              <p style={{ lineHeight: 1.6 }}>
                The "net value of taxable supplies" means the aggregate value of taxable supplies of goods or services or
                both, made during any month by a registered supplier through such operator reduced by the aggregate
                value of taxable supplies returned to such supplier during the said month.
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>
                What is the rate of TCS notified by the Government?
              </h4>
              <p style={{ lineHeight: 1.6 }}>
                Rate of TCS is 0.5% under each Act (i.e. the CGST Act, 2017, and the respective SGST Act / UTGST Act
                respectively) and the same is 1% under the IGST Act, 2017.
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>
                Is every e-commerce operator required to collect tax on behalf of the actual supplier?
              </h4>
              <p style={{ lineHeight: 1.6 }}>
                Every e-commerce operator is required to collect tax where the supplier is supplying goods or services
                through e-commerce operators and consideration with respect to the supply is to be collected by the said
                e-commerce operator.
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>
                How can actual suppliers/organizers claim credit for TCS?
              </h4>
              <p style={{ lineHeight: 1.6 }}>
                Based on the statement (FORM GSTR-8) filed by the e-commerce operator, the TCS would be credited to
                the electronic cash ledger of the actual supplier in the respective tax head. The said credit can be used at
                the time of discharge of tax liability by the actual supplier.
              </p>

              <p style={{ lineHeight: 1.6, marginBottom: 8 }}>
                If the supplier is not able to use the amount lying in the said cash ledger, the actual supplier may claim a
                refund of the excess balance lying in his electronic cash ledger in accordance with the provisions contained
                in section 54(1) of the CGST Act, 2017
              </p>

              <h4 style={{ marginTop: 20, marginBottom: 10, fontWeight: 600 }}>
                How does youtoocanrun handle TCS collected?
              </h4>
              <p style={{ lineHeight: 1.6, marginBottom: 24 }}>
                Youtoocanrun files the TCS collected from the transaction under an Organizer's account on a monthly basis.
                Total TCS collected for a month for an organizer is filed at one go.
              </p>

              {/* Checkbox */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "16px",
                background: "#f9f9f9",
                borderRadius: 6
              }}>
                <input
                  type="checkbox"
                  id="tcsCheckbox"
                  checked={tcsAccepted}
                  onChange={(e) => setTcsAccepted(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    marginTop: 2
                  }}
                />
                <label
                  htmlFor="tcsCheckbox"
                  style={{
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1.5
                  }}
                >
                  I acknowledge the terms of services related to TCS.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={handleTCSConfirm}
                disabled={!tcsAccepted}
                style={{
                  background: tcsAccepted ? "#da251c" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 32px",
                  fontWeight: 600,
                  cursor: tcsAccepted ? "pointer" : "not-allowed",
                  fontSize: 14
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 560,
              maxWidth: "95%",
            }}
          >
            <div style={{ textAlign: "center", paddingTop: 6 }}>
              <div style={{ fontSize: 56, lineHeight: 1 }}>
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 15.172L5.414 10.586L4 12l6 6 10-10-1.414-1.414L10 15.172z"
                    fill="#07A08A"
                  />
                </svg>
              </div>
              <div style={{ color: "#d01c27", fontWeight: 700, marginTop: 8 }}>
                YAY!
              </div>
              <h3 style={{ margin: "8px 0 14px", color: "#222" }}>
                Event created successfully
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    border: "1px dashed #444",
                    padding: "10px 14px",
                    borderRadius: 6,
                    minWidth: 360,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{ flex: 1, color: "#222", wordBreak: "break-all" }}
                  >
                    {savedEventUrl || `${window.location.origin}/event/new`}
                  </div>
                  <button
                    onClick={() => {
                      const text =
                        savedEventUrl || `${window.location.origin}/event/new`;
                      try {
                        navigator.clipboard.writeText(text);
                        showToast && showToast("Link copied!");
                      } catch (e) {
                        console.error("clipboard error", e);
                        showToast && showToast("Failed to copy link", 'error');
                      }
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 8,
                      fontSize: 16,
                    }}
                    aria-label="Copy Link"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    border: "1.5px solid #da251c",
                    color: "#da251c",
                    background: "#fff",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    const eventId = sessionStorage.getItem("event_id");
                    if (eventId) {
                      navigate(`/event/${eventId}`);
                    } else {
                      navigate(`/event/new`);
                    }
                  }}
                  style={{
                    background: "#da251c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Go To Register Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
