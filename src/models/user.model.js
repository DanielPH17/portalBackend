import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // Default value set to "user"
    },
    fotoDePerfil: {
      type: String,
      default: null, // Optional field, URL for profile picture
    },
    imagenDePortada: {
      type: String,
      default: null, // Optional field, URL for cover image
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
