import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CountdownTimer from "../components/CountdownTimer";
import BidModal from "../components/BidModal";
import axios from "../services/axiosConfig";
import socket from "../services/socket";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAuction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/auctions/${id}`);
      setAuction(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();

    const onBidUpdate = (data) => {
      const auctionId = data.auctionId || data.auction_id || data.id;
      const newBid = data.newBid ?? data.currentBid ?? data.bidAmount ?? data.amount;
      if (!auctionId || newBid == null) return;
      if (auctionId === id && auction) {
        setAuction((prev) => ({ ...prev, currentBid: Number(newBid) }));
      }
    };

    socket.on("bid_update", onBidUpdate);
    // Join auction room so we receive room-scoped updates for this auction
    try {
      socket.emit("join_auction", id);
    } catch (e) {
      // ignore
    }

    // Re-join on reconnects
    const rejoin = () => {
      try {
        socket.emit("join_auction", id);
      } catch (e) {
        // ignore
      }
    };
    socket.on("connect", rejoin);

    return () => {
      try {
        socket.emit("leave_auction", id);
      } catch (e) {
        // ignore
      }
      socket.off("bid_update", onBidUpdate);
      socket.off("connect", rejoin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBidSubmit = async (amount) => {
    const newBid = Number(amount);
    if (!auction) return;
    // client-side check: ensure auction not expired
    if (new Date(auction.endTime) <= new Date()) {
      alert("Auction has already ended");
      return;
    }

    if (newBid <= auction.currentBid) {
      alert("Bid must be higher than current bid!");
      return;
    }
    try {
      await axios.post(`/bids`, { auctionId: auction._id || auction.id, amount: newBid });
      // success: server emits socket update which will update state. Optimistically update for snappy UI:
      setAuction((prev) => ({ ...prev, currentBid: newBid }));
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to place bid");
    }
  };

  if (loading) return <p>Loading auction...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!auction) return <p>Auction not found.</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 mt-4">
      <img
        src={auction.image}
        alt={auction.title}
        className="rounded-xl w-full h-64 object-cover"
      />
      <h2 className="text-2xl font-bold mt-4">{auction.title}</h2>
      <p className="text-gray-700 mt-2">{auction.description}</p>
      <p className="mt-3 text-lg font-semibold text-blue-700">
        Current Bid: ₹{Number(auction.currentBid || auction.startPrice || 0).toLocaleString()}
      </p>
      <CountdownTimer endTime={auction.endTime} />

      {(auction.status === "closed" || new Date(auction.endTime) <= new Date()) ? (
        <div className="mt-4">
          <span className="inline-block px-3 py-2 bg-gray-300 text-gray-700 rounded-full">
            Auction Closed
          </span>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Place Bid
        </button>
      )}

      <BidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBidSubmit={handleBidSubmit}
      />
    </div>
  );
};

export default AuctionDetail;
