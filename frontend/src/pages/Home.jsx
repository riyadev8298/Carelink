import { Link } from "react-router-dom";

function Home() {
  const services = [
    {
      title: "Elder Care",
      icon: "👵",
      desc: "Compassionate companionship, mobility assistance, medication reminders, and respectful daily care for elderly family members.",
      serviceName: "Elder Care",
    },
    {
      title: "Patient Care",
      icon: "🏥",
      desc: "Dedicated support for patients recovering at home after hospital discharge, illness, or surgery.",
      serviceName: "Patient Care",
    },
    {
      title: "Baby Care",
      icon: "👶",
      desc: "Gentle, experienced, and safe caregiving assistance for newborns, toddlers, and young children.",
      serviceName: "Baby Care",
    },
    {
      title: "Home Care",
      icon: "🏠",
      desc: "Reliable assistance with everyday household routines, meal prep, and comfortable living at home.",
      serviceName: "Home Care",
    },
  ];

  return (
    <div className="home-page">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">TRUSTED HEALTHCARE & COMPANIONSHIP</div>
          <h1>CareLink</h1>
          <h2>Connecting You With Trusted Caregivers</h2>
          <p>
            Find reliable caregivers for elderly care, patient care, baby care,
            and home care. Verified professionals ready to support your family
            with compassion and dignity.
          </p>

          <div className="buttons hero-buttons">
            <Link to="/caregivers" className="btn btn-primary">
              🔍 Find Caregiver
            </Link>
            <Link to="/register" className="btn btn-secondary">
              📝 Register
            </Link>
            <Link to="/login" className="btn btn-outline">
              🔐 Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section className="services">
        <div className="section-title-wrap">
          <span className="section-tag">WHAT WE OFFER</span>
          <h2>Our Care Services</h2>
          <p className="section-subtitle">
            Explore personalized care options designed to suit your loved ones'
            specific needs.
          </p>
        </div>

        <div className="service-container">
          {services.map((s, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <Link
                to={`/caregivers?service=${encodeURIComponent(s.serviceName)}`}
                className="service-link"
              >
                Find {s.title} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY CHOOSE CARELINK ================= */}
      <section className="why-section-home">
        <div className="why-container">
          <h2>Why Families Trust CareLink</h2>
          <div className="why-grid">
            <div className="why-item">
              <span className="why-icon">🛡️</span>
              <h4>Verified Caregivers</h4>
              <p>Thoroughly verified profiles with background checks and customer reviews.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">💰</span>
              <h4>Transparent Charges</h4>
              <p>Clear hourly or fixed rates with free service options and no hidden fees.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">📅</span>
              <h4>Simple Appointments</h4>
              <p>Easily select your preferred date, time, and service with instant confirmation.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">🤝</span>
              <h4>Dedicated Support</h4>
              <p>Reliable communication and flexible rescheduling whenever your plans change.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK CTA ================= */}
      <section className="home-cta">
        <div className="home-cta-box">
          <h2>Ready to book a caregiver for your loved one?</h2>
          <p>Browse qualified caregivers or register your account today.</p>
          <div className="buttons">
            <Link to="/caregivers" className="btn btn-primary">
              Find Caregiver
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;