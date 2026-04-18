import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./OrganiserProfile.css";
import "./error-msg.css";

export default function OrganiserProfile() {
  const navigate = useNavigate();
  // Only allow numbers in mobile/contact number fields
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    setProfileData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  // Helper to show NA for empty fields
  const displayValue = (value) => {
    if (typeof value === "string") {
      return value.trim() ? value : "NA";
    }
    return value ? value : "NA";
  };
  const [isEditing, setIsEditing] = useState(false);
  const [hasGST, setHasGST] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState({
    organizerId: "",
    organisationName: "",
    email: "",
    mobile: "",
    about: "",
    contactPerson: "",
    contactNumber: "",
    logoImage: null,
    bannerImage: null,
    pancard: null,
    gstCertificate: null,
    gstNumber: "",
    gstPercentage: 18,
  });

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getOrganizerDetails();
      if (
        response.data &&
        response.data.organizerData &&
        response.data.organizerData.length > 0
      ) {
        const data = response.data.organizerData[0];
        setProfileData({
          organizerId: data.id || "",
          organisationName: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          about: data.about?.replace(/<[^>]*>/g, "") || "", // Remove HTML tags
          contactPerson: data.contact_person || "",
          contactNumber: data.contact_no || "",
          logoImage: data.logo_image || null,
          bannerImage: data.banner_image || null,
          pancard: data.company_pan || null,
          gstCertificate: data.gst_certificate || null,
          gstNumber: data.gst_number || "",
          gstPercentage: data.gst_percentage || 18,
        });
        setHasGST(data.gst === 1);
      }
    } catch (error) {
      console.error("Error fetching organizer data:", error);
      alert("Failed to load organizer profile. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    // Refetch data when edit is clicked
    await fetchOrganizerData();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Refetch to restore original data
    fetchOrganizerData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // Clear error on change
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = ""; // Clear the input
      return;
    }

    // Validate image formats for image fields
    const imageFields = ["logoImage", "bannerImage"];
    if (imageFields.includes(fieldName) && file) {
      const validFormats = ["image/jpeg", "image/jpg", "image/png"];
      if (!validFormats.includes(file.type)) {
        alert("Please upload only jpg, jpeg, or png formats");
        e.target.value = ""; // Clear the input
        return;
      }
    }

    setProfileData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error on file change
  };

  const handleSave = async () => {
    // Validation
    const newErrors = {};
    const mobileRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!profileData.organisationName.trim())
      newErrors.organisationName = "Organisation Name is required.";

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(profileData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!profileData.mobile.trim()) {
      newErrors.mobile = "Mobile is required.";
    } else if (!mobileRegex.test(profileData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (!profileData.about.trim()) newErrors.about = "About is required.";

    if (hasGST) {
      if (!profileData.gstNumber.trim()) {
        newErrors.gstNumber = "GST Number is required.";
      } else if (!gstRegex.test(profileData.gstNumber.toUpperCase())) {
        newErrors.gstNumber = "Enter a valid 15-digit GST number (e.g. 22AAAAA0000A1Z5).";
      }
    }
    if (!profileData.logoImage) newErrors.logoImage = "Logo Image is required.";
    if (
      profileData.contactNumber &&
      !mobileRegex.test(profileData.contactNumber)
    ) {
      newErrors.contactNumber = "Enter a valid 10-digit contact number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Wait for DOM to update then scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector(".error-msg");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focus the input before the error message if possible
          const input = firstError.previousElementSibling;
          if (input && (input.tagName === "INPUT" || input.tagName === "TEXTAREA")) {
            input.focus();
          }
        }
      }, 100);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        oragniser_id: profileData.organizerId,
        name: profileData.organisationName,
        email: profileData.email,
        mobile: profileData.mobile,
        about: `<p>${profileData.about}</p>`,
        gst: hasGST ? 1 : 0,
        gst_number: (profileData.gstNumber || "").toUpperCase(),
        gst_percentage: profileData.gstPercentage || 18,
        contact_person: profileData.contactPerson || "",
        contact_no: profileData.contactNumber || "",
      };
      if (profileData.bannerImage instanceof File) {
        payload.banner_image = profileData.bannerImage;
      }
      if (profileData.logoImage instanceof File) {
        payload.logo_image = profileData.logoImage;
      }
      if (profileData.pancard instanceof File) {
        payload.company_pancard = profileData.pancard;
      }
      if (profileData.gstCertificate instanceof File) {
        payload.gst_certificate = profileData.gstCertificate;
      }
      const result = await authAPI.addEditOrganizer(payload);
      if (result.message) {
        alert(result.message);
        navigate("/");
      }
      setIsEditing(false);
      await fetchOrganizerData();

      // Dispatch custom event to notify other components (e.g. TopNav) 
      // that the organiser profile has been updated/filled
      window.dispatchEvent(new CustomEvent("organizerProfileUpdated"));
    } catch (error) {
      console.error("Error saving organizer data:", error);
      const errorMsg = error.message || (typeof error === "string" ? error : "");

      if (errorMsg && errorMsg.includes("same name is already exists")) {
        setErrors((prev) => ({
          ...prev,
          organisationName:
            "Organiser with same name already exists, please use another name.",
        }));
        // Wait for DOM to update then scroll to error
        setTimeout(() => {
          const firstError = document.querySelector(".error-msg");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            const input = firstError.previousElementSibling;
            if (
              input &&
              (input.tagName === "INPUT" || input.tagName === "TEXTAREA")
            ) {
              input.focus();
            }
          }
        }, 100);
      } else {
        alert("Failed to save organizer profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopNav />
        <section className="organiser-hero">
          <div className="organiser-hero-overlay"></div>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h1 className="organiser-hero-title">Organiser Profile</h1>
                <nav className="organiser-breadcrumb">
                  <span>Home</span>
                  <span className="breadcrumb-separator">→</span>
                  <span>Organiser Profile</span>
                </nav>
              </div>
            </div>
          </div>
        </section>
        <div className="organiser-profile-container">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav />
      {/* Hero Section - same as My Events */}
      <section className="organiser-hero">
        <div className="organiser-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="organiser-hero-title">Organiser Profile</h1>
              <nav className="organiser-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Organiser Profile</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <div className="organiser-profile-container">
        <div className="organiser-profile-content">
          {!isEditing && (
            <div className="edit-button-container">
              <button className="edit-btn" onClick={handleEdit}>
                ✏️ Edit
              </button>
            </div>
          )}

          {isEditing ? (
            /* Edit Form Layout - Like Screenshot */
            <div className="edit-form-layout">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">
                    Organisation Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="organisationName"
                    // maxLength={20}
                    value={profileData.organisationName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Organisation Name"
                  />
                  {errors.organisationName && (
                    <div className="error-msg">{errors.organisationName}</div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Email ID<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Email ID"
                  />
                  {errors.email && (
                    <div className="error-msg">{errors.email}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label className="form-label">
                    Mobile <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleNumberInput}
                    className="form-input"
                    placeholder="Mobile"
                  />
                  {errors.mobile && (
                    <div className="error-msg">{errors.mobile}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label className="form-label">
                    About<span className="required">*</span>
                  </label>
                  <textarea
                    name="about"
                    value={profileData.about}
                    maxLength={150}
                    onChange={handleChange}
                    className="form-textarea-simple"
                    rows="6"
                    placeholder="About"
                  />
                  {errors.about && (
                    <div className="error-msg">{errors.about}</div>
                  )}
                </div>
              </div>

              <div className="gst-toggle-row">
                <label className="gst-toggle">
                  <input
                    type="checkbox"
                    checked={hasGST}
                    onChange={(e) => setHasGST(e.target.checked)}
                    className="gst-checkbox"
                  />
                  <span className="gst-label">GST</span>
                </label>
              </div>

              {hasGST && (
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      GST Number <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={profileData.gstNumber || ""}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setProfileData(prev => ({ ...prev, gstNumber: val }));
                        setErrors(prev => ({ ...prev, gstNumber: undefined }));
                      }}
                      className="form-input"
                      placeholder="GST Number (e.g. 22AAAAA0000A1Z5)"
                      maxLength={15}
                      required
                    />
                    {errors.gstNumber && (
                      <div className="error-msg">{errors.gstNumber}</div>
                    )}
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      GST Percentage <span className="required">*</span>
                    </label>
                    <div className="gst-percentage-box">18</div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    maxLength={20}
                    value={profileData.contactPerson}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Contact Person"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleNumberInput}
                    className="form-input"
                    placeholder="Contact Number"
                  />
                  {errors.contactNumber && (
                    <div className="error-msg">{errors.contactNumber}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">
                    Organiser Logo Image <span className="required">*</span>
                  </label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logoImage")}
                      className="file-input-hidden"
                      id="logoImage"
                    />
                    <label htmlFor="logoImage" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.logoImage?.name || "No file chosen"}
                    </span>
                  </div>
                  {errors.logoImage && (
                    <div className="error-msg">{errors.logoImage}</div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Banner Image</label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "bannerImage")}
                      className="file-input-hidden"
                      id="bannerImage"
                    />
                    <label htmlFor="bannerImage" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.bannerImage?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Registered Pancard</label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "pancard")}
                      className="file-input-hidden"
                      id="pancard"
                    />
                    <label htmlFor="pancard" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.pancard?.name || "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Registered GST Certificate
                  </label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "gstCertificate")}
                      className="file-input-hidden"
                      id="gstCertificate"
                    />
                    <label htmlFor="gstCertificate" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.gstCertificate?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="save-btn-form" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Profile Grid - Screenshot Style */
            <div className="profile-grid screenshot-style">
              {/* Organisation Name */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Organisation Name</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="organisationName"
                    value={profileData.organisationName}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.organisationName)}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Email</div>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.email)}
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div className="profile-field screenshot-box full-width">
                <div className="screenshot-label">Mobile</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.mobile)}
                  </div>
                )}
              </div>

              {/* About */}
              <div className="profile-field screenshot-box full-width">
                <div className="screenshot-label">About</div>
                {isEditing ? (
                  <textarea
                    name="about"
                    value={profileData.about}
                    onChange={handleChange}
                    className="field-textarea"
                    rows="4"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.about)}
                  </div>
                )}
              </div>
              {/* Contact Person */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Contact Person</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={profileData.contactPerson}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.contactPerson)}
                  </div>
                )}
              </div>

              {/* Contact Number */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Contact Number</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {displayValue(profileData.contactNumber)}
                  </div>
                )}
              </div>

              {/* Organiser Logo Image */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Organiser Logo Image</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logoImage")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.logoImage ? (
                      <div className="file-preview">
                        {profileData.logoImage.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Banner Image */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Banner Image</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "bannerImage")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.bannerImage ? (
                      <div className="file-preview">
                        {profileData.bannerImage.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Registered Pancard */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Registered Pancard</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "pancard")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.pancard ? (
                      <div className="file-preview">
                        {profileData.pancard.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Registered GST Certificate */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">
                  Registered GST Certificate
                </div>
                {isEditing ? (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "gstCertificate")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.gstCertificate ? (
                      <div className="file-preview">
                        {profileData.gstCertificate.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
