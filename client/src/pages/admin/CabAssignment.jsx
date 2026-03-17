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
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cabs & Route Assignment</h1>
          <p className="page-subtitle">Manage cabs, assign drivers and employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Cab'}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleCreateCab}>
          <h3>Create New Cab</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Vehicle Number</label>
              <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g., MH-01-AB-1234" required />
            </div>
            <div className="form-group">
              <label>Assign Driver</label>
              <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                <option value="">No driver</option>
                {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.vehicleNumber || 'N/A'})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Office</label>
              <select value={form.officeId} onChange={(e) => setForm({ ...form, officeId: e.target.value })}>
                <option value="">Select Office</option>
                {offices.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create Cab</button>
        </form>
      )}

      {/* Assign Employee Form */}
      <form className="card form-card" onSubmit={handleAssignEmployee}>
        <h3>Assign Employee to Cab</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Select Cab</label>
            <select value={assignForm.cabId} onChange={(e) => setAssignForm({ ...assignForm, cabId: e.target.value })} required>
              <option value="">Select cab</option>
              {cabs.map((c) => <option key={c._id} value={c._id}>{c.vehicleNumber} — {c.office?.name || 'No office'}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Select Employee</label>
            <select value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {unassignedEmployees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Assign</button>
      </form>

      {/* Cabs list */}
      <div className="cab-list">
        {cabs.map((cab) => (
          <div key={cab._id} className="card cab-card">
            <div className="cab-card-header">
              <div>
                <h3>🚕 {cab.vehicleNumber}</h3>
                <span className="cab-office">{cab.office?.name || 'No office'}</span>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCab(cab._id)}>Delete</button>
            </div>
            <div className="cab-driver">
              <strong>Driver:</strong> {cab.driver ? `${cab.driver.name} (${cab.driver.phone || 'N/A'})` : 'Unassigned'}
            </div>
            <div className="cab-employees">
              <strong>Passengers ({cab.employees?.length || 0}):</strong>
              {cab.employees?.length > 0 ? (
                <ul className="employee-list">
                  {cab.employees.map((emp) => (
                    <li key={emp._id} className="employee-item">
                      <span>{emp.name} — {emp.residentialAddress || 'No address'}</span>
                      <button className="btn btn-xs btn-danger" onClick={() => handleRemoveEmployee(cab._id, emp._id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              ) : <span className="empty-text"> None assigned</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
