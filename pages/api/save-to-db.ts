import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { RowDataPacket } from 'mysql2/promise';  // Importa los tipos correctos

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data, orderNumber, stopCount } = req.body;

    if (!data || data.length === 0) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún dato para insertar' });
    }

    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const fechaRegistro = `${year}-${month}-${day}`;
    const horaRegistro = currentTime.toTimeString().split(' ')[0];
    const turnoRegistro = currentTime.getHours() >= 6 && currentTime.getHours() < 14 ? 1 : 2;

    try {
      const numParadas = await getNumParadas(fechaRegistro, turnoRegistro, orderNumber);

      const values = data.map((row: any) => [
        row.NumHusoRegistro,
        row.IdFalla,
        row.TiempoRegistro,
        fechaRegistro,
        turnoRegistro,
        horaRegistro,
        orderNumber,  // Incluye el número de orden de producción
        numParadas,
        row.Estilo
      ]);

      if (values.length === 0) {
        return res.status(400).json({ success: false, message: 'No hay valores para insertar' });
      }

      const queryRegistroFallas = 
        `INSERT INTO registrofallas (
          NumHusoRegistro, IdFalla, TiempoRegistro, FechaRegistro, TurnoRegistro, HoraRegistro, 
          OrdenProduccion, NumParadas, Estilo
        ) VALUES ?`;

      const queryOP = 
        `INSERT INTO OP (NumOp, NumParadas)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE NumParadas = VALUES(NumParadas)`;

      // Obtener la conexión manualmente
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Inserción en la tabla OP
        await connection.query(queryOP, [orderNumber, stopCount]);

        // Inserción en la tabla registrofallas
        await connection.query(queryRegistroFallas, [values]);

        await connection.commit();
        res.status(200).json({ success: true });
      } catch (error) {
        await connection.rollback();
        if (error instanceof Error) {
          console.error('Error al insertar datos en la base de datos:', error.message);
          res.status(500).json({ success: false, error: error.message });
        } else {
          console.error('Error inesperado:', error);
          res.status(500).json({ success: false, error: 'Error desconocido' });
        }
      } finally {
        connection.release();  // Asegurarse de liberar la conexión
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al obtener datos para insertar:', error.message);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error('Error inesperado:', error);
        res.status(500).json({ success: false, error: 'Error desconocido' });
      }
    }
  } else {
    res.status(405).json({ message: 'Only POST method is allowed' });
  }
}

const getNumParadas = async (fecha: string, turno: number, numOrder: string): Promise<number> => {
  const query = 
    `SELECT COUNT(DISTINCT CONCAT(FechaRegistro, ' ', HoraRegistro)) AS numParadas
    FROM registrofallas
    WHERE FechaRegistro = ?
    AND TurnoRegistro = ?
    AND OrdenProduccion = ?`;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(query, [fecha, turno, numOrder]);
    return (rows[0]?.numParadas || 0) + 1;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener NumParadas:', error.message);
    } else {
      console.error('Error inesperado:', error);
    }
    return 1;
  }
};
