import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, ArrowLeft, Save, AlertCircle, ShieldAlert } from 'lucide-react';

const EditActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    maxParticipants: 10,
    minQuorum: 1
  });

  // Usamos useCallback para que la función sea estable y no dispare efectos innecesarios
  const loadActivity = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(''); // Limpiamos errores previos antes de reintentar
      
      const res = await api.get(`/activities/${id}`);
      const data = res.data;

      if (!data) {
        throw new Error('No se encontraron datos para esta orquestación.');
      }

      // VALIDACIÓN DE ESTADO: Bloqueo visual si no es PROPUESTA
      if (data.status !== 'PROPUESTA') {
        setIsEditable(false);
        setError(`Edición deshabilitada: La actividad se encuentra en estado ${data.status}.`);
      }
      
      // Formateo de fechas para el input datetime-local (YYYY-MM-DDTHH:mm)
      // Usamos un fallback de string vacío para evitar que el input se vuelva "uncontrolled"
      setFormData({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
        endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
        maxParticipants: data.maxParticipants || 10,
        minQuorum: data.minQuorum || 1
      });

    } catch (err: any) {
      console.error("Error al cargar actividad:", err);
      setError(err.response?.data?.message || 'Error crítico: No se pudo conectar con la orquestación.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable || saving) return;

    setSaving(true);
    setError('');

    try {
      await api.patch(`/activities/${id}`, {
        ...formData,
        maxParticipants: Number(formData.maxParticipants),
        minQuorum: Number(formData.minQuorum),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });
      navigate('/activities');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la actualización.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-400 font-black text-[10px] tracking-widest uppercase">Sincronizando con SIGAC...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/activities')} 
          className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          VOLVER AL PANEL
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
          
          {/* Overlay de Bloqueo */}
          {!isEditable && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center p-10 text-center">
              <ShieldAlert size={64} className="text-red-500 mb-4 animate-pulse" />
              <h2 className="text-2xl font-black text-gray-900 mb-2 italic">ACCESO RESTRINGIDO</h2>
              <p className="text-gray-600 font-bold text-sm mb-6 uppercase tracking-tight max-w-xs">{error}</p>
              <button 
                onClick={() => navigate('/activities')}
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg"
              >
                REGRESAR AL SISTEMA
              </button>
            </div>
          )}

          <h1 className="text-3xl font-black text-gray-900 mb-2 italic">Editar Actividad</h1>
          <p className="text-blue-600 font-bold text-[10px] tracking-[0.3em] uppercase mb-8">Ajuste de Parámetros de Orquestación</p>

          {error && isEditable && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Título del Proyecto</label>
              <input 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Descripción Técnica</label>
              <textarea 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Ubicación / Sala</label>
              <input 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Inicio</label>
                <input 
                  type="datetime-local"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Fin</label>
                <input 
                  type="datetime-local"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Cupo Máximo</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                  value={formData.maxParticipants}
                  onChange={e => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Mín. Quórum</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                  value={formData.minQuorum}
                  onChange={e => setFormData({...formData, minQuorum: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving || !isEditable}
              className="w-full py-5 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl font-black text-xs tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} /> 
                  ACTUALIZAR DATOS EN SISTEMA
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditActivity;