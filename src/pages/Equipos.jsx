// filepath: src/pages/Equipos.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Equipos.css';

function Equipos() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    logo: '',
    entrenador: '',
    mascota: '',
    jugadores: []
  });

  // Simulación de datos con rutas correctas de imágenes
  useEffect(() => {
    const equiposDemo = [
      {
        id: 1,
        nombre: 'Equipo Ejemplo',
        logo: '/images/logos/logo_1.jpg', // Imagen por defecto
        entrenador: 'Juan Pérez',
        mascota: 'León',
        jugadores: [
          { id: 1, nombre: 'Jugador 1', numero: '10', posicion: 'Delantero' },
          { id: 2, nombre: 'Jugador 2', numero: '1', posicion: 'Portero' }
        ]
      }
    ];
    setEquipos(equiposDemo);
  }, []);

  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    e.target.src = '/images/logos/logo_1.jpg'; // Imagen por defecto si falla la carga
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevoEquipo = {
      id: Date.now(),
      ...formData
    };
    setEquipos([...equipos, nuevoEquipo]);
    setFormData({
      nombre: '',
      logo: '',
      entrenador: '',
      mascota: '',
      jugadores: []
    });
    setShowForm(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una URL temporal para la vista previa
      const fileUrl = URL.createObjectURL(file);
      setFormData({...formData, logo: fileUrl});
    }
  };

  return (
    <div className="equipos-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Equipos</h1>
        {user?.role === 'ADMIN' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Agregar Equipo'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h3>Nuevo Equipo</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre del Equipo</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Logo del Equipo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                  required
                />
                {formData.logo && (
                  <img 
                    src={formData.logo} 
                    alt="Vista previa" 
                    className="mt-2"
                    style={{ maxWidth: '200px' }}
                  />
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Entrenador</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.entrenador}
                  onChange={(e) => setFormData({...formData, entrenador: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mascota</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.mascota}
                  onChange={(e) => setFormData({...formData, mascota: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                Guardar Equipo
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 g-4">
        {equipos.map(equipo => (
          <div key={equipo.id} className="col">
            <div className="card team-card h-100">
              <div className="card-header text-center py-3">
                <h5 className="card-title mb-0">{equipo.nombre}</h5>
              </div>
              <div className="card-body p-0">
                <div className="d-flex flex-column flex-md-row">
                  <div className="logo-container">
                    <img 
                      src={equipo.logo} 
                      className="team-logo" 
                      alt={`Logo ${equipo.nombre}`}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="team-details p-3">
                    <div className="team-info">
                      <div className="info-item">
                        <i className="bi bi-person-badge me-2"></i>
                        <span><strong>Entrenador:</strong> {equipo.entrenador}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-star me-2"></i>
                        <span><strong>Mascota:</strong> {equipo.mascota}</span>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = `/equipos/${equipo.id}`}
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Equipos;