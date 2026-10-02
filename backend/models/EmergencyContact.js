const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    relation: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);

module.exports = EmergencyContact;