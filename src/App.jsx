import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Equipos from './pages/Equipos';
import Posiciones from './pages/Posiciones';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
              <Route path="/equipos" element={<Equipos />} />
              <Route path="/posiciones" element={<Posiciones />} />
              
              {/* ...otras rutas */}
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;