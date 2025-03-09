import React, { useState } from 'react';

function SignUp({ onBack }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState(null);

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/signup_profile?username=${username}&password=${password}&first_name=${firstName}&last_name=${lastName}&email=${email}&student_id=${studentId}`, {
                method: 'GET'
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully!");
                onBack(); // กลับไปหน้า login
            } else {
                setError(data.message || "Failed to create an account.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" }}>
            <h2>Sign Up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} /><br /><br />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /><br /><br />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /><br /><br />
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /><br /><br />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} /><br /><br />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />
            <button onClick={handleSignUp}>Create Account</button>
            <br /><br />
            <button onClick={onBack}>Back</button>
        </div>
    );
}

export default SignUp;