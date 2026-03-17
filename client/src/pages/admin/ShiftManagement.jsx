import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState({ startTime: '', office: '', label: '' });

  const fetchData = async () => {
    try {
      const [shiftsRes, officesRes] = await Promise.all([
        api.get('/admin/shifts'),
        api.get('/admin/offices'),
      ]);
      setShifts(shiftsRes.data);
      setOffices(officesRes.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/shifts', form);
      toast.success('Shift created');
      setForm({ startTime: '', office: '', label: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await api.delete(`/admin/shifts/${id}`);
      toast.success('Shift deleted');
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  // Calculate end time preview
  const getEndTime = (start) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    return `${String((h + 9) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="page">
      <h1 className="page-title">Shift Management</h1>
      <p className="page-subtitle">Create 9-hour shifts by selecting a start time</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>Create New Shift</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            {form.startTime && <small className="form-hint">End time: {getEndTime(form.startTime)} (auto-calculated)</small>}
          </div>
          <div className="form-group">
            <label>Office</label>
            <select value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })} required>
              <option value="">Select Office</option>
              {offices.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Label (optional)</label>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Morning Shift" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Create Shift</button>
      </form>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Office</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{shift.label || '—'}</td>
                <td><span className="time-badge">{shift.startTime}</span></td>
                <td><span className="time-badge">{shift.endTime}</span></td>
                <td>{shift.office?.name || '—'}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(shift._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
