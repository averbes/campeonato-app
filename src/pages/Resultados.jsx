// filepath: src/pages/Resultados.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { partidosService } from '../services/api';
import './Resultados.css';

function Resultados() {
  const { user } = useAuth();
  
  // Estados para cada sección
  const [tablaPosiciones, setTablaPosiciones] = useState([]);
  const [resultadosPartidos, setResultadosPartidos] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState('todas');
  const [jornadas, setJornadas] = useState([]);

  // Calcular tabla de posiciones
  const calcularPosiciones = (resultados) => {
    const tabla = {};
    
    // Inicializar estadísticas por equipo
    resultados.forEach(partido => {
      [partido.equipoLocal, partido.equipoVisitante].forEach(equipo => {
        if (!tabla[equipo.id]) {
          tabla[equipo.id] = {
            id: equipo.id,
            nombre: equipo.nombre,
            PJ: 0, PG: 0, PE: 0, PP: 0,
            GF: 0, GC: 0, DG: 0, PTS: 0
          };
        }
      });
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

  // Calcular goleadores
  const calcularGoleadores = (resultados) => {
    const goleadoresList = [];
    
    resultados.forEach(partido => {
      if (partido.jugado && partido.goleadores) {
        partido.goleadores.forEach(goleador => {
          const existente = goleadoresList.find(g => 
            g.jugador === goleador.jugador && g.equipo === goleador.equipo
          );
          
          if (existente) {
            existente.goles += goleador.goles;
          } else {
            goleadoresList.push({
              jugador: goleador.jugador,
              equipo: goleador.equipo,
              goles: goleador.goles
            });
          }
        });
      }
    });

    return goleadoresList.sort((a, b) => b.goles - a.goles).slice(0, 10);
  };

  // Obtener jornadas únicas
  const obtenerJornadas = (resultados) => {
    const jornadasUnicas = [...new Set(resultados.map(p => p.jornada))].sort();
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
  }, []);

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
      
      {/* Resultados de Partidos */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Resultados de Partidos</h3>
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
                        <th>Visitante</th>
                        <th className="text-center">Goles</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partidosFiltrados.map((partido, index) => (
                        <tr key={index}>
                          <td><span className="badge bg-secondary">J{partido.jornada}</span></td>
                          <td>{partido.equipoLocal?.nombre || 'Equipo Local'}</td>
                          <td className="text-center fw-bold">
                            {partido.jugado ? (partido.golesLocal || 0) : '-'}
                          </td>
                          <td>{partido.equipoVisitante?.nombre || 'Equipo Visitante'}</td>
                          <td className="text-center fw-bold">
                            {partido.jugado ? (partido.golesVisitante || 0) : '-'}
                          </td>
                          <td>
                            <span className={`badge ${partido.jugado ? 'bg-success' : 'bg-warning'}`}>
                              {partido.jugado ? 'Finalizado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted">No hay partidos para mostrar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Posiciones y Goleadores */}
      <div className="row">
        {/* Tabla de Posiciones */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Tabla de Posiciones</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Pos</th>
                      <th>Equipo</th>
                      <th>PJ</th>
                      <th>G</th>
                      <th>E</th>
                      <th>P</th>
                      <th>GF</th>
                      <th>GC</th>
                      <th>DG</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaPosiciones.map((equipo, index) => (
                      <tr key={equipo.id} className={index < 3 ? 'table-success' : ''}>
                        <td className="fw-bold">{index + 1}</td>
                        <td>{equipo.nombre}</td>
                        <td>{equipo.PJ}</td>
                        <td>{equipo.PG}</td>
                        <td>{equipo.PE}</td>
                        <td>{equipo.PP}</td>
                        <td>{equipo.GF}</td>
                        <td>{equipo.GC}</td>
                        <td className={`fw-bold ${equipo.DG > 0 ? 'text-success' : equipo.DG < 0 ? 'text-danger' : ''}`}>
                          {equipo.DG > 0 ? '+' : ''}{equipo.DG}
                        </td>
                        <td className="fw-bold text-primary">{equipo.PTS}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Goleadores */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h3 className="card-title mb-0">Goleadores</h3>
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
                        <th>Goles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goleadores.map((goleador, index) => (
                        <tr key={index} className={index === 0 ? 'table-warning' : ''}>
                          <td className="fw-bold">{index + 1}</td>
                          <td>{goleador.jugador}</td>
                          <td><small>{goleador.equipo}</small></td>
                          <td className="fw-bold text-center">{goleador.goles}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted">No hay goleadores registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resultados;