import React, { useState } from 'react';

function Login({ onBack, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok) {
                // ตรวจสอบว่าโปรไฟล์ผู้ใช้มีจริง
                if (data.message === "fail" && data.result?.error_msg === "no user profile found.") {
                    alert('User profile not found. Please check your credentials.');
                    return;  // ถ้าไม่พบโปรไฟล์ผู้ใช้จะไม่เก็บข้อมูลลง localStorage
                }

                alert('Login successful!');
                localStorage.setItem('userData', JSON.stringify(data)); // เก็บข้อมูลลงใน localStorage
                onLoginSuccess(data); // ส่งข้อมูลไปที่ฟังก์ชัน onLoginSuccess
            } else {
                alert(data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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
                disabled={loading}
            /><br /><br />
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            /><br /><br />
            <button onClick={handleLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Submit'}
            </button>
            <br /><br />
            <button onClick={onBack} disabled={loading}>Back</button>
        </div>
    );
}

export default Login;
