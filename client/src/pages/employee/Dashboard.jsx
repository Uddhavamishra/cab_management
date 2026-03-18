import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [cabInfo, setCabInfo] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cabRes, attRes] = await Promise.allSettled([
          api.get('/employee/cab-info'),
          api.get('/employee/attendance'),
        ]);
        if (cabRes.status === 'fulfilled') setCabInfo(cabRes.value.data);
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome, {user?.name}</h1>
        <p className="text-slate-500 text-sm">Your daily commute dashboard</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-purple-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-3 rounded-lg text-2xl">local_taxi</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Your Cab</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 uppercase">{cabInfo?.vehicleNumber || '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-cyan-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-cyan-500 bg-cyan-50 p-3 rounded-lg text-2xl">person</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Driver</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 truncate">{cabInfo?.driver?.name || '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-3 rounded-lg text-2xl">groups</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Co-passengers</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{cabInfo?.coPassengers?.length || 0}</h3>
        </div>
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 ${attendance?.present ? 'border-t-green-500' : 'border-t-red-500'}`}>
          <div className="flex items-center gap-4 mb-4">
            <span className={`material-symbols-outlined p-3 rounded-lg text-2xl ${attendance?.present ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>{attendance?.present ? 'check_circle' : 'cancel'}</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Today's Attendance</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">{attendance?.present ? 'Present' : 'Not Marked'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-indigo-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-3 rounded-lg text-2xl">schedule</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned Shift</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 line-clamp-1">
            {user?.selectedShift ? (user.selectedShift.label || `${user.selectedShift.startTime} - ${user.selectedShift.endTime}`) : '—'}
          </h3>
          {user?.selectedShift && (
            <p className="text-xs text-slate-500 mt-2 font-medium">{user.selectedShift.startTime} to {user.selectedShift.endTime}</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-3 rounded-lg text-2xl">domain</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned Office</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 line-clamp-1">
            {user?.assignedOffice ? user.assignedOffice.name : '—'}
          </h3>
          {user?.assignedOffice && (
            <p className="text-xs text-slate-500 mt-2 font-medium truncate">{user.assignedOffice.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
