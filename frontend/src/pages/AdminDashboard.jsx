
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://carelink-9gr4.onrender.com";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("appointments");

  // Data states
  const [users, setUsers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Add caregiver
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    service: "Elder Care",
    location: "",
    phone: "",
    email: "",
    rating: 5,
    isFree: false,
    price: 300,
    priceType: "per hour",
    available: true,
  });
  const [addingCaregiver, setAddingCaregiver] = useState(false);

  // =========================================================
  // FETCH ALL DATA
  // =========================================================
  const fetchAllData = useCallback(async () => {
    try {
      setErrorMessage("");

      const [
        usersRes,
        caregiversRes,
        appointmentsRes,
        reviewsRes,
        contactsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/caregivers`),
        axios.get(`${API_BASE_URL}/appointments`),
        axios.get(`${API_BASE_URL}/reviews`),
        axios.get(`${API_BASE_URL}/emergency-contacts`),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsers(
          Array.isArray(usersRes.value.data) ? usersRes.value.data : []
        );
      }

      if (caregiversRes.status === "fulfilled") {
        setCaregivers(
          Array.isArray(caregiversRes.value.data)
            ? caregiversRes.value.data
            : []
        );
      }

      if (appointmentsRes.status === "fulfilled") {
        setAppointments(
          Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : []
        );
      }

      if (reviewsRes.status === "fulfilled") {
        setReviews(
          Array.isArray(reviewsRes.value.data)
            ? reviewsRes.value.data
            : []
        );
      }

      if (contactsRes.status === "fulfilled") {
        setContacts(
          Array.isArray(contactsRes.value.data)
            ? contactsRes.value.data
            : []
        );
      }
    } catch (err) {
      console.error("ADMIN DATA FETCH ERROR:", err);

      setErrorMessage(
        "Failed to load some dashboard data. Please verify backend is running at http://localhost:5000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
// INITIAL LOAD
// =========================================================
useEffect(() => {
  let ignore = false;

  const loadDashboardData = async () => {
    try {
      setErrorMessage("");

      const [
        usersRes,
        caregiversRes,
        appointmentsRes,
        reviewsRes,
        contactsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/caregivers`),
        axios.get(`${API_BASE_URL}/appointments`),
        axios.get(`${API_BASE_URL}/reviews`),
        axios.get(`${API_BASE_URL}/emergency-contacts`),
      ]);

      if (ignore) return;

      if (usersRes.status === "fulfilled") {
        setUsers(
          Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : []
        );
      }

      if (caregiversRes.status === "fulfilled") {
        setCaregivers(
          Array.isArray(caregiversRes.value.data)
            ? caregiversRes.value.data
            : []
        );
      }

      if (appointmentsRes.status === "fulfilled") {
        setAppointments(
          Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : []
        );
      }

      if (reviewsRes.status === "fulfilled") {
        setReviews(
          Array.isArray(reviewsRes.value.data)
            ? reviewsRes.value.data
            : []
        );
      }

      if (contactsRes.status === "fulfilled") {
        setContacts(
          Array.isArray(contactsRes.value.data)
            ? contactsRes.value.data
            : []
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("ADMIN DATA FETCH ERROR:", err);

      if (!ignore) {
        setErrorMessage(
          "Failed to load some dashboard data. Please verify backend is running at http://localhost:5000."
        );
        setLoading(false);
      }
    }
  };

  loadDashboardData();

  return () => {
    ignore = true;
  };
}, []);

  // =========================================================
  // APPOINTMENT STATUS
  // =========================================================
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setActionMessage("");
      setErrorMessage("");

      const res = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
          status: newStatus,
        }
      );

      setActionMessage(
        res.data?.message || `Status updated to ${newStatus}`
      );

      await fetchAllData();
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to update appointment status."
      );
    }
  };

  // =========================================================
  // CANCEL APPOINTMENT
  // =========================================================
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      setActionMessage("");
      setErrorMessage("");

      const res = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`
      );

      setActionMessage(
        res.data?.message || "Appointment cancelled."
      );

      await fetchAllData();
    } catch (err) {
      console.error("CANCEL ERROR:", err);

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to cancel appointment."
      );
    }
  };

  // =========================================================
  // DELETE APPOINTMENT
  // =========================================================
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("Permanently delete this appointment?")) return;

    try {
      setActionMessage("");
      setErrorMessage("");

      const res = await axios.delete(
        `${API_BASE_URL}/appointments/${appointmentId}`
      );

      setActionMessage(
        res.data?.message || "Appointment deleted."
      );

      await fetchAllData();
    } catch (err) {
      console.error("DELETE APPOINTMENT ERROR:", err);

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to delete appointment."
      );
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      setActionMessage("");
      setErrorMessage("");

      const res = await axios.delete(
        `${API_BASE_URL}/reviews/${reviewId}`
      );

      setActionMessage(
        res.data?.message || "Review deleted."
      );

      await fetchAllData();
    } catch (err) {
      console.error("DELETE REVIEW ERROR:", err);

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to delete review."
      );
    }
  };

  // =========================================================
  // ADD CAREGIVER
  // =========================================================
  const handleAddCaregiverSubmit = async (e) => {
    e.preventDefault();

    try {
      setAddingCaregiver(true);
      setActionMessage("");
      setErrorMessage("");

      await axios.post(`${API_BASE_URL}/caregivers/add`, {
        ...newCaregiver,
        price: Number(newCaregiver.price) || 0,
        rating: Number(newCaregiver.rating) || 5,
      });

      setActionMessage("New caregiver added successfully!");

      setShowAddCaregiver(false);

      setNewCaregiver({
        name: "",
        service: "Elder Care",
        location: "",
        phone: "",
        email: "",
        rating: 5,
        isFree: false,
        price: 300,
        priceType: "per hour",
        available: true,
      });

      await fetchAllData();
    } catch (err) {
      console.error("ADD CAREGIVER ERROR:", err);

      setErrorMessage(
        err.response?.data?.message ||
          "Failed to add caregiver."
      );
    } finally {
      setAddingCaregiver(false);
    }
  };

  // =========================================================
  // AVERAGE RATING
  // =========================================================
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, r) => sum + Number(r.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // RETURN UI
  // =========================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf8",
        padding: "40px 5%",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <div>
            <div
              style={{
                color: "#15917f",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "2px",
              }}
            >
              ADMINISTRATION
            </div>

            <h1
              style={{
                color: "#15534c",
                fontSize: "34px",
                margin: "5px 0",
              }}
            >
              CareLink Admin Dashboard
            </h1>

            <p
              style={{
                color: "#71807e",
                margin: 0,
                fontSize: "14px",
              }}
            >
              Real-time management for users, caregivers,
              appointments, and reviews.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={fetchAllData}
              style={{
                background: "white",
                color: "#15534c",
                border: "1px solid #d5e5e1",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🔄 Refresh Data
            </button>

            <button
              type="button"
              onClick={() => setShowAddCaregiver(true)}
              style={{
                background: "#15917f",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ➕ Add Caregiver
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {actionMessage && (
          <div
            style={{
              background: "#eaf8f3",
              color: "#15917f",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "600",
              border: "1px solid #b7e4d8",
            }}
          >
            ✅ {actionMessage}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            style={{
              background: "#fff1f1",
              color: "#c0392b",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #f5c6cb",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "30px 20px",
              color: "#15917f",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            ⏳ Loading dashboard metrics and records...
          </div>
        )}

        {/* KPI CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "35px",
          }}
        >
          {/* USERS */}
          <div style={cardStyle}>
            <div style={smallTitleStyle}>
              TOTAL REGISTERED USERS
            </div>

            <div style={bigNumberStyle}>
              👥 {users.length}
            </div>

            <div style={greenSmallStyle}>
              Active platform members
            </div>
          </div>

          {/* CAREGIVERS */}
          <div style={cardStyle}>
            <div style={smallTitleStyle}>
              VERIFIED CAREGIVERS
            </div>

            <div style={bigNumberStyle}>
              👩‍⚕️ {caregivers.length}
            </div>

            <div style={greenSmallStyle}>
              {caregivers.filter((c) => c.available).length}{" "}
              Currently Available
            </div>
          </div>

          {/* APPOINTMENTS */}
          <div style={cardStyle}>
            <div style={smallTitleStyle}>
              TOTAL APPOINTMENTS
            </div>

            <div style={bigNumberStyle}>
              📅 {appointments.length}
            </div>

            <div style={greenSmallStyle}>
              {
                appointments.filter(
                  (a) => a.status === "Confirmed"
                ).length
              }{" "}
              Confirmed bookings
            </div>
          </div>

          {/* REVIEWS */}
          <div style={cardStyle}>
            <div style={smallTitleStyle}>
              REVIEWS & RATINGS
            </div>

            <div style={bigNumberStyle}>
              ⭐ {avgRating}
            </div>

            <div style={greenSmallStyle}>
              {reviews.length} total customer reviews
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            borderBottom: "2px solid #e5efec",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <TabButton
            active={activeTab === "appointments"}
            onClick={() => {
              setActiveTab("appointments");
              setSearchQuery("");
            }}
          >
            📅 Appointments ({appointments.length})
          </TabButton>

          <TabButton
            active={activeTab === "caregivers"}
            onClick={() => {
              setActiveTab("caregivers");
              setSearchQuery("");
            }}
          >
            👩‍⚕️ Caregivers ({caregivers.length})
          </TabButton>

          <TabButton
            active={activeTab === "users"}
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
          >
            👥 Users ({users.length})
          </TabButton>

          <TabButton
            active={activeTab === "reviews"}
            onClick={() => {
              setActiveTab("reviews");
              setSearchQuery("");
            }}
          >
            ⭐ Reviews ({reviews.length})
          </TabButton>

          <TabButton
            active={activeTab === "contacts"}
            onClick={() => {
              setActiveTab("contacts");
              setSearchQuery("");
            }}
          >
            🚨 Emergency Contacts ({contacts.length})
          </TabButton>
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "11px 16px",
              border: "1px solid #d5e5e1",
              borderRadius: "8px",
              outline: "none",
              fontSize: "14px",
              background: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* =====================================================
            USERS
        ===================================================== */}
        {activeTab === "users" && (
          <TableContainer>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>User ID</th>
                </tr>
              </thead>

              <tbody>
                {users
                  .filter(
                    (u) =>
                      !searchQuery ||
                      u.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      u.email
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((u, i) => (
                    <tr
                      key={u._id || i}
                      style={rowStyle}
                    >
                      <td style={tdStyle}>
                        👤 {u.name}
                      </td>

                      <td style={tdStyle}>
                        {u.email}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            background:
                              u.role === "admin"
                                ? "#ffebee"
                                : "#eaf8f3",
                            color:
                              u.role === "admin"
                                ? "#c0392b"
                                : "#15917f",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {u.role || "user"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          color: "#879996",
                          fontSize: "12px",
                        }}
                      >
                        {u._id}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableContainer>
        )}

        {/* =====================================================
            CAREGIVERS
        ===================================================== */}
        {activeTab === "caregivers" && (
          <TableContainer>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Caregiver</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Availability</th>
                  <th style={thStyle}>Charges</th>
                  <th style={thStyle}>Rating</th>
                </tr>
              </thead>

              <tbody>
                {caregivers
                  .filter(
                    (c) =>
                      !searchQuery ||
                      c.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.service
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.location
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((c) => (
                    <tr
                      key={c._id}
                      style={rowStyle}
                    >
                      <td style={tdStyle}>
                        👩‍⚕️ {c.name}
                      </td>

                      <td style={tdStyle}>
                        {c.service}
                      </td>

                      <td style={tdStyle}>
                        📍 {c.location}
                      </td>

                      <td style={tdStyle}>
                        📞 {c.phone}
                        <br />
                        {c.email && (
                          <span>
                            ✉️ {c.email}
                          </span>
                        )}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            background: c.available
                              ? "#eaf8f3"
                              : "#ffebee",
                            color: c.available
                              ? "#15917f"
                              : "#d9534f",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {c.available
                            ? "🟢 Available"
                            : "🔴 Busy"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {c.isFree
                          ? "Free"
                          : `₹${c.price}/${
                              c.priceType || "hr"
                            }`}
                      </td>

                      <td style={tdStyle}>
                        ⭐ {c.rating || 5}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableContainer>
        )}

        {/* =====================================================
            APPOINTMENTS
        ===================================================== */}
        {activeTab === "appointments" && (
          <TableContainer>
            <table
              style={{
                ...tableStyle,
                minWidth: "900px",
              }}
            >
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Patient / User</th>
                  <th style={thStyle}>Caregiver</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>
                    Duration & Charges
                  </th>
                  <th style={thStyle}>Status</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {appointments
                  .filter(
                    (a) =>
                      !searchQuery ||
                      a.userName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      a.caregiverName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      a.service
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      a.status
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((a) => (
                    <tr
                      key={a._id}
                      style={rowStyle}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#15534c",
                          }}
                        >
                          {a.userName}
                        </div>

                        <div
                          style={{
                            color: "#71807e",
                            fontSize: "12px",
                          }}
                        >
                          📞 {a.phone}
                        </div>

                        {a.userEmail && (
                          <div
                            style={{
                              color: "#71807e",
                              fontSize: "12px",
                            }}
                          >
                            ✉️ {a.userEmail}
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>
                        👩‍⚕️ {a.caregiverName}
                      </td>

                      <td style={tdStyle}>
                        {a.service}
                      </td>

                      <td style={tdStyle}>
                        <div>
                          📅 {a.appointmentDate}
                        </div>

                        <div
                          style={{
                            color: "#71807e",
                            fontSize: "12px",
                          }}
                        >
                          ⏰ {a.appointmentTime}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div>
                          ⏳ {a.duration}
                        </div>

                        <div
                          style={{
                            fontWeight: "700",
                            color: "#15917f",
                          }}
                        >
                          💰{" "}
                          {a.charges === 0
                            ? "Free"
                            : `₹${a.charges}`}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <select
                          value={
                            a.status || "Confirmed"
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              a._id,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border:
                              "1px solid #d5e5e1",
                            background:
                              a.status === "Cancelled"
                                ? "#ffebee"
                                : a.status === "Completed"
                                ? "#eef2f5"
                                : "#eaf8f3",
                            color:
                              a.status === "Cancelled"
                                ? "#d9534f"
                                : a.status === "Completed"
                                ? "#556b66"
                                : "#15917f",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Confirmed">
                            🟢 Confirmed
                          </option>
                          <option value="Active">
                            🔵 Active
                          </option>
                          <option value="Pending">
                            🟡 Pending
                          </option>
                          <option value="Completed">
                            ⚪ Completed
                          </option>
                          <option value="Cancelled">
                            🔴 Cancelled
                          </option>
                        </select>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                          }}
                        >
                          {a.status !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancelAppointment(
                                  a._id
                                )
                              }
                              style={cancelButtonStyle}
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAppointment(
                                a._id
                              )
                            }
                            style={deleteButtonStyle}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableContainer>
        )}

        {/* =====================================================
            REVIEWS
        ===================================================== */}
        {activeTab === "reviews" && (
          <TableContainer>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Caregiver</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Rating</th>
                  <th style={thStyle}>Review Text</th>
                  <th style={thStyle}>Date</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#71807e",
                      }}
                    >
                      No reviews submitted yet.
                    </td>
                  </tr>
                ) : (
                  reviews
                    .filter(
                      (r) =>
                        !searchQuery ||
                        r.caregiverName
                          ?.toLowerCase()
                          .includes(
                            searchQuery.toLowerCase()
                          ) ||
                        r.userName
                          ?.toLowerCase()
                          .includes(
                            searchQuery.toLowerCase()
                          ) ||
                        r.review
                          ?.toLowerCase()
                          .includes(
                            searchQuery.toLowerCase()
                          )
                    )
                    .map((r) => (
                      <tr
                        key={r._id}
                        style={rowStyle}
                      >
                        <td style={tdStyle}>
                          👩‍⚕️ {r.caregiverName}
                        </td>

                        <td style={tdStyle}>
                          <div>
                            👤 {r.userName}
                          </div>

                          {r.userEmail && (
                            <div
                              style={{
                                color: "#71807e",
                                fontSize: "12px",
                              }}
                            >
                              {r.userEmail}
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: "#d49a18",
                            fontWeight: "700",
                          }}
                        >
                          {"⭐".repeat(
                            Number(r.rating || 5)
                          )}{" "}
                          ({r.rating}/5)
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: "300px",
                          }}
                        >
                          "{r.review}"
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: "#71807e",
                            fontSize: "12px",
                          }}
                        >
                          {r.createdAt
                            ? new Date(
                                r.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteReview(r._id)
                            }
                            style={deleteReviewButtonStyle}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </TableContainer>
        )}

        {/* =====================================================
            EMERGENCY CONTACTS
        ===================================================== */}
        {activeTab === "contacts" && (
          <TableContainer>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Relation</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Created</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#71807e",
                      }}
                    >
                      No emergency contacts found.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c._id}
                      style={rowStyle}
                    >
                      <td style={tdStyle}>
                        🚨 {c.name}
                      </td>

                      <td style={tdStyle}>
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
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "600",
                          color: "#15534c",
                        }}
                      >
                        📞 {c.phone}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          color: "#71807e",
                          fontSize: "12px",
                        }}
                      >
                        {c.createdAt
                          ? new Date(
                              c.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete this contact?"
                              )
                            ) {
                              return;
                            }

                            try {
                              await axios.delete(
                                `${API_BASE_URL}/emergency-contacts/${c._id}`
                              );

                              setActionMessage(
                                "Emergency contact deleted."
                              );

                              await fetchAllData();
                            } catch (err) {
                              console.error(
                                "DELETE CONTACT ERROR:",
                                err
                              );

                              setErrorMessage(
                                err.response?.data?.message ||
                                  "Failed to delete emergency contact."
                              );
                            }
                          }}
                          style={deleteReviewButtonStyle}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableContainer>
        )}

        {/* BACK LINKS */}
        <div
          style={{
            textAlign: "center",
            marginTop: "35px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#15534c",
              fontWeight: "700",
              marginRight: "20px",
            }}
          >
            ← Back to Home
          </Link>

          <Link
            to="/appointments"
            style={{
              color: "#15917f",
              fontWeight: "700",
            }}
          >
            Go to Booking Page →
          </Link>
        </div>
      </div>

      {/* =====================================================
          ADD CAREGIVER MODAL
      ===================================================== */}
      {showAddCaregiver && (
        <div
          onClick={() => setShowAddCaregiver(false)}
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
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.25)",
              boxSizing: "border-box",
            }}
          >
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
                Add New Caregiver
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowAddCaregiver(false)
                }
                style={{
                  border: "none",
                  background: "#f1f5f4",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCaregiverSubmit}>
              {/* NAME */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>
                  Full Name *
                </label>

                <input
                  type="text"
                  placeholder="Caregiver Name"
                  value={newCaregiver.name}
                  onChange={(e) =>
                    setNewCaregiver({
                      ...newCaregiver,
                      name: e.target.value,
                    })
                  }
                  style={inputStyle}
                  required
                />
              </div>

              {/* SERVICE + LOCATION */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Service Category *
                  </label>

                  <select
                    value={newCaregiver.service}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        service: e.target.value,
                      })
                    }
                    style={inputStyle}
                    required
                  >
                    <option value="Elder Care">
                      Elder Care
                    </option>
                    <option value="Patient Care">
                      Patient Care
                    </option>
                    <option value="Baby Care">
                      Baby Care
                    </option>
                    <option value="Home Care">
                      Home Care
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Location *
                  </label>

                  <input
                    type="text"
                    placeholder="City / Area"
                    value={newCaregiver.location}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        location: e.target.value,
                      })
                    }
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* PHONE + EMAIL */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    placeholder="10-digit Phone"
                    value={newCaregiver.phone}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        phone: e.target.value,
                      })
                    }
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="caregiver@email.com"
                    value={newCaregiver.email}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        email: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* PRICE + PRICE TYPE */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="Rate"
                    value={newCaregiver.price}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        price: e.target.value,
                        isFree:
                          Number(e.target.value) === 0,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Price Unit
                  </label>

                  <select
                    value={newCaregiver.priceType}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        priceType: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="per hour">
                      per hour
                    </option>
                    <option value="per day">
                      per day
                    </option>
                    <option value="per visit">
                      per visit
                    </option>
                  </select>
                </div>
              </div>

              {/* RATING + STATUS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Initial Rating (1-5)
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={newCaregiver.rating}
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        rating: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Initial Status
                  </label>

                  <select
                    value={
                      newCaregiver.available
                        ? "yes"
                        : "no"
                    }
                    onChange={(e) =>
                      setNewCaregiver({
                        ...newCaregiver,
                        available:
                          e.target.value === "yes",
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="yes">
                      Available
                    </option>

                    <option value="no">
                      Not Available
                    </option>
                  </select>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={addingCaregiver}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "none",
                  borderRadius: "8px",
                  background: addingCaregiver
                    ? "#9abdb7"
                    : "#15917f",
                  color: "white",
                  fontWeight: "700",
                  cursor: addingCaregiver
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {addingCaregiver
                  ? "Saving Caregiver..."
                  : "Save Caregiver"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// SMALL REUSABLE COMPONENTS
// =========================================================

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 20px",
        background: "none",
        border: "none",
        borderBottom: active
          ? "3px solid #15917f"
          : "3px solid transparent",
        color: active
          ? "#15917f"
          : "#647773",
        fontWeight: active ? "800" : "600",
        fontSize: "15px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function TableContainer({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e5efec",
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.04)",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #e5efec",
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
};

const smallTitleStyle = {
  color: "#71807e",
  fontSize: "13px",
  fontWeight: "700",
};

const bigNumberStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#15534c",
  margin: "8px 0 4px",
};

const greenSmallStyle = {
  color: "#15917f",
  fontSize: "12px",
  fontWeight: "600",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "14px",
};

const tableHeaderStyle = {
  background: "#edf8f5",
  color: "#15534c",
};

const thStyle = {
  padding: "14px 18px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 18px",
  color: "#506965",
};

const rowStyle = {
  borderBottom: "1px solid #f0f5f4",
};

const cancelButtonStyle = {
  padding: "6px 10px",
  background: "#fff5f5",
  border: "1px solid #f5c6cb",
  color: "#c0392b",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const deleteButtonStyle = {
  padding: "6px 10px",
  background: "#f1f5f4",
  border: "1px solid #d5e5e1",
  color: "#506965",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};

const deleteReviewButtonStyle = {
  padding: "6px 12px",
  background: "#fff1f1",
  border: "1px solid #f5c6cb",
  color: "#c0392b",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};

const labelStyle = {
  display: "block",
  color: "#15534c",
  fontWeight: "700",
  marginBottom: "5px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d5e5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  background: "white",
};

export default AdminDashboard;

