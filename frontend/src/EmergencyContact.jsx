
import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://carelink-9gr4.onrender.com";

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

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanRelation = relation.trim();

    if (!cleanName || !cleanPhone || !cleanRelation) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios({
        method: "POST",
        url: `${API_BASE_URL}/emergency-contacts/add`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          name: cleanName,
          phone: cleanPhone,
          relation: cleanRelation,
        },
        timeout: 30000,
      });

      console.log("Emergency Contact Response:", response.data);

      setMessage(
        response.data?.message ||
          "Emergency contact saved successfully."
      );

      setName("");
      setPhone("");
      setRelation("");

    } catch (err) {
      console.error(
        "Emergency Contact Error:",
        err.response?.data || err.message
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            `Server error (${err.response.status}).`
        );
      } else if (err.request) {
        setError(
          "Cannot connect to CareLink server. Please try again."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
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
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
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
            background: "#d4edda",
            color: "#155724",
            borderRadius: "6px",
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
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label>Contact Name</label>

          <input
            type="text"
            placeholder="Enter contact name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>Phone Number</label>

          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            maxLength={10}
            onChange={(e) => {
              setPhone(
                e.target.value.replace(/\D/g, "")
              );
            }}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "22px" }}>
          <label>Relation</label>

          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff",
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "6px",
            background: loading ? "#999" : "#007bff",
            color: "#fff",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : "Save Emergency Contact"}
        </button>
      </form>
    </div>
  );
}

export default EmergencyContact;
