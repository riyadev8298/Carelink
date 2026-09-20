const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

router.post("/add", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();

        res.json({
            message: "Booking added successfully",
            booking: booking
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add booking",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find();

        res.json(bookings);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
});

module.exports = router;