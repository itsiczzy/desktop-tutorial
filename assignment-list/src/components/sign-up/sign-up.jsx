import React from 'react';

function SignUp({ onBack }) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" }}>
        <h2>Sign Up</h2>
        <input type="text" placeholder="First Name" /><br /><br />
        <input type="text" placeholder="Last Name" /><br /><br />
        <input type="email" placeholder="Email Address" /><br /><br />
        <input type="text" placeholder="Username" /><br /><br />
        <input type="password" placeholder="Password" /><br /><br />
        <input type="password" placeholder="Confirm Password" /><br /><br />
        <button>Create Account</button>
        <br /><br />
        <button onClick={onBack}>Back</button>
      </div>
    );
  }
  
  export default SignUp;