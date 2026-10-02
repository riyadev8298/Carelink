const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        caregiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Caregiver",
            required: false
        },
        caregiverName: {
            type: String,
            required: true
        },
        service: {
            type: String,
            required: true
        },
        appointmentDate: {
            type: String,
            required: true
        },
        appointmentTime: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            default: "1 hour"
        },
        userName: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        specialInstructions: {
            type: String,
            default: ""
        },
        charges: {
            type: Number,
            default: 0
        },
        priceType: {
            type: String,
            default: "Free"
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Active", "Completed", "Cancelled"],
            default: "Confirmed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
