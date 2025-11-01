import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
