const express = require("express");
const router = express.Router();


// ================= ADD EMERGENCY CONTACT =================

router.post("/add", async (req, res) => {
  try {
    const { name, phone, relation } = req.body;

    if (!name || !phone || !relation) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit phone number."
      });
    }

    const db = req.app.locals.db;

    const contact = {
      name: name,
      phone: phone,
      relation: relation,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db
      .collection("emergencycontacts")
      .insertOne(contact);

    res.status(201).json({
      message: "Emergency contact saved successfully.",
      contact: {
        _id: result.insertedId,
        ...contact
      }
    });

  } catch (error) {
    console.error("ADD EMERGENCY CONTACT ERROR:", error);

    res.status(500).json({
      message: "Failed to save emergency contact.",
      error: error.message
    });
  }
});


// ================= GET ALL EMERGENCY CONTACTS =================

router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const contacts = await db
      .collection("emergencycontacts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(contacts);

  } catch (error) {
    console.error("GET EMERGENCY CONTACTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch emergency contacts.",
      error: error.message
    });
  }
});


// ================= DELETE EMERGENCY CONTACT =================

router.delete("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const mongoose = require("mongoose");

    const result = await db
      .collection("emergencycontacts")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(req.params.id)
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Emergency contact not found."
      });
    }

    res.json({
      message: "Emergency contact deleted successfully."
    });

  } catch (error) {
    console.error("DELETE EMERGENCY CONTACT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete emergency contact.",
      error: error.message
    });
  }
});


module.exports = router;