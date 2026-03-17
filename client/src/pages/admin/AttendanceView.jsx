import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function AttendanceView() {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/admin/attendance?date=${date}`);
      setAttendance(res.data);
    } catch (err) { toast.error('Failed to fetch attendance'); }
  };

  useEffect(() => { fetchAttendance(); }, [date]);

  const presentCount = attendance.filter(a => a.present).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track driver and employee presence</p>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Records</span>
              <span className="material-symbols-outlined text-slate-400">format_list_bulleted</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{attendance.length}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center border-b-4 border-b-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Present Today</span>
              <span className="material-symbols-outlined text-emerald-500">how_to_reg</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{presentCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center border-b-4 border-b-rose-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Absentees</span>
              <span className="material-symbols-outlined text-rose-500">person_off</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{attendance.length - presentCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Date:</span>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <span className="material-symbols-outlined text-slate-400 text-sm ml-2">calendar_month</span>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-slate-700 dark:text-slate-300 outline-none w-40"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {a.employee?.name ? a.employee.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{a.employee?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {a.employee?.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.present ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                          <span className="size-1.5 rounded-full bg-rose-500"></span>
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                        <p className="text-sm font-medium">No attendance records for this date</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
