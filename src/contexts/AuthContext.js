import React, { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function Dashboard() {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Inscripciones Pendientes</h5>
              <p className="card-text">Gestionar solicitudes de inscripción</p>
              <button className="btn btn-primary">Ver Inscripciones</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Calendario</h5>
              <p className="card-text">Gestionar calendario de partidos</p>
              <button className="btn btn-primary">Administrar Calendario</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Resultados</h5>
              <p className="card-text">Registro de resultados de partidos</p>
              <button className="btn btn-primary">Registrar Resultados</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;