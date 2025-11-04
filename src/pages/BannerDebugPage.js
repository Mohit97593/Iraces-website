import React from "react";

function BannerDebugPage() {
  // These URLs should come from your API, but for debug, hardcoded here
  const bannerImageUrl =
    "https://13.233.59.198/races/public/uploads/banner_image/1762194388_banner.png";
  const bannerUrl =
    "https://drive.google.com/file/d/1RffOm13TNIY96OQteS_sW9oWMDaw-AH2/view?usp=sharing";

  return (
    <div style={{ padding: "32px" }}>
      <h2>Banner Debug Page</h2>
      <div style={{ marginBottom: "24px" }}>
        <h4>Banner Image (Direct from API):</h4>
        <img
          src={bannerImageUrl}
          alt="Banner from API"
          style={{
            maxWidth: "100%",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px #eee",
          }}
          onError={(e) => {
            e.target.style.border = "2px solid red";
            e.target.alt = "Image failed to load";
          }}
        />
        <div style={{ fontSize: "0.9rem", marginTop: "8px" }}>
          <span>URL: </span>
          <a href={bannerImageUrl} target="_blank" rel="noopener noreferrer">
            {bannerImageUrl}
          </a>
        </div>
      </div>
      <div>
        <h4>Banner Link (Google Drive):</h4>
        <a href={bannerUrl} target="_blank" rel="noopener noreferrer">
          {bannerUrl}
        </a>
      </div>
    </div>
  );
}

export default BannerDebugPage;
