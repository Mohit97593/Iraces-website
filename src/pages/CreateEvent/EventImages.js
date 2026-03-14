import React, { useState, useEffect, useRef } from "react";
import { authAPI } from "../../services/authAPI";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Toast from "../../components/Toast/Toast";

export default function EventImages({ onBack, onNext, isReadOnly }) {
  const [bannerBg, setBannerBg] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#030303");
  const [backgroundStatus, setBackgroundStatus] = useState(1);
  const [eventBanner, setEventBanner] = useState(null);
  const [eventBannerPreview, setEventBannerPreview] = useState(null);
  const [descriptionImage, setDescriptionImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [creatives, setCreatives] = useState([]);
  const [creativesPreviews, setCreativesPreviews] = useState([]);
  const [hoveredCreativeIndex, setHoveredCreativeIndex] = useState(null);
  const prevObjectUrl = useRef(null);
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    } catch (e) {
      return html.replace(/<[^>]*>?/gm, "");
    }
  };

  // Ensure the CKEditor editable area is tall enough (matches screenshot)
  useEffect(() => {
    const styleId = "eventimages-ckeditor-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        /* Increase CKEditor editable height for Event Description */
        .eventimages-ckeditor .ck-editor__editable_inline {
          min-height: 360px !important;
          max-height: 720px;
          overflow: auto;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) {
      authAPI.getEventDetails(eventId).then((res) => {
        if (res && res.data && res.data.EventData && res.data.EventData[0]) {
          const details = res.data.EventData[0];
          setEventDetails(details);
          // If server already has a banner image, show it as preview
          if (details.banner_image) setEventBannerPreview(details.banner_image);
        }

        // Load saved event photos from EventImages array
        if (res.data.EventImages && Array.isArray(res.data.EventImages) && res.data.EventImages.length > 0) {
          const photoUrls = res.data.EventImages.map(photo => {
            // EventImages has structure: { id, event_id, image, created_by }
            if (photo.image) return photo.image;
            return null;
          }).filter(url => url !== null);

          if (photoUrls.length > 0) {
            setCreativesPreviews(photoUrls);
            console.log('✅ Loaded event photos:', photoUrls);
          }
        }
      });
    }
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) {
        try {
          URL.revokeObjectURL(prevObjectUrl.current);
        } catch (e) { }
        prevObjectUrl.current = null;
      }
    };
  }, []);

  // For persisting form data
  useEffect(() => {
    // Load saved form data from sessionStorage if available
    const saved = sessionStorage.getItem("eventImagesFormData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // If event_id matches or not present, restore
        if (
          !data.event_id ||
          (eventDetails && data.event_id === eventDetails.id)
        ) {
          setDescription(data.description || "");
          setKeywords(data.keywords || "");
          setBackgroundColor(data.backgroundColor || "#030303");
          setBackgroundStatus(data.backgroundStatus || 1);
          setBannerBg(data.bannerBg || false);
          if (data.bannerImageUrl) setEventBannerPreview(data.bannerImageUrl);
        }
      } catch { }
    }
  }, [eventDetails]);

  // Listen for parent prefill completion and re-apply saved images data
  useEffect(() => {
    const onPrefill = () => {
      const saved = sessionStorage.getItem("eventImagesFormData");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setDescription(data.description || "");
          setKeywords(data.keywords || "");
          setBackgroundColor(data.backgroundColor || "#030303");
          setBackgroundStatus(data.backgroundStatus || 1);
          setBannerBg(data.bannerBg || false);
          if (data.bannerImageUrl) setEventBannerPreview(data.bannerImageUrl);
        } catch (e) { }
      }
    };
    window.addEventListener("createEventPrefillDone", onPrefill);
    return () =>
      window.removeEventListener("createEventPrefillDone", onPrefill);
  }, []);

  const handleSave = async () => {
    setErrorMsg("");
    // Validation
    if (!eventDetails || !eventDetails.new_event_url) {
      setErrorMsg("Event URL is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Description is required.");
      return;
    }
    if (!keywords.trim()) {
      setErrorMsg("Keywords/Metatags are required.");
      return;
    }
    if (!eventBanner && !eventBannerPreview) {
      setErrorMsg("Banner image is required.");
      return;
    }
    if (eventBanner && eventBanner.size > 5 * 1024 * 1024) {
      setErrorMsg("Banner image must be 5MB or less.");
      return;
    }
    // Save form data to sessionStorage
    sessionStorage.setItem(
      "eventImagesFormData",
      JSON.stringify({
        event_id: eventDetails.id,
        description,
        keywords,
        backgroundColor,
        backgroundStatus,
        bannerBg,
        // persist only remote/server preview URLs, not local object URLs
        bannerImageUrl:
          eventBannerPreview &&
            (eventBannerPreview.startsWith("http") ||
              eventBannerPreview.startsWith("/"))
            ? eventBannerPreview
            : null,
      })
    );
    const formData = new FormData();
    formData.append("event_id", eventDetails.id);
    formData.append("event_description", description);
    formData.append("event_keywords", keywords);
    formData.append("background_color", backgroundColor ? backgroundColor : "");
    formData.append("background_status", backgroundStatus);
    formData.append("event_url", eventDetails.new_event_url || "");
    formData.append("url_link", eventDetails.url_link || "");
    formData.append(
      "description_image",
      descriptionImage ? descriptionImage : ""
    );
    if (eventBanner) formData.append("event_banner", eventBanner);

    // Add Event Communication Creatives photos
    if (creatives && creatives.length > 0) {
      creatives.forEach((file) => {
        formData.append("event_photos[]", file);
      });
    }

    try {
      const res = await authAPI.addEventDescription(formData);
      if (res.data && res.data.status === 200) {
        triggerToast("Event description saved!");
        // Call event details API after saving description
        let bannerImage = null;
        if (eventDetails && eventDetails.id) {
          const detailsRes = await authAPI.getEventDetails(eventDetails.id);
          if (
            detailsRes &&
            detailsRes.data &&
            detailsRes.data.EventData &&
            detailsRes.data.EventData[0]
          ) {
            const details2 = detailsRes.data.EventData[0];
            setEventDetails(details2);
            bannerImage = details2.banner_image || null;
            if (bannerImage) setEventBannerPreview(bannerImage);
          }
        }
        // Pass banner image to parent (CreateEvent) if available
        if (bannerImage) {
          onNext(bannerImage);
        } else if (res.data.banner_image) {
          onNext(res.data.banner_image);
        } else {
          onNext();
        }
      } else {
        setErrorMsg(res.data.message || "Failed to save event description");
      }
    } catch (err) {
      setErrorMsg("Error saving event description");
    }
  };

  return (
    <div className="event-form-section">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h3>Event Description</h3>
      <form>
        <div className="form-group">
          <label>
            Event URL <span style={{ color: "#da251c" }}>*</span>
          </label>
          <input
            type="text"
            className="form-controll"
            value={
              eventDetails && eventDetails.new_event_url
                ? eventDetails.new_event_url
                : ""
            }
            readOnly
            required
          />
          {errorMsg === "Event URL is required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>
            Description <span style={{ color: "#da251c" }}>*</span>
          </label>
          <div className="eventimages-ckeditor" style={{ marginTop: 8 }}>
            <CKEditor
              editor={ClassicEditor}
              data={description}
              disabled={isReadOnly}
              config={{
                // Custom upload adapter for images
                extraPlugins: [
                  function (editor) {
                    editor.plugins.get("FileRepository").createUploadAdapter = (
                      loader
                    ) => {
                      return {
                        upload: () => {
                          return loader.file.then(
                            (file) =>
                              new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  resolve({
                                    default: reader.result,
                                  });
                                };
                                reader.onerror = (error) => reject(error);
                                reader.readAsDataURL(file);
                              })
                          );
                        },
                      };
                    };
                  },
                ],
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setDescription(data);
              }}
            />
          </div>
          {errorMsg === "Description is required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}

            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>
            Keywords/Metatags <span style={{ color: "#da251c" }}>*</span>
          </label>
          <input
            type="text"
            className="form-controll"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isReadOnly}
            required
          />
          {errorMsg === "Keywords/Metatags are required." && (
            <div
              style={{
                color: "#da251c",
                fontWeight: 500,
                fontSize: "0.92em",
                marginTop: 4,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        <div className="form-row" style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>
              Event Banner <span style={{ color: "#da251c" }}>*</span>
            </label>
            <input
              type="file"
              className="form-controll"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  setErrorMsg("Banner image must be 5MB or less.");
                  e.target.value = null;
                  setEventBanner(null);
                } else if (file) {
                  setErrorMsg("");
                  setEventBanner(file);
                  // revoke previous object URL if any
                  if (prevObjectUrl.current) {
                    try {
                      URL.revokeObjectURL(prevObjectUrl.current);
                    } catch (e) { }
                    prevObjectUrl.current = null;
                  }
                  const url = URL.createObjectURL(file);
                  prevObjectUrl.current = url;
                  setEventBannerPreview(url);
                }
              }}
              disabled={isReadOnly}
              required
            />
            {errorMsg === "Banner image is required." && (
              <div
                style={{
                  color: "#da251c",
                  fontWeight: 500,
                  fontSize: "0.92em",
                  marginTop: 4,
                }}
              >
                {errorMsg}
              </div>
            )}
            {errorMsg === "Banner image must be 5MB or less." && (
              <div
                style={{
                  color: "#da251c",
                  fontWeight: 500,
                  fontSize: "0.92em",
                  marginTop: 4,
                }}
              >
                {errorMsg}
              </div>
            )}
            <small>In jpg, jpeg, png formats. Max upto 5MB. Recommended size: 1490 x 450 pixels (3.3:1 aspect ratio).</small>
            {eventBannerPreview && (
              <div
                style={{
                  marginTop: 8,
                  position: "relative",
                  width: "fit-content",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                  src={eventBannerPreview}
                  alt="Banner preview"
                  style={{
                    maxWidth: 240,
                    maxHeight: 140,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {/* View Icon */}
                    <div
                      title="View"
                      style={{
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                      }}
                      onClick={() => window.open(eventBannerPreview, "_blank")}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                    {/* Delete Icon */}
                    {!isReadOnly && (
                      <div
                        title="Delete"
                        style={{
                          cursor: "pointer",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                        }}
                        onClick={() => {
                          setEventBanner(null);
                          if (prevObjectUrl.current) {
                            try {
                              URL.revokeObjectURL(prevObjectUrl.current);
                            } catch (e) { }
                            prevObjectUrl.current = null;
                          }
                          setEventBannerPreview(null);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Event Communication Creatives</label>
            <input
              type="file"
              className="form-controll"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const files = Array.from(e.target.files);
                  const newPreviews = files.map((file) =>
                    URL.createObjectURL(file)
                  );
                  setCreatives((prev) => [...prev, ...files]);
                  setCreativesPreviews((prev) => [...prev, ...newPreviews]);
                  // Clear input value to allow re-selecting same file if needed
                  e.target.value = null;
                }
              }}
              disabled={isReadOnly}
            />
            <small>You can choose multiple files.</small>
            {creativesPreviews.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {creativesPreviews.map((preview, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "fit-content",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                    onMouseEnter={() => setHoveredCreativeIndex(index)}
                    onMouseLeave={() => setHoveredCreativeIndex(null)}
                  >
                    <img
                      src={preview}
                      alt={`Creative ${index + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {hoveredCreativeIndex === index && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: "rgba(0,0,0,0.5)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* View Icon */}
                        <div
                          title="View"
                          style={{
                            cursor: "pointer",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                          }}
                          onClick={() => window.open(preview, "_blank")}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                        {/* Delete Icon */}
                        {!isReadOnly && (
                          <div
                            title="Delete"
                            style={{
                              cursor: "pointer",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255,255,255,0.2)",
                              borderRadius: "50%",
                              width: 28,
                              height: 28,
                            }}
                            onClick={() => {
                              // Remove from state
                              const newCreatives = [...creatives];
                              newCreatives.splice(index, 1);
                              setCreatives(newCreatives);

                              const newPreviews = [...creativesPreviews];
                              const urlToRemove = newPreviews[index];

                              // Only revoke URL if it's a blob URL (newly uploaded)
                              // Don't revoke if it's a server URL (http/https)
                              if (urlToRemove && urlToRemove.startsWith('blob:')) {
                                try {
                                  URL.revokeObjectURL(urlToRemove);
                                } catch (e) {
                                  console.error('Error revoking URL:', e);
                                }
                              }

                              newPreviews.splice(index, 1);
                              setCreativesPreviews(newPreviews);
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Banner Background</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              type="button"
              className={`btn ${bannerBg ? "btn-success" : "btn-light"}`}
              style={{
                borderRadius: "24px 0 0 24px",
                border: bannerBg ? "2px solid #da251c" : "1px solid #ccc",
                color: bannerBg ? "#fff" : "#da251c",
                background: bannerBg ? "#da251c" : "#fff",
                fontWeight: 600,
                minWidth: 60,
              }}
              onClick={() => {
                if (!isReadOnly) {
                  setBannerBg(true);
                  setBackgroundStatus(1);
                }
              }}
              disabled={isReadOnly}
            >
              Yes
            </button>
            <button
              type="button"
              className={`btn ${!bannerBg ? "btn-danger" : "btn-light"}`}
              style={{
                borderRadius: "0 24px 24px 0",
                border: !bannerBg ? "2px solid #da251c" : "1px solid #ccc",
                color: !bannerBg ? "#fff" : "#da251c",
                background: !bannerBg ? "#da251c" : "#fff",
                fontWeight: 600,
                minWidth: 60,
              }}
              onClick={() => {
                if (!isReadOnly) {
                  setBannerBg(false);
                  setBackgroundStatus(0);
                  setBackgroundColor("");
                }
              }}
              disabled={isReadOnly}
            >
              No
            </button>
            {bannerBg && (
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => !isReadOnly && setBackgroundColor(e.target.value)}
                disabled={isReadOnly}
                style={{
                  marginLeft: 16,
                  width: 40,
                  height: 32,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  cursor: isReadOnly ? "default" : "pointer"
                }}
              />
            )}
            {bannerBg && (
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 500,
                }}
              >
                Background Color
              </span>
            )}
          </div>
        </div>
        {/* <div className="form-group">
          <label>Description Image</label>
          <input
            type="file"
            className="form-controll"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setDescriptionImage(e.target.files[0])}
          />
        </div> */}
        {!isReadOnly && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 32,
              gap: 16,
            }}
          >
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
              onClick={handleSave}
            >
              Save & Next (3/11)
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
