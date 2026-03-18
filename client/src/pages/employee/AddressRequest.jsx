import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function AddressRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const fetchData = async () => {
    try {
      const [reqRes, meRes] = await Promise.all([
        api.get('/employee/address-requests'),
        api.get('/auth/me'),
      ]);
      setRequests(reqRes.data);
      setUserInfo(meRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/employee/address-request', { newAddress });
      toast.success('Address request submitted');
      setNewAddress('');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Address Update</h1>
        <p className="text-slate-500 text-sm">Submit a new residential address for admin approval</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-2xl text-primary bg-primary/10 p-2 rounded-lg">location_on</span>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Current Address</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6 flex-1 text-sm leading-relaxed">
            {userInfo?.residentialAddress || 'Not set'}
          </p>
          {userInfo?.pendingAddress && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 mt-0.5">pending_actions</span>
              <div>
                <strong className="block mb-1 font-bold">Pending Approval:</strong>
                <span className="opacity-90">{userInfo.pendingAddress}</span>
              </div>
            </div>
          )}
        </div>

        <form className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col" onSubmit={handleSubmit}>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Request Change</h3>
          <div className="mb-4 flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Residential Address</label>
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter your new full residential address"
              rows={4}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Request History</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs font-bold">Requested Address</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs font-bold w-32">Status</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs font-bold w-40">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-md truncate">{req.newAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
