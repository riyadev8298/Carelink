import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        {
          email: email.trim(),
          password: password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      const user = response.data.user;

      if (user) {
        localStorage.setItem(
          "carelink_user",
          JSON.stringify(user)
        );

        // Update Navbar immediately
        window.dispatchEvent(
          new Event("carelink_auth_change")
        );
      }

      // Show successful login message
      setMessage(
        "Login successful! You are now logged in to CareLink."
      );

      // Clear password field after successful login
      setPassword("");

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Login failed. Unable to connect to the backend server (http://localhost:5000). Please check that it is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const redirectPath = location.state?.from || "/caregivers";
    const redirectState = location.state?.redirectState || null;

    navigate(redirectPath, {
      state: redirectState,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "white",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#15917f",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            CARELINK
          </div>

          <h1
            style={{
              color: "#15534c",
              margin: "10px 0",
              fontSize: "30px",
            }}
          >
            Welcome Back
          </h1>

          <p
            style={{
              color: "#71807e",
              margin: 0,
            }}
          >
            Login to manage your appointments and caregivers.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#fff1f1",
              color: "#c0392b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "14px",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            style={{
              background: "#eaf8f3",
              color: "#15917f",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid #b7e4d8",
            }}
          >
            <div>{message}</div>

            <button
              type="button"
              onClick={handleContinue}
              style={{
                display: "block",
                margin: "12px auto 0",
                border: "none",
                background: "#15917f",
                color: "white",
                padding: "9px 20px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Continue to Caregivers
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <label
            style={{
              display: "block",
              color: "#15534c",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d5e5e1",
              borderRadius: "8px",
              marginBottom: "16px",
              outline: "none",
              fontSize: "14px",
            }}
          />

          {/* Password */}
          <label
            style={{
              display: "block",
              color: "#15534c",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d5e5e1",
              borderRadius: "8px",
              marginBottom: "20px",
              outline: "none",
              fontSize: "14px",
            }}
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: loading ? "#9abdb7" : "#15917f",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#71807e",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#15917f",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Register
          </Link>
        </div>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            marginTop: "18px",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#f1f5f4",
            color: "#15534c",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Login;