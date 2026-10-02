import React, { useState } from "react";
import axios from "axios";

function EmergencyContact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!name.trim() || !phone.trim() || !relation.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://carelink-9gr4.onrender.com/emergency-contacts/add",
        {
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim(),
        }
      );

      setMessage(
        response.data.message || "Emergency contact saved successfully."
      );

      // Clear form after successful save
      setName("");
      setPhone("");
      setRelation("");
    } catch (err) {
      console.error("Emergency Contact Error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Failed to save emergency contact."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "25px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Emergency Contact
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Add an emergency contact for quick access.
      </p>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Contact Name
          </label>

          <input
            type="text"
            placeholder="Enter contact name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            maxLength="10"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setPhone(value);
            }}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Relation */}
        <div style={{ marginBottom: "22px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Relation
          </label>

          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
          >
            <option value="">Select Relation</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Friend">Friend</option>
            <option value="Guardian">Guardian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: loading ? "#999" : "#007bff",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Emergency Contact"}
        </button>
      </form>
    </div>
  );
}

export default EmergencyContact;