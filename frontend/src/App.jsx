import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [caregivers, setCaregivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminCaregivers, setAdminCaregivers] = useState([]);

  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showCaregiverForm, setShowCaregiverForm] = useState(false);
const [caregiverName, setCaregiverName] = useState("");
const [caregiverService, setCaregiverService] = useState("");
const [caregiverLocation, setCaregiverLocation] = useState("");
const [caregiverPhone, setCaregiverPhone] = useState("");

  const [showBooking, setShowBooking] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState("");
  const [date, setDate] = useState("");

  // Find Caregivers
  const findCaregivers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/caregivers"
      );
      setCaregivers(response.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // Confirm Booking
  const confirmBooking = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/bookings/add",
        {
          userName: userName,
          caregiverName: selectedCaregiver,
          service: "Care Service",
          date: date,
          time: "10:00 AM"
        }
      );

      alert("Booking confirmed successfully!");
      console.log(response.data);
    } catch (error) {
      console.log("Booking Error:", error);
      alert("Booking failed");
    }
  };

  // Get Bookings
  const getBookings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/bookings"
      );
      setBookings(response.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // Register
  const registerUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/users/register",
        {
          name: registerName,
          email: registerEmail,
          password: registerPassword
        }
      );

      alert("Registration Successful!");
      console.log(response.data);
    } catch (error) {
      console.log("Registration Error:", error);

      if (error.response) {
        alert(
          "Registration Failed: " +
          (error.response.data.error ||
            error.response.data.message)
        );
      } else {
        alert("Registration Failed: Backend is not connected");
      }
    }
  };

  // Login
  const loginUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        {
          email: loginEmail,
          password: loginPassword
        }
      );

      alert("Login Successful!");
      console.log(response.data);
    } catch (error) {
      console.log("FULL LOGIN ERROR:", error);

      if (error.response) {
        alert(
          "Login Error: " +
          JSON.stringify(error.response.data)
        );
      } else {
        alert("Login Error: Backend is not connected");
      }
    }
  };
  const addCaregiver = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/caregivers/add",
      {
        name: caregiverName,
        service: caregiverService,
        location: caregiverLocation,
        phone: caregiverPhone
      }
    );

    alert("Caregiver registration successful!");

    console.log(response.data);

    setShowCaregiverForm(false);

    setCaregiverName("");
    setCaregiverService("");
    setCaregiverLocation("");
    setCaregiverPhone("");

    findCaregivers();

  } catch (error) {
    console.log("Caregiver Error:", error);

    if (error.response) {
      alert(
        "Caregiver Registration Failed: " +
        (error.response.data.error || error.response.data.message)
      );
    } else {
      alert("Caregiver Registration Failed: Backend is not connected");
    }
  }
};
const getUsers = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/users"
    );

    setUsers(response.data);
  } catch (error) {
    console.log("Users Error:", error);
  }
};
const getAdminCaregivers = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/caregivers"
    );

    setAdminCaregivers(response.data);
  } catch (error) {
    console.log("Caregivers Error:", error);
  }
};

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          CareLink
        </div>

        <div className="nav-buttons">
          <button>Home</button>

          <button
            onClick={() =>
              document
                .getElementById("services")
                .scrollIntoView()
            }
          >
            Services
          </button>

          <button onClick={() => setShowRegister(true)}>
            Register
          </button>

          <button onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button onClick={() => setShowCaregiverForm(true)}>
  Become a Caregiver
</button>

<button 
  onClick={() => { 
    setShowAdmin(true); 
    getUsers(); 
    getAdminCaregivers();
  }} 
> 
  Admin Dashboard 
