import React, { useState, useEffect } from 'react';

function Login({ onBack, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // เก็บ mockUser ไว้ใน localStorage (ถ้ายังไม่มี)
    useEffect(() => {
        const savedUser = localStorage.getItem('mockUser');
        if (!savedUser) {
            localStorage.setItem('mockUser', JSON.stringify({ username: 'testuser', password: 'testpass' }));
        }
    }, []);

    const handleLogin = async () => {
        const savedUser = JSON.parse(localStorage.getItem('mockUser'));

        // เช็คกับ mockUser ก่อน
        if (username === savedUser.username && password === savedUser.password) {
            alert('Login successful! (Mock data)');
            onLoginSuccess(savedUser);
            return;
        }

        // ถ้าไม่ใช่ mockUser ให้ลองเรียก API จริง
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Login successful!');
                onLoginSuccess(data);
            } else {
                alert(data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /><br /><br />
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br /><br />
            <button onClick={handleLogin}>Submit</button>
            <br /><br />
            <button onClick={onBack}>Back</button>
        </div>
    );
}

export default Login;
