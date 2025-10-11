// ...existing code...
import React from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AppRouter } from "./routes/router"; // use named export

function App() {
  return (
    <div className="wrapper">
      <RouterProvider router={AppRouter} />
    </div>
  );
}

export default App;
