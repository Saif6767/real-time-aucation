import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🟩 Register Controller
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // 🛡️ Secure admin creation logic
    // Automatically assign admin role when the email matches ADMIN_EMAIL
    let userRole = "user";
    if (email === process.env.ADMIN_EMAIL) {
      userRole = "admin";
    }

    const user = await User.create({
      username,
      email,
      password: hashed,
      role: userRole,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟦 Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // If this login email matches the configured ADMIN_EMAIL but the DB record
    // doesn't yet have admin role (older signup), promote the user to admin.
    if (email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // include role in JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
