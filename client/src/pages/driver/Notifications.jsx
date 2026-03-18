import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/driver/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/driver/notifications/${id}/acknowledge`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, acknowledged: true } : n));
    } catch (err) {
      toast.error('Failed to acknowledge');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cancellations & Notifications</h1>
        <p className="text-slate-500 text-sm">Review employee commute cancellations</p>
      </header>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-4">notifications_off</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Notifications</h3>
            <p className="text-slate-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`bg-white dark:bg-slate-900 p-6 rounded-xl border ${notification.acknowledged ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-l-4 border-l-red-500 shadow-sm border-slate-200 dark:border-slate-700'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.acknowledged ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-red-100 text-red-500 dark:bg-red-900/40'}`}>
                    <span className="material-symbols-outlined">{notification.type === 'pickup' ? 'directions_run' : 'hail'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {notification.employee?.name || 'Unknown Employee'}
                      {!notification.acknowledged && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[10px] font-bold uppercase rounded-full tracking-wider">New</span>
                      )}
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      Cancelled {notification.type} for Date: {notification.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact</p>
                  <p className="text-xs text-slate-500">{notification.employee?.phone || 'No phone'}</p>
                </div>
                {!notification.acknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(notification._id)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {notification.acknowledged && (
                  <div className="flex items-center gap-1 text-green-500">
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Acknowledged</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
