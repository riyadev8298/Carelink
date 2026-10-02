import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        {
          name,
          email,
          password,
        }
      );

      console.log("REGISTER RESPONSE:", response.data);

      // Successful registration message
      setMessage(
        "Registration successful! Your account has been created. Please login to continue."
      );

      // Clear form after successful registration
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // No automatic redirect here.
      // User can click "Go to Login".
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Registration failed. Please check that the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
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
            Create Account
          </h1>

          <p
            style={{
              color: "#71807e",
              margin: 0,
            }}
          >
            Create your CareLink account.
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
              border: "1px solid #b9e5da",
            }}
          >
            <div>{message}</div>

            <button
              type="button"
              onClick={() => navigate("/login")}
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
              Go to Login
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <label
            style={{
              display: "block",
              color: "#15534c",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          {/* Email */}
          <label
            style={{
              display: "block",
              color: "#15534c",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Email
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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <label
            style={{
              display: "block",
              color: "#15534c",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Create Account Button */}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#71807e",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              border: "none",
              background: "none",
              color: "#15917f",
              fontWeight: "700",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Login
          </button>
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

export default Register;