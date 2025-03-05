import { useState } from "react";
import Login from "./components/login/login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "20px" }}>
        {!isLoggedIn ? (
          <>
            <h1>Welcome to Assignment Tracker</h1>
            <p>
              Are you tired of losing track of your assignments? Our online assignment tracker
              helps you stay organized, manage your tasks efficiently, and never miss a deadline again!
            </p>
            <p>
              Unlike writing in a notebook, our tool allows you to edit, delete, and manage your assignments
              anytime, anywhere. Say goodbye to messy handwriting and lost notes!
            </p>
            <button onClick={() => setIsLoggedIn(true)}>Login</button>
            <button style={{ marginLeft: "10px" }}>Sign Up</button>
          </>
        ) : (
          <Login onBack={() => setIsLoggedIn(false)} />
        )}
      </div>
    </>
  );
}

export default App;
