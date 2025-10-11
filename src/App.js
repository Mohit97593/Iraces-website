import React from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AppRouter } from "./routes/router";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="wrapper">
        <RouterProvider router={AppRouter} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
