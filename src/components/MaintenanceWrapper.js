import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";
import MaintenancePage from "../pages/MaintenancePage";

const MaintenanceWrapper = ({ children }) => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const checkMaintenanceMode = async () => {
        try {
            const response = await authAPI.getMaintenanceMode();

            if (
                response &&
                response.data &&
                response.data.maintance_mode &&
                response.data.maintance_mode.length > 0
            ) {
                // Check the maintenance_mode flag (1 for active, 0 for inactive)
                const isMaintenanceActive = response.data.maintance_mode[0].maintenance_mode === 1;
                setIsMaintenanceMode(isMaintenanceActive);

                // If active and not on the maintenance page URL, redirect to it
                if (isMaintenanceActive && location.pathname !== "/maintenance-mode") {
                    navigate("/maintenance-mode", { replace: true });
                }
                // If NOT active and we are on the maintenance page, redirect back home
                else if (!isMaintenanceActive && location.pathname === "/maintenance-mode") {
                    navigate("/", { replace: true });
                }
            } else {
                setIsMaintenanceMode(false);
                if (location.pathname === "/maintenance-mode") {
                    navigate("/", { replace: true });
                }
            }
        } catch (error) {
            console.error("Failed to check maintenance mode:", error);
            setIsMaintenanceMode(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkMaintenanceMode();
    }, [location.pathname]); // Check on every route change

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    // Always render MaintenancePage if flag is active to block content access
    if (isMaintenanceMode) {
        return <MaintenancePage />;
    }

    return children;
};

export default MaintenanceWrapper;
