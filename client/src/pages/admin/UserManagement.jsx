import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '', selectedShift: '', assignedOffice: '' });
  const [resetPw, setResetPw] = useState({ userId: null, newPassword: '' });

  const fetchData = async () => {
    try {
      const [usersRes, shiftsRes, officesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/shifts'),
        api.get('/admin/offices')
      ]);
      setUsers(usersRes.data);
      setShifts(shiftsRes.data);
      setOffices(officesRes.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, form);
        toast.success('User updated');
      } else {
        await api.post('/admin/users', form);
        toast.success('User created');
      }
      setShowForm(false);
      setEditingUser(null);
      setForm({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '', selectedShift: '', assignedOffice: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', role: user.role, name: user.name, phone: user.phone || '', vehicleNumber: user.vehicleNumber || '', residentialAddress: user.residentialAddress || '', selectedShift: user.selectedShift?._id || '', assignedOffice: user.assignedOffice?._id || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleResetPassword = async () => {
    try {
      await api.put(`/admin/users/${resetPw.userId}/reset-password`, { newPassword: resetPw.newPassword });
      toast.success('Password reset');
      setResetPw({ userId: null, newPassword: '' });
    } catch (err) { toast.error('Reset failed'); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-background-light dark:bg-background-dark">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h2>
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          onClick={() => { setShowForm(!showForm); setEditingUser(null); setForm({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '', selectedShift: '', assignedOffice: '' }); }}
        >
          <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
          <span>{showForm ? 'Cancel' : 'Add New User'}</span>
        </button>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {showForm && (
            <form className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800" onSubmit={handleSubmit}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editingUser} />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                {form.role === 'driver' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Number</label>
                    <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
                  </div>
                )}
                {form.role === 'employee' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                      <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Shift</label>
                      <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.selectedShift} onChange={(e) => setForm({ ...form, selectedShift: e.target.value })}>
                        <option value="">-- No Shift assigned --</option>
                        {shifts.map(s => <option key={s._id} value={s._id}>{s.label || `${s.startTime}-${s.endTime}`} ({s.office?.name})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Office</label>
                      <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm" value={form.assignedOffice} onChange={(e) => setForm({ ...form, assignedOffice: e.target.value })}>
                        <option value="">-- No Office assigned --</option>
                        {offices.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">{editingUser ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Office</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            {user.name ? user.name.substring(0, 2) : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                            <span className="text-xs text-slate-500">{user.username} | {user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                          user.role === 'admin' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                          user.role === 'driver' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {user.assignedOffice?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors p-1" onClick={() => handleEdit(user)} title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="text-slate-400 hover:text-amber-500 transition-colors ml-2 p-1" onClick={() => setResetPw({ userId: user._id, newPassword: '' })} title="Reset Password">
                          <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                        </button>
                        <button className="text-slate-400 hover:text-red-500 transition-colors ml-2 p-1" onClick={() => handleDelete(user._id)} title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total: {users.length} users</span>
            </div>
          </div>
        </div>
      </div>

      {resetPw.userId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setResetPw({ userId: null, newPassword: '' })}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 min-w-[360px] max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Reset Password</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-slate-100" 
                type="password" 
                value={resetPw.newPassword} 
                onChange={(e) => setResetPw({ ...resetPw, newPassword: e.target.value })} 
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors" 
                onClick={() => setResetPw({ userId: null, newPassword: '' })}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" 
                onClick={handleResetPassword}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
