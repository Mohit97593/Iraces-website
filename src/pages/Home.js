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
        sessionStorage.getItem("selectedCitySlug") ||
        sessionStorage.getItem("detectedCitySlug");

      if (storedCitySlug) {
        navigate(`/in/${storedCitySlug}`, { replace: true });
        return;
      }

      // Try to detect user's location using multiple IP geolocation APIs
      try {
        setIsDetectingLocation(true);
        console.log("🌐 Auto-detecting location on home...");

        const apis = [
          { url: "https://ipapi.co/json/", cityKey: "city", regionKey: "region" },
          { url: "https://freeipapi.com/api/json", cityKey: "cityName", regionKey: "regionName" },
          { url: "https://ipwho.is/", cityKey: "city", regionKey: "region" }
        ];

        let detectedLocation = null;

        for (const api of apis) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          try {
            const response = await fetch(api.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response && response.ok) {
              const data = await response.json();
              const city = data[api.cityKey];
              const region = data[api.regionKey];
              
              const detected = city || region;
              
              if (detected && detected.trim() !== "" && detected.toLowerCase() !== "india") {
                detectedLocation = detected;
                console.log(`✅ Detected location via ${api.url}:`, detectedLocation);
                break;
              }
            }
          } catch (e) {
            clearTimeout(timeoutId);
            console.warn(`❌ API ${api.url} failed or timed out`);
          }
        }

        if (detectedLocation) {
          const citySlug = detectedLocation
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
          
          sessionStorage.setItem("detectedCity", detectedLocation);
          sessionStorage.setItem("detectedCitySlug", citySlug);
          navigate(`/in/${citySlug}`, { replace: true });
        } else {
          // Default to India if no specific location found
          console.warn("⚠️ No specific location detected, defaulting to India.");
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
