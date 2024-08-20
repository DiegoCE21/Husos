const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'sistemahusos',
  connectionLimit: 10,
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Request updates with optional filters
    socket.on('requestUpdates', async (filters = {}) => {
      try {
        const { fecha = '', turno = '' } = filters;

        const connection = await pool.getConnection();
        let query = 'SELECT * FROM registrofallas';
        const params = [];

        // Apply filters
        if (fecha || turno !== '') {
          query += ' WHERE';
          if (fecha) {
            query += ' DATE(FechaRegistro) = ?';
            params.push(new Date(fecha).toISOString().split('T')[0]); // Format date for MySQL
          }
          if (turno !== '') {
            if (fecha) query += ' AND';
            query += ' TurnoRegistro = ?';
            params.push(turno);
          }
        }

        const [rows] = await connection.query(query, params);
        connection.release();
        socket.emit('updateData', rows);
      } catch (error) {
        console.error('Error fetching data:', error);
        socket.emit('error', 'Failed to fetch data');
      }
    });

    // Example of emitting updates periodically (every 10 seconds)
    // Remove this if not needed
    setInterval(async () => {
      try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM registrofallas');
        connection.release();
        io.emit('updateData', rows);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 10000); // 10000 ms = 10 seconds

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
