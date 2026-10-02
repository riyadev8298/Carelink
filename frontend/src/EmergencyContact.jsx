import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://carelink-9gr4.onrender.com";

function EmergencyContact() {
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all saved emergency contacts from backend (manual refresh / post-action)
  const fetchContacts = async () => {
    try {
      setErrorMessage("");
      const response = await axios.get(`${API_BASE_URL}/emergency-contacts`);
      const list = Array.isArray(response.data) ? response.data : [];
      setContacts(list);

      if (list.length > 0) {
        localStorage.setItem("carelink_emergency_contact", JSON.stringify(list[0]));
      }
    } catch (error) {
      console.error("GET EMERGENCY CONTACTS ERROR:", error);
      setErrorMessage(
        "Failed to load emergency contacts. Please verify backend is running at http://localhost:5000."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    let ignore = false;

    axios
      .get(`${API_BASE_URL}/emergency-contacts`)
      .then((response) => {
        if (!ignore) {
          const list = Array.isArray(response.data) ? response.data : [];
          setContacts(list);
          if (list.length > 0) {
            localStorage.setItem("carelink_emergency_contact", JSON.stringify(list[0]));
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("GET EMERGENCY CONTACTS ERROR:", error);
        if (!ignore) {
          setErrorMessage(
            "Failed to load emergency contacts. Please verify backend is running at http://localhost:5000."
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveContact = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!contactName.trim() || !phone.trim() || !relation) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/emergency-contacts/add`,
        {
          name: contactName.trim(),
          phone: cleanPhone,
          relation: relation,
        }
      );

      const newContact = response.data.contact;
      setMessage("Emergency contact saved successfully! 🚨");

      if (newContact) {
        localStorage.setItem(
          "carelink_emergency_contact",
          JSON.stringify(newContact)
        );
      }

      setContactName("");
      setPhone("");
      setRelation("");

      await fetchContacts();
    } catch (error) {
      console.error("SAVE EMERGENCY CONTACT ERROR:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to save emergency contact."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this emergency contact?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/emergency-contacts/${id}`);
      setMessage("Emergency contact deleted.");
      await fetchContacts();
    } catch (error) {
      console.error("DELETE EMERGENCY CONTACT ERROR:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to delete emergency contact."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf8",
        padding: "45px 5%",
      }}
    >
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              color: "#c0392b",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            SAFETY & EMERGENCY
          </div>
          <h1
            style={{
              color: "#15534c",
              fontSize: "36px",
              margin: "8px 0",
            }}
          >
            🚨 Emergency Contacts
          </h1>
          <p style={{ color: "#71807e", fontSize: "15px" }}>
            Save trusted family or medical contacts for immediate assistance during caregiving sessions.
          </p>
        </div>

        {/* Success Alert */}
        {message && (
          <div
            style={{
              background: "#eaf8f3",
              color: "#15917f",
              padding: "14px 20px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "600",
              border: "1px solid #b7e4d8",
              textAlign: "center",
            }}
          >
            ✅ {message}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: "#fff1f1",
              color: "#c0392b",
              padding: "14px 20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #f5c6cb",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Card */}
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "18px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            border: "1px solid #e5efec",
            marginBottom: "35px",
          }}
        >
          <h2
            style={{
              color: "#15534c",
              fontSize: "20px",
              margin: "0 0 18px 0",
            }}
          >
            Add New Emergency Contact
          </h2>

          <form onSubmit={saveContact}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                Contact Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Rajesh Sharma or Priya (Sister)"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  Phone Number (10 digits) *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  Relationship *
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Select Relation --</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Doctor">Doctor / Hospital</option>
                  <option value="Friend">Friend / Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "8px",
                background: submitting ? "#e88e89" : "#c0392b",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 18px rgba(192, 57, 43, 0.25)",
              }}
            >
              {submitting ? "Saving Contact..." : "🚨 Save Emergency Contact"}
            </button>
          </form>
        </div>

        {/* Saved Contacts Section */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              color: "#15534c",
              fontSize: "22px",
              marginBottom: "16px",
            }}
          >
            📋 Saved Emergency Contacts
          </h2>

          {loading ? (
            <div style={{ color: "#71807e", textAlign: "center", padding: "30px" }}>
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "14px",
                textAlign: "center",
                color: "#71807e",
                border: "1px dashed #d5e5e1",
              }}
            >
              No emergency contacts saved yet. Add your trusted family doctor or guardian above.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {contacts.map((c) => (
                <div
                  key={c._id}
                  style={{
                    background: "white",
                    padding: "20px 24px",
                    borderRadius: "14px",
                    border: "1px solid #e5efec",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "17px", color: "#15534c" }}>
                        {c.name}
                      </strong>
                      <span
                        style={{
                          background: "#ffebee",
                          color: "#c0392b",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {c.relation}
                      </span>
                    </div>
                    <div
                      style={{
                        color: "#506965",
                        marginTop: "5px",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      📞 {c.phone}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <a
                      href={`tel:${c.phone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "9px 18px",
                        background: "#2e7d32",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      📞 Call Now
                    </a>

                    <button
                      type="button"
                      onClick={() => deleteContact(c._id)}
                      style={{
                        padding: "9px 14px",
                        background: "#fff1f1",
                        border: "1px solid #f5c6cb",
                        color: "#c0392b",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back navigation */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            to="/my-appointments"
            style={{
              color: "#15917f",
              fontWeight: "700",
              marginRight: "20px",
            }}
          >
            ← Back to My Appointments
          </Link>
          <Link
            to="/"
            style={{
              color: "#15534c",
              fontWeight: "600",
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d5e5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  background: "white",
};

export default EmergencyContact;