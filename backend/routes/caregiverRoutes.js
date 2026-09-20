const express = require("express");
const router = express.Router();
const Caregiver = require("../models/Caregiver");
router.post("/add",async(req,res)=>{
    try{
        const caregiver = new Caregiver(req.body);
        await caregiver.save();
        res.json({
            message: "Caregiver added successfully",
            caregiver: caregiver
        });
    } catch(error) {
        res.status(500).json({
            message: "Failed to add caregiver" ,
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const caregivers = await Caregiver.find();

        res.json(caregivers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch caregivers",
            error: error.message
        });
    }
});
module.exports = router;