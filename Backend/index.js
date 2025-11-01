import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { setupSocket } from "./utils/socketManager.js";
import authRoutes from "./routes/authRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import cron from "node-cron";
import Auction from "./models/Auction.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Every minute update auction statuses (upcoming -> ongoing -> completed)
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // mark completed auctions
    const toComplete = await Auction.find({ endTime: { $lt: now }, status: { $ne: "completed" } });
    for (const auc of toComplete) {
      auc.status = "completed";
      await auc.save();
      console.log(`⏰ Auction "${auc.title}" marked completed automatically`);
    }

    // mark ongoing auctions (treat missing startTime as started)
    const toOngoing = await Auction.find({
      endTime: { $gt: now },
      status: { $ne: "ongoing" },
      $or: [{ startTime: { $lte: now } }, { startTime: { $exists: false } }],
    });
    for (const auc of toOngoing) {
      auc.status = "ongoing";
      await auc.save();
      console.log(`▶️ Auction "${auc.title}" marked ongoing`);
    }

    // mark upcoming auctions (if startTime in future)
    const toUpcoming = await Auction.find({ startTime: { $gt: now }, status: { $ne: "upcoming" } });
    for (const auc of toUpcoming) {
      auc.status = "upcoming";
      await auc.save();
      console.log(`🔵 Auction "${auc.title}" marked upcoming`);
    }
  } catch (err) {
    console.error("Cron auction status update error:", err);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject socket.io into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);

// Socket setup
setupSocket(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
