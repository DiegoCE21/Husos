import React from 'react';
import Cell from './Cell';

interface GridProps {
  isRegisterActive: boolean;
  showAlert: () => void;
}

export default function Grid({ isRegisterActive, showAlert }: GridProps) {
  const totalCells = 256;

  // Generar celdas para el lado operación (1-128)
  const operationCells = Array.from({ length: 128 }, (_, index) => {
    const cellNumber = index + 1;

    return (
      <Cell
        key={cellNumber}
        number={cellNumber}
        isRegisterActive={isRegisterActive}
        showAlert={showAlert}
      />
    );
  });

  const transmissionCells = Array.from({ length: 124 }, (_, index) => {
    const cellNumber = index + 133; // Comienza en 133

    return (
      <Cell
        key={cellNumber}
        number={cellNumber}
        isRegisterActive={isRegisterActive}
        showAlert={showAlert}
      />
    );
  });

  return (
    <div className="container-grid">
      <div className="row">
        <h2>Lado operación</h2>
        <div className="grid-row">{operationCells}</div>
      </div>
      <div className="row">
        <h2>Lado transmisión</h2>
        <div className="grid-row">{transmissionCells}</div>
      </div>
    </div>
  );
}
