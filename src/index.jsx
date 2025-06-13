import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResultadosProvider } from './contexts/ResultadosContext';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ResultadosProvider>
          <App />
        </ResultadosProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);