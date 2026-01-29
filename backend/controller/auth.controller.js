import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../.config/config.js";

const { JWT_USER_SECRET, JWT_ADMIN_SECRET, NODE_ENV, ADMIN_PASSKEY } = config;

// Optimize bcrypt rounds for better performance
// 10 rounds provides excellent security while keeping login fast (~100-150ms for hash comparison)
// 12 rounds adds ~150-200ms extra latency with minimal security benefit
const BCRYPT_ROUNDS = NODE_ENV === 'production' ? 10 : 8;

// Function to generate token and set cookie
const generateTokenAndSetCookie = (res, user) => {
  const secret = user.role === "admin" ? JWT_ADMIN_SECRET : JWT_USER_SECRET;
  const token = jwt.sign({
    id: user._id,
    role: user.role,
    email: user.email
  }, secret, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
  });
  return token;
};

//Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, location, adminPasskey } = req.body;

    // Admin passkey validation
    if (role === "admin") {
      if (!adminPasskey || adminPasskey.trim() === "") {
        return res.status(400).json({ message: "Admin passkey is required" })
      }

      // Ensure ADMIN_PASSKEY is loaded from config
      if (!ADMIN_PASSKEY) {
        console.error("ADMIN_PASSKEY is not configured in environment variables");
        return res.status(500).json({ message: "Server configuration error: Admin passkey not set" })
      }

      const receivedKey = adminPasskey.trim();
      const expectedKey = ADMIN_PASSKEY.trim();

      if (receivedKey !== expectedKey) {
        return res.status(403).json({ message: "Invalid admin passkey" })
      }
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      location,
    });

    await newUser.save();

    const token = generateTokenAndSetCookie(res, newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location,
        profilePhoto: newUser.profilePhoto,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user with lean() for better performance
    // Select only fields needed for login to reduce data transfer
    const user = await User.findOne({ email })
      .select('_id name email password role location profilePhoto')
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Convert lean object back to mongoose document for token generation
    const userDoc = { ...user, _id: user._id, role: user.role, email: user.email };
    const token = generateTokenAndSetCookie(res, userDoc);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};