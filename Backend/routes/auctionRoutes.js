import express from "express";
import multer from "multer";
import { getAllAuctions, getAuctionById, createAuction } from "../controllers/auctionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer: store uploads temporarily in uploads/ (deleted after Cloudinary upload)
const upload = multer({ dest: "uploads/" });

router.get("/", getAllAuctions);
router.get("/:id", getAuctionById);
// Create auction (protected). Accepts optional file field named 'image'.
router.post("/", protect, upload.single("image"), createAuction);

export default router;
