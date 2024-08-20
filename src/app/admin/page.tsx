"use client";

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Link from 'next/link';

interface RegistroFallas {
    IdRegistro: number;
    NumHusoRegistro: string;
    IdFalla: string;
    TiempoRegistro: string;
    FechaRegistro: Date;
    TurnoRegistro: number;
    HoraRegistro: string;
    OrdenProduccion: string;
    NumParadas: number;
    HusosRequeridos: number;
    Estilo: string;
}

export default function AdminDashboard() {
    const [registros, setRegistros] = useState<RegistroFallas[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [fechaFiltro, setFechaFiltro] = useState<string>('');
    const [turnoFiltro, setTurnoFiltro] = useState<number | ''>('');

    useEffect(() => {
        const socketIo = io(); // Conectarse al servidor Socket.io
        setSocket(socketIo);

        const requestData = () => {
            socketIo.emit('requestUpdates', {
                fecha: fechaFiltro,
                turno: turnoFiltro,
            });
        };

        socketIo.on('updateData', (data: RegistroFallas[]) => {
            setRegistros(data);
        });

        // Solicitar datos al conectar
        requestData();

        // Solicitar datos cada vez que cambien los filtros
        // Esto asegura que los datos se actualicen cuando cambie el filtro
        socketIo.on('connect', requestData);

        return () => {
            socketIo.disconnect();
        };
    }, [fechaFiltro, turnoFiltro]);

    

    // Filtrar registros según los valores de los filtros
    const registrosFiltrados = registros.filter(registro => {
        const fechaCoincide = fechaFiltro ? new Date(registro.FechaRegistro).toISOString().slice(0, 10) === fechaFiltro : true;
        const turnoCoincide = turnoFiltro !== '' ? registro.TurnoRegistro === turnoFiltro : true;
        return fechaCoincide && turnoCoincide;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <Link href="/">Ir a Registro</Link>
            </div>
            <div className="filters-container">
                <div className="filter">
                    <label htmlFor="fechaFiltro">Fecha:</label>
                    <input
                        type="date"
                        id="fechaFiltro"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                    />
                </div>
                <div className="filter">
                    <label htmlFor="turnoFiltro">Turno:</label>
                    <input
                        type="number"
                        id="turnoFiltro"
                        value={turnoFiltro === '' ? '' : turnoFiltro}
                        onChange={(e) => setTurnoFiltro(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        min="0"
                    />
                </div>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Numero de Huso</th>
                            <th>Tipo de falla</th>
                            <th>Tiempo de registro</th>
                            <th>Fecha de registro</th>
                            <th>Turno de registro</th>
                            <th>Hora de registro</th>
                            <th>Orden de produccion</th>
                            <th>Numero de parada</th>
                            <th>Husos requeridos</th>
                            <th>Estilo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrosFiltrados.map((registro) => (
                            <tr key={registro.IdRegistro}>
                                <td>{registro.NumHusoRegistro}</td>
                                <td>{registro.IdFalla}</td>
                                <td>{registro.TiempoRegistro}</td>
                                <td>{new Date(registro.FechaRegistro).toISOString().slice(0, 10)}</td>
                                <td>{registro.TurnoRegistro}</td>
                                <td>{registro.HoraRegistro}</td>
                                <td>{registro.OrdenProduccion}</td>
                                <td>{registro.NumParadas}</td>
                                <td>{registro.HusosRequeridos}</td>
                                <td>{registro.Estilo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
