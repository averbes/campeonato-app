// filepath: src/pages/Posiciones.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResultados } from '../contexts/ResultadosContext';
import { partidosService } from '../services/api';
import './Posiciones.css';

function Posiciones() {
  const { user } = useAuth();
  const { resultadosActualizados } = useResultados();
  console.log('Contexto de resultados:', { resultadosActualizados });
  const [tablaPosiciones, setTablaPosiciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estructura de datos para la tabla de posiciones
  const calcularPosiciones = (resultados) => {
    const tabla = {};
    
    // Inicializar estadísticas por equipo
    resultados.forEach(partido => {
      if (!tabla[partido.equipoLocal.id]) {
        tabla[partido.equipoLocal.id] = {
          id: partido.equipoLocal.id,
          nombre: partido.equipoLocal.nombre,
          PJ: 0, // Partidos jugados
          PG: 0, // Partidos ganados
          PE: 0, // Partidos empatados
          PP: 0, // Partidos perdidos
          GF: 0, // Goles a favor
          GC: 0, // Goles en contra
          DG: 0, // Diferencia de goles
          PTS: 0 // Puntos
        };
      }
      // Similar para equipo visitante
    });

    // Calcular estadísticas
    resultados.forEach(partido => {
      if (partido.jugado) {
        const local = tabla[partido.equipoLocal.id];
        const visitante = tabla[partido.equipoVisitante.id];

        local.PJ++;
        visitante.PJ++;
        local.GF += partido.golesLocal;
        local.GC += partido.golesVisitante;
        visitante.GF += partido.golesVisitante;
        visitante.GC += partido.golesLocal;

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

    // Calcular diferencia de goles y convertir a array
    return Object.values(tabla).map(equipo => ({
      ...equipo,
      DG: equipo.GF - equipo.GC
    })).sort((a, b) => 
      b.PTS - a.PTS || b.DG - a.DG || b.GF - a.GF
    );
  };

  useEffect(() => {
    const cargarPosiciones = async () => {
      try {
        const resultados = await partidosService.getResultados();
        const posiciones = calcularPosiciones(resultados);
        setTablaPosiciones(posiciones);
        setCargando(false);
      } catch (error) {
        console.error('Error al cargar las posiciones:', error);
        setCargando(false);
      }
    };

    cargarPosiciones();
  }, [resultadosActualizados]); // Se ejecuta cuando hay nuevos resultados

  if (cargando) {
    return <div className="text-center py-4">Cargando tabla de posiciones...</div>;
  }

  return (
    <div className="posiciones-container">
      <h2 className="mb-4">Tabla de Posiciones</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Pos.</th>
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
            {tablaPosiciones.map((equipo, index) => (
              <tr key={equipo.id}>
                <td>{index + 1}</td>
                <td>{equipo.nombre}</td>
                <td>{equipo.PJ}</td>
                <td>{equipo.PG}</td>
                <td>{equipo.PE}</td>
                <td>{equipo.PP}</td>
                <td>{equipo.GF}</td>
                <td>{equipo.GC}</td>
                <td>{equipo.DG}</td>
                <td className="fw-bold">{equipo.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Posiciones;