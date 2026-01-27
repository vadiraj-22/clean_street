import express from "express";
import mongoose from "mongoose";
import config from "./.config/config.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import adminRoutes from "./routes/admin.routes.js"; // Single, correct import
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { performanceLogger, requestSizeLimiter } from './middleware/performance.middleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout' });
  });
  next();
});

// Performance monitoring
app.use(performanceLogger);
app.use(requestSizeLimiter);

// --- Middleware ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://infosys-spring-board-clean-p-roject.vercel.app",
    "https://clean-street.vercel.app"
  ],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(cookieParser());
// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running...",
    timestamp: new Date().toISOString(),
    status: "healthy"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes); // Use the routes once


// --- Database Connection ---
console.log("🔍 Environment check:");
console.log("MONGO_URL:", config.MONGO_URL ? "✅ Set" : "❌ Missing");
console.log("JWT_USER_SECRET:", config.JWT_USER_SECRET ? "✅ Set" : "❌ Missing");
console.log("JWT_ADMIN_SECRET:", config.JWT_ADMIN_SECRET ? "✅ Set" : "❌ Missing");
console.log("PORT:", config.PORT);
console.log("NODE_ENV:", config.NODE_ENV);

if (!config.MONGO_URL) {
  console.error("❌ MongoDB connection error: MONGO_URL is missing.");
  console.error("Please set the MONGO_URL environment variable.");
  process.exit(1);
}

if (!config.JWT_USER_SECRET) {
  console.error("❌ JWT_USER_SECRET is missing.");
  console.error("Please set the JWT_USER_SECRET environment variable.");
  process.exit(1);
}

if (!config.JWT_ADMIN_SECRET) {
  console.error("❌ JWT_ADMIN_SECRET is missing.");
  console.error("Please set the JWT_ADMIN_SECRET environment variable.");
  process.exit(1);
}

mongoose.connect(config.MONGO_URL, {
  maxPoolSize: 10, // Maximum number of connections
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
);