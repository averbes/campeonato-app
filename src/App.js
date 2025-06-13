import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResultadosProvider } from './contexts/ResultadosContext';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Equipos from './pages/Equipos';
import Calendario from './pages/Calendario';
import Posiciones from './pages/Posiciones';
import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DetalleEquipo from './pages/DetalleEquipo';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <ResultadosProvider>
        <Router>
          <div className="app-container d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <div className="container-fluid py-4">
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/equipos" element={<Equipos />} />
                  <Route path="/equipos/:id" element={<DetalleEquipo />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/posiciones" element={<Posiciones />} />
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </ResultadosProvider>
    </AuthProvider>
  );
}

export default App;