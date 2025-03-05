function Login({ onBack }) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" }}>
        <h2>Login</h2>
        <input type="text" placeholder="Username" /><br /><br />
        <input type="password" placeholder="Password" /><br /><br />
        <button>Submit</button>
        <br /><br />
        <button onClick={onBack}>Back</button>
      </div>
    );
  }
  
  export default Login;
  