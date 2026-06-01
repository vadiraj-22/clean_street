import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import config from "../.config/config.js";

const { JWT_USER_SECRET, JWT_ADMIN_SECRET, NODE_ENV, ADMIN_PASSKEY, GOOGLE_CLIENT_ID } = config;

// Lazy-initialize Google OAuth client (avoids crash when GOOGLE_CLIENT_ID is not yet set)
let googleClient = null;
const getGoogleClient = () => {
  if (!googleClient && GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

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
      authProvider: "local",
      isProfileComplete: true,
    });

    await newUser.save();

    const token = generateTokenAndSetCookie(res, newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location,
        profilePhoto: newUser.profilePhoto,
        isProfileComplete: newUser.isProfileComplete,
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
      .select('_id name email password role location profilePhoto authProvider isProfileComplete')
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user signed up via Google and has no password, tell them to use Google
    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please sign in with Google." });
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
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Google Sign-In
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not configured in environment variables");
      return res.status(500).json({ message: "Server configuration error: Google Client ID not set" });
    }

    // Verify the Google ID token
    const client = getGoogleClient();
    if (!client) {
      return res.status(500).json({ message: "Server configuration error: Google Client ID not set" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Could not retrieve email from Google account" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // Existing user — update googleId if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profilePhoto && picture) {
          user.profilePhoto = picture;
        }
        await user.save();
      }
    } else {
      // New user — create with Google info, mark profile as incomplete
      isNewUser = true;
      user = new User({
        name: name || "Google User",
        email,
        googleId,
        authProvider: "google",
        profilePhoto: picture || "",
        role: "user",
        location: "",
        isProfileComplete: false,
      });
      await user.save();
    }

    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      message: isNewUser ? "Account created with Google" : "Login successful",
      token,
      isNewUser,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(401).json({ message: "Google sign-in expired. Please try again." });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};