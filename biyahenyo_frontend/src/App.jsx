import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DriverDashboardPage from "./pages/DriverDashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LiveMapPage from "./pages/LiveMapPage";
import RoutePlannerPage from "./pages/RoutePlannerPage";
import SignupPage from "./pages/SignupPage";
import SplashPage from "./pages/SplashPage";
import RoutesPage from "./pages/Routes";
import FarePage from "./pages/Fare";
import TransportPage from "./pages/Transport";
import ReportsPage from "./pages/Reports";
import ProfileSettingPage from "./pages/ProfileSettingPage";

function AuthRedirect() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.redirectPath} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute allowedRoles={["DRIVER"]}>
            <DriverDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-planner"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <RoutePlannerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-map/:tripId"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <LiveMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <RoutesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fare"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <FarePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transport"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <TransportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-setting"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ProfileSettingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/auth-redirect" element={<AuthRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
