import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function CabAssignment() {
  const [cabs, setCabs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', driverId: '', officeId: '' });
  const [assignForm, setAssignForm] = useState({ cabId: '', employeeId: '' });

  const fetchData = async () => {
    try {
      const [cabsRes, usersRes, officesRes] = await Promise.all([
        api.get('/admin/cabs'),
        api.get('/admin/users'),
        api.get('/admin/offices'),
      ]);
      setCabs(cabsRes.data);
      setDrivers(usersRes.data.filter(u => u.role === 'driver'));
      setEmployees(usersRes.data.filter(u => u.role === 'employee'));
      setOffices(officesRes.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCab = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/cabs', form);
      toast.success('Cab created');
      setForm({ vehicleNumber: '', driverId: '', officeId: '' });
      setShowForm(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/cabs/${assignForm.cabId}/assign-employee`, { employeeId: assignForm.employeeId });
      toast.success('Employee assigned to cab');
      setAssignForm({ cabId: '', employeeId: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveEmployee = async (cabId, employeeId) => {
    try {
      await api.post(`/admin/cabs/${cabId}/remove-employee`, { employeeId });
      toast.success('Employee removed');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDeleteCab = async (id) => {
    if (!confirm('Delete this cab?')) return;
    try {
      await api.delete(`/admin/cabs/${id}`);
      toast.success('Cab deleted');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const unassignedEmployees = employees.filter(e => !e.assignedCab);

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-background-light dark:bg-background-dark">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cabs & Routes</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your fleet and active service routes</p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add_circle'}</span>
          <span>{showForm ? 'Cancel' : 'Add New Cab'}</span>
        </button>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {showForm && (
            <form className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" onSubmit={handleCreateCab}>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Cab</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Number</label>
                  <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g., MH-01-AB-1234" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Driver</label>
                  <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-slate-100" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                    <option value="">No driver</option>
                    {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.vehicleNumber || 'N/A'})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Office</label>
                  <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-slate-100" value={form.officeId} onChange={(e) => setForm({ ...form, officeId: e.target.value })}>
                    <option value="">Select Office</option>
                    {offices.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Create Cab</button>
            </form>
          )}

          {/* Assign Employee Form */}
          <form className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" onSubmit={handleAssignEmployee}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assign Employee to Cab</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Cab</label>
                <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-slate-100" value={assignForm.cabId} onChange={(e) => setAssignForm({ ...assignForm, cabId: e.target.value })} required>
                  <option value="">Select cab</option>
                  {cabs.map((c) => <option key={c._id} value={c._id}>{c.vehicleNumber} — {c.office?.name || 'No office'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Employee</label>
                <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-slate-100" value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })} required>
                  <option value="">Select employee</option>
                  {unassignedEmployees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Assign Employee</button>
          </form>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plate No</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Office</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passengers</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {cabs.map((cab) => (
                    <tr key={cab._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 font-mono font-medium text-slate-900 dark:text-white text-sm">
                        🚕 {cab.vehicleNumber}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {cab.office?.name || 'No office'}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-900 dark:text-white font-medium">
                        {cab.driver ? `${cab.driver.name} (${cab.driver.phone || 'N/A'})` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-xs text-slate-500 uppercase">{cab.employees?.length || 0} Assigned</span>
                          {cab.employees?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {cab.employees.map((emp) => (
                                <div key={emp._id} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700">
                                  <span>{emp.name}</span>
                                  <button 
                                    className="text-slate-400 hover:text-red-500 ml-1"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveEmployee(cab._id, emp._id); }}
                                    title="Remove Passenger"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteCab(cab._id)}
                          title="Delete Cab"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cabs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No cabs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Total: {cabs.length} cabs</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
