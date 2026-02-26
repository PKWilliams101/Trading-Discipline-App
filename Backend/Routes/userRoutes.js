const express = require('express');
const router = express.Router();
const User = require('../Models/User');

// 1. REGISTER ROUTE (Fixes the 404 on Register)
// Endpoint: POST http://localhost:5000/api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (Plain text password for now to avoid bcrypt complexity errors)
    const user = await User.create({
      username,
      email,
      password,
      tradingPlanRules: [], // Default empty plan
      plannedDailyLimit: 3  // Default limit
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: "dummy_token_for_now" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// 2. LOGIN ROUTE (Fixes the 404 on Login)
// Endpoint: POST http://localhost:5000/api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    
    // Simple password check (Replace with bcrypt.compare later for security)
    if (user && (user.password === password)) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        tradingPlanRules: user.tradingPlanRules,
        plannedDailyLimit: user.plannedDailyLimit
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// Endpoint: PUT http://localhost:5000/api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

module.exports = router;