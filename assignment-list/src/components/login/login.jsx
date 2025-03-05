import React, { useState } from 'react';

function Login({ onBack, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Simple login validation 
        // In a real app, you'd replace this with actual authentication
        if (username === 'user' && password === 'password') {
            onLoginSuccess();
        } else {
            alert('Invalid username or password');
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