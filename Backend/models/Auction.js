import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    startPrice: Number,
    currentBid: { type: Number, default: 0 },
    endTime: Date,
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);
