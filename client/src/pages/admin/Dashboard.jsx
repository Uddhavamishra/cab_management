import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ employees: 0, drivers: 0, cabs: 0, offices: 0, pendingAddresses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, cabsRes, officesRes, addressRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/cabs'),
          api.get('/admin/offices'),
          api.get('/admin/address-requests'),
        ]);
        setStats({
          employees: usersRes.data.filter(u => u.role === 'employee').length,
          drivers: usersRes.data.filter(u => u.role === 'driver').length,
          cabs: cabsRes.data.length,
          offices: officesRes.data.length,
          pendingAddresses: addressRes.data.filter(r => r.status === 'pending').length,
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Employees', value: stats.employees, icon: '👩', color: '#8b5cf6' },
    { label: 'Drivers', value: stats.drivers, icon: '🚗', color: '#06b6d4' },
    { label: 'Cabs', value: stats.cabs, icon: '🚕', color: '#f59e0b' },
    { label: 'Offices', value: stats.offices, icon: '🏢', color: '#10b981' },
    { label: 'Pending Addresses', value: stats.pendingAddresses, icon: '📍', color: '#ef4444' },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Overview of your cab management system</p>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
