import { useEffect, useState } from 'react';

interface TimerProps {
  time: number; // Cambiado a recibir el tiempo directamente
}

export default function Timer({ time }: TimerProps) {
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div>
      <h3>Tiempo: {formatTime(time)}</h3>
    </div>
  );
}
