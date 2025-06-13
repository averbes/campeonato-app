// filepath: src/pages/Posiciones.jsx
// filepath: src/pages/Posiciones.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResultados } from '../contexts/ResultadosContext';
import { partidosService } from '../services/api';
import './Posiciones.css';

function Posiciones() {
  const { user } = useAuth();
  const { resultadosActualizados } = useResultados();
  
  const [tablaPosiciones, setTablaPosiciones] = useState([]);
  const [resultadosPartidos, setResultadosPartidos] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState('todas');
  const [jornadas, setJornadas] = useState([]);

  console.log('ResultadosContext:', resultadosActualizados);

  // Calcular tabla de posiciones
  const calcularPosiciones = (resultados) => {
    const tabla = {};
    
    // Inicializar estadísticas por equipo
    resultados.forEach(partido => {
      // Inicializar equipo local
      if (!tabla[partido.equipoLocal.id]) {
        tabla[partido.equipoLocal.id] = {
          id: partido.equipoLocal.id,
          nombre: partido.equipoLocal.nombre,
          PJ: 0, PG: 0, PE: 0, PP: 0,
          GF: 0, GC: 0, DG: 0, PTS: 0
        };
      }
      
      // Inicializar equipo visitante
      if (!tabla[partido.equipoVisitante.id]) {
        tabla[partido.equipoVisitante.id] = {
          id: partido.equipoVisitante.id,
          nombre: partido.equipoVisitante.nombre,
          PJ: 0, PG: 0, PE: 0, PP: 0,
          GF: 0, GC: 0, DG: 0, PTS: 0
        };
      }
    });

    // Calcular estadísticas
    resultados.forEach(partido => {
      if (partido.jugado) {
        const local = tabla[partido.equipoLocal.id];
        const visitante = tabla[partido.equipoVisitante.id];

        local.PJ++;
        visitante.PJ++;
        local.GF += partido.golesLocal || 0;
        local.GC += partido.golesVisitante || 0;
        visitante.GF += partido.golesVisitante || 0;
        visitante.GC += partido.golesLocal || 0;

        if (partido.golesLocal > partido.golesVisitante) {
          local.PG++;
          local.PTS += 3;
          visitante.PP++;
        } else if (partido.golesLocal < partido.golesVisitante) {
          visitante.PG++;
          visitante.PTS += 3;
          local.PP++;
        } else {
          local.PE++;
          visitante.PE++;
          local.PTS += 1;
          visitante.PTS += 1;
        }
      }
    });

    return Object.values(tabla).map(equipo => ({
      ...equipo,
      DG: equipo.GF - equipo.GC
    })).sort((a, b) => 
      b.PTS - a.PTS || b.DG - a.DG || b.GF - a.GF
    );
  };

  // Calcular tabla de goleadores
  const calcularGoleadores = (resultados) => {
    const goleadoresList = [];
    
    // Simulamos goleadores basados en los goles de cada partido
    resultados.forEach(partido => {
      if (partido.jugado) {
        // Simular goleadores del equipo local
        if (partido.golesLocal > 0) {
          const jugadoresLocal = partido.goleadoresLocal || [`Jugador ${partido.equipoLocal.nombre.split(' ')[0]}`];
          jugadoresLocal.forEach((jugador, index) => {
            if (index < partido.golesLocal) {
              const existente = goleadoresList.find(g => 
                g.jugador === jugador && g.equipo === partido.equipoLocal.nombre
              );
              
              if (existente) {
                existente.goles += 1;
              } else {
                goleadoresList.push({
                  jugador: jugador,
                  equipo: partido.equipoLocal.nombre,
                  goles: 1
                });
              }
            }
          });
        }
        
        // Simular goleadores del equipo visitante
        if (partido.golesVisitante > 0) {
          const jugadoresVisitante = partido.goleadoresVisitante || [`Jugador ${partido.equipoVisitante.nombre.split(' ')[0]}`];
          jugadoresVisitante.forEach((jugador, index) => {
            if (index < partido.golesVisitante) {
              const existente = goleadoresList.find(g => 
                g.jugador === jugador && g.equipo === partido.equipoVisitante.nombre
              );
              
              if (existente) {
                existente.goles += 1;
              } else {
                goleadoresList.push({
                  jugador: jugador,
                  equipo: partido.equipoVisitante.nombre,
                  goles: 1
                });
              }
            }
          });
        }
      }
    });

    return goleadoresList.sort((a, b) => b.goles - a.goles).slice(0, 10);
  };

  // Obtener jornadas únicas
  const obtenerJornadas = (resultados) => {
    const jornadasUnicas = [...new Set(resultados.map(p => p.jornada))].sort((a, b) => a - b);
    return jornadasUnicas;
  };

  // Filtrar partidos por jornada
  const filtrarPorJornada = (partidos) => {
    if (jornadaSeleccionada === 'todas') return partidos;
    return partidos.filter(p => p.jornada === parseInt(jornadaSeleccionada));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const resultados = await partidosService.getResultados();
        
        // Calcular todas las estadísticas
        const posiciones = calcularPosiciones(resultados);
        const goleadoresList = calcularGoleadores(resultados);
        const jornadasList = obtenerJornadas(resultados);
        
        setTablaPosiciones(posiciones);
        setResultadosPartidos(resultados);
        setGoleadores(goleadoresList);
        setJornadas(jornadasList);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [resultadosActualizados]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error al cargar los datos</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando resultados y estadísticas...</p>
      </div>
    );
  }

  const partidosFiltrados = filtrarPorJornada(resultadosPartidos);

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4 text-center">Resultados y Estadísticas</h1>
      
      {/* Resultados de Partidos por Jornadas */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Resultados de Partidos
              </h3>
              <select 
                className="form-select form-select-sm w-auto"
                value={jornadaSeleccionada}
                onChange={(e) => setJornadaSeleccionada(e.target.value)}
              >
                <option value="todas">Todas las jornadas</option>
                {jornadas.map(jornada => (
                  <option key={jornada} value={jornada}>
                    Jornada {jornada}
                  </option>
                ))}
              </select>
            </div>
            <div className="card-body">
              {partidosFiltrados.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Jornada</th>
                        <th>Local</th>
                        <th className="text-center">Goles</th>
                        <th className="text-center">VS</th>
                        <th className="text-center">Goles</th>
                        <th>Visitante</th>
                        <th className="text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partidosFiltrados.map((partido, index) => (
                        <tr key={partido.id || index}>
                          <td>
                            <span className="badge bg-secondary">J{partido.jornada}</span>
                          </td>
                          <td className="fw-bold">{partido.equipoLocal?.nombre || 'Equipo Local'}</td>
                          <td className="text-center fw-bold text-primary fs-4">
                            {partido.jugado ? (partido.golesLocal || 0) : '-'}
                          </td>
                          <td className="text-center text-muted">vs</td>
                          <td className="text-center fw-bold text-primary fs-4">
                            {partido.jugado ? (partido.golesVisitante || 0) : '-'}
                          </td>
                          <td className="fw-bold">{partido.equipoVisitante?.nombre || 'Equipo Visitante'}</td>
                          <td className="text-center">
                            <span className={`badge ${partido.jugado ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {partido.jugado ? 'Finalizado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-futbol fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No hay partidos para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fila con Tabla de Posiciones y Goleadores */}
      <div className="row">
        {/* Tabla de Posiciones */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-trophy me-2"></i>
                Tabla de Posiciones
              </h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Pos</th>
                      <th>Equipo</th>
                      <th>PJ</th>
                      <th>PG</th>
                      <th>PE</th>
                      <th>PP</th>
                      <th>GF</th>
                      <th>GC</th>
                      <th>DG</th>
                      <th>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaPosiciones.length > 0 ? (
                      tablaPosiciones.map((equipo, index) => (
                        <tr key={equipo.id} className={
                          index === 0 ? 'table-warning' : 
                          index < 3 ? 'table-success' : 
                          index >= tablaPosiciones.length - 2 ? 'table-danger' : ''
                        }>
                          <td className="fw-bold">
                            {index === 0 && <i className="fas fa-crown text-warning me-1"></i>}
                            {index + 1}
                          </td>
                          <td className="fw-bold">{equipo.nombre}</td>
                          <td>{equipo.PJ}</td>
                          <td>{equipo.PG}</td>
                          <td>{equipo.PE}</td>
                          <td>{equipo.PP}</td>
                          <td>{equipo.GF}</td>
                          <td>{equipo.GC}</td>
                          <td className={`fw-bold ${equipo.DG > 0 ? 'text-success' : equipo.DG < 0 ? 'text-danger' : ''}`}>
                            {equipo.DG > 0 ? '+' : ''}{equipo.DG}
                          </td>
                          <td className="fw-bold text-primary fs-5">{equipo.PTS}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <i className="fas fa-table fa-2x text-muted mb-2"></i>
                          <p className="text-muted mb-0">No hay datos disponibles</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Leyenda */}
              <div className="mt-3">
                <small className="text-muted">
                  <span className="badge bg-warning text-dark me-2">1°</span> Campeón
                  <span className="badge bg-success me-2 ms-2">2°-3°</span> Clasificación
                  <span className="badge bg-danger ms-2">Últimos</span> Descenso
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Goleadores */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h3 className="card-title mb-0">
                <i className="fas fa-futbol me-2"></i>
                Goleadores
              </h3>
            </div>
            <div className="card-body">
              {goleadores.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Pos</th>
                        <th>Jugador</th>
                        <th>Equipo</th>
                        <th className="text-center">Goles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goleadores.map((goleador, index) => (
                        <tr key={`${goleador.jugador}-${goleador.equipo}`} 
                            className={index === 0 ? 'table-warning' : ''}>
                          <td className="fw-bold">
                            {index === 0 && <i className="fas fa-medal text-warning me-1"></i>}
                            {index + 1}
                          </td>
                          <td className="fw-bold">{goleador.jugador}</td>
                          <td>
                            <small className="text-muted">{goleador.equipo}</small>
                          </td>
                          <td className="text-center fw-bold text-success fs-5">
                            {goleador.goles}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-user-slash fa-2x text-muted mb-2"></i>
                  <p className="text-muted mb-0">No hay goleadores registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posiciones;