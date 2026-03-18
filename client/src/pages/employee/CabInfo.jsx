import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function CabInfo() {
  const [cabInfo, setCabInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCab = async () => {
      try {
        const res = await api.get('/employee/cab-info');
        setCabInfo(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCab();
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (!cabInfo) {
    return (
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cab Information</h1>
        </header>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">local_taxi</span>
          <p className="text-slate-500 font-medium">You haven&apos;t been assigned to a cab yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cab Information</h1>
        <p className="text-slate-500 text-sm">Your assigned cab and co-passenger details</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-2xl text-primary bg-primary/10 p-2 rounded-lg">person</span>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Driver Details</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><span className="text-slate-500 font-medium">Name</span><span className="font-bold text-slate-800 dark:text-white">{cabInfo.driver?.name || '—'}</span></div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><span className="text-slate-500 font-medium">Phone</span><span className="font-bold text-slate-800 dark:text-white">{cabInfo.driver?.phone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Vehicle</span><span className="font-bold uppercase tracking-wider text-slate-800 dark:text-white">{cabInfo.vehicleNumber}</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-2xl text-teal-500 bg-teal-50 p-2 rounded-lg">corporate_fare</span>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Office</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><span className="text-slate-500 font-medium">Name</span><span className="font-bold text-slate-800 dark:text-white">{cabInfo.office?.name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Address</span><span className="font-bold text-right max-w-[60%] text-slate-800 dark:text-white">{cabInfo.office?.address || '—'}</span></div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Co-passengers ({cabInfo.coPassengers?.length || 0})</h2>
        {cabInfo.coPassengers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cabInfo.coPassengers.map((p) => (
              <div key={p._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">call</span> {p.phone || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium">
            No co-passengers assigned
          </div>
        )}
      </div>
    </div>
  );
}
