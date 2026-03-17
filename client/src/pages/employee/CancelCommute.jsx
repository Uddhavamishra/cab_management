import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function CancelCommute() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCancellations = async () => {
    try {
      const res = await api.get('/employee/cancellations');
      setCancellations(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCancellations(); }, []);

  const handleCancel = async (type) => {
    setLoading(true);
    try {
      await api.post('/employee/cancel', { type });
      toast.success(`${type === 'pickup' ? 'Pickup' : 'Drop-off'} cancelled successfully`);
      fetchCancellations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
    setLoading(false);
  };

  const pickupCancelled = cancellations.some(c => c.type === 'pickup');
  const dropoffCancelled = cancellations.some(c => c.type === 'dropoff');

  return (
    <div className="page">
      <h1 className="page-title">Cancel Commute</h1>
      <p className="page-subtitle">Cancel your pickup or drop-off (must be at least 2 hours before)</p>

      <div className="cards-grid">
        <div className={`card cancel-card ${pickupCancelled ? 'cancelled' : ''}`}>
          <div className="cancel-card-icon">🌅</div>
          <h3>Pickup</h3>
          <p>Cancel your morning pickup</p>
          {pickupCancelled ? (
            <span className="badge badge-rejected">Cancelled for today</span>
          ) : (
            <button className="btn btn-danger btn-full" onClick={() => handleCancel('pickup')} disabled={loading}>
              Cancel Pickup
            </button>
          )}
        </div>

        <div className={`card cancel-card ${dropoffCancelled ? 'cancelled' : ''}`}>
          <div className="cancel-card-icon">🌇</div>
          <h3>Drop-off</h3>
          <p>Cancel your evening drop-off</p>
          {dropoffCancelled ? (
            <span className="badge badge-rejected">Cancelled for today</span>
          ) : (
            <button className="btn btn-danger btn-full" onClick={() => handleCancel('dropoff')} disabled={loading}>
              Cancel Drop-off
            </button>
          )}
        </div>
      </div>

      <div className="info-notice">
        <span className="info-notice-icon">ℹ️</span>
        <p>Cancellation is only allowed if it&apos;s at least <strong>2 hours</strong> before the shift start (for pickup) or shift end (for drop-off).</p>
      </div>
    </div>
  );
}
