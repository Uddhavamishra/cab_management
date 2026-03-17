import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function OfficeManagement() {
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);

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
    <div className="page">
      <h1 className="page-title">Office Management</h1>
      <p className="page-subtitle">Manage the two designated office locations</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Office' : 'Add Office'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Office Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., HQ Office" required />
          </div>
          <div className="form-group">
            <label>Full Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g., 123 Main St, City" required />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add Office'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm({ name: '', address: '' }); }}>Cancel</button>}
        </div>
      </form>

      <div className="cards-grid">
        {offices.map((office) => (
          <div key={office._id} className="card info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🏢</span>
              <h3>{office.name}</h3>
            </div>
            <p className="info-card-detail">{office.address}</p>
            <div className="card-actions">
              <button className="btn btn-sm btn-outline" onClick={() => handleEdit(office)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(office._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
