const express = require("express");
const router = express.Router();
const User = require("../models/User");

console.log("USER ROUTES LOADED");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        console.log("REGISTER REQUEST:", req.body);

        const { name, email, password } = req.body;

        // Check fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check existing email
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered. Please use another email."
            });
        }

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            role: "user"
        });

        await user.save();

        console.log("USER REGISTERED SUCCESSFULLY");

        return res.status(201).json({
            message: "Registration Successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log("REGISTRATION ERROR:", error);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

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
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});


// GET USERS
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");

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