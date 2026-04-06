import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  maxParticipants: number;
  minQuorum: number;
  startTime: string;
  endTime: string;
  status: 'PROPUESTA' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';
  _count: {
    participants: number;
  };
  isUserEnrolled: boolean;
  admin?: { name: string; sector: string };
}

const ActivitiesList = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCoordinator = user.role === 'COORDINADOR';

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (error) {
      showFeedback('error', 'No se pudieron sincronizar las actividades.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: 'error' | 'success', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  const handleEnrollment = async (activityId: string) => {
    try {
      await api.post(`/activities/${activityId}/join`);
      showFeedback('success', 'Operación de inscripción actualizada.');
      fetchActivities();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error en la inscripción.';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar actividad definitivamente?")) return;
    try {
      await api.delete(`/activities/${id}`);
      showFeedback('success', 'Actividad eliminada.');
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      showFeedback('error', 'No se pudo eliminar la actividad.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/activities/${id}/status`, { status: newStatus });
      showFeedback('success', `Estado actualizado a ${newStatus}`);
      fetchActivities();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al cambiar estado.';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const filteredActivities = activities.filter(act => 
    act.title.toLowerCase().includes(filter.toLowerCase()) ||
    act.location.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Panel de Control</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Alexander Management System</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por aula o título..."
                className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 w-full md:w-64 font-bold shadow-sm transition-all"
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {isCoordinator && (
              <button 
                onClick={() => navigate('/create-activity')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={24} />
                <span className="hidden md:inline font-black pr-2">NUEVA</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {statusMessage.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top border-2 ${
            statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm uppercase tracking-tight">{statusMessage.text}</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-black text-xs tracking-widest">CARGANDO ORQUESTACIÓN...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => {
              const isClosed = activity.status === 'CANCELADA' || activity.status === 'FINALIZADA';
              
              return (
                <div key={activity.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all flex flex-col group overflow-hidden">
                  
                  {/* Status Header */}
                  <div className="p-6 pb-2 flex justify-between items-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                      activity.status === 'CONFIRMADA' ? 'bg-green-50 text-green-600 border-green-100' :
                      activity.status === 'CANCELADA' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {activity.status}
                    </span>
                    
                    {isCoordinator && (
                      <div className="flex gap-1">
                        {!isClosed && (
                          <button 
                            onClick={() => navigate(`/edit-activity/${activity.id}`)}
                            className="text-gray-300 hover:text-blue-500 transition-colors p-2"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(activity.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-8 pt-2 space-y-4 flex-grow">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </h2>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2 uppercase italic">
                      {activity.description || 'Información técnica no especificada.'}
                    </p>

                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-3 text-gray-700 font-bold text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Clock className="text-blue-500" size={14} />
                        {formatDate(activity.startTime)}
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 font-bold text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <MapPin className="text-blue-500" size={14} />
                        {activity.location}
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 font-bold text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Users className="text-blue-500" size={14} />
                        {activity._count.participants} / {activity.maxParticipants} (Min: {activity.minQuorum})
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 bg-gray-50/50 border-t border-gray-50 mt-auto">
                    {isCoordinator ? (
                      isClosed ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-gray-400 font-black text-[10px] tracking-widest uppercase bg-gray-100 rounded-xl">
                          <Lock size={12} /> Registro Bloqueado
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(activity.id, 'CONFIRMADA')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-[10px] tracking-widest transition-all shadow-md active:scale-95"
                          >
                            CONFIRMAR
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(activity.id, 'CANCELADA')}
                            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all active:scale-95"
                          >
                            CANCELAR
                          </button>
                        </div>
                      )
                    ) : (
                      <button 
                        onClick={() => handleEnrollment(activity.id)}
                        className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                          activity.status !== 'PROPUESTA' 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-blue-600 shadow-lg active:scale-95'
                        }`}
                        disabled={activity.status !== 'PROPUESTA'}
                      >
                        {activity.status !== 'PROPUESTA' ? 'INSCRIPCIÓN CERRADA' : <>UNIRSE AL EVENTO <ArrowRight size={14} /></>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;