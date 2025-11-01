import React from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";

const AuctionCard = ({ auction }) => {
  const currentBid = Number(auction.currentBid || auction.startPrice || 0);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col">
      <img src={auction.image} alt={auction.title} className="rounded-xl h-40 w-full object-cover" />
      <h3 className="text-lg font-semibold mt-3">{auction.title}</h3>

      {auction.status === "completed" && (
        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-white bg-gray-500 rounded-full">
          Closed
        </span>
      )}

      <p className="text-sm text-gray-600">Current Bid: ₹{currentBid.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mb-2">
        Time Left: <CountdownTimer endTime={auction.endTime} />
      </p>

      <Link
        to={auction.status === "completed" ? "#" : `/auction/${auction.id}`}
        className={`text-center py-1 rounded-lg transition-all ${
          auction.status === "completed"
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {auction.status === "completed" ? "Closed" : "View Details"}
      </Link>
    </div>
  );
};

export default AuctionCard;
