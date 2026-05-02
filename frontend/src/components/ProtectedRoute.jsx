import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const guestToken = localStorage.getItem("guest_token");

  if (!token && !guestToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
