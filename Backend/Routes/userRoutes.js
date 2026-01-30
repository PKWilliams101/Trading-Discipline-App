const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

// AUTH ROUTES
router.post("/register", userController.createUser); // Register
router.post("/login", userController.loginUser);     // Login

// PROFILE ROUTES
router.get("/", userController.getAllUsers);         // Get all (Debug)
router.get("/:id", userController.getUserById);      // Get Profile
router.put("/:id/strategy", userController.updateUserStrategy); // Update Settings

module.exports = router;