import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/authAPI";

export default function Home() {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);

  useEffect(() => {
    const detectAndRedirect = async () => {
      // Check if user has previously selected/detected a city
      const storedCitySlug =
        localStorage.getItem("selectedCitySlug") ||
        localStorage.getItem("detectedCitySlug");

      if (storedCitySlug) {
        navigate(`/in/${storedCitySlug}`, { replace: true });
        return;
      }

      // Try to detect user's location using IP geolocation
      try {
        setIsDetectingLocation(true);

        // Use IP geolocation API (more reliable for city detection)
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.city && data.country_code === "IN") {
          // User is in India, use their city
          const citySlug = data.city
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
          localStorage.setItem("detectedCity", data.city);
          localStorage.setItem("detectedCitySlug", citySlug);
          navigate(`/in/${citySlug}`, { replace: true });
        } else if (data.city) {
          // User outside India, still show their city
          const citySlug = data.city
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
          localStorage.setItem("detectedCity", data.city);
          localStorage.setItem("detectedCitySlug", citySlug);
          navigate(`/in/${citySlug}`, { replace: true });
        } else {
          // Default to India if city not found
          navigate(`/in/india`, { replace: true });
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        // On error, default to India
        navigate(`/in/india`, { replace: true });
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectAndRedirect();
  }, [navigate]);

  // Show loading while detecting location
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #97f397",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        ></div>
        <p>Detecting your location...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
