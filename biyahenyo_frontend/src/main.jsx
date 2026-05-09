import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "leaflet/dist/leaflet.css";
import "./index.css";

const PHONE_WIDTH = 393;
const PHONE_HEIGHT = 852;

function ViewportScaleManager() {
  React.useEffect(() => {
    const updateScale = () => {
      const availableWidth = Math.max(window.innerWidth - 32, 0);
      const availableHeight = Math.max(window.innerHeight - 32, 0);
      const scale = Math.min(availableWidth / PHONE_WIDTH, availableHeight / PHONE_HEIGHT, 1);

      document.documentElement.style.setProperty("--phone-scale", String(scale || 1));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ViewportScaleManager />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
