import { Navigate } from "react-router-dom";
import { decryptData } from "./secureStorage";

export default function ProtectedRoute({ children }) {
  const isAuth = decryptData(localStorage.getItem("user")); // or check user context / redux

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
