import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function DriverDashboard() {
  const [office, setOffice] = useState(null);
  const [shift, setShift] = useState(null);
  const [manifestCount, setManifestCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [officeRes, shiftRes, manifestRes] = await Promise.allSettled([
          api.get('/driver/office'),
          api.get('/driver/selected-shift'),
          api.get('/driver/manifest'),
        ]);
        if (officeRes.status === 'fulfilled') setOffice(officeRes.value.data);
        if (shiftRes.status === 'fulfilled') setShift(shiftRes.value.data);
        if (manifestRes.status === 'fulfilled') setManifestCount(manifestRes.value.data.manifest?.length || 0);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Driver Dashboard</h1>
        <p className="text-slate-500 text-sm">Your daily commute overview</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-purple-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-3 rounded-lg text-2xl">corporate_fare</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned Office</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 truncate">{office?.name || '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-cyan-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-cyan-500 bg-cyan-50 p-3 rounded-lg text-2xl">schedule</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Current Shift</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">{shift ? `${shift.startTime} - ${shift.endTime}` : 'Not selected'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-3 rounded-lg text-2xl">groups</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Passengers</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{manifestCount}</h3>
        </div>
      </div>
    </div>
  );
}
