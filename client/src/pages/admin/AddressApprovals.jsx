import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function AddressApprovals() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/address-requests');
      setRequests(res.data);
    } catch (err) { toast.error('Failed to fetch requests'); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/admin/address-requests/${id}`, { status });
      toast.success(`Address ${status}`);
      fetchRequests();
    } catch (err) { toast.error('Action failed'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const processed = requests.filter(r => r.status !== 'pending');

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Address Approvals</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage official address change requests for all employees.</p>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Requests</p>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded-lg">pending_actions</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{pending.length}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Processed Requests</p>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 dark:bg-blue-500/10 p-1.5 rounded-lg">fact_check</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{processed.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Requests</p>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">folder_open</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{requests.length}</p>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('active')}
                className={`text-sm font-bold pb-4 -mb-4 px-2 transition-colors ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-b-2 border-transparent'}`}
              >
                Active Queue ({pending.length})
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-bold pb-4 -mb-4 px-2 transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-b-2 border-transparent'}`}
              >
                History ({processed.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address Context</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(activeTab === 'active' ? pending : processed).map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                          {req.employee?.name ? req.employee.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{req.employee?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">ID: {req.employee?._id?.substring(0,8) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 text-sm items-center">
                        <div className="max-w-[200px] truncate text-slate-500 line-through" title={req.employee?.residentialAddress || 'Not set'}>
                          {req.employee?.residentialAddress || 'None'}
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                        <div className="max-w-[250px] font-medium text-slate-900 dark:text-white whitespace-normal">
                          {req.newAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800/50">
                          Pending
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-800/50">
                          Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wide border border-red-200 dark:border-red-900/50">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(req._id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleAction(req._id, 'approved')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(req.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {(activeTab === 'active' ? pending : processed).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">drafts</span>
                      <p className="text-sm">No {activeTab === 'active' ? 'pending' : 'processed'} address requests.</p>
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
