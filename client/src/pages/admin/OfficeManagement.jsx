import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function OfficeManagement() {
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchOffices = async () => {
    try {
      const res = await api.get('/admin/offices');
      setOffices(res.data);
    } catch (err) { toast.error('Failed to fetch offices'); }
  };

  useEffect(() => { fetchOffices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/offices/${editingId}`, form);
        toast.success('Office updated');
      } else {
        await api.post('/admin/offices', form);
        toast.success('Office created');
      }
      setForm({ name: '', address: '' });
      setEditingId(null);
      fetchOffices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (office) => {
    setEditingId(office._id);
    setForm({ name: office.name, address: office.address });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this office?')) return;
    try {
      await api.delete(`/admin/offices/${id}`);
      toast.success('Office deleted');
      fetchOffices();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Office Locations</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', address: '' }); }}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add_business'}</span>
            {showForm ? 'Cancel' : 'Add Office'}
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Page Intro */}
        <div className="max-w-4xl">
          <p className="text-slate-500 dark:text-slate-400">Manage your branch network and physical work locations for employees and cabs.</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Offices</p>
            <p className="text-3xl font-black text-primary">{offices.length}</p>
          </div>
        </div>

        {showForm && (
          <form className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" onSubmit={(e) => { handleSubmit(e); setShowForm(false); }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Office' : 'Add New Office'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Office Name</label>
                <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., HQ Office" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
                <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g., 123 Main St, City" required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">{editingId ? 'Update Office' : 'Save Office'}</button>
              {editingId && (
                <button type="button" className="px-6 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium" onClick={() => { setEditingId(null); setForm({ name: '', address: '' }); setShowForm(false); }}>Cancel</button>
              )}
            </div>
          </form>
        )}

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Office Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {offices.map((office) => (
                <tr key={office._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">apartment</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{office.name}</p>
                        <p className="text-xs text-slate-500">Branch</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{office.address}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={() => { handleEdit(office); setShowForm(true); }}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={() => handleDelete(office._id)}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {offices.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">domain_disabled</span>
                    <p className="text-sm">No offices registered yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total: {offices.length} offices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
