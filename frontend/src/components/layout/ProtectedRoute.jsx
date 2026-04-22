import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-sky-50 text-slate-700">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
