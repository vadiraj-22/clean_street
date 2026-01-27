import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../.config/config.js";
const{ JWT_USER_SECRET, JWT_ADMIN_SECRET }= config; 

export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then in Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // First decode without verification to check role
    const payload = jwt.decode(token);
    const secret = payload.role === 'admin' ? JWT_ADMIN_SECRET : JWT_USER_SECRET;
    const decoded = jwt.verify(token, secret);

    // Store minimal user data in JWT to avoid DB lookup
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${
          req.user?.role || "unknown"
        }' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then in Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // No token, but that's okay - continue without user
    req.user = null;
    return next();
  }

  try {
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_USER_SECRET);
    } catch (err) {
      decoded = jwt.verify(token, JWT_ADMIN_SECRET);
    }

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    // Invalid token, but continue without user
    req.user = null;
    next();
  }
};
