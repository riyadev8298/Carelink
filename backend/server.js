const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// ROUTES
// ===============================

const userRoutes = require("./routes/userRoutes");
const caregiverRoutes = require("./routes/caregiverRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const emergencyContactRoutes = require("./routes/EmergencyContactRoutes");


// ===============================
// ROUTE CONNECTIONS
// ===============================

app.use("/users", userRoutes);
app.use("/caregivers", caregiverRoutes);
app.use("/bookings", bookingRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/emergency-contacts", emergencyContactRoutes);


// ===============================
// TEST ROUTES
// ===============================

app.get("/", (req, res) => {
    res.send("CareLink Backend is Running");
});

app.get("/hello", (req, res) => {
    res.send("Hello CareLink");
});


// ===============================
// MONGODB CONNECTION
// ===============================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        const db = mongoose.connection.db;
        app.locals.db = db;
    })

        const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareLink server is running on port ${PORT}`);
});