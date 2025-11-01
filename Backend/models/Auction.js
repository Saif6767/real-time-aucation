import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    startPrice: Number,
    currentBid: { type: Number, default: 0 },
    startTime: Date,
    endTime: Date,
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    // statuses: upcoming = not yet started, ongoing = active between startTime and endTime, completed = finished
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);
