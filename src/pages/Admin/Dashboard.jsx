import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

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
      </div>
    </div>
  );
}

export default Dashboard;