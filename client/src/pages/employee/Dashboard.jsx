import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [cabInfo, setCabInfo] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cabRes, attRes] = await Promise.allSettled([
          api.get('/employee/cab-info'),
          api.get('/employee/attendance'),
        ]);
        if (cabRes.status === 'fulfilled') setCabInfo(cabRes.value.data);
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Welcome, {user?.name}</h1>
      <p className="page-subtitle">Your daily commute dashboard</p>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTopColor: '#8b5cf6' }}>
          <div className="stat-icon">🚕</div>
          <div className="stat-value">{cabInfo?.vehicleNumber || '—'}</div>
          <div className="stat-label">Your Cab</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#06b6d4' }}>
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{cabInfo?.driver?.name || '—'}</div>
          <div className="stat-label">Driver</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#f59e0b' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{cabInfo?.coPassengers?.length || 0}</div>
          <div className="stat-label">Co-passengers</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: attendance?.present ? '#10b981' : '#ef4444' }}>
          <div className="stat-icon">{attendance?.present ? '✅' : '❌'}</div>
          <div className="stat-value">{attendance?.present ? 'Present' : 'Not Marked'}</div>
          <div className="stat-label">Today&apos;s Attendance</div>
        </div>
      </div>
    </div>
  );
}
