import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function Caregivers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [caregivers, setCaregivers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [selectedCaregiver, setSelectedCaregiver] = useState(null);

  const service = searchParams.get("service") || selectedService;

  const handleServiceChange = (val) => {
    setSelectedService(val);
    if (val) {
      setSearchParams({ service: val });
    } else {
      setSearchParams({});
    }
  };

  // ================= GET CAREGIVERS (RETRY / MANUAL) =================
  const getCaregivers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(`${API_BASE_URL}/caregivers`);
      setCaregivers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("GET CAREGIVERS ERROR:", error);
      setMessage(
        "Unable to load caregivers from http://localhost:5000/caregivers. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    let ignore = false;

    axios
      .get(`${API_BASE_URL}/caregivers`)
      .then((response) => {
        if (!ignore) {
          setCaregivers(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("GET CAREGIVERS ERROR:", error);
        if (!ignore) {
          setMessage(
            "Unable to load caregivers from http://localhost:5000/caregivers. Please ensure the backend server is running."
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // ================= SEARCH + FILTER =================
  const filteredCaregivers = caregivers.filter((caregiver) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      caregiver.name?.toLowerCase().includes(searchText) ||
      caregiver.location?.toLowerCase().includes(searchText) ||
      caregiver.service?.toLowerCase().includes(searchText);

    const matchesService =
      service === "" || caregiver.service?.toLowerCase() === service.toLowerCase();

    return matchesSearch && matchesService;
  });

  const [caregiverReviews, setCaregiverReviews] = useState([]);

  // ================= OPEN DETAILS =================
  const openCaregiverDetails = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setCaregiverReviews([]);
    if (caregiver?._id) {
      axios
        .get(`${API_BASE_URL}/reviews/caregiver/${caregiver._id}`)
        .then((res) => {
          setCaregiverReviews(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setCaregiverReviews([]);
        });
    }
  };

  // ================= BOOK CARE / APPOINTMENT =================
  const bookAppointment = (caregiver) => {
    setSelectedCaregiver(null);

    // Direct to appointments with selected caregiver
    navigate("/appointments", {
      state: {
        caregiver: caregiver,
        caregiverId: caregiver._id,
        openAppointment: true,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf8",
        padding: "45px 7%",
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            color: "#15917f",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "2px",
          }}
        >
          CARELINK
        </div>

        <h1
          style={{
            color: "#15534c",
            fontSize: "38px",
            margin: "10px 0",
          }}
        >
          Find a Caregiver
        </h1>

        <p
          style={{
            color: "#71807e",
            fontSize: "15px",
          }}
        >
          Search and filter verified caregivers according to your care requirements.
        </p>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          maxWidth: "850px",
          margin: "0 auto 35px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search caregiver name, service or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 300px",
            padding: "14px 16px",
            border: "1px solid #d5e5e1",
            borderRadius: "9px",
            outline: "none",
            fontSize: "14px",
            background: "white",
          }}
        />

        <select
          value={service}
          onChange={(e) => handleServiceChange(e.target.value)}
          style={{
            flex: "0 1 200px",
            padding: "14px",
            border: "1px solid #d5e5e1",
            borderRadius: "9px",
            background: "white",
            color: "#405653",
            minWidth: "170px",
          }}
        >
          <option value="">All Services</option>
          <option value="Elder Care">Elder Care</option>
          <option value="Patient Care">Patient Care</option>
          <option value="Baby Care">Baby Care</option>
          <option value="Home Care">Home Care</option>
        </select>

        {service && (
          <button
            onClick={() => handleServiceChange("")}
            style={{
              padding: "12px 18px",
              border: "1px solid #d5e5e1",
              background: "white",
              color: "#c0392b",
              borderRadius: "9px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* ================= ERROR ================= */}
      {message && (
        <div
          style={{
            maxWidth: "850px",
            margin: "0 auto 25px",
            padding: "18px",
            background: "#fff1f1",
            color: "#c0392b",
            borderRadius: "10px",
            textAlign: "center",
            border: "1px solid #f5c6cb",
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>⚠️ {message}</p>
          <button
            onClick={getCaregivers}
            style={{
              background: "#c0392b",
              color: "white",
              border: "none",
              padding: "8px 18px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🔄 Retry Connection
          </button>
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#15917f",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          ⏳ Loading caregivers...
        </div>
      )}

      {/* ================= NO CAREGIVERS ================= */}
      {!loading && filteredCaregivers.length === 0 && !message && (
        <div
          style={{
            textAlign: "center",
            background: "white",
            padding: "50px",
            borderRadius: "15px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "45px", marginBottom: "10px" }}>👩‍⚕️</div>
          <h3 style={{ color: "#15534c", margin: "10px 0" }}>No Caregivers Found</h3>
          <p style={{ color: "#71807e", margin: "0 0 15px 0" }}>
            No caregiver matches your search query or selected service filter.
          </p>
          {(search || service) && (
            <button
              onClick={() => {
                setSearch("");
                handleServiceChange("");
              }}
              style={{
                border: "none",
                background: "#15917f",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      )}

      {/* ================= CAREGIVER LIST ================= */}
      {!loading && filteredCaregivers.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "22px",
          }}
        >
          {filteredCaregivers.map((caregiver) => (
            <div
              key={caregiver._id}
              onClick={() => openCaregiverDetails(caregiver)}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.07)",
                border: "1px solid #e5efec",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              title="Click caregiver card to view details"
            >
              {/* ICON */}
              <div
                style={{
                  width: "62px",
                  height: "62px",
                  borderRadius: "50%",
                  background: "#dff5f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  marginBottom: "15px",
                }}
              >
                👩‍⚕️
              </div>

              {/* CAREGIVER NAME */}
              <h2
                onClick={(e) => {
                  e.stopPropagation();
                  openCaregiverDetails(caregiver);
                }}
                style={{
                  color: "#15917f",
                  fontSize: "21px",
                  margin: "5px 0",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                title="Click to view caregiver details"
              >
                {caregiver.name}
              </h2>

              <p
                style={{
                  color: "#15534c",
                  fontWeight: "700",
                  margin: "4px 0",
                }}
              >
                {caregiver.service}
              </p>

              <p style={{ color: "#71807e", margin: "4px 0" }}>
                📍 {caregiver.location}
              </p>

              <p style={{ color: "#71807e", margin: "4px 0" }}>
                📞 {caregiver.phone || "Not available"}
              </p>

              <p
                style={{
                  color: "#71807e",
                  margin: "4px 0",
                  wordBreak: "break-word",
                }}
              >
                ✉️ {caregiver.email || "Not available"}
              </p>

              <p
                style={{
                  color: "#d49a18",
                  fontWeight: "700",
                  margin: "4px 0",
                }}
              >
                ⭐ {caregiver.rating || 0} / 5
              </p>

              <p
                style={{
                  color: caregiver.available ? "#15917f" : "#d9534f",
                  fontWeight: "700",
                  margin: "4px 0",
                }}
              >
                {caregiver.available ? "🟢 Available" : "🔴 Not Available"}
              </p>

              <p
                style={{
                  color: "#15534c",
                  fontWeight: "700",
                  margin: "6px 0 15px 0",
                  fontSize: "16px",
                }}
              >
                💰{" "}
                {caregiver.isFree
                  ? "Free Service"
                  : `₹${caregiver.price || 0} / ${caregiver.priceType || "per hour"}`}
              </p>

              {/* ACTION BUTTONS */}
              <div style={{ marginTop: "auto", display: "grid", gap: "8px" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCaregiverDetails(caregiver);
                  }}
                  style={{
                    width: "100%",
                    border: "1px solid #15917f",
                    padding: "11px",
                    borderRadius: "8px",
                    background: "white",
                    color: "#15917f",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  👤 View Details
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    bookAppointment(caregiver);
                  }}
                  disabled={!caregiver.available}
                  style={{
                    width: "100%",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    background: caregiver.available ? "#15917f" : "#b9c5c2",
                    color: "white",
                    fontWeight: "700",
                    cursor: caregiver.available ? "pointer" : "not-allowed",
                  }}
                >
                  {caregiver.available ? "📅 Book Appointment" : "Not Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= BACK HOME ================= */}
      <div
        style={{
          textAlign: "center",
          marginTop: "45px",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            border: "none",
            background: "#15534c",
            color: "white",
            padding: "12px 25px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          ← Back to Home
        </button>
      </div>

      {/* =====================================================
          CAREGIVER DETAILS POPUP
      ===================================================== */}
      {selectedCaregiver && (
        <div
          onClick={() => setSelectedCaregiver(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            {/* POPUP HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#15534c",
                  margin: 0,
                }}
              >
                Caregiver Details
              </h2>

              <button
                onClick={() => setSelectedCaregiver(null)}
                style={{
                  border: "none",
                  background: "#f1f5f4",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* PROFILE */}
            <div
              style={{
                textAlign: "center",
                background: "#f4faf8",
                padding: "22px",
                borderRadius: "14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#dff5f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  margin: "0 auto 12px",
                }}
              >
                👩‍⚕️
              </div>

              <h2
                style={{
                  color: "#15917f",
                  margin: "0 0 6px 0",
                }}
              >
                {selectedCaregiver.name}
              </h2>

              <p
                style={{
                  color: "#15534c",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {selectedCaregiver.service}
              </p>
            </div>

            {/* DETAILS */}
            <div
              style={{
                display: "grid",
                gap: "10px",
                fontSize: "15px",
              }}
            >
              <div>
                <strong>Name:</strong> {selectedCaregiver.name}
              </div>

              <div>
                <strong>Service:</strong> {selectedCaregiver.service}
              </div>

              <div>
                📍 <strong>Location:</strong>{" "}
                {selectedCaregiver.location || "Not available"}
              </div>

              <div>
                📞 <strong>Phone:</strong>{" "}
                {selectedCaregiver.phone || "Not available"}
              </div>

              <div>
                ✉️ <strong>Email:</strong>{" "}
                {selectedCaregiver.email || "Not available"}
              </div>

              <div>
                ⭐ <strong>Rating:</strong> {selectedCaregiver.rating || 0} / 5
              </div>

              <div>
                <strong>Availability:</strong>{" "}
                {selectedCaregiver.available ? (
                  <span style={{ color: "#15917f", fontWeight: "700" }}>
                    🟢 Available
                  </span>
                ) : (
                  <span style={{ color: "#d9534f", fontWeight: "700" }}>
                    🔴 Not Available
                  </span>
                )}
              </div>

              <div>
                💰 <strong>Charges:</strong>{" "}
                {selectedCaregiver.isFree
                  ? "Free Service"
                  : `₹${selectedCaregiver.price || 0} / ${
                      selectedCaregiver.priceType || "per hour"
                    }`}
              </div>
            </div>

            {/* REVIEWS & RATINGS LIST IN POPUP */}
            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid #e5efec",
                paddingTop: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ color: "#15534c", margin: 0, fontSize: "15px" }}>
                  ⭐ Patient Reviews & Ratings
                </h4>
                <span
                  style={{
                    color: "#d49a18",
                    fontWeight: "700",
                    fontSize: "13px",
                  }}
                >
                  ⭐ {selectedCaregiver.rating || 5}/5
                </span>
              </div>

              {caregiverReviews.length === 0 ? (
                <p style={{ color: "#71807e", fontSize: "13px", margin: 0 }}>
                  No customer reviews submitted for this caregiver yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                  {caregiverReviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        background: "#fbfdfc",
                        border: "1px solid #edf4f2",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <strong style={{ color: "#15534c" }}>{rev.userName}</strong>
                        <span style={{ color: "#d49a18" }}>
                          {"⭐".repeat(rev.rating || 5)}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: "#556e69", fontStyle: "italic" }}>
                        "{rev.review}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================
                MODAL ACTIONS: Register, Login, Book Care, Close
            ================================================= */}
            <div style={{ marginTop: "25px", display: "grid", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCaregiver(null);
                  navigate("/register");
                }}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "1px solid #15917f",
                  background: "white",
                  color: "#15917f",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                📝 Register
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCaregiver(null);
                  navigate("/login");
                }}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "1px solid #15534c",
                  background: "white",
                  color: "#15534c",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                🔐 Login
              </button>

              <button
                type="button"
                disabled={!selectedCaregiver.available}
                onClick={() => bookAppointment(selectedCaregiver)}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "none",
                  background: selectedCaregiver.available ? "#15917f" : "#b9c5c2",
                  color: "white",
                  borderRadius: "8px",
                  cursor: selectedCaregiver.available ? "pointer" : "not-allowed",
                  fontWeight: "700",
                }}
              >
                {selectedCaregiver.available ? "📅 Book Care" : "🔴 Not Available"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCaregiver(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  background: "#f1f5f4",
                  color: "#15534c",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Caregivers;
