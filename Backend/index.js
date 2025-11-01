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

// Every minute check for expired auctions
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const expired = await Auction.find({
    endTime: { $lt: now },
    status: { $ne: "closed" },
  });

  for (const auc of expired) {
    auc.status = "closed";
    await auc.save();
    console.log(`⏰ Auction "${auc.title}" closed automatically`);
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
