import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function AttendanceView() {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/admin/attendance?date=${date}`);
      setAttendance(res.data);
    } catch (err) { toast.error('Failed to fetch attendance'); }
  };

  useEffect(() => { fetchAttendance(); }, [date]);

  const presentCount = attendance.filter(a => a.present).length;

  return (
    <div className="page">
      <h1 className="page-title">Attendance Tracker</h1>
      <p className="page-subtitle">View daily attendance marked by employees</p>

      <div className="card form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Select Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-pill">
          <span className="stat-pill-value">{attendance.length}</span>
          <span className="stat-pill-label">Total Records</span>
        </div>
        <div className="stat-pill stat-pill-success">
          <span className="stat-pill-value">{presentCount}</span>
          <span className="stat-pill-label">Present</span>
        </div>
        <div className="stat-pill stat-pill-danger">
          <span className="stat-pill-value">{attendance.length - presentCount}</span>
          <span className="stat-pill-label">Absent</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a._id}>
                <td><strong>{a.employee?.name || 'Unknown'}</strong></td>
                <td>{a.employee?.phone || '—'}</td>
                <td>
                  <span className={`badge badge-${a.present ? 'approved' : 'rejected'}`}>
                    {a.present ? 'Present' : 'Absent'}
                  </span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr><td colSpan="3" className="empty-cell">No attendance records for this date</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
