import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";

export default function InvitationHandler() {
  const { orgId, email } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth context to finish initial loading
    if (isAuthLoading) return;

    const processInvitation = async () => {
      console.log("📨 Processing invitation for URL params:", { orgId, email });
      
      // 1. Store invitation data in sessionStorage (AuthContext will pick it up)
      sessionStorage.setItem("pendingInvitation", JSON.stringify({ orgId, email }));
      
      // 2. Add a professional note to be shown on login/signup page
      sessionStorage.setItem("authNote", "You have been invited to join an organizing team. Logging in or creating an account will automatically accept your invitation.");

      if (isAuthenticated) {
        // User is ALREADY logged in. 
        // We call the API directly here because the AuthContext watcher only fires on state change.
        console.log("🔄 Already authenticated, calling acceptOrgInvitation directly.");
        setIsProcessing(true);
        try {
          await authAPI.acceptOrgInvitation(orgId, email);
          console.log("✅ Invitation accepted successfully");
          // Clear invitation data
          sessionStorage.removeItem("pendingInvitation");
          sessionStorage.removeItem("authNote");
        } catch (err) {
          console.error("❌ Error accepting invitation:", err);
          setError("Failed to accept invitation. It may have expired or been already accepted.");
          return;
        } finally {
          setIsProcessing(false);
        }
        navigate("/");
      } else {
        // User is not logged in, redirect to login
        sessionStorage.setItem("redirectAfterLogin", "/");
        navigate("/login");
      }
    };

    processInvitation();
  }, [isAuthenticated, isAuthLoading, orgId, email, navigate]);

  if (isAuthLoading || isProcessing) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4>Accepting invitation...</h4>
        <p className="text-muted">Please wait while we process your request.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="alert alert-danger shadow-sm">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    );
  }

  return null;
}
