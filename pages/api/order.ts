import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { orderNumber, selectedStyle, stopCount } = req.body;
    console.log("Request received with data:", { orderNumber, selectedStyle, stopCount });

    try {
      const [checkRows]: [RowDataPacket[], any] = await pool.query(`
        SELECT Estilo, NumParadas 
        FROM OP 
        WHERE NumOp = ?
      `, [orderNumber]);
      console.log("Check rows:", checkRows);

      if (checkRows.length > 0) {
        const currentStyle = checkRows[0].Estilo;
        const currentStopCount = checkRows[0].NumParadas;
        console.log("Current style and stop count:", { currentStyle, currentStopCount });

        if (currentStyle !== selectedStyle || currentStopCount !== stopCount) {
          await pool.query(`
            UPDATE OP 
            SET Estilo = ?, NumParadas = ?
            WHERE NumOp = ?
          `, [selectedStyle, stopCount, orderNumber]);

          console.log("Order updated successfully.");
          return res.status(200).json({ success: true, message: 'Orden actualizada correctamente.' });
        } else {
          console.log("No changes in order.");
          return res.status(200).json({ success: true, message: 'No hay cambios en la orden.' });
        }
      } else {
        await pool.query(`
          INSERT INTO OP (NumOp, Estilo, NumParadas)
          VALUES (?, ?, ?)
        `, [orderNumber, selectedStyle, stopCount]);

        console.log("Order inserted successfully.");
        return res.status(200).json({ success: true, message: 'Orden insertada correctamente.' });
      }
    } catch (error) {
      console.error('Error al manejar la orden:', error);
      return res.status(500).json({ success: false, error: 'Error en la base de datos.' });
    }
  } else {
    res.status(405).json({ message: 'Only POST method is allowed' });
  }
}
