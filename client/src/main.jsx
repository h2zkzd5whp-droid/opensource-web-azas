import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import App from './App.jsx';

// createRoot(domNode, options?) setting start point on index.html

const domNode = document.getElementById('root');

createRoot(domNode).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
