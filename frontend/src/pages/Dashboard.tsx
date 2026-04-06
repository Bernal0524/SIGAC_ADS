import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Rocket, 
  ShieldCheck, 
  Bell,
  LogOut,
  Activity as ActivityIcon,
  Loader2,
  Plus
} from 'lucide-react';

interface Stats {
  totalActivities: number;
  myEnrollments: number;
  upcomingEvents: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    myEnrollments: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Intentamos traer datos reales, si falla (por el back) ponemos ceros
        const [activitiesRes, enrollRes] = await Promise.all([
          api.get('/activities').catch(() => ({ data: [] })),
          api.get('/activities/my-enrollments').catch(() => ({ data: [] }))
        ]);

        const activities = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];
        const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];

        setStats({
          totalActivities: activities.length,
          myEnrollments: enrollments.length,
          upcomingEvents: activities.filter((a: any) => new Date(a.startTime) > new Date()).length
        });
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isCoordinator = user?.role === 'COORDINADOR';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* Sidebar - Panel Izquierdo */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">SIGAC</span>
        </div>

        <nav className="p-6 space-y-2 flex-grow">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 p-4 bg-blue-50 text-blue-600 rounded-2xl font-black transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => navigate('/activities')} className="w-full flex items-center gap-4 p-4 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-2xl font-bold transition-all">
            <ActivityIcon size={20} /> Actividades
          </button>
          <button onClick={() => navigate('/availability')} className="w-full flex items-center gap-4 p-4 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-2xl font-bold transition-all">
            <Clock size={20} /> Disponibilidad
          </button>
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-50 rounded-2xl font-bold transition-all">
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10 lg:p-14 overflow-y-auto">
        
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋
            </h1>
            <p className="text-gray-500 font-medium mt-1">Panel de {user?.role?.toLowerCase() || 'operador'} • SIGAC Orquestación</p>
          </div>

          <div className="flex items-center gap-4">
            {isCoordinator && (
              <button 
                onClick={() => navigate('/activities')} 
                className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus size={20} /> Nueva Actividad
              </button>
            )}
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-all">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ActivityIcon size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Actividades</p>
                  <p className="text-3xl font-black text-gray-900">{stats.totalActivities}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-all">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Inscrito</p>
                  <p className="text-3xl font-black text-gray-900">{stats.myEnrollments}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-all">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Próximos</p>
                  <p className="text-3xl font-black text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE ORQUESTACIÓN Y DISPONIBILIDAD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tarjeta de Disponibilidad - EL CORE DEL DASHBOARD AHORA */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                      <Clock size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Disponibilidad de Equipo</h2>
                </div>
                <p className="text-gray-400 font-medium mb-8">
                  {isCoordinator 
                    ? "Gestiona los horarios de los participantes para asignar misiones sin conflictos." 
                    : "Actualiza tus horarios libres para que el sistema te asigne automáticamente."
                  }
                </p>
                <button 
                  onClick={() => navigate('/availability')}
                  className="w-full bg-gray-900 text-white px-8 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  {isCoordinator ? "Ver Cuadrante de Disponibilidad" : "Configurar mis Horarios"} <ChevronRight size={20} />
                </button>
              </div>

              {/* Acceso rápido a Actividades */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                  <Rocket size={120} className="-rotate-12" />
                </div>
                <h2 className="text-3xl font-black mb-4">Panel de<br/>Actividades</h2>
                <p className="text-blue-100 font-medium mb-8 max-w-[250px]">
                  Gestiona las misiones actuales y asigna participantes según disponibilidad.
                </p>
                <button 
                  onClick={() => navigate('/activities')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                  Ver Misiones <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
          SIGAC INFRASTRUCTURE MANAGEMENT • 2026
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;