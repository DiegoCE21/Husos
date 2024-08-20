// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Usar el método get() para acceder a la cookie
    const userCookie = req.cookies.get('user');
    const user = userCookie ? JSON.parse(userCookie.value) : null;

    // Redirigir si el usuario intenta acceder a /admin sin ser admin
    if (url.pathname.startsWith('/admin') && (!user || user.tipoUsuario !== 'admin')) {
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Redirigir si el usuario ya ha iniciado sesión y visita la página de login
    if (url.pathname === '/login' && user) {
        if (user.tipoUsuario === 'admin') {
            url.pathname = '/admin/';
        } else {
            url.pathname = '/user/dashboard';
        }
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'], // Aplica el middleware a las rutas /admin y /login
};
