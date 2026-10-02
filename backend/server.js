const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");
const caregiverRoutes = require("./routes/caregiverRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const emergencyContactRoutes = require("./routes/EmergencyContactRoutes");

app.use("/users", userRoutes);
app.use("/caregivers", caregiverRoutes);
app.use("/bookings", bookingRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/emergency-contacts", emergencyContactRoutes);

// Home
app.get("/", (req, res) => {
  res.send("CareLink Backend is Running");
});

app.get("/hello", (req, res) => {
  res.send("Hello CareLink");
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

let dbConnectionError = null;

const connectWithRetry = () => {
  console.log("Connecting to MongoDB Atlas...");
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("MongoDB Connected Successfully");
      dbConnectionError = null;
      app.locals.db = mongoose.connection.db;
      console.log("Database reference is ready");
    })
    .catch((error) => {
      console.error("MongoDB Connection Error:", error.message || error);
      dbConnectionError = error.message || String(error);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.get("/api/status", (req, res) => {
  let maskedUri = "Not set";
  if (process.env.MONGO_URI) {
    const parts = process.env.MONGO_URI.split("@");
    maskedUri = parts.length > 1 ? `mongodb+srv://***@${parts[1]}` : "set";
  }
  res.json({
    status: "ok",
    commit: "deploy-live-v1",
    dbReadyState: mongoose.connection.readyState,
    dbReadyStateText: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    maskedUri,
    dbError: dbConnectionError
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareLink server is running on port ${PORT}`);
});