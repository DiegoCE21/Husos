import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // No password as per your setup
  database: 'sistemahusos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
