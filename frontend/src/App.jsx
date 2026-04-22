import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import { PublicRoute } from "./components/layout/PublicRoute.jsx";
import { LoginPage } from "./pages/auth/LoginPage.jsx";
import { SignupPage } from "./pages/auth/SignupPage.jsx";
import { DashboardPage } from "./pages/dashboard/DashboardPage.jsx";
import { SubscriptionPage } from "./pages/dashboard/SubscriptionPage.jsx";
import { ScoresPage } from "./pages/dashboard/ScoresPage.jsx";
import { WinningsPage } from "./pages/dashboard/WinningsPage.jsx";
import { NotificationsPage } from "./pages/dashboard/NotificationsPage.jsx";
import { AdminPage } from "./pages/admin/AdminPage.jsx";
import { CharitiesPage } from "./pages/admin/CharitiesPage.jsx";
import { WinnersPage } from "./pages/admin/WinnersPage.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="scores" element={<ScoresPage />} />
        <Route path="winnings" element={<WinningsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="admin"
          element={
            user?.role === "admin" ? <AdminPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="admin/charities"
          element={
            user?.role === "admin" ? <CharitiesPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="admin/winners"
          element={
            user?.role === "admin" ? <WinnersPage /> : <Navigate to="/dashboard" replace />
          }
        />
      </Route>
    </Routes>
  );
}
