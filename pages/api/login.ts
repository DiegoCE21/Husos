import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { serialize } from 'cookie';

type User = {
  email: string;
  password: string;
  tipoUsuario: string;
};

// Función para obtener el usuario por email desde la base de datos
async function getUserByEmail(email: string): Promise<User | null> {
  const [rows]: any[] = await pool.query('SELECT email, password, tipoUsuario FROM usuarios WHERE email = ?', [email]);
  const users: User[] = rows as User[];
  return users.length > 0 ? users[0] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const user = await getUserByEmail(email);

  if (!user || password !== user.password) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // Establecemos la cookie con la información del usuario
  res.setHeader('Set-Cookie', serialize('user', JSON.stringify({
    email: user.email,
    tipoUsuario: user.tipoUsuario,
  }), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 día
  }));

  return res.status(200).json({ 
    message: 'Login correcto', 
    isAdmin: user.tipoUsuario === 'admin' 
  });
}
