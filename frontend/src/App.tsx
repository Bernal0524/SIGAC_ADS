import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importación de Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ActivitiesList from './pages/ActivitiesList';
import CreateActivity from './pages/CreateActivity';
import EditActivity from './pages/EditActivity'; // <-- IMPORTANTE: Importa la nueva página
import AvailabilityManager from './pages/Availability/AvailabilityManager';

/**
 * SIGAC - Orquestador Principal de Rutas
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* --- RUTAS PROTEGIDAS (Cualquier usuario logueado: Colaboradores y Coordinadores) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activities" element={<ActivitiesList />} />
            <Route path="/availability" element={<AvailabilityManager />} />
          </Route>

          {/* --- RUTAS EXCLUSIVAS (Solo COORDINADORES) --- */}
          <Route element={<ProtectedRoute allowedRoles={['COORDINADOR']} />}>
            <Route path="/create-activity" element={<CreateActivity />} />
            {/* ESTA ES LA RUTA QUE FALTABA: 
                El ":id" permite que React identifique qué actividad quieres editar 
            */}
            <Route path="/edit-activity/:id" element={<EditActivity />} />
          </Route>

          {/* --- REDIRECCIÓN POR DEFECTO --- */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* --- MANEJO DE 404 PERSONALIZADO --- */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
              <h1 className="text-9xl font-black text-gray-200">404</h1>
              <p className="text-2xl font-bold text-gray-800 mt-4 tracking-tight">
                Parece que te has perdido en la orquestación.
              </p>
              <p className="text-gray-400 font-medium mt-2">La ruta que buscas no existe o no tienes permisos.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                Volver al Sistema
              </button>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;