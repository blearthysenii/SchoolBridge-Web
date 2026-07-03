import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "./components/ToastProvider";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "50105892629-0nt0fu8b6k8bmajdemq8ipqm41kcvbg3.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
