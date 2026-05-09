import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Unauthorized from "./pages/Unauthorized";
import Landing from "./pages/Landing";
import Apply from "./pages/Apply";
import Track from "./pages/Track";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import RoleManagement from "./pages/admin/RoleManagement";
import DisasterManagement from "./pages/admin/DisasterManagement";
import GeographyManagement from "./pages/admin/GeographyManagement";
import DisasterEvents from "./pages/admin/DisasterEvents";
import DisasterEventDetail from "./pages/admin/DisasterEventDetail";
import LossMetricManagement from "./pages/admin/LossMetricManagement";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import DashboardLayout from "./components/DashboardLayout";
import Applications from "./pages/Applications";
import PublicUpload from "./pages/PublicUpload";
import ApplicationFormView from "./pages/ApplicationFormView";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import ApplicationDetail from "./pages/ApplicationDetail";
import { ROLES } from "./constants/roles";
import useAuthStore from "./store/authStore";
import useNotificationStore from "./store/notificationStore";
import ErrorBoundary from "./components/ErrorBoundary";

// Strip /api suffix so socket connects to server root, not the API path
const _apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || _apiUrl.replace(/\/api$/, "");

function App() {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        if (import.meta.env.DEV) console.log("Connected to Real-time Notification Engine");
        socket.emit("join", user._id);
      });

      socket.on("notification:new", (notification) => {
        if (import.meta.env.DEV) console.log("New real-time notification received:", notification);
        addNotification(notification);
        
        // Browser native notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico"
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user, addNotification]);

  useEffect(() => {
    // Request notification permission on first load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        {/* Unauthorized - accessible to EVERYONE (logged in or not) */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public Routes - Only accessible when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        {/* Protected Routes - Only accessible when logged in */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/track" element={<Track />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationFormView />} />
            <Route path="/application/:id" element={<ApplicationDetail />} />
            <Route path="/upload/:applicationNumber" element={<PublicUpload />} />
            
            {/* Shared/Public routes */}
            <Route path="/incident/:id" element={<DisasterEventDetail />} />
            
            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DEPARTMENT]} />}>
              <Route path="/admin/users" element={<RoleManagement />} />
              <Route path="/admin/disasters" element={<DisasterManagement />} />
              <Route path="/admin/loss-metrics" element={<LossMetricManagement />} />
              <Route path="/admin/geography" element={<GeographyManagement />} />
              <Route path="/admin/disaster-events" element={<DisasterEvents />} />
            </Route>
            
            <Route path="/reports" element={<Reports />} />

            {/* Department Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]} />}>
              <Route path="/department/tasks" element={<Tasks />} />
            </Route>
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
