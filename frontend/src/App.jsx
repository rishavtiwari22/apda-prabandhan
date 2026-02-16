import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import RoleManagement from "./pages/admin/RoleManagement";
import DisasterManagement from "./pages/admin/DisasterManagement";
import GeographyManagement from "./pages/admin/GeographyManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { ROLES } from "./constants/roles";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Only accessible when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes - Only accessible when logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/users" element={<RoleManagement />} />
            <Route path="/admin/disasters" element={<DisasterManagement />} />
            <Route path="/admin/geography" element={<GeographyManagement />} />
          </Route>

          {/* Department Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]} />}>
            <Route path="/department/tasks" element={<div className="p-8">Department Tasks (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
