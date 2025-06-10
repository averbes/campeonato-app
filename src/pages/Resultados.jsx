import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { partidosService } from '../services/api';
import './Resultados.css';

function Resultados() {
  const { user } = useAuth();
  const [partidos, setPartidos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    equipoLocalId: '',
    equipoVisitanteId: '',
    golesLocal: '',
    golesVisitante: '',
    fecha: '',
    hora: ''
  });
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [equiposData, resultadosData] = await Promise.all([
          partidosService.getEquipos(),
          partidosService.getResultados()
        ]);
        setEquipos(equiposData);
        setPartidos(resultadosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nuevoPartido = {
        equipoLocalId: parseInt(formData.equipoLocalId),
        equipoVisitanteId: parseInt(formData.equipoVisitanteId),
        golesLocal: parseInt(formData.golesLocal),
        golesVisitante: parseInt(formData.golesVisitante),
        fecha: formData.fecha,
        hora: formData.hora,
        jugado: true
      };

      const partidoGuardado = await partidosService.guardarResultado(nuevoPartido);
      setPartidos([...partidos, partidoGuardado]);
      
      // Limpiar formulario y cerrar
      setShowForm(false);
      setFormData({
        equipoLocalId: '',
        equipoVisitanteId: '',
        golesLocal: '',
        golesVisitante: '',
        fecha: '',
        hora: ''
      });

      // Actualizar tabla de posiciones
      const resultadosActualizados = await partidosService.getResultados();
      // Aquí podrías emitir un evento o usar un contexto para actualizar Posiciones
      
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      // Mostrar mensaje de error al usuario
    }
  };
  
  return (
    <div className="resultados-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Resultados de Partidos</h2>
        {user?.role === 'ADMIN' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Agregar Resultado'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Equipo Local</label>
                    <select 
                      className="form-select"
                      value={formData.equipoLocalId}
                      onChange={(e) => setFormData({...formData, equipoLocalId: e.target.value})}
                      required
                    >
                      <option value="">Seleccione equipo local</option>
                      {equipos.map(equipo => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Goles Local</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.golesLocal}
                      onChange={(e) => setFormData({...formData, golesLocal: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Equipo Visitante</label>
                    <select 
                      className="form-select"
                      value={formData.equipoVisitanteId}
                      onChange={(e) => setFormData({...formData, equipoVisitanteId: e.target.value})}
                      required
                    >
                      <option value="">Seleccione equipo visitante</option>
                      {equipos.map(equipo => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Goles Visitante</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.golesVisitante}
                      onChange={(e) => setFormData({...formData, golesVisitante: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Hora</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                Guardar Resultado
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="resultados-lista">
        {partidos.map(partido => (
          <div key={partido.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="equipo-local text-end">
                  <h5>{partido.equipoLocal.nombre}</h5>
                  <span className="resultado">{partido.golesLocal}</span>
                </div>
                <div className="versus mx-3">VS</div>
                <div className="equipo-visitante text-start">
                  <h5>{partido.equipoVisitante.nombre}</h5>
                  <span className="resultado">{partido.golesVisitante}</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  {new Date(partido.fecha).toLocaleDateString()} - {partido.hora}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resultados;