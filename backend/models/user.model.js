import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      default: "user",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Optimized index for login lookups
// The compound index {email: 1, role: 1} covers both:
// - Queries by email only (uses index prefix matching)
// - Queries by email AND role
// No need for a separate email-only index (would be redundant and slow down writes)
userSchema.index({ email: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
