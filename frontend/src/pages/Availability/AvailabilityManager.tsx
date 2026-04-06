import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Clock, 
  Calendar, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Estructura ajustada para match con Prisma
 */
interface Availability {
  id?: string;
  dayOfWeek: number;
  startTime: string | Date;
  endTime: string | Date;
}

const DAYS_MAP: { [key: string]: number } = {
  'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6
};

// Inverso para mostrar en la tabla
const REVERSE_DAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const AvailabilityManager = () => {
  const navigate = useNavigate();
  
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newDay, setNewDay] = useState('Lunes');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAvailability();
  }, []);

  /**
   * Helper para convertir "08:00" en un ISO String que Prisma entienda
   */
  const formatTimeToISO = (timeStr: string) => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return today.toISOString();
  };

  /**
   * Helper para extraer "HH:mm" de un ISO String del backend
   */
  const formatISOToTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // CORRECCIÓN: Endpoint correcto definido en el Controller
      const response = await api.get('/availability');
      setAvailabilities(response.data || []);
    } catch (error) {
      console.error("Error cargando disponibilidad:", error);
      showFeedback('error', 'No se pudo cargar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: 'error' | 'success', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleAddRow = () => {
    if (newStart >= newEnd) {
      showFeedback('error', 'La hora de inicio debe ser menor a la de fin');
      return;
    }
    
    const dayNum = DAYS_MAP[newDay];
    
    // Validar traslape local rápido
    const exists = availabilities.find(a => 
      a.dayOfWeek === dayNum && 
      formatISOToTime(a.startTime as string) === newStart
    );

    if (exists) {
      showFeedback('error', 'Esta franja ya existe en tu lista');
      return;
    }

    const newItem: Availability = {
      dayOfWeek: dayNum,
      startTime: formatTimeToISO(newStart),
      endTime: formatTimeToISO(newEnd)
    };

    setAvailabilities([...availabilities, newItem]);
  };

  const handleRemoveRow = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // CORRECCIÓN: Usar el endpoint 'sync' masivo que creamos en el backend
      await api.post('/availability/sync', { 
        availabilities: availabilities.map(({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime,
          endTime
        }))
      });
      showFeedback('success', '¡Disponibilidad guardada con éxito!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al guardar.';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200 text-gray-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mi Disponibilidad</h1>
              <p className="text-gray-500 font-medium">Gestiona tus horarios para la orquestación SIGAC</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Panel de Agregar (Izquierda) */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} /> Nueva Franja
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Día</label>
                <select 
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                >
                  {Object.keys(DAYS_MAP).filter(d => d !== 'Domingo').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entrada</label>
                  <input 
                    type="time" 
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Salida</label>
                  <input 
                    type="time" 
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleAddRow}
                className="w-full mt-4 bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Agregar a la lista
              </button>
            </div>
          </div>

          {/* Tabla de Franjas (Derecha) */}
          <div className="md:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} /> Horarios Configurados
              </h2>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold">Cargando disponibilidad...</p>
              </div>
            ) : availabilities.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Calendar size={32} />
                </div>
                <p className="text-gray-400 font-bold">No has definido horarios todavía.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Día</th>
                      <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</th>
                      <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilities.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map((item, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="p-5 font-bold text-gray-700">{REVERSE_DAYS_MAP[item.dayOfWeek]}</td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black border border-blue-100">
                            {formatISOToTime(item.startTime as string)} - {formatISOToTime(item.endTime as string)}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
          SIGAC INFRASTRUCTURE MANAGEMENT • 2026
        </p>
      </div>
    </div>
  );
};

export default AvailabilityManager;