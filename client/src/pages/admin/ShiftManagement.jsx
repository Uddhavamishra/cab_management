import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startTime: '', office: '', label: '' });

  const fetchData = async () => {
    try {
      const [shiftsRes, officesRes] = await Promise.all([
        api.get('/admin/shifts'),
        api.get('/admin/offices'),
      ]);
      setShifts(shiftsRes.data);
      setOffices(officesRes.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/shifts', form);
      toast.success('Shift created');
      setForm({ startTime: '', office: '', label: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await api.delete(`/admin/shifts/${id}`);
      toast.success('Shift deleted');
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  // Calculate end time preview
  const getEndTime = (start) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    return `${String((h + 9) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shifts Management</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancel' : 'Create Shift'}
          </button>
        </div>
      </header>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        
        {showForm && (
          <form className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" onSubmit={(e) => { handleSubmit(e); setShowForm(false); }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Shift</h3>
            <p className="text-sm text-slate-500 mb-6">Create 9-hour shifts by selecting a start time</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Label (Optional)</label>
                <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Morning Shift" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                {form.startTime && <p className="text-xs text-slate-500 mt-2 font-medium">End time: <span className="text-primary">{getEndTime(form.startTime)}</span> (auto-calculated)</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Office</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white" value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })} required>
                  <option value="">Select Office</option>
                  {offices.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-md shadow-primary/20">Save Shift</button>
          </form>
        )}

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">All Shifts</h4>
              <p className="text-sm text-slate-500 mt-1">Manage shift times across offices</p>
            </div>
            <div className="text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              Total: {shifts.length}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Shift Name</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Time Slot</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Office</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {shifts.map((shift) => (
                  <tr key={shift._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">
                            {parseInt(shift.startTime?.split(':')[0]) < 12 ? 'wb_sunny' : parseInt(shift.startTime?.split(':')[0]) < 18 ? 'partly_cloudy_day' : 'bedtime'}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{shift.label || 'Unnamed Shift'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">{shift.startTime}</span>
                          <span className="text-slate-400">→</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">{shift.endTime}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">Duration: 9 Hours</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {shift.office?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        onClick={() => handleDelete(shift._id)}
                        title="Delete Shift"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                        <p className="text-sm font-medium">No shifts found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
