const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

// POST /api/users - Create user
router.post("/", userController.createUser);

// GET /api/users - Get all users
router.get("/", userController.getAllUsers);

// GET /api/users/:id - Get specific user
router.get("/:id", userController.getUserById);

module.exports = router;