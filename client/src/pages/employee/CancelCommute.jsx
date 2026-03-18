import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function CancelCommute() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCancellations = async () => {
    try {
      const res = await api.get('/employee/cancellations');
      setCancellations(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCancellations(); }, []);

  const handleCancel = async (type) => {
    setLoading(true);
    try {
      await api.post('/employee/cancel', { type });
      toast.success(`${type === 'pickup' ? 'Pickup' : 'Drop-off'} cancelled successfully`);
      fetchCancellations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
    setLoading(false);
  };

  const pickupCancelled = cancellations.some(c => c.type === 'pickup');
  const dropoffCancelled = cancellations.some(c => c.type === 'dropoff');

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cancel Commute</h1>
        <p className="text-slate-500 text-sm">Cancel your pickup or drop-off (must be at least 2 hours before)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-8 flex flex-col items-center text-center shadow-sm ${pickupCancelled ? 'border-red-200 bg-red-50/50' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl mb-4">
            <span className="material-symbols-outlined text-4xl">wb_twilight</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Morning Pickup</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">Cancel your ride from home to the office.</p>
          {pickupCancelled ? (
            <span className="px-4 py-2 bg-red-100 text-red-600 font-bold text-sm uppercase tracking-wide rounded-lg w-full">Cancelled for Today</span>
          ) : (
            <button className="w-full py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors" onClick={() => handleCancel('pickup')} disabled={loading}>
              {loading ? 'Processing...' : 'Cancel Pickup'}
            </button>
          )}
        </div>

        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-8 flex flex-col items-center text-center shadow-sm ${dropoffCancelled ? 'border-red-200 bg-red-50/50' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-3xl mb-4">
            <span className="material-symbols-outlined text-4xl">dark_mode</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Evening Drop-off</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">Cancel your ride from the office back home.</p>
          {dropoffCancelled ? (
            <span className="px-4 py-2 bg-red-100 text-red-600 font-bold text-sm uppercase tracking-wide rounded-lg w-full">Cancelled for Today</span>
          ) : (
            <button className="w-full py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors" onClick={() => handleCancel('dropoff')} disabled={loading}>
              {loading ? 'Processing...' : 'Cancel Drop-off'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
        <span className="material-symbols-outlined text-blue-500">info</span>
        <p>Cancellation is only allowed if it&apos;s at least <strong>2 hours</strong> before the shift start (for pickup) or shift end (for drop-off). Violating this may result in penalties.</p>
      </div>
    </div>
  );
}
