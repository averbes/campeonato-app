// filepath: src/contexts/ResultadosContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { partidosService } from '../services/api';

const ResultadosContext = createContext();

export const useResultados = () => {
  const context = useContext(ResultadosContext);
  if (!context) {
    throw new Error('useResultados debe usarse dentro de ResultadosProvider');
  }
  return context;
};

export const ResultadosProvider = ({ children }) => {
  const [resultados, setResultados] = useState([]);
  const [resultadosActualizados, setResultadosActualizados] = useState(0);
  const [cargando, setCargando] = useState(false);

  const cargarResultados = async () => {
    try {
      setCargando(true);
      const data = await partidosService.getResultados();
      setResultados(data);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarResultado = async (partidoActualizado) => {
    try {
      // Aquí harías la llamada a la API para actualizar
      await partidosService.actualizarResultado(partidoActualizado);
      
      // Actualizar el estado local
      setResultados(prev => 
        prev.map(partido => 
          partido.id === partidoActualizado.id ? partidoActualizado : partido
        )
      );
      
      // Trigger para que otros componentes sepan que hay cambios
      setResultadosActualizados(prev => prev + 1);
    } catch (error) {
      console.error('Error al actualizar resultado:', error);
      throw error;
    }
  };

  useEffect(() => {
    cargarResultados();
  }, []);

  const value = {
    resultados,
    resultadosActualizados,
    cargando,
    cargarResultados,
    actualizarResultado
  };

  return (
    <ResultadosContext.Provider value={value}>
      {children}
    </ResultadosContext.Provider>
  );
};