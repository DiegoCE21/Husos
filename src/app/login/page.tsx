'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.status === 200) {
            if (data.isAdmin) {
                router.push('/admin/');
            } else {
                router.push('/user/dashboard');
            }
        } else {
            setError(data.message);
        }
    };

    return (
        <div className="containerForm">
            <form onSubmit={handleSubmit} className="form">
                <div className="inputGroup">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="input"
                    />
                </div>
                <div className="inputGroup">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="submitButton">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}
