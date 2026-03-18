import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function Attendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/employee/attendance');
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const toggleAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.post('/employee/attendance');
      setAttendance(res.data);
      toast.success(res.data.present ? 'Marked as present!' : 'Marked as absent');
    } catch (err) { toast.error('Failed to update attendance'); }
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Attendance</h1>
        <p className="text-slate-500 text-sm">{today}</p>
      </header>

      <div className={`border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm transition-colors ${attendance?.present ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm ${attendance?.present ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'}`}>
          <span className="material-symbols-outlined text-5xl">{attendance?.present ? 'check_circle' : 'person_off'}</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">
          {attendance?.present ? 'You are marked as PRESENT' : 'You are NOT marked for today'}
        </h2>
        
        <button
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full max-w-md shadow-sm ${attendance?.present ? 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' : 'bg-primary text-white hover:bg-primary-dark'}`}
          onClick={toggleAttendance}
          disabled={loading}
        >
          {loading ? 'Updating...' : attendance?.present ? 'Mark as Absent' : 'Mark as Present'}
        </button>
      </div>
    </div>
  );
}
