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

// Note: email index is automatically created by unique: true on the email field above

const User = mongoose.model("User", userSchema);

export default User;
