import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '' });
  const [resetPw, setResetPw] = useState({ userId: null, newPassword: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) { toast.error('Failed to fetch users'); }
  };

  useEffect(() => { fetchUsers(); }, []);

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
      setForm({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', role: user.role, name: user.name, phone: user.phone || '', vehicleNumber: user.vehicleNumber || '', residentialAddress: user.residentialAddress || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
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
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage drivers and employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingUser(null); setForm({ username: '', password: '', role: 'employee', name: '', phone: '', vehicleNumber: '', residentialAddress: '' }); }}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editingUser} />
            </div>
            {!editingUser && (
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            )}
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {form.role === 'driver' && (
              <div className="form-group">
                <label>Vehicle Number</label>
                <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
              </div>
            )}
            {form.role === 'employee' && (
              <div className="form-group">
                <label>Residential Address</label>
                <input value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} />
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Office</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.username}</td>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                <td>{user.phone || '—'}</td>
                <td>{user.assignedOffice?.name || '—'}</td>
                <td className="actions-cell">
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="btn btn-sm btn-outline" onClick={() => setResetPw({ userId: user._id, newPassword: '' })}>Reset PW</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetPw.userId && (
        <div className="modal-overlay" onClick={() => setResetPw({ userId: null, newPassword: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={resetPw.newPassword} onChange={(e) => setResetPw({ ...resetPw, newPassword: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setResetPw({ userId: null, newPassword: '' })}>Cancel</button>
              <button className="btn btn-primary" onClick={handleResetPassword}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
