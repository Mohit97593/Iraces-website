import React from "react";
import RacesLogo from "../assets/image/Races_1.png";

const MaintenancePage = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#ffffff",
                fontFamily: "'Inter', sans-serif",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <div style={{ marginBottom: "20px" }}>
                <img
                    src={RacesLogo}
                    alt="RACES Logo"
                    style={{ maxWidth: "250px", height: "auto" }}
                />
            </div>

            <div style={{ marginBottom: "30px", maxWidth: "500px" }}>
                {/* Placeholder for the illustration since I don't have the exact image asset */}
                <svg
                    viewBox="0 0 500 300"
                    style={{ width: "100%", height: "auto" }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect x="150" y="100" width="200" height="150" fill="#f0f0f0" rx="10" />
                    <path d="M250 50 L250 100" stroke="#333" strokeWidth="2" />
                    <path d="M200 80 L300 80" stroke="#333" strokeWidth="2" />
                    <circle cx="250" cy="175" r="40" fill="#e0e0e0" />
                    <path d="M230 175 L270 175 M250 155 L250 195" stroke="#333" strokeWidth="4" />
                    <text x="250" y="280" textAnchor="middle" fill="#666" style={{ fontSize: "14px" }}>
                        Site Under Maintenance
                    </text>
                </svg>
            </div>

            <h1
                style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: "10px",
                    marginTop: "0",
                }}
            >
                The site is currently down for maintenance
            </h1>

            <p
                style={{
                    fontSize: "1.2rem",
                    color: "#333",
                    fontWeight: "500",
                }}
            >
                We apologize for any inconveniences caused.
            </p>

            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { margin: 0; }
        `}
            </style>
        </div>
    );
};

export default MaintenancePage;
