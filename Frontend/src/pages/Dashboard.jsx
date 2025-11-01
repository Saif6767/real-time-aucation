import React, { useEffect, useState } from "react";
import AuctionCard from "../components/AuctionCard";
import axios from "../services/axiosConfig";
import socket from "../services/socket";

const placeholderImage = "https://via.placeholder.com/300x200?text=No+Image";

const formatTimeRemaining = (endTime) => {
  try {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    if (isNaN(diff) || diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  } catch (e) {
    return "--";
  }
};

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let rejoinListener = null;

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/auctions");
      // normalize to what AuctionCard expects: id, image, title, currentBid, timeRemaining
      const normalized = (res.data || []).map((a) => ({
        ...a,
        id: a._id || a.id,
        image: a.image || placeholderImage,
        currentBid: typeof a.currentBid === "number" ? a.currentBid : Number(a.currentBid) || 0,
        endTime: a.endTime || a.end_time || a.end,
      }));
      setAuctions(normalized);

      // Join socket rooms for ongoing auctions only (so we receive real-time updates)
      try {
        normalized.forEach((a) => {
          const aid = a._id || a.id;
          if (aid && a.status === "ongoing") socket.emit("join_auction", aid);
        });
        // Re-join on reconnects
        if (normalized.length) {
          rejoinListener = () => {
            normalized.forEach((a) => {
              const aid = a._id || a.id;
              if (aid && a.status === "ongoing") socket.emit("join_auction", aid);
            });
          };
          socket.on("connect", rejoinListener);
        }
      } catch (e) {
        // ignore socket join errors
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchAuctions();

  const onBidUpdate = (data) => {
    if (!data) return;
    const auctionId = data.auctionId || data.auction_id || data.id;
    const newBid = data.newBid ?? data.currentBid ?? data.bidAmount ?? data.amount ?? data.bid?.amount;
    if (!auctionId || newBid == null) return;
    setAuctions((prev) =>
      prev.map((a) =>
        (a._id === auctionId || a.id === auctionId)
          ? { ...a, currentBid: Number(newBid) }
          : a
      )
    );
  };

  socket.on("bid_update", onBidUpdate);

  // 🕐 NEW: every 30 seconds refresh auction list to detect closed ones
  const refreshInterval = setInterval(() => {
    fetchAuctions();
  }, 30000);

  return () => {
    socket.off("bid_update", onBidUpdate);
    clearInterval(refreshInterval);
    try {
      socket.off("connect", rejoinListener);
    } catch (e) {
      // ignore
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // split auctions by status
  const upcoming = auctions.filter((a) => a.status === "upcoming");
  const ongoing = auctions.filter((a) => a.status === "ongoing");
  const completed = auctions.filter((a) => a.status === "completed");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Auctions</h1>

      {loading ? (
        <p>Loading auctions...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">🔵 Upcoming Auctions</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-600">No upcoming auctions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">🟢 Ongoing Auctions</h2>
            {ongoing.length === 0 ? (
              <p className="text-sm text-gray-600">No ongoing auctions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoing.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">🔴 Completed Auctions</h2>
            {completed.length === 0 ? (
              <p className="text-sm text-gray-600">No completed auctions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completed.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
