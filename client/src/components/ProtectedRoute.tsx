import React from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("ProtectedRoute token:", token);

  if (!token) {
    const verifyToken = async () => {
      console.log("Verifying token:", token);
      try {
        const response = await api.get("/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.data;
        if (!data.isValid) {
          localStorage.removeItem("token");
          return <Navigate to="/login" replace />;
        }
      } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
      }
    };

    verifyToken();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
