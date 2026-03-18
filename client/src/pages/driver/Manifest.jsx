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
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Passenger Manifest</h1>
        <p className="text-slate-500 text-sm">Drag to reorder pickup/drop-off route</p>
      </header>

      {cabInfo && (
        <div className="flex flex-wrap items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl mb-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">local_taxi</span>
            <strong className="text-slate-800 dark:text-white">{cabInfo.vehicleNumber}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">corporate_fare</span>
            <span className="text-slate-600 dark:text-slate-300">{cabInfo.office?.name || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">groups</span>
            <span className="text-slate-600 dark:text-slate-300">{manifest.length} passengers</span>
          </div>
        </div>
      )}

      {/* Cancellation Alerts */}
      {cancellations.length > 0 && (
        <div className="space-y-3 mb-8">
          {cancellations.map((c) => (
            <div key={c._id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <div className="text-sm text-red-800 dark:text-red-200">
                  <strong className="font-bold">{c.employee?.name}</strong> cancelled their <span className="uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-800/50 rounded ml-1">{c.type}</span>
                </div>
              </div>
              <button 
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => acknowledgeCancel(c._id)}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="manifest">
          {(provided) => (
            <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
              {manifest.map((emp, index) => (
                <Draggable key={emp._id} draggableId={emp._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border ${snapshot.isDragging ? 'bg-slate-50 border-primary ring-2 ring-primary/20 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} ${emp.cancelledPickup || emp.cancelledDropoff ? 'opacity-60 bg-slate-50' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div 
                        className="text-slate-400 cursor-grab hover:text-slate-600 px-2"
                        {...provided.dragHandleProps}
                      >
                        <span className="material-symbols-outlined">drag_indicator</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-800 truncate">{emp.name}</h4>
                          {emp.cancelledPickup && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-600 rounded">Pickup Cancelled</span>}
                          {emp.cancelledDropoff && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-600 rounded">Drop Cancelled</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span> {emp.phone || 'N/A'}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {emp.address || 'No address'}</span>
                        </div>
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
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl mt-4">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">receipt_long</span>
          <p className="text-slate-500 font-medium">No passengers assigned to your cab</p>
        </div>
      )}
    </div>
  );
}
