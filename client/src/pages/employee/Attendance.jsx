import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function Attendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/employee/attendance');
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const toggleAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.post('/employee/attendance');
      setAttendance(res.data);
      toast.success(res.data.present ? 'Marked as present!' : 'Marked as absent');
    } catch (err) { toast.error('Failed to update attendance'); }
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <h1 className="page-title">Daily Attendance</h1>
      <p className="page-subtitle">{today}</p>

      <div className="attendance-card">
        <div className={`attendance-status ${attendance?.present ? 'present' : 'absent'}`}>
          <span className="attendance-icon">{attendance?.present ? '✅' : '⬜'}</span>
          <h2>{attendance?.present ? 'You are marked as PRESENT' : 'You are NOT marked for today'}</h2>
        </div>
        <button
          className={`btn btn-full btn-lg ${attendance?.present ? 'btn-outline' : 'btn-success'}`}
          onClick={toggleAttendance}
          disabled={loading}
        >
          {loading ? 'Updating...' : attendance?.present ? 'Mark as Absent' : 'Mark as Present'}
        </button>
      </div>
    </div>
  );
}
