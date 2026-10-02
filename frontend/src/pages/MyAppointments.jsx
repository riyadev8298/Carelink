import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function MyAppointments() {
  const navigate = useNavigate();

  const getLoggedInUser = () => {
    try {
      const stored = localStorage.getItem("carelink_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getLoggedInUser();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Search by email or name filter
  const [searchEmail, setSearchEmail] = useState(currentUser?.email || "");

  // Emergency Contact in User's Area (Module 7)
  const [emergencyContact, setEmergencyContact] = useState(() => {
    try {
      const stored = localStorage.getItem("carelink_emergency_contact");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Modal States: Details, Reschedule, Review
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // Review Modal State (Module 8)
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState({});

  // Fetch appointments from backend (for manual searches / refresh)
  const fetchAppointments = useCallback(async (emailToUse) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const emailParam = emailToUse ? emailToUse.trim() : "";
      const url = emailParam
        ? `${API_BASE_URL}/appointments?userEmail=${encodeURIComponent(emailParam)}`
        : `${API_BASE_URL}/appointments`;

      const res = await axios.get(url);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH APPOINTMENTS ERROR:", err);
      setErrorMessage(
        "Failed to load appointments from http://localhost:5000/appointments. Please ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    let ignore = false;
    const emailParam = currentUser?.email ? currentUser.email.trim() : "";
    const url = emailParam
      ? `${API_BASE_URL}/appointments?userEmail=${encodeURIComponent(emailParam)}`
      : `${API_BASE_URL}/appointments`;

    axios
      .get(url)
      .then((res) => {
        if (!ignore) {
          setAppointments(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("FETCH APPOINTMENTS ERROR:", err);
        if (!ignore) {
          setErrorMessage(
            "Failed to load appointments from http://localhost:5000/appointments. Please ensure backend is running."
          );
          setLoading(false);
        }
      });

    // Also fetch latest emergency contact
    axios
      .get(`${API_BASE_URL}/emergency-contacts`)
      .then((res) => {
        if (!ignore && Array.isArray(res.data) && res.data.length > 0) {
          setEmergencyContact(res.data[0]);
          localStorage.setItem(
            "carelink_emergency_contact",
            JSON.stringify(res.data[0])
          );
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [currentUser?.email]);

  // Handle Cancel Appointment
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setCancelLoadingId(appointmentId);
      setActionSuccess("");
      setErrorMessage("");

      const res = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`
      );

      setActionSuccess(res.data?.message || "Appointment cancelled successfully.");

      // Refresh list
      await fetchAppointments(searchEmail);

      // If details modal is open for this appointment, update it
      if (detailsAppointment && detailsAppointment._id === appointmentId) {
        setDetailsAppointment({
          ...detailsAppointment,
          status: "Cancelled",
        });
      }
    } catch (err) {
      console.error("CANCEL APPOINTMENT ERROR:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to cancel appointment. Please check if backend is running."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (appointment) => {
    setRescheduleAppointment(appointment);
    setNewDate(appointment.appointmentDate || "");
    setNewTime(appointment.appointmentTime || "");
    setRescheduleError("");
  };

  // Handle Reschedule Appointment
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleAppointment) return;

    if (!newDate || !newTime) {
      setRescheduleError("Please select both a new date and time.");
      return;
    }

    if (newDate < getTodayString()) {
      setRescheduleError("Rescheduled date cannot be in the past.");
      return;
    }

    try {
      setRescheduleLoading(true);
      setRescheduleError("");

      const res = await axios.put(
        `${API_BASE_URL}/appointments/${rescheduleAppointment._id}/reschedule`,
        {
          appointmentDate: newDate,
          appointmentTime: newTime,
        }
      );

      setActionSuccess(
        res.data?.message || "Appointment rescheduled successfully!"
      );
      setRescheduleAppointment(null);

      // Refresh appointments
      await fetchAppointments(searchEmail);

      if (
        detailsAppointment &&
        detailsAppointment._id === rescheduleAppointment._id
      ) {
        setDetailsAppointment({
          ...detailsAppointment,
          appointmentDate: newDate,
          appointmentTime: newTime,
          status: "Confirmed",
        });
      }
    } catch (err) {
      console.error("RESCHEDULE ERROR:", err);
      setRescheduleError(
        err.response?.data?.message ||
          "Failed to reschedule. The caregiver might be busy at this time."
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Open Review Modal (Module 8: Reviews & Ratings)
  const openReviewModal = (appointment) => {
    setReviewAppointment(appointment);
    setReviewRating(5);
    setReviewText("");
    setReviewError("");
  };

  // Submit Review to Backend (POST /reviews/add)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewAppointment) return;

    if (!reviewText.trim()) {
      setReviewError("Please write your review feedback.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError("");

      const payload = {
        caregiverId: reviewAppointment.caregiverId,
        caregiverName: reviewAppointment.caregiverName,
        userName: currentUser?.name || reviewAppointment.userName,
        userEmail: currentUser?.email || reviewAppointment.userEmail || "",
        rating: Number(reviewRating),
        review: reviewText.trim(),
      };

      const res = await axios.post(`${API_BASE_URL}/reviews/add`, payload);

      setActionSuccess(
        res.data?.message || "Thank you! Your review has been submitted. ⭐"
      );

      setSubmittedReviews((prev) => ({
        ...prev,
        [reviewAppointment._id]: {
          rating: Number(reviewRating),
          review: reviewText.trim(),
        },
      }));

      setReviewAppointment(null);
    } catch (err) {
      console.error("SUBMIT REVIEW ERROR:", err);
      setReviewError(
        err.response?.data?.message ||
          "Failed to submit review. Please check if backend is running."
      );
    } finally {
      setReviewLoading(false);
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
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
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
              fontSize: "36px",
              margin: "8px 0",
            }}
          >
            My Appointments
          </h1>
          <p style={{ color: "#71807e", fontSize: "15px" }}>
            Track, view details, reschedule, cancel, or review your booked caregiver appointments.
          </p>
        </div>

        {/* ================= EMERGENCY CONTACT QUICK BAR (Module 7) ================= */}
        <div
          style={{
            background: "#fff9f9",
            border: "1px solid #ffd8d8",
            borderRadius: "14px",
            padding: "16px 22px",
            marginBottom: "25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "0 4px 15px rgba(192, 57, 43, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>🚨</span>
            <div>
              <div style={{ fontWeight: "700", color: "#c0392b", fontSize: "14px" }}>
                Emergency Contact On Record:
              </div>
              <div style={{ color: "#4a5d5a", fontSize: "14px" }}>
                {emergencyContact ? (
                  <>
                    <strong>{emergencyContact.name}</strong> ({emergencyContact.relation}) — 📞 {emergencyContact.phone}
                  </>
                ) : (
                  "No emergency contact saved yet."
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {emergencyContact && (
              <a
                href={`tel:${emergencyContact.phone}`}
                style={{
                  background: "#2e7d32",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                📞 Call Now
              </a>
            )}
            <Link
              to="/emergency-contact"
              style={{
                background: "white",
                color: "#c0392b",
                border: "1px solid #f5c6cb",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              {emergencyContact ? "Manage Contact" : "➕ Add Emergency Contact"}
            </Link>
          </div>
        </div>

        {/* Not Logged In Banner */}
        {!currentUser && (
          <div
            style={{
              background: "#eaf8f3",
              border: "1px solid #c2ebe0",
              padding: "16px 20px",
              borderRadius: "12px",
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <strong style={{ color: "#15534c" }}>
                💡 Tip: Login for automatic booking history
              </strong>
              <p style={{ margin: "4px 0 0", color: "#486b65", fontSize: "13px" }}>
                Login to your account or search below by the email used during booking.
              </p>
            </div>
            <Link
              to="/login"
              style={{
                background: "#15917f",
                color: "white",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              🔐 Login
            </Link>
          </div>
        )}

        {/* Filter / Email search bar */}
        <div
          style={{
            background: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            marginBottom: "25px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="email"
            placeholder="Search appointments by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{
              flex: "1 1 250px",
              padding: "12px 14px",
              border: "1px solid #d5e5e1",
              borderRadius: "8px",
              outline: "none",
              fontSize: "14px",
            }}
          />

          <button
            type="button"
            onClick={() => fetchAppointments(searchEmail)}
            style={{
              background: "#15917f",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🔍 Search
          </button>

          {searchEmail && (
            <button
              type="button"
              onClick={() => {
                setSearchEmail("");
                fetchAppointments("");
              }}
              style={{
                background: "white",
                color: "#71807e",
                border: "1px solid #d5e5e1",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Show All
            </button>
          )}

          <Link
            to="/appointments"
            style={{
              marginLeft: "auto",
              background: "#15534c",
              color: "white",
              padding: "12px 18px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            ➕ Book New Appointment
          </Link>
        </div>

        {/* Success message banner */}
        {actionSuccess && (
          <div
            style={{
              background: "#eaf8f3",
              color: "#15917f",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "600",
              border: "1px solid #b7e4d8",
            }}
          >
            ✅ {actionSuccess}
          </div>
        )}

        {/* Error message banner */}
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
            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => fetchAppointments(searchEmail)}
                style={{
                  background: "#c0392b",
                  color: "white",
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
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
            ⏳ Loading your appointments...
          </div>
        )}

        {/* Empty state */}
        {!loading && appointments.length === 0 && !errorMessage && (
          <div
            style={{
              textAlign: "center",
              background: "white",
              padding: "50px 30px",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #e5efec",
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>📅</div>
            <h2 style={{ color: "#15534c", margin: "10px 0" }}>
              No appointments found
            </h2>
            <p style={{ color: "#71807e", marginBottom: "25px" }}>
              {searchEmail
                ? `No booked appointments found for ${searchEmail}.`
                : "You don't have any appointments booked yet."}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link
                to="/appointments"
                style={{
                  background: "#15917f",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                📅 Book an Appointment
              </Link>
              <Link
                to="/caregivers"
                style={{
                  background: "white",
                  color: "#15534c",
                  border: "1px solid #15534c",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                🔍 Browse Caregivers
              </Link>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {!loading && appointments.length > 0 && (
          <div style={{ display: "grid", gap: "18px" }}>
            {appointments.map((appt) => {
              const isCancelled = appt.status === "Cancelled";
              const isCompleted = appt.status === "Completed";
              const userReview = submittedReviews[appt._id];

              return (
                <div
                  key={appt._id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                    border: isCancelled
                      ? "1px solid #f0d5d5"
                      : isCompleted
                      ? "1px solid #ccebe4"
                      : "1px solid #e5efec",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div>
                    {/* Status Badge */}
                    <div style={{ marginBottom: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          background: isCancelled
                            ? "#ffebeb"
                            : isCompleted
                            ? "#eaf8f3"
                            : "#e8f4fd",
                          color: isCancelled
                            ? "#d9534f"
                            : isCompleted
                            ? "#15917f"
                            : "#1976d2",
                        }}
                      >
                        {isCancelled
                          ? "🔴 Cancelled"
                          : isCompleted
                          ? "🟢 Completed"
                          : "🔵 Confirmed"}
                      </span>

                      <span
                        style={{
                          marginLeft: "12px",
                          color: "#71807e",
                          fontSize: "13px",
                        }}
                      >
                        Service: <strong>{appt.service}</strong>
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        color: "#15534c",
                        fontSize: "20px",
                      }}
                    >
                      👩‍⚕️ Caregiver: {appt.caregiverName}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "18px",
                        color: "#4e6763",
                        fontSize: "14px",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        📅 <strong>Date:</strong> {appt.appointmentDate}
                      </div>
                      <div>
                        ⏰ <strong>Time:</strong> {appt.appointmentTime}
                      </div>
                      <div>
                        ⏳ <strong>Duration:</strong> {appt.duration}
                      </div>
                      <div>
                        💰 <strong>Charges:</strong>{" "}
                        {appt.charges === 0 ? "Free" : `₹${appt.charges}`}
                      </div>
                    </div>

                    <div style={{ color: "#71807e", fontSize: "13px" }}>
                      👤 <strong>Patient:</strong> {appt.userName} | 📞{" "}
                      {appt.phone} | 📍 {appt.address}
                    </div>

                    {/* Submitted Review Display (Module 8) */}
                    {userReview && (
                      <div
                        style={{
                          marginTop: "12px",
                          background: "#fffaf0",
                          border: "1px solid #f5e4bc",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#7c5c10",
                        }}
                      >
                        <strong>⭐ Your Rating:</strong> {"⭐".repeat(userReview.rating)} ({userReview.rating}/5)
                        <div style={{ fontStyle: "italic", marginTop: "4px" }}>
                          "{userReview.review}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      minWidth: "155px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDetailsAppointment(appt)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: "8px",
                        border: "1px solid #15917f",
                        background: "white",
                        color: "#15917f",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      👁️ View Details
                    </button>

                    {/* Review Button (Module 8: for completed or active appointments) */}
                    {!isCancelled && !userReview && (
                      <button
                        type="button"
                        onClick={() => openReviewModal(appt)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: "8px",
                          border: "1px solid #d49a18",
                          background: "#fffaf0",
                          color: "#a4740b",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        ⭐ Review Caregiver
                      </button>
                    )}

                    {!isCancelled && !isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(appt)}
                          style={{
                            padding: "9px 14px",
                            borderRadius: "8px",
                            border: "1px solid #1976d2",
                            background: "#f0f7ff",
                            color: "#1976d2",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          🔄 Reschedule
                        </button>

                        <button
                          type="button"
                          disabled={cancelLoadingId === appt._id}
                          onClick={() => handleCancel(appt._id)}
                          style={{
                            padding: "9px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d9534f",
                            background: "#fff5f5",
                            color: "#c0392b",
                            fontWeight: "700",
                            cursor:
                              cancelLoadingId === appt._id
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "13px",
                          }}
                        >
                          {cancelLoadingId === appt._id
                            ? "Cancelling..."
                            : "❌ Cancel"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "#15534c",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}
      {detailsAppointment && (
        <div
          onClick={() => setDetailsAppointment(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
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
              <h2 style={{ color: "#15534c", margin: 0 }}>
                Appointment Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailsAppointment(null)}
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

            <div
              style={{
                background: "#f4faf8",
                padding: "18px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#15917f" }}>
                👩‍⚕️ {detailsAppointment.caregiverName}
              </div>
              <div style={{ color: "#15534c", fontWeight: "600" }}>
                Service: {detailsAppointment.service}
              </div>
              <div style={{ marginTop: "6px" }}>
                Status:{" "}
                <strong>
                  {detailsAppointment.status === "Cancelled"
                    ? "🔴 Cancelled"
                    : detailsAppointment.status === "Completed"
                    ? "🟢 Completed"
                    : "🔵 Confirmed"}
                </strong>
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px", fontSize: "14px" }}>
              <div>
                📅 <strong>Date:</strong> {detailsAppointment.appointmentDate}
              </div>
              <div>
                ⏰ <strong>Time:</strong> {detailsAppointment.appointmentTime}
              </div>
              <div>
                ⏳ <strong>Duration:</strong> {detailsAppointment.duration}
              </div>
              <div>
                💰 <strong>Charges:</strong>{" "}
                {detailsAppointment.charges === 0
                  ? "Free Service"
                  : `₹${detailsAppointment.charges}`}
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #e5efec" }} />
              <div>
                👤 <strong>Patient Name:</strong> {detailsAppointment.userName}
              </div>
              <div>
                ✉️ <strong>Contact Email:</strong>{" "}
                {detailsAppointment.userEmail || "Not provided"}
              </div>
              <div>
                📞 <strong>Contact Phone:</strong> {detailsAppointment.phone}
              </div>
              <div>
                📍 <strong>Service Address:</strong> {detailsAppointment.address}
              </div>
              <div>
                📝 <strong>Special Instructions:</strong>{" "}
                {detailsAppointment.specialInstructions || "None"}
              </div>
            </div>

            <div style={{ marginTop: "25px", display: "grid", gap: "10px" }}>
              {!isCancelledAppointment(detailsAppointment) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailsAppointment;
                      setDetailsAppointment(null);
                      openReviewModal(target);
                    }}
                    style={{
                      padding: "12px",
                      background: "#fffaf0",
                      border: "1px solid #d49a18",
                      color: "#a4740b",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ⭐ Review Caregiver
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = detailsAppointment;
                      setDetailsAppointment(null);
                      openRescheduleModal(target);
                    }}
                    style={{
                      padding: "12px",
                      background: "#f0f7ff",
                      border: "1px solid #1976d2",
                      color: "#1976d2",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    🔄 Reschedule Appointment
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCancel(detailsAppointment._id)}
                    style={{
                      padding: "12px",
                      background: "#fff5f5",
                      border: "1px solid #d9534f",
                      color: "#c0392b",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Cancel Appointment
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setDetailsAppointment(null)}
                style={{
                  padding: "12px",
                  background: "#f1f5f4",
                  border: "none",
                  color: "#15534c",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESCHEDULE MODAL
      ===================================================== */}
      {rescheduleAppointment && (
        <div
          onClick={() => setRescheduleAppointment(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              maxWidth: "480px",
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2 style={{ color: "#15534c", margin: 0 }}>
                Reschedule Appointment
              </h2>
              <button
                type="button"
                onClick={() => setRescheduleAppointment(null)}
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

            <p style={{ color: "#71807e", fontSize: "14px", margin: "0 0 15px 0" }}>
              Caregiver: <strong>{rescheduleAppointment.caregiverName}</strong> (
              {rescheduleAppointment.service})
            </p>

            {rescheduleError && (
              <div
                style={{
                  background: "#fff1f1",
                  color: "#c0392b",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  fontSize: "13px",
                  border: "1px solid #f5c6cb",
                }}
              >
                ⚠️ {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit}>
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
                  New Appointment Date *
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  New Appointment Time *
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    background: "white",
                    outline: "none",
                  }}
                  required
                >
                  <option value="">-- Select Time Slot --</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  style={{
                    padding: "13px",
                    border: "none",
                    borderRadius: "8px",
                    background: rescheduleLoading ? "#9abdb7" : "#15917f",
                    color: "white",
                    fontWeight: "700",
                    cursor: rescheduleLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {rescheduleLoading
                    ? "Updating Appointment..."
                    : "Confirm Reschedule"}
                </button>

                <button
                  type="button"
                  onClick={() => setRescheduleAppointment(null)}
                  style={{
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#f1f5f4",
                    color: "#15534c",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          GIVE REVIEW MODAL (Module 8: Review & Rating)
      ===================================================== */}
      {reviewAppointment && (
        <div
          onClick={() => setReviewAppointment(null)}
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
              maxWidth: "500px",
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ color: "#15534c", margin: 0 }}>
                ⭐ Rate & Review Caregiver
              </h2>
              <button
                type="button"
                onClick={() => setReviewAppointment(null)}
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

            <div
              style={{
                background: "#f4faf8",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "18px",
                fontSize: "14px",
              }}
            >
              <div>
                Caregiver: <strong>{reviewAppointment.caregiverName}</strong>
              </div>
              <div style={{ color: "#506965", fontSize: "13px" }}>
                Service: {reviewAppointment.service} | Date: {reviewAppointment.appointmentDate}
              </div>
            </div>

            {reviewError && (
              <div
                style={{
                  background: "#fff1f1",
                  color: "#c0392b",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  fontSize: "13px",
                  border: "1px solid #f5c6cb",
                }}
              >
                ⚠️ {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating Picker */}
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Select Rating (1 to 5 Stars) *
                </label>
                <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: star <= reviewRating ? "#fff2d6" : "#f1f5f4",
                        border: star <= reviewRating ? "1px solid #d49a18" : "1px solid #e5efec",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "22px",
                        cursor: "pointer",
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "6px", color: "#d49a18", fontWeight: "700" }}>
                  {reviewRating} out of 5 Stars
                </div>
              </div>

              {/* Review Text */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  Your Review & Feedback *
                </label>
                <textarea
                  rows="4"
                  placeholder="Share your experience with this caregiver..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    outline: "none",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                  required
                />
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  style={{
                    padding: "13px",
                    border: "none",
                    borderRadius: "8px",
                    background: reviewLoading ? "#9abdb7" : "#15917f",
                    color: "white",
                    fontWeight: "700",
                    cursor: reviewLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {reviewLoading ? "Submitting Review..." : "⭐ Submit Review"}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAppointment(null)}
                  style={{
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#f1f5f4",
                    color: "#15534c",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function isCancelledAppointment(appt) {
  return appt?.status === "Cancelled";
}

export default MyAppointments;
