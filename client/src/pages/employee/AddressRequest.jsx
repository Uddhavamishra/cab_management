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
    <div className="page">
      <h1 className="page-title">Address Update</h1>
      <p className="page-subtitle">Submit a new residential address for admin approval</p>

      <div className="card info-card">
        <div className="info-card-header">
          <span className="info-card-icon">📍</span>
          <h3>Current Address</h3>
        </div>
        <p className="info-card-detail">{userInfo?.residentialAddress || 'Not set'}</p>
        {userInfo?.pendingAddress && (
          <div className="pending-notice">
            <span className="badge badge-pending">Pending</span>
            <span>{userInfo.pendingAddress}</span>
          </div>
        )}
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>Request Address Change</h3>
        <div className="form-group">
          <label>New Residential Address</label>
          <textarea
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter your new full residential address"
            rows={3}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {requests.length > 0 && (
        <div className="section">
          <h2 className="section-title">Request History</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Address</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.newAddress}</td>
                    <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
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
