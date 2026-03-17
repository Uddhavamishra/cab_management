import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function Manifest() {
  const [manifest, setManifest] = useState([]);
  const [cabInfo, setCabInfo] = useState(null);
  const [cancellations, setCancellations] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [manifestRes, cancelRes] = await Promise.all([
        api.get('/driver/manifest'),
        api.get('/driver/cancellations'),
      ]);
      setManifest(manifestRes.data.manifest || []);
      setCabInfo(manifestRes.data.cab || null);
      setCancellations(cancelRes.data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(manifest);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setManifest(items);

    try {
      await api.put('/driver/manifest/reorder', { order: items.map(i => i._id) });
      toast.success('Route order updated');
    } catch (err) { toast.error('Failed to update order'); }
  };

  const acknowledgeCancel = async (id) => {
    try {
      await api.put(`/driver/cancellations/${id}/acknowledge`);
      setCancellations(cancellations.filter(c => c._id !== id));
      toast.success('Acknowledged');
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="page">
      <h1 className="page-title">Passenger Manifest</h1>
      <p className="page-subtitle">Drag to reorder pickup/drop-off route</p>

      {cabInfo && (
        <div className="card cab-info-strip">
          <span>🚕 <strong>{cabInfo.vehicleNumber}</strong></span>
          <span>🏢 {cabInfo.office?.name || '—'}</span>
          <span>👩 {manifest.length} passengers</span>
        </div>
      )}

      {/* Cancellation Alerts */}
      {cancellations.length > 0 && (
        <div className="alert-section">
          {cancellations.map((c) => (
            <div key={c._id} className="alert-card alert-warning">
              <div className="alert-content">
                <strong>{c.employee?.name}</strong> cancelled their <span className="badge badge-rejected">{c.type}</span>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => acknowledgeCancel(c._id)}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="manifest">
          {(provided) => (
            <div className="manifest-list" {...provided.droppableProps} ref={provided.innerRef}>
              {manifest.map((emp, index) => (
                <Draggable key={emp._id} draggableId={emp._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={`manifest-item ${snapshot.isDragging ? 'dragging' : ''} ${emp.cancelledPickup || emp.cancelledDropoff ? 'cancelled' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="manifest-order">{index + 1}</div>
                      <div className="manifest-drag-handle">⠿</div>
                      <div className="manifest-details">
                        <div className="manifest-name">{emp.name}</div>
                        <div className="manifest-phone">📞 {emp.phone || 'N/A'}</div>
                        <div className="manifest-address">📍 {emp.address || 'No address'}</div>
                        {emp.cancelledPickup && <span className="badge badge-rejected">Pickup Cancelled</span>}
                        {emp.cancelledDropoff && <span className="badge badge-rejected">Drop Cancelled</span>}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {manifest.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No passengers assigned to your cab</p>
        </div>
      )}
    </div>
  );
}
