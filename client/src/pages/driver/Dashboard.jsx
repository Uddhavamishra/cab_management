import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function DriverDashboard() {
  const [office, setOffice] = useState(null);
  const [shift, setShift] = useState(null);
  const [manifestCount, setManifestCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [officeRes, shiftRes, manifestRes] = await Promise.allSettled([
          api.get('/driver/office'),
          api.get('/driver/selected-shift'),
          api.get('/driver/manifest'),
        ]);
        if (officeRes.status === 'fulfilled') setOffice(officeRes.value.data);
        if (shiftRes.status === 'fulfilled') setShift(shiftRes.value.data);
        if (manifestRes.status === 'fulfilled') setManifestCount(manifestRes.value.data.manifest?.length || 0);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Driver Dashboard</h1>
      <p className="page-subtitle">Your daily commute overview</p>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTopColor: '#8b5cf6' }}>
          <div className="stat-icon">🏢</div>
          <div className="stat-value">{office?.name || '—'}</div>
          <div className="stat-label">Assigned Office</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#06b6d4' }}>
          <div className="stat-icon">🕐</div>
          <div className="stat-value">{shift ? `${shift.startTime} - ${shift.endTime}` : 'Not selected'}</div>
          <div className="stat-label">Current Shift</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#f59e0b' }}>
          <div className="stat-icon">👩</div>
          <div className="stat-value">{manifestCount}</div>
          <div className="stat-label">Passengers</div>
        </div>
      </div>
    </div>
  );
}
