import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/users', label: 'Drivers & Users', icon: 'person' },
  { to: '/admin/cabs', label: 'Fleets & Routes', icon: 'local_taxi' },
  { to: '/admin/shifts', label: 'Shifts', icon: 'schedule' },
  { to: '/admin/attendance', label: 'Attendance', icon: 'calendar_today' },
  { to: '/admin/offices', label: 'Offices', icon: 'corporate_fare' },
  { to: '/admin/address-approvals', label: 'Address Approvals', icon: 'location_on' },
];

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: 'dashboard' },
  { to: '/driver/shifts', label: 'Shift Selection', icon: 'schedule' },
  { to: '/driver/manifest', label: 'Passenger Manifest', icon: 'receipt_long' },
];

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', icon: 'dashboard' },
  { to: '/employee/cab-info', label: 'Cab Info', icon: 'directions_car' },
  { to: '/employee/cancel', label: 'Cancel Commute', icon: 'cancel' },
  { to: '/employee/attendance', label: 'Attendance', icon: 'how_to_reg' },
  { to: '/employee/address', label: 'Address Request', icon: 'home_work' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks :
                user.role === 'driver' ? driverLinks : employeeLinks;

  const roleLabel = user.role === 'admin' ? 'Fleet Management' :
                    user.role === 'driver' ? 'Driver Portal' : 'Employee Portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined text-[20px]">local_taxi</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">CabFlow</h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{roleLabel}</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto hidden-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/driver' || link.to === '/employee'}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl mb-3 border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
