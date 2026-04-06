import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, 
  MapPin, 
  Users, 
  Clock, 
  Loader2, 
  ChevronLeft,
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  Rocket,
  UserPlus,
  X
} from 'lucide-react';

const CreateActivity = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[]>('');
  const [success, setSuccess] = useState(false);

  // Estado para participantes disponibles (Vienen del backend)
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    maxParticipants: 20,
    minQuorum: 5,
    startTime: '',
    endTime: ''
  });

  // Efecto para buscar personal libre cuando cambian las fechas
  useEffect(() => {
    const fetchAvailable = async () => {
      if (formData.startTime && formData.endTime) {
        setLoadingStaff(true);
        try {
          const res = await api.get('/activities/available-participants', {
            params: { start: formData.startTime, end: formData.endTime }
          });
          setAvailableStaff(res.data);
        } catch (err) {
          console.error("Error cargando personal libre", err);
        } finally {
          setLoadingStaff(false);
        }
      }
    };
    fetchAvailable();
  }, [formData.startTime, formData.endTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'maxParticipants' || name === 'minQuorum') 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start < new Date()) {
      setError('La actividad no puede iniciar en el pasado.');
      setLoading(false); return;
    }
    if (start >= end) {
      setError('La hora de inicio debe ser previa a la de finalización.');
      setLoading(false); return;
    }

    try {
      const payload = {
        ...formData,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        participantIds: selectedParticipants // Enviamos los IDs seleccionados
      };

      // Sincronizado con @Post('create')
      await api.post('/activities/create', payload);
      
      setSuccess(true);
      setTimeout(() => navigate('/activities'), 1500);
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(message || 'Error crítico en el servidor SIGAC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          <button 
            onClick={() => navigate('/activities')}
            className="group flex items-center gap-2 text-gray-400 font-bold mb-4 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={20}/>
            <span>Volver al Listado</span>
          </button>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 p-8 text-white relative">
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <CalendarPlus size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Nueva Actividad</h1>
                  <p className="text-blue-100 text-sm">Configuración de Orquestación</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-bold">
                    {Array.isArray(error) ? error.join(', ') : error}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título</label>
                  <input name="title" required placeholder="Ej: Auditoría Trimestral" className="form-input-sigac" onChange={handleChange} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea name="description" rows={2} className="form-input-sigac" onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ubicación</label>
                    <input name="location" required className="form-input-sigac" onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max</label>
                      <input name="maxParticipants" type="number" defaultValue={20} className="form-input-sigac" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Quórum</label>
                      <input name="minQuorum" type="number" defaultValue={5} className="form-input-sigac border-blue-100 bg-blue-50" onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Inicio</label>
                    <input name="startTime" type="datetime-local" required className="form-input-sigac" onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Fin</label>
                    <input name="endTime" type="datetime-local" required className="form-input-sigac" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || success} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><span>Publicar Actividad</span> <Rocket size={18}/></>}
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Asignación de Personal Libre */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Personal Libre
              </h2>
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg">
                {selectedParticipants.length} Seleccionados
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {!formData.startTime || !formData.endTime ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock className="mx-auto mb-2 opacity-20" size={32} />
                  <p className="text-xs font-bold">Define las fechas para ver<br/>personal disponible</p>
                </div>
              ) : loadingStaff ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : availableStaff.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs">No hay personal disponible en este rango.</p>
              ) : (
                availableStaff.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => toggleParticipant(user.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedParticipants.includes(user.id) 
                        ? 'border-blue-500 bg-blue-50 shadow-md translate-x-1' 
                        : 'border-gray-100 hover:border-blue-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        selectedParticipants.includes(user.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800">{user.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{user.sector || 'General'}</p>
                      </div>
                    </div>
                    {selectedParticipants.includes(user.id) && <UserPlus size={14} className="text-blue-500" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .form-input-sigac {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          outline: none;
          transition: all 0.2s;
          font-weight: 700;
          color: #374151;
          font-size: 0.875rem;
        }
        .form-input-sigac:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
};

export default CreateActivity;