</button>
 
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          <h1>
            Care and Support at Your Fingertips
          </h1>

          <p>
            Find trusted caregivers and book quality
            care services easily for your loved ones.
          </p>

          <button onClick={findCaregivers}>
            Find a Caregiver
          </button>

          <button onClick={() => setShowBooking(true)}>
            Book Care
          </button>

        </div>
      </section>

      {/* Welcome */}
      <section className="welcome">
        <h2>Welcome to CareLink</h2>

        <p>
          CareLink helps you find and book trusted
          care services easily and conveniently.
        </p>
      </section>

      {/* Register */}
      {showRegister && (
        <section className="form-section">
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={registerName}
            onChange={(e) =>
              setRegisterName(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={registerEmail}
            onChange={(e) =>
              setRegisterEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={registerPassword}
            onChange={(e) =>
              setRegisterPassword(e.target.value)
            }
          />

          <br />

          <button onClick={registerUser}>
            Submit Registration
          </button>
        </section>
      )}

      {/* Login */}
      {showLogin && (
        <section className="form-section">
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={loginEmail}
            onChange={(e) =>
              setLoginEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(e) =>
              setLoginPassword(e.target.value)
            }
          />

          <br />

          <button onClick={loginUser}>
            Login
          </button>
        </section>
      )}
      {showCaregiverForm && (
  <section className="form-section">

    <h2>Become a Caregiver</h2>

    <input
      type="text"
      placeholder="Enter your name"
      value={caregiverName}
      onChange={(e) => setCaregiverName(e.target.value)}
    />

    <select
      value={caregiverService}
      onChange={(e) => setCaregiverService(e.target.value)}
    >
      <option value="">Select Service</option>
      <option value="Elder Care">Elder Care</option>
      <option value="Patient Care">Patient Care</option>
      <option value="Baby Care">Baby Care</option>
      <option value="Home Care">Home Care</option>
    </select>

    <input
      type="text"
      placeholder="Enter your location"
      value={caregiverLocation}
      onChange={(e) => setCaregiverLocation(e.target.value)}
    />

    <input
      type="tel"
      placeholder="Enter your phone number"
      value={caregiverPhone}
      onChange={(e) => setCaregiverPhone(e.target.value)}
    />

    <br />

    <button onClick={addCaregiver}>
      Register as Caregiver
    </button>

  </section>
)}
{showAdmin && (
  <section className="form-section">
    <h2>Admin Dashboard</h2>

    <h3>CareLink Management</h3>

    <p>
      Welcome to the CareLink Admin Dashboard.
    </p>

    <p>
      Manage users, caregivers and bookings from one place.
    </p>
    <h3>Registered Users</h3>

{users.map((user) => (
  <div key={user._id}>
    <p><b>Name:</b> {user.name}</p>
    <p><b>Email:</b> {user.email}</p>
    <p><b>Role:</b> {user.role}</p>
    <hr />
  </div>
))}
<h3>Registered Caregivers</h3>

{adminCaregivers.map((caregiver) => (
  <div key={caregiver._id}>
    <p><b>Name:</b> {caregiver.name}</p>
    <p><b>Service:</b> {caregiver.service}</p>
    <p><b>Location:</b> {caregiver.location}</p>
    <p><b>Phone:</b> {caregiver.phone}</p>
    <p>
      <b>Available:</b>{" "}
      {caregiver.available ? "Yes" : "No"}
    </p>
    <hr />
  </div>
))}
<h3>Registered Bookings</h3>

{bookings.map((booking) => (
  <div key={booking._id}>
    <p><b>User:</b> {booking.userName}</p>
    <p><b>Caregiver:</b> {booking.caregiverName}</p>
    <p><b>Service:</b> {booking.service}</p>
    <p><b>Date:</b> {booking.date}</p>
    <p><b>Time:</b> {booking.time}</p>
    <p><b>Status:</b> {booking.status}</p>
    <hr />
  </div>
))}

    <button 
  onClick={() => { 
    setShowAdmin(true); 
    getUsers(); 
    getAdminCaregivers();
    getBookings();
  }} 
> 
  Admin Dashboard 
</button>
  </section>
)}
      {/* Services */}
      <section id="services" className="services">
        <h2>Our Services</h2>

        <div className="service-container">

          <div className="service-card">
            <h3>👵 Elder Care</h3>
            <p>
              Caring and supportive services for elderly people.
            </p>
          </div>

          <div className="service-card">
            <h3>🏥 Patient Care</h3>
            <p>
              Home care and support for patients.
            </p>
          </div>

          <div className="service-card">
            <h3>👶 Baby Care</h3>
            <p>
              Safe and reliable care for babies.
            </p>
          </div>

          <div className="service-card">
            <h3>🏠 Home Care</h3>
            <p>
              Helpful care services available at home.
            </p>
          </div>

        </div>
      </section>

      {/* Booking Buttons */}
      <section className="action-section">

        <button onClick={findCaregivers}>
          Find a Caregiver
        </button>

        <button onClick={() => setShowBooking(true)}>
          Book Care
        </button>

        <button onClick={getBookings}>
          My Bookings
        </button>

      </section>

      {/* Booking Form */}
      {showBooking && (
        <section className="form-section">
          <h2>Book Care</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) =>
              setUserName(e.target.value)
            }
          />

          <select
            value={selectedCaregiver}
            onChange={(e) =>
              setSelectedCaregiver(e.target.value)
            }
          >
            <option value="">
              Select Caregiver
            </option>

            {caregivers.map((caregiver) => (
              <option
                key={caregiver._id}
                value={caregiver.name}
              >
                {caregiver.name} - {caregiver.service}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <br />

          <button onClick={confirmBooking}>
            Confirm Booking
          </button>
        </section>
      )}

      {/* Available Caregivers */}
      <section className="caregiver-section">
        <h2>Available Caregivers</h2>

        <div className="caregiver-container">

          {caregivers.map((caregiver) => (
            <div
              className="caregiver-card"
              key={caregiver._id}
            >
              <h3>{caregiver.name}</h3>

              <p>
                <b>Service:</b> {caregiver.service}
              </p>

              <p>
                <b>Location:</b> {caregiver.location}
              </p>

              <p>
                <b>Phone:</b> {caregiver.phone}
              </p>

              <p>
                <b>Status:</b>{" "}
                {caregiver.available
                  ? "Available"
                  : "Not Available"}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* My Bookings */}
      <section className="booking-section">

        {bookings.map((booking) => (
          <div
            className="booking-card"
            key={booking._id}
          >
            <h3>My Booking</h3>

            <p>
              <b>User:</b> {booking.userName}
            </p>

            <p>
              <b>Caregiver:</b>{" "}
              {booking.caregiverName}
            </p>

            <p>
              <b>Service:</b> {booking.service}
            </p>

            <p>
              <b>Date:</b> {booking.date}
            </p>

            <p>
              <b>Time:</b> {booking.time}
            </p>

            <p>
              <b>Status:</b> {booking.status}
            </p>
          </div>
        ))}

      </section>

      {/* Why Choose CareLink */}
      <section className="why-section">

        <h2>Why Choose CareLink?</h2>

        <div className="why-container">

          <div>
            <h3>✓ Trusted Caregivers</h3>
            <p>
              Find caregivers for different care needs.
            </p>
          </div>

          <div>
            <h3>✓ Easy Booking</h3>
            <p>
              Book care services quickly and easily.
            </p>
          </div>

          <div>
            <h3>✓ All Care Services</h3>
            <p>
              Multiple care services available in one place.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="footer">
        <h2>CareLink</h2>
        <p>
          Care and Support at Your Fingertips
        </p>
        <p>© 2026 CareLink. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;

