import React, { useState } from 'react';

function EditarResultado({ partido, onGuardar }) {
  const [resultados, setResultados] = useState({
    golesLocal: partido.golesLocal || 0,
    golesVisitante: partido.golesVisitante || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...partido,
      ...resultados,
      jugado: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-3">
      <div className="d-flex align-items-center justify-content-between">
        <span>{partido.equipoLocal.nombre}</span>
        <div className="mx-2">
          <input
            type="number"
            min="0"
            className="form-control form-control-sm mx-2"
            style={{ width: '60px' }}
            value={resultados.golesLocal}
            onChange={(e) => setResultados({
              ...resultados,
              golesLocal: parseInt(e.target.value)
            })}
          />
        </div>
        <span>vs</span>
        <div className="mx-2">
          <input
            type="number"
            min="0"
            className="form-control form-control-sm mx-2"
            style={{ width: '60px' }}
            value={resultados.golesVisitante}
            onChange={(e) => setResultados({
              ...resultados,
              golesVisitante: parseInt(e.target.value)
            })}
          />
        </div>
        <span>{partido.equipoVisitante.nombre}</span>
        <button type="submit" className="btn btn-primary btn-sm ms-3">
          Guardar
        </button>
      </div>
    </form>
  );
}

export default EditarResultado;