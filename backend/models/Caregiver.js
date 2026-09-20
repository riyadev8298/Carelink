const mongoose= require("mongoose");
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
    available: {
        type: String,
        default: true
    }

});
module.exports = mongoose.model("Caregiver",caregiverSchema);