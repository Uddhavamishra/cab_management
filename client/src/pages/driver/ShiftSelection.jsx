import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function ShiftSelection() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  const fetchData = async () => {
    try {
      const [shiftsRes, currentRes] = await Promise.all([
        api.get('/driver/shifts'),
        api.get('/driver/selected-shift'),
      ]);
      setShifts(shiftsRes.data);
      setSelectedShift(currentRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelect = async (shiftId) => {
    try {
      await api.post('/driver/select-shift', { shiftId });
      toast.success('Shift selected');
      fetchData();
    } catch (err) { toast.error('Failed to select shift'); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Shift Selection</h1>
        <p className="text-slate-500 text-sm">Choose your preferred shift for today</p>
      </header>

      {selectedShift && (
        <div className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Current Shift</h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded shadow-sm text-lg font-bold text-slate-700 dark:text-slate-200">{selectedShift.startTime}</span>
            <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
            <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded shadow-sm text-lg font-bold text-slate-700 dark:text-slate-200">{selectedShift.endTime}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {selectedShift.office?.name || ''} {selectedShift.label ? `• ${selectedShift.label}` : ''}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => (
          <div key={shift._id} className={`bg-white dark:bg-slate-900 border rounded-xl p-6 flex flex-col ${selectedShift?._id === shift._id ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-bold text-slate-700 dark:text-slate-300">{shift.startTime}</span>
                <span className="text-slate-400 text-xs">→</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-bold text-slate-700 dark:text-slate-300">{shift.endTime}</span>
              </div>
            </div>
            <p className="font-bold text-slate-800 dark:text-white mb-1">{shift.label || 'Unnamed Shift'}</p>
            <p className="text-sm text-slate-500 mb-6 flex-1">{shift.office?.name || ''}</p>
            
            {shift.assignedEmployees && shift.assignedEmployees.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Employees:</p>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {shift.assignedEmployees.map(emp => (
                    <div key={emp._id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{emp.name}</span>
                      <span className="text-[10px] opacity-70 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{emp.phone || 'No phone'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => handleSelect(shift._id)}
              disabled={selectedShift?._id === shift._id}
              className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${selectedShift?._id === shift._id ? 'bg-slate-50 text-primary border border-primary/30 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark shadow-sm'}`}
            >
              {selectedShift?._id === shift._id ? 'Selected ✓' : 'Select Shift'}
            </button>
          </div>
        ))}
      </div>

      {shifts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">schedule</span>
          <p className="text-slate-500 font-medium">No shifts available for your office</p>
        </div>
      )}
    </div>
  );
}
