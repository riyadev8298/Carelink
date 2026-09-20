require("dotenv").config(); 
 
const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
 
const userRoutes = require("./routes/userRoutes"); 
const caregiverRoutes = require("./routes/caregiverRoutes"); 
const bookingRoutes = require("./routes/bookingRoutes"); 
 
const app = express(); 
 
app.use(cors()); 
app.use(express.json()); 
 
app.use("/users", userRoutes); 
app.use("/caregivers", caregiverRoutes); 
app.use("/bookings", bookingRoutes); 
 
app.get("/", (req, res) => { 
    res.send("CareLink Backend is Running"); 
}); 
 
mongoose.connect(process.env.MONGO_URI) 
    .then(() => { 
        console.log("MongoDB Connected Successfully"); 
 
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => { 
            console.log(`CareLink server is running on port ${PORT}`); 
        }); 
    }) 
    .catch((error) => { 
        console.log("MongoDB connection error:", error.message); 
    });