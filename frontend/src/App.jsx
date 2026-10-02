import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate } from "react-router-dom";
import "./index.css";

// Page Components
import Home from "./pages/Home";
import Caregivers from "./pages/Caregiver";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Appointments from "./pages/Appointments";
import MyAppointments from "./pages/MyAppointments";
import EmergencyContact from "./EmergencyContact";
import AdminDashboard from "./pages/AdminDashboard";

// Navigation Bar Component
function NavigationBar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("carelink_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const checkUser = () => {
    try {
      const stored = localStorage.getItem("carelink_user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    window.addEventListener("storage", checkUser);
    window.addEventListener("carelink_auth_change", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("carelink_auth_change", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("carelink_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("carelink_auth_change"));
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">🌿</span> CareLink
      </Link>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          Home
        </NavLink>

        <NavLink
          to="/caregivers"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          Find Caregiver
        </NavLink>

        <NavLink
          to="/appointments"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          Appointments
        </NavLink>

        <NavLink
          to="/my-appointments"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          My Appointments
        </NavLink>

        <NavLink
          to="/emergency-contact"
          className={({ isActive }) =>
            isActive ? "nav-item nav-emergency active" : "nav-item nav-emergency"
          }
        >
          🚨 Emergency
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? "nav-item nav-admin active" : "nav-item nav-admin"
          }
        >
          🛡️ Admin
        </NavLink>

        {currentUser ? (
          <div className="user-nav-box">
            <span className="user-badge" title={currentUser.email}>
              👤 {currentUser.name || "User"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-logout"
              title="Log out of CareLink"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Register
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "nav-item nav-btn active" : "nav-item nav-btn"
              }
            >
              Login
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavigationBar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/caregivers" element={<Caregivers />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/emergency-contact" element={<EmergencyContact />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Fallback to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>© {new Date().getFullYear()} CareLink — Connecting You With Trusted Caregivers.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;