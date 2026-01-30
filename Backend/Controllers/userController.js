const User = require("../Models/User");

// 1. REGISTER (Create User)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, experienceLevel, plannedDailyLimit } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      username,
      email,
      password,
      experienceLevel: experienceLevel || "BEGINNER",
      plannedDailyLimit: plannedDailyLimit || 3
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. LOGIN (Authenticate User)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple password check (Add bcrypt in future if needed)
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(user); // Send back the user profile
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. GET USER (Fetch Profile)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. UPDATE STRATEGY (Settings Page)
exports.updateUserStrategy = async (req, res) => {
  try {
    const { plannedDailyLimit, tradingPlanRules } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          plannedDailyLimit: plannedDailyLimit,
          tradingPlanRules: tradingPlanRules 
        } 
      },
      { new: true } // Return the fresh data
    );
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Keep your GetAllUsers if you need it for debugging
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};