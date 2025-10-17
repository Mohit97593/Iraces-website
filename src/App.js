import React from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AppRouter } from "./routes/router";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="wrapper">
          <RouterProvider router={AppRouter} />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
