import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/offices', label: 'Offices', icon: '🏢' },
  { to: '/admin/shifts', label: 'Shifts', icon: '🕐' },
  { to: '/admin/cabs', label: 'Cabs & Routes', icon: '🚕' },
  { to: '/admin/address-approvals', label: 'Address Approvals', icon: '📍' },
  { to: '/admin/attendance', label: 'Attendance', icon: '✅' },
];

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: '📊' },
  { to: '/driver/shifts', label: 'Shift Selection', icon: '🕐' },
  { to: '/driver/manifest', label: 'Passenger Manifest', icon: '📋' },
];

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', icon: '📊' },
  { to: '/employee/cab-info', label: 'Cab Info', icon: '🚕' },
  { to: '/employee/cancel', label: 'Cancel Commute', icon: '❌' },
  { to: '/employee/attendance', label: 'Attendance', icon: '✅' },
  { to: '/employee/address', label: 'Address Request', icon: '📍' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks :
                user.role === 'driver' ? driverLinks : employeeLinks;

  const roleLabel = user.role === 'admin' ? 'Admin Panel' :
                    user.role === 'driver' ? 'Driver Panel' : 'Employee Panel';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🚕</div>
        <h2 className="sidebar-title">CabFlow</h2>
        <span className="sidebar-role">{roleLabel}</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/driver' || link.to === '/employee'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout →
        </button>
      </div>
    </aside>
  );
}
