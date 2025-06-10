import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ResultadosProvider } from './contexts/ResultadosContext';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ResultadosProvider>
        <App />
      </ResultadosProvider>
    </AuthProvider>
  </React.StrictMode>
);