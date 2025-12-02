// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Redirect to /auth and remember where user was trying to go
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
