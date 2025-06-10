import React, { createContext, useContext, useState } from 'react';

const ResultadosContext = createContext();

export function ResultadosProvider({ children }) {
  const [resultadosActualizados, setResultadosActualizados] = useState(false);

  const actualizarResultados = () => {
    setResultadosActualizados(prev => !prev);
  };

  const value = {
    resultadosActualizados,
    actualizarResultados
  };

  return (
    <ResultadosContext.Provider value={value}>
      {children}
    </ResultadosContext.Provider>
  );
}

export const useResultados = () => {
  const context = useContext(ResultadosContext);
  if (!context) {
    throw new Error('useResultados debe usarse dentro de ResultadosProvider');
  }
  return context;
};