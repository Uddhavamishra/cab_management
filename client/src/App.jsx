import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import OfficeManagement from './pages/admin/OfficeManagement';
import ShiftManagement from './pages/admin/ShiftManagement';
import CabAssignment from './pages/admin/CabAssignment';
import AddressApprovals from './pages/admin/AddressApprovals';
import AttendanceView from './pages/admin/AttendanceView';

// Driver
import DriverDashboard from './pages/driver/Dashboard';
import ShiftSelection from './pages/driver/ShiftSelection';
import Manifest from './pages/driver/Manifest';
import Notifications from './pages/driver/Notifications';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import CabInfo from './pages/employee/CabInfo';
import CancelCommute from './pages/employee/CancelCommute';
import Attendance from './pages/employee/Attendance';
import AddressRequest from './pages/employee/AddressRequest';

function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/offices" element={<ProtectedRoute roles={['admin']}><OfficeManagement /></ProtectedRoute>} />
          <Route path="/admin/shifts" element={<ProtectedRoute roles={['admin']}><ShiftManagement /></ProtectedRoute>} />
          <Route path="/admin/cabs" element={<ProtectedRoute roles={['admin']}><CabAssignment /></ProtectedRoute>} />
          <Route path="/admin/address-approvals" element={<ProtectedRoute roles={['admin']}><AddressApprovals /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><AttendanceView /></ProtectedRoute>} />

          {/* Driver Routes */}
          <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/shifts" element={<ProtectedRoute roles={['driver']}><ShiftSelection /></ProtectedRoute>} />
          <Route path="/driver/manifest" element={<ProtectedRoute roles={['driver']}><Manifest /></ProtectedRoute>} />
          <Route path="/driver/notifications" element={<ProtectedRoute roles={['driver']}><Notifications /></ProtectedRoute>} />

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/cab-info" element={<ProtectedRoute roles={['employee']}><CabInfo /></ProtectedRoute>} />
          <Route path="/employee/cancel" element={<ProtectedRoute roles={['employee']}><CancelCommute /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute roles={['employee']}><Attendance /></ProtectedRoute>} />
          <Route path="/employee/address" element={<ProtectedRoute roles={['employee']}><AddressRequest /></ProtectedRoute>} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
