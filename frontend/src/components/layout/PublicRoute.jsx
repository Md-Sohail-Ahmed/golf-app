import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-sky-50 text-slate-700">Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}
