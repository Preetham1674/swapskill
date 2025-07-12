// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // <--- IMPORT AUTHPROVIDER

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* <--- WRAP APP WITH AUTHPROVIDER */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
