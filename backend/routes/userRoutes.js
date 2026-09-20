const express = require("express");
const router = express.Router();
const User = require("../models/User");

console.log("USER ROUTES LOADED");

router.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.json({
            message: "User registered successfully",
            user: user
        });

    } catch (error) {
        console.log("REGISTRATION ERROR:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        res.json({
            message: "Login successful",
            user: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});


router.get("/", async (req, res) => {
    try {
        console.log("GET USERS ROUTE WORKING");
const users = await User.find().select("-password");
        console.log("TOTAL USERS:", users.length);

        res.json(users);

    } catch (error) {
        console.log("GET USERS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});


module.exports = router;