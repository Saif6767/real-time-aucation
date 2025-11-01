import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";

export const placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    // Use atomic update to prevent races and accept bids only while auction is active
    const now = new Date();
    if (auction.startTime && new Date(auction.startTime) > now) {
      return res.status(400).json({ message: "Auction hasn't started yet" });
    }
    if (new Date(auction.endTime) <= now) {
      return res.status(400).json({ message: "Auction expired" });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ message: "Bid too low" });
    }

    // Create bid first, then try to atomically update the auction to include this bid
    const bid = await Bid.create({
      auction: auctionId,
      user: req.user.id,
      amount,
    });

    // Attempt atomic update: only update if auction still active and currentBid is still lower than amount
    const updated = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        endTime: { $gt: now },
        $or: [{ startTime: { $lte: now } }, { startTime: { $exists: false } }],
        currentBid: { $lt: amount },
      },
      { $set: { currentBid: amount }, $push: { bids: bid._id } },
      { new: true }
    );

    if (!updated) {
      // Auction expired or someone beat the bid; remove the created bid to avoid orphan
      await Bid.findByIdAndDelete(bid._id).catch(() => {});
      // Determine reason for failure
      const fresh = await Auction.findById(auctionId).lean();
      if (!fresh) return res.status(404).json({ message: "Auction not found" });
      if (new Date(fresh.endTime) <= now) return res.status(400).json({ message: "Auction expired" });
      if (amount <= fresh.currentBid) return res.status(400).json({ message: "Bid too low" });
      return res.status(400).json({ message: "Bid rejected" });
    }

    // Socket event trigger (real-time update) - emit to the auction room
    try {
      req.io.to(auctionId.toString()).emit("bid_update", { auctionId, newBid: amount });
    } catch (e) {
      console.error("Socket emit error:", e);
    }

    res.status(201).json({ message: "Bid placed", bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
