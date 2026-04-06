import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
// CORRECCIÓN: De 'admin' a 'api' solo hay dos niveles de subida
import api from '../../api/axios'; 

const ActivityForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAvailable = async () => {
      if (formData.startTime && formData.endTime) {
        setLoadingParticipants(true);
        try {
          const response = await api.get('/groups/available-participants', {
            params: { start: formData.startTime, end: formData.endTime }
          });
          const participants = response.data.data || response.data;
          setAvailableParticipants(Array.isArray(participants) ? participants : []);
        } catch (error) {
          console.error("Error consultando disponibilidad");
        } finally {
          setLoadingParticipants(false);
        }
      }
    };
    fetchAvailable();
  }, [formData.startTime, formData.endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/activities/create', { ...formData, participantIds: selectedIds });
      alert("¡Actividad creada!");
      setFormData({ title: '', description: '', startTime: '', endTime: '', location: '' });
      setSelectedIds([]);
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
      <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] border shadow-sm">
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Calendar className="text-blue-600" /> Detalles
        </h3>
        <div className="space-y-4">
          <input 
            type="text" placeholder="Título" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none"
            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
          />
          <div className="grid grid-cols-2 gap-4">
            <input type="datetime-local" className="p-4 bg-gray-50 border rounded-2xl" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required />
            <input type="datetime-local" className="p-4 bg-gray-50 border rounded-2xl" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} required />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6">
        <h3 className="text-xl font-black flex items-center gap-2"><Users className="text-blue-600" /> Personal Libre</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {availableParticipants.map((p: any) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedIds((prev: any) => prev.includes(p.id) ? prev.filter((id: any) => id !== p.id) : [...prev, p.id])}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedIds.includes(p.id) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600'}`}
            >
              <p className="font-black text-sm uppercase">{p.name}</p>
            </div>
          ))}
        </div>
        <button disabled={submitting || selectedIds.length === 0} className="w-full py-5 bg-black text-white rounded-2xl font-black shadow-xl disabled:opacity-30">
          {submitting ? 'GUARDANDO...' : `CONFIRMAR (${selectedIds.length})`}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;