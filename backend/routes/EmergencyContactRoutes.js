const express = require("express");
const router = express.Router();

const EmergencyContact = require("../models/EmergencyContact");

router.post("/add", async (req, res) => {
  try {
    const { name, phone, relation } = req.body;

    if (!name || !phone || !relation) {
      return res.status(400).json({
        message: "Please fill all fields."
      });
    }

    const contact = await EmergencyContact.create({
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim()
    });

    res.status(201).json({
      message: "Emergency contact saved successfully.",
      contact
    });

  } catch (error) {
    console.error("Emergency Contact Error:", error);

    res.status(500).json({
      message: "Failed to save emergency contact.",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const contacts = await EmergencyContact.find()
      .sort({ createdAt: -1 });

    res.status(200).json(contacts);

  } catch (error) {
    console.error("Emergency Contact Fetch Error:", error);

    res.status(500).json({
      message: "Failed to fetch emergency contacts.",
      error: error.message
    });
  }
});

module.exports = router;