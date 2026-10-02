const mongoose = require("mongoose");

const caregiverSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    service: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        default: ""
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    available: {
        type: Boolean,
        default: true
    },

    isFree: {
        type: Boolean,
        default: true
    },

    price: {
        type: Number,
        default: 0
    },

    priceType: {
        type: String,
        default: "per hour"
    }

});

module.exports = mongoose.model(
    "Caregiver",
    caregiverSchema
);
