import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Helper for today's date in YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Appointments() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage if logged in
  const getLoggedInUser = () => {
    try {
      const stored = localStorage.getItem("carelink_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getLoggedInUser();

  const [caregivers, setCaregivers] = useState([]);
  const [loadingCaregivers, setLoadingCaregivers] = useState(true);

  // Form Fields
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(
    location.state?.caregiver?._id || location.state?.caregiverId || ""
  );
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState("1 hour");
  const [patientName, setPatientName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Fetch available caregivers for dropdown
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoadingCaregivers(true);
        const res = await axios.get(`${API_BASE_URL}/caregivers`);
        const list = Array.isArray(res.data) ? res.data : [];
        setCaregivers(list);

        // If no caregiver selected yet and we have caregivers, check if state had one
        if (!selectedCaregiverId && location.state?.caregiver?._id) {
          setSelectedCaregiverId(location.state.caregiver._id);
        }
      } catch (err) {
        console.error("Error fetching caregivers:", err);
        setErrorMessage(
          "Unable to load caregivers list from backend. Please ensure the backend is running."
        );
      } finally {
        setLoadingCaregivers(false);
      }
    };

    fetchCaregivers();
  }, [location.state, selectedCaregiverId]);

  // Find currently selected caregiver object
  const activeCaregiver =
    caregivers.find((c) => c._id === selectedCaregiverId) ||
    location.state?.caregiver ||
    null;

  // Calculate duration multiplier in hours
  const getDurationHours = (dur) => {
    if (dur.includes("1 hour")) return 1;
    if (dur.includes("2 hours")) return 2;
    if (dur.includes("3 hours")) return 3;
    if (dur.includes("4 hours")) return 4;
    if (dur.includes("6 hours")) return 6;
    if (dur.includes("8 hours")) return 8;
    if (dur.includes("12 hours") || dur.includes("Full Day")) return 12;
    return 1;
  };

  // Calculate charges
  const calculateCharges = () => {
    if (!activeCaregiver) return 0;
    if (activeCaregiver.isFree) return 0;

    const basePrice = Number(activeCaregiver.price) || 0;
    const priceType = (activeCaregiver.priceType || "").toLowerCase();

    if (priceType.includes("hour")) {
      const hours = getDurationHours(duration);
      return basePrice * hours;
    }
    return basePrice;
  };

  const calculatedCharges = calculateCharges();

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessData(null);

    if (!activeCaregiver) {
      setErrorMessage("Please select a caregiver.");
      return;
    }

    if (!appointmentDate) {
      setErrorMessage("Please select an appointment date.");
      return;
    }

    if (appointmentDate < getTodayString()) {
      setErrorMessage("Appointment date cannot be in the past.");
      return;
    }

    if (!appointmentTime) {
      setErrorMessage("Please select an appointment time.");
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage("Please enter patient/client name.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter contact phone number.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please enter service address.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        caregiverId: activeCaregiver._id,
        caregiverName: activeCaregiver.name,
        service: activeCaregiver.service,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        duration: duration,
        userName: patientName.trim(),
        userEmail: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        specialInstructions: specialInstructions.trim(),
        charges: calculatedCharges,
        priceType: activeCaregiver.isFree
          ? "Free"
          : activeCaregiver.priceType || "per hour",
      };

      console.log("SUBMITTING APPOINTMENT:", payload);

      const response = await axios.post(
        `${API_BASE_URL}/appointments/add`,
        payload
      );

      console.log("APPOINTMENT SUCCESS:", response.data);
      setSuccessData(response.data.appointment || payload);
    } catch (err) {
      console.error("APPOINTMENT SUBMIT ERROR:", err);

      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(
          "Failed to book appointment. Please verify that backend is running at http://localhost:5000."
        );
      }
    } finally {
      setSubmitting(false);
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
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
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
            Book an Appointment
          </h1>
          <p style={{ color: "#71807e", fontSize: "15px" }}>
            Schedule professional care services with verified caregivers.
          </p>
        </div>

        {/* Success Modal / Card */}
        {successData && (
          <div
            style={{
              background: "white",
              padding: "35px",
              borderRadius: "18px",
              boxShadow: "0 10px 35px rgba(21, 145, 127, 0.15)",
              border: "2px solid #15917f",
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎉</div>
            <h2 style={{ color: "#15534c", margin: "10px 0" }}>
              Appointment Booked Successfully!
            </h2>
            <p style={{ color: "#506965", fontSize: "15px" }}>
              Your appointment with <strong>{successData.caregiverName}</strong> (
              {successData.service}) has been confirmed for{" "}
              <strong>{successData.appointmentDate}</strong> at{" "}
              <strong>{successData.appointmentTime}</strong>.
            </p>

            <div
              style={{
                display: "inline-block",
                background: "#f0f9f7",
                padding: "15px 25px",
                borderRadius: "10px",
                margin: "15px 0 25px",
                textAlign: "left",
              }}
            >
              <div>
                <strong>Patient:</strong> {successData.userName}
              </div>
              <div>
                <strong>Contact:</strong> {successData.phone}
              </div>
              <div>
                <strong>Duration:</strong> {successData.duration}
              </div>
              <div>
                <strong>Charges:</strong>{" "}
                {successData.charges === 0
                  ? "Free Service"
                  : `₹${successData.charges}`}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span style={{ color: "#15917f", fontWeight: "700" }}>
                  🟢 Confirmed
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/my-appointments")}
                style={{
                  background: "#15917f",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                📋 View My Appointments
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setAppointmentDate("");
                  setAppointmentTime("");
                  setSpecialInstructions("");
                }}
                style={{
                  background: "white",
                  color: "#15534c",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "1px solid #15534c",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ➕ Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
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

        {/* Booking Form Card */}
        <div
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "18px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            border: "1px solid #e5efec",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* 1. SELECT CAREGIVER */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                1. Select Caregiver *
              </label>

              {loadingCaregivers ? (
                <div style={{ color: "#71807e", fontSize: "14px" }}>
                  Loading caregivers list...
                </div>
              ) : (
                <select
                  value={selectedCaregiverId}
                  onChange={(e) => setSelectedCaregiverId(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    background: "white",
                    fontSize: "14px",
                    color: "#274a45",
                    outline: "none",
                  }}
                  required
                >
                  <option value="">-- Choose a Caregiver --</option>
                  {caregivers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.service} ({c.location}) -{" "}
                      {c.isFree ? "Free" : `₹${c.price}/${c.priceType || "hr"}`}
                    </option>
                  ))}
                </select>
              )}

              {/* Selected Caregiver Info Badge */}
              {activeCaregiver && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px 16px",
                    background: "#f0f8f6",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <strong>Selected:</strong> {activeCaregiver.name} (
                    {activeCaregiver.service}) - 📍 {activeCaregiver.location}
                  </div>
                  <div>
                    <strong>Rate:</strong>{" "}
                    {activeCaregiver.isFree
                      ? "Free Service"
                      : `₹${activeCaregiver.price} / ${
                          activeCaregiver.priceType || "per hour"
                        }`}
                  </div>
                </div>
              )}
            </div>

            {/* 2. DATE & TIME */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "22px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  2. Appointment Date *
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  3. Appointment Time *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    background: "white",
                    fontSize: "14px",
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
            </div>

            {/* 3. DURATION */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                4. Select Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #d5e5e1",
                  borderRadius: "8px",
                  background: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="6 hours">6 hours</option>
                <option value="8 hours">8 hours</option>
                <option value="Full Day (12 hours)">Full Day (12 hours)</option>
              </select>
            </div>

            {/* 4. PATIENT & CONTACT DETAILS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "22px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  5. Patient / Client Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name of patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#15534c",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  6. Contact Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #d5e5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                7. Contact Phone Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #d5e5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
                required
              />
            </div>

            {/* 5. ADDRESS */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                8. Service Address *
              </label>
              <textarea
                rows="3"
                placeholder="House / Flat No, Street, Landmark, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #d5e5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
                required
              />
            </div>

            {/* 6. SPECIAL INSTRUCTIONS */}
            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  color: "#15534c",
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                9. Special Instructions (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Any medical condition, dietary needs, or specific instructions for caregiver..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #d5e5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* 7. CHARGES SUMMARY */}
            <div
              style={{
                background: "#f6fbfa",
                border: "1px solid #dcece8",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#15534c",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  💰 Estimated Charges:
                </span>
                <div style={{ color: "#71807e", fontSize: "13px" }}>
                  {activeCaregiver?.isFree
                    ? "Complimentary care assistance"
                    : `Based on ₹${activeCaregiver?.price || 0} / ${
                        activeCaregiver?.priceType || "per hour"
                      } × ${duration}`}
                </div>
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#15917f",
                }}
              >
                {activeCaregiver?.isFree
                  ? "Free Service"
                  : `₹${calculatedCharges}`}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "10px",
                background: submitting ? "#9abdb7" : "#15917f",
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(21, 145, 127, 0.25)",
              }}
            >
              {submitting ? "Booking Appointment..." : "📅 Confirm & Submit Appointment"}
            </button>
          </form>
        </div>

        {/* Bottom Navigation Link */}
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Link
            to="/my-appointments"
            style={{
              color: "#15917f",
              fontWeight: "700",
              textDecoration: "underline",
              marginRight: "20px",
            }}
          >
            Go to My Appointments &rarr;
          </Link>

          <Link
            to="/caregivers"
            style={{
              color: "#15534c",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Browse More Caregivers
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
