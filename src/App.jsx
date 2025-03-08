import { useState } from "react";
import Login from "./components/login/login";
import SignUp from "./components/sign-up/sign-up";
import AssignmentList from "./components/assignment-list/assignment";


export default function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [user, setUser] = useState(null); // ✅ เก็บข้อมูล user ที่ล็อกอิน

  return (
    <>
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "20px" }}>
        {currentView === 'welcome' && (
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
            <button onClick={() => setCurrentView('login')}>Login</button>
            <button 
              style={{ marginLeft: "10px" }} 
              onClick={() => setCurrentView('signup')}
            >
              Sign Up
            </button>
          </>
        )}

        {currentView === 'login' && (
          <Login 
            onBack={() => setCurrentView('welcome')}
            onLoginSuccess={(userData) => {
              setUser(userData); // ✅ เก็บ user หลังล็อกอิน
              setCurrentView('assignment-list');
            }}
          />
        )}

        {currentView === 'signup' && (
          <SignUp onBack={() => setCurrentView('welcome')} />
        )}

        {currentView === 'assignment-list' && (
          <AssignmentList user={user} />  // ✅ ส่ง user ไปแสดงชื่อ-นามสกุล
        )}
      </div>
    </>
  );
}
