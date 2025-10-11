import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// ...existing code...
// import { BrowserRouter } from "react-router-dom"; // removed: avoid nesting routers
import { Provider } from "react-redux";
import { store } from "./store/store";

// ...existing code...
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure public/index.html contains <div id="root"></div>'
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
