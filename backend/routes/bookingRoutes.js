const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Booking = require("../models/Booking");
const Caregiver = require("../models/Caregiver");


// ================= ADD BOOKING =================

router.post("/add", async (req, res) => {
    try {
        let caregiver = null;

        if (req.body.caregiverId && mongoose.Types.ObjectId.isValid(req.body.caregiverId)) {
            caregiver = await Caregiver.findById(req.body.caregiverId);
        }

        if (!caregiver && req.body.caregiverName) {
            caregiver = await Caregiver.findOne({ name: req.body.caregiverName });
        }

        if (!caregiver) {
            return res.status(404).json({
                message: "Caregiver not found"
            });
        }

        const isAvailable =
            caregiver.available === true ||
            caregiver.available === "true" ||
            caregiver.available === "Available";

        if (!isAvailable) {
            return res.status(400).json({
                message: "Caregiver is not available"
            });
        }

        const isFree = caregiver.isFree !== false;
        const charges = isFree ? 0 : Number(caregiver.price || req.body.charges || 0);
        const priceType = isFree ? "Free" : (caregiver.priceType || req.body.priceType || "per hour");

        const booking = new Booking({
            userName: req.body.userName,
            caregiverId: caregiver._id,
            caregiverName: caregiver.name,
            service: req.body.service || caregiver.service,
            date: req.body.date,
            time: req.body.time || "10:00 AM",
            charges: charges,
            priceType: priceType,
            status: "Active"
        });

        await booking.save();

        // Caregiver becomes unavailable during active booking
        caregiver.available = false;
        await caregiver.save();

        res.json({
            message: "Booking added successfully",
            booking: booking
        });

    } catch (error) {
        console.log("ADD BOOKING ERROR:", error);

        res.status(500).json({
            message: "Failed to add booking",
            error: error.message
        });
    }
});


// ================= GET BOOKINGS =================

router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ _id: -1 });

        // Normalize legacy bookings safely so undefined fields don't cause UI issues
        const safeBookings = bookings.map((b) => {
            const doc = b.toObject ? b.toObject() : b;
            return {
                ...doc,
                charges: typeof doc.charges === "number" ? doc.charges : (doc.charges ? Number(doc.charges) : 0),
                priceType: doc.priceType || (doc.charges > 0 ? "per hour" : "Free"),
                status: doc.status || "Active",
                time: doc.time || "10:00 AM"
            };
        });

        res.json(safeBookings);

    } catch (error) {
        console.log("GET BOOKINGS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
});


// ================= DELETE BOOKING =================

router.delete("/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking deleted successfully"
        });

    } catch (error) {
        console.log("DELETE BOOKING ERROR:", error);

        res.status(500).json({
            message: "Failed to delete booking",
            error: error.message
        });
    }
});


// ================= CANCEL BOOKING =================

router.put("/:id/cancel", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Find caregiver safely supporting both new and old legacy bookings
        let caregiver = null;

        if (booking.caregiverId && mongoose.Types.ObjectId.isValid(booking.caregiverId)) {
            try {
                caregiver = await Caregiver.findById(booking.caregiverId);
            } catch (err) {
                console.log("Caregiver lookup by ID error:", err.message);
            }
        }

        if (!caregiver && booking.caregiverName) {
            caregiver = await Caregiver.findOne({
                name: booking.caregiverName
            });
        }

        // Update booking status
        await Booking.updateOne(
            { _id: req.params.id },
            { $set: { status: "Cancelled" } }
        );

        // Restore caregiver availability
        if (caregiver) {
            await Caregiver.findByIdAndUpdate(
                caregiver._id,
                { available: true }
            );
        }

        res.json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.log("CANCEL ERROR:", error);

        res.status(500).json({
            message: "Failed to cancel booking",
            error: error.message
        });
    }
});


// ================= COMPLETE BOOKING =================

router.put("/:id/complete", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Find caregiver safely supporting both new and old legacy bookings
        let caregiver = null;

        if (booking.caregiverId && mongoose.Types.ObjectId.isValid(booking.caregiverId)) {
            try {
                caregiver = await Caregiver.findById(booking.caregiverId);
            } catch (err) {
                console.log("Caregiver lookup by ID error:", err.message);
            }
        }

        if (!caregiver && booking.caregiverName) {
            caregiver = await Caregiver.findOne({
                name: booking.caregiverName
            });
        }

        // Update booking status
        await Booking.updateOne(
            { _id: req.params.id },
            { $set: { status: "Completed" } }
        );

        // Restore caregiver availability
        if (caregiver) {
            await Caregiver.findByIdAndUpdate(
                caregiver._id,
                { available: true }
            );
        }

        res.json({
            message: "Booking completed successfully"
        });

    } catch (error) {
        console.log("COMPLETE ERROR:", error);

        res.status(500).json({
            message: "Failed to complete booking",
            error: error.message
        });
    }
});


module.exports = router;
