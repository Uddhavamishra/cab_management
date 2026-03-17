import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function AddressApprovals() {
  const [requests, setRequests] = useState([]);

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
    <div className="page">
      <h1 className="page-title">Address Approvals</h1>
      <p className="page-subtitle">Review and approve/reject employee address change requests</p>

      {pending.length > 0 && (
        <div className="section">
          <h2 className="section-title">Pending Requests ({pending.length})</h2>
          <div className="cards-grid">
            {pending.map((req) => (
              <div key={req._id} className="card info-card pending-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📍</span>
                  <h3>{req.employee?.name || 'Unknown'}</h3>
                </div>
                <div className="address-change">
                  <div className="address-from">
                    <small>Current Address</small>
                    <p>{req.employee?.residentialAddress || 'Not set'}</p>
                  </div>
                  <div className="address-arrow">→</div>
                  <div className="address-to">
                    <small>Requested Address</small>
                    <p>{req.newAddress}</p>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-sm btn-success" onClick={() => handleAction(req._id, 'approved')}>✓ Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleAction(req._id, 'rejected')}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <p>No pending address requests</p>
        </div>
      )}

      {processed.length > 0 && (
        <div className="section">
          <h2 className="section-title">Processed Requests</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>New Address</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {processed.map((req) => (
                  <tr key={req._id}>
                    <td>{req.employee?.name || 'Unknown'}</td>
                    <td>{req.newAddress}</td>
                    <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                    <td>{new Date(req.updatedAt).toLocaleDateString()}</td>
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
