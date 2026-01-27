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

// Add indexes for faster lookups during login
userSchema.index({ email: 1 });
userSchema.index({ email: 1, role: 1 }); // Compound index for email + role queries

const User = mongoose.model("User", userSchema);

export default User;
