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

router.delete("/:id", async (req, res) => {
  try {
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Emergency contact not found."
      });
    }

    res.status(200).json({
      message: "Emergency contact deleted successfully."
    });
  } catch (error) {
    console.error("Delete Emergency Contact Error:", error);

    res.status(500).json({
      message: "Failed to delete emergency contact.",
      error: error.message
    });
  }
});

module.exports = router;