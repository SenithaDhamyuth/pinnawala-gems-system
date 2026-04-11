import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./index.css";
import "./inventory/styles/inventory.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: "16px",
          boxShadow: "0 14px 40px rgba(15, 23, 42, 0.2)",
        },
      }}
    />
  </StrictMode>,
);
