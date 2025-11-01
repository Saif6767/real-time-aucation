import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Ensure env vars are loaded even if this module is imported before the app's
// central dotenv.config() runs (node may evaluate imports before index.js body).
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn("Cloudinary env vars missing: ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set.");
}

export default cloudinary;
