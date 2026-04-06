import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * IMPORTACIÓN DE ESTILOS GLOBALES
 * Asegúrate de que index.css contenga las directivas de Tailwind:
 * @tailwind base; @tailwind components; @tailwind utilities;
 */
import './index.css';

/**
 * PUNTO DE ENTRADA AL DOM (SIGAC INFRASTRUCTURE)
 * Se encarga de montar la aplicación en el div con id 'root' de index.html
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se encontró el elemento raíz 'root' en el index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);