import React from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AppRouter } from "./routes/router";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <div className="wrapper">
            <RouterProvider router={AppRouter} />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
