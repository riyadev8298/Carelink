const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },

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
        type: String
    },

    date: {
        type: String
    },

    time: {
        type: String
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
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);