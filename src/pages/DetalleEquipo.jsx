import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function DetalleEquipo() {
  const { id } = useParams();
  const { user } = useAuth();
  const [equipo, setEquipo] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Aquí iría la llamada a tu API para obtener los detalles del equipo
    // Por ahora, simulamos los datos
    setEquipo({
      id: id,
      nombre: 'Equipo Ejemplo',
      logo: 'https://via.placeholder.com/150',
      entrenador: 'Juan Pérez',
      mascota: 'León',
      jugadores: [
        { id: 1, nombre: 'Jugador 1', numero: '10', posicion: 'Delantero' },
        { id: 2, nombre: 'Jugador 2', numero: '1', posicion: 'Portero' }
      ]
    });
  }, [id]);

  if (!equipo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-4">
          <img 
            src={equipo.logo} 
            alt={`Logo ${equipo.nombre}`}
            className="img-fluid mb-3"
          />
        </div>
        <div className="col-md-8">
          <h1>{equipo.nombre}</h1>
          <p><strong>Entrenador:</strong> {equipo.entrenador}</p>
          <p><strong>Mascota:</strong> {equipo.mascota}</p>
          
          <h3>Jugadores</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Nombre</th>
                  <th>Posición</th>
                </tr>
              </thead>
              <tbody>
                {equipo.jugadores.map(jugador => (
                  <tr key={jugador.id}>
                    <td>{jugador.numero}</td>
                    <td>{jugador.nombre}</td>
                    <td>{jugador.posicion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleEquipo;