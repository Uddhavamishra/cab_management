import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function ShiftSelection() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  const fetchData = async () => {
    try {
      const [shiftsRes, currentRes] = await Promise.all([
        api.get('/driver/shifts'),
        api.get('/driver/selected-shift'),
      ]);
      setShifts(shiftsRes.data);
      setSelectedShift(currentRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelect = async (shiftId) => {
    try {
      await api.post('/driver/select-shift', { shiftId });
      toast.success('Shift selected');
      fetchData();
    } catch (err) { toast.error('Failed to select shift'); }
  };

  return (
    <div className="page">
      <h1 className="page-title">Shift Selection</h1>
      <p className="page-subtitle">Choose your preferred shift</p>

      {selectedShift && (
        <div className="card current-shift-card">
          <h3>Current Shift</h3>
          <div className="shift-times">
            <span className="time-badge large">{selectedShift.startTime}</span>
            <span className="shift-arrow">→</span>
            <span className="time-badge large">{selectedShift.endTime}</span>
          </div>
          <p className="shift-office">{selectedShift.office?.name || ''} {selectedShift.label ? `• ${selectedShift.label}` : ''}</p>
        </div>
      )}

      <div className="cards-grid">
        {shifts.map((shift) => (
          <div key={shift._id} className={`card shift-card ${selectedShift?._id === shift._id ? 'selected' : ''}`}>
            <div className="shift-times">
              <span className="time-badge">{shift.startTime}</span>
              <span className="shift-arrow">→</span>
              <span className="time-badge">{shift.endTime}</span>
            </div>
            <p className="shift-label">{shift.label || 'Unnamed Shift'}</p>
            <p className="shift-office">{shift.office?.name || ''}</p>
            <button
              className={`btn btn-full ${selectedShift?._id === shift._id ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => handleSelect(shift._id)}
              disabled={selectedShift?._id === shift._id}
            >
              {selectedShift?._id === shift._id ? 'Selected ✓' : 'Select Shift'}
            </button>
          </div>
        ))}
      </div>

      {shifts.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🕐</span>
          <p>No shifts available for your office</p>
        </div>
      )}
    </div>
  );
}
