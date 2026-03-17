import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function CabInfo() {
  const [cabInfo, setCabInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCab = async () => {
      try {
        const res = await api.get('/employee/cab-info');
        setCabInfo(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCab();
  }, []);

  if (loading) return <div className="page"><div className="spinner" /></div>;

  if (!cabInfo) {
    return (
      <div className="page">
        <h1 className="page-title">Cab Information</h1>
        <div className="empty-state">
          <span className="empty-icon">🚕</span>
          <p>You haven&apos;t been assigned to a cab yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Cab Information</h1>
      <p className="page-subtitle">Your assigned cab and co-passenger details</p>

      <div className="cards-grid">
        <div className="card info-card">
          <div className="info-card-header">
            <span className="info-card-icon">🚗</span>
            <h3>Driver Details</h3>
          </div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">Name</span><span className="info-value">{cabInfo.driver?.name || '—'}</span></div>
            <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{cabInfo.driver?.phone || '—'}</span></div>
            <div className="info-row"><span className="info-label">Vehicle</span><span className="info-value">{cabInfo.vehicleNumber}</span></div>
          </div>
        </div>

        <div className="card info-card">
          <div className="info-card-header">
            <span className="info-card-icon">🏢</span>
            <h3>Office</h3>
          </div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">Name</span><span className="info-value">{cabInfo.office?.name || '—'}</span></div>
            <div className="info-row"><span className="info-label">Address</span><span className="info-value">{cabInfo.office?.address || '—'}</span></div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Co-passengers ({cabInfo.coPassengers?.length || 0})</h2>
        {cabInfo.coPassengers?.length > 0 ? (
          <div className="cards-grid">
            {cabInfo.coPassengers.map((p) => (
              <div key={p._id} className="card info-card compact">
                <div className="info-card-header">
                  <span className="info-card-icon">👩</span>
                  <h3>{p.name}</h3>
                </div>
                <p className="info-card-detail">📞 {p.phone || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state small">
            <p>No co-passengers assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}
